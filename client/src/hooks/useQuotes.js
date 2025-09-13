import { useState, useEffect } from 'react';
import { quotesApi } from '../services/api';

export function useQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const loadQuotes = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotesApi.getQuotes({
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      });
      
      setQuotes(response.quotes);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err.message);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const searchQuotes = async (searchTerm, page = 1) => {
    const params = {
      page,
      limit: pagination.limit,
    };
    
    if (searchTerm && searchTerm.trim()) {
      params.contains = searchTerm.trim();
    }
    
    setPagination(prev => ({ ...prev, page }));
    await loadQuotes(params);
  };

  const changePage = async (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      await loadQuotes({ page: newPage });
    }
  };

  // Load initial quotes
  useEffect(() => {
    loadQuotes();
  }, []);

  return {
    quotes,
    loading,
    error,
    pagination,
    searchQuotes,
    changePage,
    reload: loadQuotes,
  };
}

export function useRandomQuote() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRandomQuote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quotesApi.getRandomQuote();
      setQuote(response.quote);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  return {
    quote,
    loading,
    error,
    refresh: fetchRandomQuote,
  };
}