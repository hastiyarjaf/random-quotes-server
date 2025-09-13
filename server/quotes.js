const fs = require('fs');
const path = require('path');

/**
 * Loads and normalizes quotes from JSON file
 * Supports both formats: ["..."] and {"quotes": ["..."]}
 */
class QuotesService {
  constructor(quotesPath = null) {
    this.quotesPath = quotesPath || path.join(__dirname, '..', 'quotes.json');
    this.quotes = [];
    this.loadQuotes();
  }

  loadQuotes() {
    try {
      const quotesFile = fs.readFileSync(this.quotesPath, 'utf8');
      const data = JSON.parse(quotesFile);
      
      // Handle different formats
      if (Array.isArray(data)) {
        // Format: ["quote1", "quote2", ...]
        this.quotes = data.map(quote => this.normalizeQuote(quote));
      } else if (data.quotes && Array.isArray(data.quotes)) {
        // Format: {"quotes": ["quote1", "quote2", ...]}
        this.quotes = data.quotes.map(quote => this.normalizeQuote(quote));
      } else {
        throw new Error('Invalid quotes file format');
      }

      console.log(`Loaded ${this.quotes.length} quotes successfully`);
    } catch (error) {
      console.error('Error loading quotes file:', error);
      throw error;
    }
  }

  normalizeQuote(quote) {
    // Handle string quotes (convert to object)
    if (typeof quote === 'string') {
      return {
        id: this.generateId(),
        text: quote,
        author: 'Unknown'
      };
    }

    // Handle object quotes (ensure required fields)
    if (typeof quote === 'object') {
      return {
        id: quote.id || this.generateId(),
        text: quote.text || quote.quote || '',
        author: quote.author || 'Unknown'
      };
    }

    throw new Error('Invalid quote format');
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  getAllQuotes() {
    return this.quotes;
  }

  getRandomQuote() {
    if (this.quotes.length === 0) {
      throw new Error('No quotes available');
    }
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
  }

  getQuoteById(id) {
    return this.quotes.find(quote => quote.id === id);
  }

  searchQuotes(query, page = 1, limit = 10) {
    if (!query) {
      return this.getPaginatedQuotes(page, limit);
    }

    const searchTerm = query.toLowerCase();
    const filteredQuotes = this.quotes.filter(quote => 
      quote.text.toLowerCase().includes(searchTerm) ||
      quote.author.toLowerCase().includes(searchTerm)
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      quotes: filteredQuotes.slice(startIndex, endIndex),
      total: filteredQuotes.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredQuotes.length / limit)
    };
  }

  getPaginatedQuotes(page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      quotes: this.quotes.slice(startIndex, endIndex),
      total: this.quotes.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(this.quotes.length / limit)
    };
  }

  getCount() {
    return this.quotes.length;
  }

  // Get sample quotes for AI context (for system prompts)
  getSampleQuotes(count = 3) {
    const shuffled = [...this.quotes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

module.exports = QuotesService;