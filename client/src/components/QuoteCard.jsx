import React from 'react';
import './QuoteCard.css';

function QuoteCard({ quote, loading, onRefresh, featured = false }) {
  if (loading) {
    return (
      <div className={`quote-card ${featured ? 'featured' : ''}`}>
        <div className="quote-card-loading">
          <div className="loading-spinner large"></div>
          <p>Loading inspiring quote...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className={`quote-card ${featured ? 'featured' : ''}`}>
        <div className="quote-card-error">
          <p>No quote available</p>
          {onRefresh && (
            <button onClick={onRefresh} className="button button-outline">
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`quote-card ${featured ? 'featured' : ''}`}>
      <div className="quote-content">
        <blockquote className="quote-text">
          "{quote.text}"
        </blockquote>
        <footer className="quote-footer">
          <cite className="quote-author">— {quote.author}</cite>
          {quote.id && (
            <span className="quote-id">#{quote.id}</span>
          )}
        </footer>
      </div>
      
      {onRefresh && (
        <div className="quote-actions">
          <button 
            onClick={onRefresh} 
            className="button button-secondary"
            title="Get another quote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            New Quote
          </button>
        </div>
      )}
      
      <div className="quote-decorations">
        <div className="quote-mark quote-mark-open">"</div>
        <div className="quote-mark quote-mark-close">"</div>
      </div>
    </div>
  );
}

export default QuoteCard;