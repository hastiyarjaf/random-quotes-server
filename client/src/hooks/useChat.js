import { useState, useCallback } from 'react';
import { quotesApi } from '../services/api';

const LANGUAGE_CONFIG = {
  en: { name: 'English', direction: 'ltr', code: 'en' },
  ar: { name: 'العربية', direction: 'rtl', code: 'ar' },
  ckb: { name: 'کوردی', direction: 'rtl', code: 'ckb' }
};

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Convert messages to API format (keep last 10 for context)
      const history = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const response = await quotesApi.chat(messageText, language, history);

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        language: response.language,
        direction: response.direction,
        provider: response.provider,
        quote: response.quote, // Include quote if fallback was used
        fallback: response.fallback,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update document direction for RTL languages
      if (response.direction) {
        document.documentElement.setAttribute('dir', response.direction);
      }
    } catch (err) {
      setError(err.message);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date().toISOString(),
        error: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, language]);

  const changeLanguage = useCallback((newLanguage) => {
    if (LANGUAGE_CONFIG[newLanguage]) {
      setLanguage(newLanguage);
      
      // Update document direction immediately
      const direction = LANGUAGE_CONFIG[newLanguage].direction;
      document.documentElement.setAttribute('dir', direction);
      
      // Add system message about language change
      const systemMessage = {
        id: Date.now(),
        role: 'system',
        content: `Language changed to ${LANGUAGE_CONFIG[newLanguage].name}`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    
    // Reset to LTR direction
    document.documentElement.setAttribute('dir', 'ltr');
  }, []);

  const getCurrentLanguageConfig = useCallback(() => {
    return LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.en;
  }, [language]);

  return {
    messages,
    isTyping,
    language,
    error,
    sendMessage,
    changeLanguage,
    clearChat,
    getCurrentLanguageConfig,
    availableLanguages: LANGUAGE_CONFIG,
  };
}