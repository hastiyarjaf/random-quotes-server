const request = require('supertest');
const app = require('../index');

describe('Random Quotes API', () => {
  afterAll(() => {
    // Give time for the server to close properly
    setTimeout(() => process.exit(), 100);
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('quotes');
      expect(response.body.quotes).toHaveProperty('total');
      expect(typeof response.body.quotes.total).toBe('number');
      expect(response.body.quotes.total).toBeGreaterThan(0);
    });
  });

  describe('GET /', () => {
    test('should return welcome message with endpoints', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('/api/v1/quote');
      expect(response.body.endpoints).toHaveProperty('/api/v1/chat');
    });
  });

  describe('GET /api/v1/quote', () => {
    test('should return a random quote', async () => {
      const response = await request(app).get('/api/v1/quote');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('quote');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.quote).toHaveProperty('id');
      expect(response.body.quote).toHaveProperty('text');
      expect(response.body.quote).toHaveProperty('author');
    });

    test('should return different quotes on multiple requests', async () => {
      const response1 = await request(app).get('/api/v1/quote');
      const response2 = await request(app).get('/api/v1/quote');
      const response3 = await request(app).get('/api/v1/quote');
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response3.status).toBe(200);

      // With multiple quotes, at least one should be different
      const quotes = [response1.body.quote.id, response2.body.quote.id, response3.body.quote.id];
      const uniqueQuotes = new Set(quotes);
      expect(uniqueQuotes.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/quotes', () => {
    test('should return paginated quotes with default parameters', async () => {
      const response = await request(app).get('/api/v1/quotes');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('quotes');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.quotes)).toBe(true);
      expect(response.body.quotes.length).toBeGreaterThan(0);
    });

    test('should respect pagination parameters', async () => {
      const response = await request(app).get('/api/v1/quotes?page=1&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
      expect(response.body.quotes.length).toBeLessThanOrEqual(2);
    });

    test('should search quotes by text content', async () => {
      const response = await request(app).get('/api/v1/quotes?contains=work');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('quotes');
      
      // Check that returned quotes contain the search term
      if (response.body.quotes.length > 0) {
        const hasSearchTerm = response.body.quotes.some(quote => 
          quote.text.toLowerCase().includes('work') || 
          quote.author.toLowerCase().includes('work')
        );
        expect(hasSearchTerm).toBe(true);
      }
    });

    test('should handle large page numbers gracefully', async () => {
      const response = await request(app).get('/api/v1/quotes?page=999');
      
      expect(response.status).toBe(200);
      expect(response.body.quotes.length).toBe(0);
    });

    test('should limit maximum results per page', async () => {
      const response = await request(app).get('/api/v1/quotes?limit=200');
      
      expect(response.status).toBe(200);
      expect(response.body.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /api/v1/quotes/:id', () => {
    let validQuoteId;

    beforeAll(async () => {
      // Get a valid quote ID for testing
      const response = await request(app).get('/api/v1/quote');
      validQuoteId = response.body.quote.id;
    });

    test('should return quote by valid ID', async () => {
      const response = await request(app).get(`/api/v1/quotes/${validQuoteId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('quote');
      expect(response.body.quote.id).toBe(validQuoteId);
    });

    test('should return 404 for invalid ID', async () => {
      const response = await request(app).get('/api/v1/quotes/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Quote not found');
    });
  });

  describe('POST /api/v1/chat', () => {
    test('should handle valid chat request in English', async () => {
      const chatRequest = {
        message: 'Give me a motivational quote',
        language: 'en'
      };

      const response = await request(app)
        .post('/api/v1/chat')
        .send(chatRequest);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('language', 'en');
      expect(response.body).toHaveProperty('direction', 'ltr');
      expect(response.body).toHaveProperty('provider');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should handle Arabic language requests', async () => {
      const chatRequest = {
        message: 'اعطني اقتباس ملهم',
        language: 'ar'
      };

      const response = await request(app)
        .post('/api/v1/chat')
        .send(chatRequest);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('language', 'ar');
      expect(response.body).toHaveProperty('direction', 'rtl');
    });

    test('should handle Sorani Kurdish language requests', async () => {
      const chatRequest = {
        message: 'وتەیەکی باشم بۆ بنێرە',
        language: 'ckb'
      };

      const response = await request(app)
        .post('/api/v1/chat')
        .send(chatRequest);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('language', 'ckb');
      expect(response.body).toHaveProperty('direction', 'rtl');
    });

    test('should provide fallback response when no API key', async () => {
      const chatRequest = {
        message: 'Tell me about success',
        language: 'en'
      };

      const response = await request(app)
        .post('/api/v1/chat')
        .send(chatRequest);
      
      expect(response.status).toBe(200);
      expect(response.body.provider).toBe('fallback');
      expect(response.body).toHaveProperty('quote');
    });

    test('should handle conversation history', async () => {
      const chatRequest = {
        message: 'What about motivation?',
        language: 'en',
        history: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hello! How can I help you?' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/chat')
        .send(chatRequest);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
    });

    test('should validate required message field', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Message is required and must be a non-empty string');
    });

    test('should validate message length', async () => {
      const longMessage = 'a'.repeat(1001);
      
      const response = await request(app)
        .post('/api/v1/chat')
        .send({ message: longMessage });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Message must be less than 1000 characters');
    });

    test('should validate language parameter', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .send({ 
          message: 'Hello',
          language: 'invalid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Language must be one of: en, ar, ckb');
    });

    test('should validate history format', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .send({ 
          message: 'Hello',
          history: [{ invalidField: 'test' }]
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('Backward compatibility', () => {
    test('should redirect /quote to /api/v1/quote', async () => {
      const response = await request(app).get('/quote');
      expect(response.status).toBe(301);
    });

    test('should redirect /quotes to /api/v1/quotes', async () => {
      const response = await request(app).get('/quotes');
      expect(response.status).toBe(301);
    });
  });

  describe('Error handling', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });
  });
});