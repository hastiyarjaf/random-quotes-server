const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Chat service with AI integration and multilingual support
 * Supports Gemini AI with fallback for missing API keys
 * Languages: English (en), Arabic (ar), Sorani Kurdish (ckb)
 */
class ChatService {
  constructor(quotesService) {
    this.quotesService = quotesService;
    this.provider = process.env.AI_PROVIDER || 'gemini';
    this.initializeProviders();
  }

  initializeProviders() {
    // Initialize Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.geminiModel = this.genAI.getGenerativeModel({ 
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
        });
        console.log('Gemini AI initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Gemini:', error);
        this.genAI = null;
      }
    } else {
      console.log('GEMINI_API_KEY not found, using fallback responses');
      this.genAI = null;
    }

    // TODO: Initialize OpenAI and Azure (for future use)
    // Keep stubs for backward compatibility
    this.openAI = null;
    this.azureOpenAI = null;
  }

  getLanguageConfig(language) {
    const configs = {
      en: {
        name: 'English',
        direction: 'ltr',
        fallbackPrefix: 'Here\'s a thoughtful quote for you:',
        fallbackSuffix: 'I hope this quote inspires you! Feel free to ask me anything about quotes, life wisdom, or request quotes on specific topics.',
        systemPrompt: 'You are a wise and inspiring assistant that helps people with quotes and life wisdom. Respond in English.'
      },
      ar: {
        name: 'Arabic',
        direction: 'rtl',
        fallbackPrefix: 'إليك اقتباس ملهم:',
        fallbackSuffix: 'أتمنى أن يلهمك هذا الاقتباس! لا تتردد في سؤالي عن أي شيء يتعلق بالاقتباسات أو حكمة الحياة.',
        systemPrompt: 'أنت مساعد حكيم وملهم يساعد الناس بالاقتباسات وحكمة الحياة. أجب باللغة العربية.'
      },
      ckb: {
        name: 'Sorani Kurdish',
        direction: 'rtl',
        fallbackPrefix: 'ئەمە وتەیەکی باشە بۆت:',
        fallbackSuffix: 'هیوادارم ئەم وتەیە ئیلهامت بدات! دڵنیابە لە پرسیاری هەرچی لەبارەی وتە و دانایی ژیان.',
        systemPrompt: 'تۆ یارمەتیدەرێکی دانا و ئیلهامبەخشیت کە خەڵک لەگەڵ وتە و دانایی ژیان یارمەتیدەدەیت. بە کوردی سۆرانی وەڵام بدەرەوە.'
      }
    };

    return configs[language] || configs.en;
  }

  async generateResponse(message, language = 'en', history = []) {
    const langConfig = this.getLanguageConfig(language);

    try {
      if (this.genAI && this.provider === 'gemini') {
        return await this.generateGeminiResponse(message, langConfig, history);
      }
      // TODO: Add OpenAI and Azure providers
      else {
        return this.generateFallbackResponse(langConfig);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      return this.generateFallbackResponse(langConfig);
    }
  }

  async generateGeminiResponse(message, langConfig, history) {
    try {
      const sampleQuotes = this.quotesService.getSampleQuotes(3);
      const quotesContext = sampleQuotes.map(q => `"${q.text}" - ${q.author}`).join('\n');
      
      const systemPrompt = `${langConfig.systemPrompt}\n\nHere are some sample quotes from our collection:\n${quotesContext}\n\nProvide helpful, inspiring responses while staying true to the wisdom and philosophy themes. Keep responses concise but meaningful.`;

      // Build conversation history
      const conversationHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Add current message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const chat = this.geminiModel.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'I understand. I\'ll provide helpful, inspiring responses about quotes and life wisdom in the requested language.' }] },
          ...conversationHistory.slice(0, -1) // Don't include the current message in history
        ],
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      return {
        message: text.trim(),
        language,
        direction: langConfig.direction,
        provider: 'gemini'
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  generateFallbackResponse(langConfig) {
    try {
      const randomQuote = this.quotesService.getRandomQuote();
      const message = `${langConfig.fallbackPrefix}\n\n"${randomQuote.text}" - ${randomQuote.author}\n\n${langConfig.fallbackSuffix}`;

      return {
        message,
        language: langConfig.name.toLowerCase().includes('english') ? 'en' : 
                 langConfig.name.toLowerCase().includes('arabic') ? 'ar' : 'ckb',
        direction: langConfig.direction,
        provider: 'fallback',
        quote: randomQuote
      };
    } catch (error) {
      console.error('Fallback response error:', error);
      const message = langConfig.fallbackPrefix || 'I apologize, but I\'m having trouble generating a response right now.';
      return {
        message,
        language: 'en',
        direction: 'ltr',
        provider: 'fallback',
        error: true
      };
    }
  }

  validateChatRequest(body) {
    const errors = [];

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      errors.push('Message is required and must be a non-empty string');
    }

    if (body.message && body.message.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    if (body.language && !['en', 'ar', 'ckb'].includes(body.language)) {
      errors.push('Language must be one of: en, ar, ckb');
    }

    if (body.history && (!Array.isArray(body.history) || body.history.length > 10)) {
      errors.push('History must be an array with maximum 10 entries');
    }

    if (body.history) {
      for (let i = 0; i < body.history.length; i++) {
        const msg = body.history[i];
        if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
          errors.push(`History item ${i} must have role 'user' or 'assistant'`);
        }
        if (!msg.content || typeof msg.content !== 'string') {
          errors.push(`History item ${i} must have content as string`);
        }
      }
    }

    return errors;
  }
}

module.exports = ChatService;