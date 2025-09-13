require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Import services
const QuotesService = require('./server/quotes');
const ChatService = require('./server/chatService');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize services
let quotesService;
let chatService;

try {
    quotesService = new QuotesService();
    chatService = new ChatService(quotesService);
} catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
}

// Security and performance middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8080',
    credentials: true
}));

app.use(compression());

// Logging
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const chatLimiter = rateLimit({
    windowMs: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
    max: parseInt(process.env.CHAT_RATE_LIMIT_MAX) || 20, // limit each IP to 20 chat requests per windowMs
    message: {
        error: 'Too many chat requests',
        message: 'You have exceeded the chat rate limit. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        quotes: {
            total: quotesService.getCount()
        },
        environment: NODE_ENV,
        version: require('./package.json').version
    });
});

// API Documentation
let swaggerDocument;
try {
    swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
    console.warn('OpenAPI documentation not available:', error.message);
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Random Quotes API!',
        version: require('./package.json').version,
        endpoints: {
            '/health': 'GET - Health check',
            '/docs': 'GET - API documentation',
            '/api/v1/quote': 'GET - Returns a random quote',
            '/api/v1/quotes': 'GET - Returns paginated quotes with optional search',
            '/api/v1/quotes/:id': 'GET - Returns a specific quote by ID',
            '/api/v1/chat': 'POST - AI chat endpoint'
        }
    });
});

// API v1 routes
app.get('/api/v1/quote', (req, res) => {
    try {
        const quote = quotesService.getRandomQuote();
        res.json({
            quote,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting random quote:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve quote'
        });
    }
});

app.get('/api/v1/quotes', (req, res) => {
    try {
        const { contains, page = 1, limit = 10 } = req.query;
        
        // Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

        let result;
        if (contains) {
            result = quotesService.searchQuotes(contains, pageNum, limitNum);
        } else {
            result = quotesService.getPaginatedQuotes(pageNum, limitNum);
        }

        res.json(result);
    } catch (error) {
        console.error('Error getting quotes:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve quotes'
        });
    }
});

app.get('/api/v1/quotes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const quote = quotesService.getQuoteById(id);
        
        if (!quote) {
            return res.status(404).json({
                error: 'Quote not found',
                message: `No quote found with ID: ${id}`
            });
        }

        res.json({ quote });
    } catch (error) {
        console.error('Error getting quote by ID:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve quote'
        });
    }
});

// AI Chat endpoint with stricter rate limiting
app.post('/api/v1/chat', chatLimiter, async (req, res) => {
    try {
        const { message, language = 'en', history = [] } = req.body;
        
        // Validate request
        const validationErrors = chatService.validateChatRequest(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid request parameters',
                details: validationErrors
            });
        }

        // Generate AI response
        const response = await chatService.generateResponse(message, language, history);

        res.json({
            response: response.message,
            language: response.language,
            direction: response.direction,
            provider: response.provider,
            timestamp: new Date().toISOString(),
            ...(response.quote && { quote: response.quote }),
            ...(response.error && { fallback: true })
        });
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to generate chat response'
        });
    }
});

// Backward compatibility routes (deprecated but maintained)
app.get('/quote', (req, res) => {
    res.redirect(301, '/api/v1/quote');
});

app.get('/quotes', (req, res) => {
    res.redirect(301, '/api/v1/quotes');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'Please check the available endpoints at the root URL'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Graceful shutdown
const server = app.listen(PORT, () => {
    console.log(`Random Quotes Server is running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Visit http://localhost:${PORT} to get started`);
    console.log(`API Documentation: http://localhost:${PORT}/docs`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

module.exports = app;