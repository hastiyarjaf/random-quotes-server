import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import chatIcon from '../assets/icons/chat.svg';
import './ChatWidget.css';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const {
    messages,
    isTyping,
    language,
    sendMessage,
    changeLanguage,
    clearChat,
    getCurrentLanguageConfig,
    availableLanguages,
  } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300); // Wait for animation to complete
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isTyping) return;

    const message = currentMessage.trim();
    setCurrentMessage('');
    await sendMessage(message);
  };

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  const formatMessage = (message) => {
    // Simple message formatting: convert line breaks and bold text
    return message
      .split('\n')
      .map((line, index, array) => (
        <React.Fragment key={index}>
          {line}
          {index < array.length - 1 && <br />}
        </React.Fragment>
      ));
  };

  const currentLangConfig = getCurrentLanguageConfig();

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        title={isOpen ? 'Close chat' : 'Chat with AI'}
      >
        <img src={chatIcon} alt="Chat" className="chat-icon" />
        {messages.length > 0 && !isOpen && (
          <div className="chat-badge">
            {messages.length > 99 ? '99+' : messages.length}
          </div>
        )}
      </button>

      {/* Chat Widget */}
      <div className={`chat-widget ${isOpen ? 'open' : ''}`} id="chat">
        <div className="chat-header">
          <div className="chat-title">
            <h3>AI Wisdom Chat</h3>
            <p>Ask for quotes and wisdom in your language</p>
          </div>
          
          {/* Language Selector */}
          <div className="language-selector">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="language-select"
              aria-label="Select language"
            >
              {Object.entries(availableLanguages).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          <div className="chat-controls">
            <button
              onClick={clearChat}
              className="button button-outline clear-btn"
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="button button-outline close-btn"
              title="Close chat"
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="chat-messages" dir={currentLangConfig.direction}>
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="welcome-icon">
                <img src={chatIcon} alt="Chat" />
              </div>
              <h4>Welcome to AI Wisdom Chat!</h4>
              <p>
                Ask me for quotes about any topic, request wisdom, or just have a conversation.
                I speak English, Arabic, and Sorani Kurdish!
              </p>
              <div className="example-questions">
                <p>Try asking:</p>
                <ul>
                  <li>"Give me a quote about success"</li>
                  <li>"اقتباس عن الحياة" (Arabic)</li>
                  <li>"وتەیەک لەسەر خۆشەویستی" (Kurdish)</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role} ${message.error ? 'error' : ''}`}
            >
              <div className="message-content">
                <div className="message-text">
                  {formatMessage(message.content)}
                </div>
                
                {message.quote && (
                  <div className="message-quote">
                    <blockquote>
                      "{message.quote.text}"
                    </blockquote>
                    <cite>— {message.quote.author}</cite>
                  </div>
                )}
                
                <div className="message-meta">
                  <time className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </time>
                  {message.provider && (
                    <span className="message-provider">
                      {message.provider === 'fallback' && '🤖'}
                      {message.provider === 'gemini' && '✨'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message assistant typing">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="chat-input-group">
            <input
              ref={inputRef}
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder={
                language === 'ar' ? 'اكتب رسالتك هنا...' :
                language === 'ckb' ? 'پەیامەکەت لێرە بنووسە...' :
                'Type your message here...'
              }
              className="chat-input"
              disabled={isTyping}
              maxLength={1000}
              dir={currentLangConfig.direction}
            />
            <button
              type="submit"
              disabled={!currentMessage.trim() || isTyping}
              className="chat-send-btn"
              title="Send message"
              aria-label="Send message"
            >
              {isTyping ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              )}
            </button>
          </div>
          
          <div className="character-count">
            {currentMessage.length}/1000
          </div>
        </form>
      </div>

      {/* Overlay */}
      {isOpen && <div className="chat-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}

export default ChatWidget;