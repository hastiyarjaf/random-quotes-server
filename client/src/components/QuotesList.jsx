import React, { useState } from 'react';
import QuoteCard from './QuoteCard';
import { useQuotes } from '../hooks/useQuotes';
import './QuotesList.css';

function QuotesList() {
  const { quotes, loading, error, pagination, searchQuotes, changePage } = useQuotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      await searchQuotes(searchTerm, 1);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    changePage(newPage);
    // Smooth scroll to top of quotes section
    document.querySelector('.quotes-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page context, and last page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="quotes-list" id="quotes">
      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search quotes by text or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input search-input"
              disabled={searchLoading}
            />
            <button 
              type="submit" 
              className="button search-button"
              disabled={searchLoading}
            >
              {searchLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              )}
              Search
            </button>
          </div>
        </form>
        
        {searchTerm && (
          <div className="search-info">
            <p>
              {pagination.total > 0 ? (
                <>Showing {pagination.total} result{pagination.total !== 1 ? 's' : ''} for "{searchTerm}"</>
              ) : (
                <>No results found for "{searchTerm}"</>
              )}
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                searchQuotes('', 1);
              }}
              className="button button-outline clear-search"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          Error loading quotes: {error}
        </div>
      )}

      {/* Quotes Grid */}
      {loading ? (
        <div className="quotes-loading">
          <div className="loading-spinner large"></div>
          <p>Loading quotes...</p>
        </div>
      ) : quotes.length > 0 ? (
        <>
          <div className="quotes-grid">
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                <p>
                  Showing {quotes.length} of {pagination.total} quotes 
                  (Page {pagination.page} of {pagination.totalPages})
                </p>
              </div>
              
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="button button-outline pagination-btn"
                  title="Previous page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                  Previous
                </button>

                <div className="pagination-numbers">
                  {generatePageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`button pagination-number ${
                          pageNum === pagination.page ? 'active' : 'button-outline'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="button button-outline pagination-btn"
                  title="Next page"
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-quotes">
          <div className="no-quotes-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
          </div>
          <h3>No quotes found</h3>
          <p>Try adjusting your search terms or browse all quotes.</p>
        </div>
      )}
    </div>
  );
}

export default QuotesList;