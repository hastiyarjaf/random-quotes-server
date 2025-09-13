import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import QuoteCard from './components/QuoteCard';
import QuotesList from './components/QuotesList';
import ChatWidget from './components/ChatWidget';
import { useRandomQuote } from './hooks/useQuotes';
import { quotesApi } from './services/api';
import './App.css';

function App() {
  const { quote: randomQuote, loading: randomLoading, refresh: refreshRandom } = useRandomQuote();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // Check API health on load
    quotesApi.getHealth()
      .then(setHealth)
      .catch(err => console.warn('Health check failed:', err.message));
  }, []);

  return (
    <div className="app">
      <Header health={health} />
      
      <main className="main-content">
        {/* Hero Section with Random Quote */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Wisdom
            </h1>
            <p className="hero-subtitle">
              Explore inspiring quotes and chat with AI for personalized wisdom
            </p>
            
            <QuoteCard 
              quote={randomQuote}
              loading={randomLoading}
              onRefresh={refreshRandom}
              featured
            />
          </div>
        </section>

        {/* Quotes Collection Section */}
        <section className="quotes-section">
          <div className="section-header">
            <h2>Explore Our Collection</h2>
            <p>Browse, search, and discover quotes that inspire you</p>
          </div>
          
          <QuotesList />
        </section>
      </main>

      {/* Floating Chat Widget */}
      <ChatWidget />

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Random Quotes. Powered by AI wisdom.</p>
          {health && (
            <p className="footer-stats">
              {health.quotes.total} quotes available
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;