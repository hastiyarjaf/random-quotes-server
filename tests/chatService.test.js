const ChatService = require('../server/chatService');
const QuotesService = require('../server/quotes');

// Mock the Google Generative AI module
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Mocked AI response about wisdom and quotes.'
          }
        })
      })
    })
  }))
}));

describe('ChatService', () => {
  let chatService;
  let quotesService;

  beforeEach(() => {
    // Reset environment variables
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_PROVIDER;
    delete process.env.GEMINI_MODEL;

    // Create quotes service with mock data
    quotesService = {
      getSampleQuotes: jest.fn().mockReturnValue([
        { text: 'Sample quote 1', author: 'Author 1' },
        { text: 'Sample quote 2', author: 'Author 2' }
      ]),
      getRandomQuote: jest.fn().mockReturnValue({
        id: 'test-id',
        text: 'Random test quote',
        author: 'Test Author'
      })
    };

    chatService = new ChatService(quotesService);
  });

  describe('Language configuration', () => {
    test('should return English config for en', () => {
      const config = chatService.getLanguageConfig('en');
      
      expect(config.name).toBe('English');
      expect(config.direction).toBe('ltr');
      expect(config.fallbackPrefix).toContain('thoughtful quote');
      expect(config.systemPrompt).toContain('English');
    });

    test('should return Arabic config for ar', () => {
      const config = chatService.getLanguageConfig('ar');
      
      expect(config.name).toBe('Arabic');
      expect(config.direction).toBe('rtl');
      expect(config.fallbackPrefix).toContain('إليك اقتباس');
      expect(config.systemPrompt).toContain('العربية');
    });

    test('should return Kurdish config for ckb', () => {
      const config = chatService.getLanguageConfig('ckb');
      
      expect(config.name).toBe('Sorani Kurdish');
      expect(config.direction).toBe('rtl');
      expect(config.fallbackPrefix).toContain('ئەمە وتەیەک');
      expect(config.systemPrompt).toContain('کوردی سۆرانی');
    });

    test('should default to English for unknown language', () => {
      const config = chatService.getLanguageConfig('unknown');
      
      expect(config.name).toBe('English');
      expect(config.direction).toBe('ltr');
    });
  });

  describe('Fallback response generation', () => {
    test('should generate fallback response with random quote', async () => {
      const response = await chatService.generateResponse('Hello', 'en');
      
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('language', 'en');
      expect(response).toHaveProperty('direction', 'ltr');
      expect(response).toHaveProperty('provider', 'fallback');
      expect(response).toHaveProperty('quote');
      expect(quotesService.getRandomQuote).toHaveBeenCalled();
    });

    test('should generate Arabic fallback response', async () => {
      const response = await chatService.generateResponse('مرحبا', 'ar');
      
      expect(response.language).toBe('ar');
      expect(response.direction).toBe('rtl');
      expect(response.message).toContain('إليك اقتباس');
    });

    test('should generate Kurdish fallback response', async () => {
      const response = await chatService.generateResponse('سڵاو', 'ckb');
      
      expect(response.language).toBe('ckb');
      expect(response.direction).toBe('rtl');
      expect(response.message).toContain('ئەمە وتەیەک');
    });

    test('should handle error in fallback gracefully', async () => {
      // Make getRandomQuote throw an error
      quotesService.getRandomQuote.mockImplementation(() => {
        throw new Error('No quotes available');
      });

      // Mock console.error to avoid cluttering test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await chatService.generateResponse('Hello', 'en');
      
      expect(response).toHaveProperty('error', true);
      expect(response).toHaveProperty('provider', 'fallback');
      expect(response.message).toContain('thoughtful quote');

      consoleSpy.mockRestore();
    });
  });

  describe('Gemini AI integration', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      process.env.AI_PROVIDER = 'gemini';
      
      // Mock console.log for cleaner test output
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      chatService = new ChatService(quotesService);
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    test('should use Gemini when API key is available', async () => {
      const response = await chatService.generateResponse('Hello', 'en');
      
      expect(response).toHaveProperty('provider', 'gemini');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('language', 'en');
      expect(response).toHaveProperty('direction', 'ltr');
    });

    test('should include sample quotes in system prompt', async () => {
      await chatService.generateResponse('Hello', 'en');
      
      expect(quotesService.getSampleQuotes).toHaveBeenCalledWith(3);
    });

    test('should fall back to local response on Gemini error', async () => {
      // Mock Gemini to throw an error
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockChat = {
        sendMessage: jest.fn().mockRejectedValue(new Error('API Error'))
      };
      const mockModel = {
        startChat: jest.fn().mockReturnValue(mockChat)
      };
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      // Mock console.error to avoid cluttering test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      chatService = new ChatService(quotesService);
      const response = await chatService.generateResponse('Hello', 'en');
      
      expect(response.provider).toBe('fallback');

      consoleSpy.mockRestore();
    });
  });

  describe('Request validation', () => {
    test('should validate required message', () => {
      const errors = chatService.validateChatRequest({});
      
      expect(errors).toContain('Message is required and must be a non-empty string');
    });

    test('should validate empty message', () => {
      const errors = chatService.validateChatRequest({ message: '' });
      
      expect(errors).toContain('Message is required and must be a non-empty string');
    });

    test('should validate message type', () => {
      const errors = chatService.validateChatRequest({ message: 123 });
      
      expect(errors).toContain('Message is required and must be a non-empty string');
    });

    test('should validate message length', () => {
      const longMessage = 'a'.repeat(1001);
      const errors = chatService.validateChatRequest({ message: longMessage });
      
      expect(errors).toContain('Message must be less than 1000 characters');
    });

    test('should validate language parameter', () => {
      const errors = chatService.validateChatRequest({ 
        message: 'Hello', 
        language: 'invalid' 
      });
      
      expect(errors).toContain('Language must be one of: en, ar, ckb');
    });

    test('should validate history array', () => {
      const errors = chatService.validateChatRequest({ 
        message: 'Hello', 
        history: 'not an array' 
      });
      
      expect(errors).toContain('History must be an array with maximum 10 entries');
    });

    test('should validate history length', () => {
      const longHistory = Array(11).fill({ role: 'user', content: 'test' });
      const errors = chatService.validateChatRequest({ 
        message: 'Hello', 
        history: longHistory 
      });
      
      expect(errors).toContain('History must be an array with maximum 10 entries');
    });

    test('should validate history item format', () => {
      const errors = chatService.validateChatRequest({ 
        message: 'Hello', 
        history: [{ role: 'invalid', content: 'test' }] 
      });
      
      expect(errors).toContain('History item 0 must have role \'user\' or \'assistant\'');
    });

    test('should validate history item content', () => {
      const errors = chatService.validateChatRequest({ 
        message: 'Hello', 
        history: [{ role: 'user', content: 123 }] 
      });
      
      expect(errors).toContain('History item 0 must have content as string');
    });

    test('should return no errors for valid request', () => {
      const errors = chatService.validateChatRequest({
        message: 'Hello',
        language: 'en',
        history: [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello!' }
        ]
      });
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('Provider initialization', () => {
    beforeEach(() => {
      // Mock console.log for cleaner test output
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    test('should initialize without API key', () => {
      expect(() => new ChatService(quotesService)).not.toThrow();
    });

    test('should set default provider to gemini', () => {
      const service = new ChatService(quotesService);
      expect(service.provider).toBe('gemini');
    });

    test('should respect AI_PROVIDER environment variable', () => {
      process.env.AI_PROVIDER = 'openai';
      const service = new ChatService(quotesService);
      expect(service.provider).toBe('openai');
    });
  });
});