const QuotesService = require('../server/quotes');
const fs = require('fs');
const path = require('path');

describe('QuotesService', () => {
  let quotesService;
  let tempQuotesFile;

  beforeAll(() => {
    // Create a temporary quotes file for testing
    const testQuotes = {
      quotes: [
        { text: 'Test quote 1', author: 'Test Author 1' },
        { text: 'Test quote 2', author: 'Test Author 2' },
        'Simple string quote'
      ]
    };
    
    tempQuotesFile = path.join(__dirname, 'temp-quotes.json');
    fs.writeFileSync(tempQuotesFile, JSON.stringify(testQuotes));
  });

  afterAll(() => {
    // Clean up temporary file
    if (fs.existsSync(tempQuotesFile)) {
      fs.unlinkSync(tempQuotesFile);
    }
  });

  beforeEach(() => {
    quotesService = new QuotesService(tempQuotesFile);
  });

  describe('Quote loading and normalization', () => {
    test('should load quotes from JSON file', () => {
      expect(quotesService.getCount()).toBe(3);
    });

    test('should normalize string quotes to objects', () => {
      const quotes = quotesService.getAllQuotes();
      const stringQuote = quotes.find(q => q.text === 'Simple string quote');
      
      expect(stringQuote).toBeDefined();
      expect(stringQuote).toHaveProperty('id');
      expect(stringQuote).toHaveProperty('text', 'Simple string quote');
      expect(stringQuote).toHaveProperty('author', 'Unknown');
    });

    test('should add IDs to quotes without them', () => {
      const quotes = quotesService.getAllQuotes();
      
      quotes.forEach(quote => {
        expect(quote).toHaveProperty('id');
        expect(typeof quote.id).toBe('string');
        expect(quote.id.length).toBeGreaterThan(0);
      });
    });

    test('should handle array format quotes', () => {
      const arrayQuotes = ['Quote 1', 'Quote 2'];
      fs.writeFileSync(tempQuotesFile, JSON.stringify(arrayQuotes));
      
      const service = new QuotesService(tempQuotesFile);
      expect(service.getCount()).toBe(2);
      
      const quotes = service.getAllQuotes();
      expect(quotes[0].text).toBe('Quote 1');
      expect(quotes[0].author).toBe('Unknown');
    });

    test('should throw error for invalid file format', () => {
      fs.writeFileSync(tempQuotesFile, JSON.stringify({ invalidFormat: true }));
      
      expect(() => {
        new QuotesService(tempQuotesFile);
      }).toThrow('Invalid quotes file format');
    });
  });

  describe('Quote retrieval', () => {
    test('should return random quote', () => {
      const quote = quotesService.getRandomQuote();
      
      expect(quote).toHaveProperty('id');
      expect(quote).toHaveProperty('text');
      expect(quote).toHaveProperty('author');
    });

    test('should return different random quotes', () => {
      const quotes = new Set();
      
      // Get 10 random quotes (some might be duplicates due to small dataset)
      for (let i = 0; i < 10; i++) {
        quotes.add(quotesService.getRandomQuote().id);
      }
      
      expect(quotes.size).toBeGreaterThanOrEqual(1);
    });

    test('should return all quotes', () => {
      const allQuotes = quotesService.getAllQuotes();
      
      expect(Array.isArray(allQuotes)).toBe(true);
      expect(allQuotes.length).toBe(3);
    });

    test('should find quote by ID', () => {
      const allQuotes = quotesService.getAllQuotes();
      const firstQuote = allQuotes[0];
      
      const foundQuote = quotesService.getQuoteById(firstQuote.id);
      
      expect(foundQuote).toEqual(firstQuote);
    });

    test('should return undefined for non-existent ID', () => {
      const quote = quotesService.getQuoteById('nonexistent');
      expect(quote).toBeUndefined();
    });
  });

  describe('Search functionality', () => {
    test('should search quotes by text', () => {
      const result = quotesService.searchQuotes('Test quote 1');
      
      expect(result.quotes.length).toBeGreaterThan(0);
      expect(result.quotes[0].text).toBe('Test quote 1');
    });

    test('should search quotes by author', () => {
      const result = quotesService.searchQuotes('Test Author 1');
      
      expect(result.quotes.length).toBeGreaterThan(0);
      expect(result.quotes[0].author).toBe('Test Author 1');
    });

    test('should be case insensitive', () => {
      const result = quotesService.searchQuotes('test QUOTE');
      
      expect(result.quotes.length).toBeGreaterThan(0);
    });

    test('should return empty results for no matches', () => {
      const result = quotesService.searchQuotes('nonexistent');
      
      expect(result.quotes.length).toBe(0);
      expect(result.total).toBe(0);
    });

    test('should include pagination metadata', () => {
      const result = quotesService.searchQuotes('Test');
      
      expect(result).toHaveProperty('quotes');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
    });
  });

  describe('Pagination', () => {
    test('should return paginated results', () => {
      const result = quotesService.getPaginatedQuotes(1, 2);
      
      expect(result.quotes.length).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(2);
    });

    test('should handle page beyond available data', () => {
      const result = quotesService.getPaginatedQuotes(10, 10);
      
      expect(result.quotes.length).toBe(0);
      expect(result.page).toBe(10);
    });

    test('should convert string parameters to integers', () => {
      const result = quotesService.getPaginatedQuotes('2', '1');
      
      expect(result.page).toBe(2);
      expect(result.limit).toBe(1);
    });
  });

  describe('Utility functions', () => {
    test('should return correct count', () => {
      expect(quotesService.getCount()).toBe(3);
    });

    test('should return sample quotes', () => {
      const samples = quotesService.getSampleQuotes(2);
      
      expect(Array.isArray(samples)).toBe(true);
      expect(samples.length).toBeLessThanOrEqual(2);
      
      samples.forEach(quote => {
        expect(quote).toHaveProperty('text');
        expect(quote).toHaveProperty('author');
      });
    });

    test('should limit sample quotes to available count', () => {
      const samples = quotesService.getSampleQuotes(10);
      
      expect(samples.length).toBeLessThanOrEqual(3);
    });
  });
});