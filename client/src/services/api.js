const API_BASE_URL = typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or JSON parsing errors
    throw new ApiError(
      error.message || 'Network error occurred',
      0,
      null
    );
  }
}

export const quotesApi = {
  // Get random quote
  async getRandomQuote() {
    return apiCall('/v1/quote');
  },

  // Get paginated quotes with optional search
  async getQuotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/v1/quotes${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  },

  // Get quote by ID
  async getQuoteById(id) {
    return apiCall(`/v1/quotes/${encodeURIComponent(id)}`);
  },

  // Chat with AI
  async chat(message, language = 'en', history = []) {
    return apiCall('/v1/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        language,
        history: history.slice(-10), // Keep only last 10 messages for context
      }),
    });
  },

  // Get health status
  async getHealth() {
    return apiCall('/../health'); // Go up from /api to /health
  },
};

export { ApiError };