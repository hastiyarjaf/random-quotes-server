const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load quotes from JSON file
let quotesData;
try {
    const quotesFile = fs.readFileSync(path.join(__dirname, 'quotes.json'), 'utf8');
    quotesData = JSON.parse(quotesFile);
} catch (error) {
    console.error('Error loading quotes file:', error);
    process.exit(1);
}

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Random Quotes API!',
        endpoints: {
            '/quote': 'GET - Returns a random quote',
            '/quotes': 'GET - Returns all quotes'
        }
    });
});

app.get('/quote', (req, res) => {
    const quotes = quotesData.quotes;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    res.json({
        quote: randomQuote,
        timestamp: new Date().toISOString()
    });
});

app.get('/quotes', (req, res) => {
    res.json({
        quotes: quotesData.quotes,
        total: quotesData.quotes.length
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'Please check the available endpoints at the root URL'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Random Quotes Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to get started`);
});