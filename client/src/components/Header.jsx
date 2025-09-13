import React from 'react';
import './Header.css';

function Header({ health }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="/quote.svg" alt="Random Quotes" className="logo-icon" />
          <h1 className="logo-text">Random Quotes</h1>
        </div>
        
        <nav className="nav">
          <a href="#quotes" className="nav-link">
            Browse Quotes
          </a>
          <a href="#chat" className="nav-link">
            AI Chat
          </a>
          {health && (
            <div className="status-indicator">
              <div className="status-dot online"></div>
              <span className="status-text">
                {health.quotes?.total || 0} quotes
              </span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;