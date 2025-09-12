# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a simple Node.js Express server that serves random quotes from a JSON data file. The application provides a RESTful API with endpoints to retrieve random quotes or all quotes.

## Architecture

### Core Components

- **`index.js`**: Main application entry point containing Express server setup, route handlers, and error handling
- **`quotes.json`**: Static JSON data store containing an array of quote objects with `text` and `author` properties
- **`package.json`**: Project configuration with dependencies and scripts

### Application Flow

1. Server loads quotes from `quotes.json` at startup (synchronous file read)
2. Express server serves three main endpoints:
   - `/` - API documentation endpoint
   - `/quote` - Returns a single random quote with timestamp
   - `/quotes` - Returns all quotes with count
3. 404 handler for undefined routes
4. Server listens on PORT environment variable or defaults to 3000

## Development Commands

### Running the Application
```bash
# Start the server
npm start

# Development mode (same as start - no hot reload configured)
npm run dev

# Start with custom port
PORT=8080 npm start
```

### Package Management
```bash
# Install dependencies
npm install

# Check for outdated packages
npm outdated

# Update packages
npm update
```

### Testing the API
```bash
# Test the root endpoint
curl http://localhost:3000/

# Get a random quote
curl http://localhost:3000/quote

# Get all quotes
curl http://localhost:3000/quotes

# Test 404 handling
curl http://localhost:3000/nonexistent
```

## Data Management

### Adding New Quotes

Quotes are stored in `quotes.json` as an array of objects. Each quote object requires:
- `text`: The quote content (string)
- `author`: Quote attribution (string)

To add quotes, edit the `quotes` array in `quotes.json`. The server must be restarted after changes since quotes are loaded synchronously at startup.

### Quote Data Structure
```json
{
  "quotes": [
    {
      "text": "Quote content here",
      "author": "Author Name"
    }
  ]
}
```

## Architecture Considerations

### Current Limitations
- No persistent database - quotes stored in JSON file
- No hot reload in development mode
- Synchronous file loading blocks server startup
- No input validation or sanitization
- No rate limiting or security middleware
- No logging middleware
- No test framework configured

### Potential Improvements
- Add database integration for quote storage
- Implement input validation for future POST endpoints
- Add development hot reload with nodemon
- Implement async file loading with error handling
- Add security middleware (helmet, cors)
- Add structured logging
- Configure testing framework (Jest, Mocha)
- Add Docker containerization
- Implement quote categorization or tagging