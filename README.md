# Random Quotes - AI Wisdom 🌟

A polished, deploy-ready full-stack application featuring an extensive quotes collection and an AI-powered chatbot that speaks English, Arabic, and Sorani Kurdish. Built with modern technologies and designed for accessibility and multilingual support.

![Random Quotes App](https://github.com/user-attachments/assets/cb622609-ec62-43fb-9f70-b9e8021662f5)

## ✨ Features

### 🔮 AI-Powered Chat
- **Multilingual AI Assistant**: Chat in English, Arabic (العربية), or Sorani Kurdish (کوردی)
- **Gemini AI Integration**: Powered by Google's Gemini AI with graceful fallbacks
- **RTL Support**: Full right-to-left text support for Arabic and Kurdish
- **Context-Aware**: Maintains conversation history for better responses
- **Fallback System**: Works even without API keys using local quote responses

![AI Chat Widget](https://github.com/user-attachments/assets/40b50441-af05-427b-add9-e7e3d1efdd0a)

### 📚 Quote Management
- **Extensive Collection**: Curated collection of inspiring quotes
- **Smart Search**: Search quotes by text or author
- **Pagination**: Smooth pagination for large collections
- **Random Quotes**: Get random inspiring quotes instantly
- **Flexible Format Support**: Supports multiple JSON quote formats

### 🎨 Modern UI/UX
- **Mobile-First Design**: Optimized for all device sizes
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Beautiful Gradients**: Modern gradient-based theme
- **Smooth Animations**: Polished interactions and transitions
- **Touch-Friendly**: 44px minimum touch targets for mobile

### 🚀 Production Ready
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Performance**: Compression, caching, and optimized assets
- **Monitoring**: Health checks and comprehensive logging
- **Docker Support**: Complete containerization with docker-compose
- **CI/CD**: GitHub Actions workflow with testing and security scans

## 🛠 Technology Stack

### Backend
- **Node.js + Express**: Robust server foundation
- **Google Gemini AI**: Advanced AI capabilities
- **Security Middleware**: Helmet, CORS, rate limiting
- **OpenAPI Documentation**: Swagger UI integration
- **Comprehensive Testing**: Jest + Supertest

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Lightning-fast development and builds
- **CSS Variables**: Maintainable theming system
- **Responsive Design**: Mobile-first approach
- **RTL Support**: Built-in right-to-left language support

### Infrastructure
- **Docker**: Multi-stage builds with security best practices
- **Nginx**: High-performance static file serving
- **GitHub Actions**: Automated testing and deployment
- **Health Checks**: Comprehensive monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose
- (Optional) Gemini API key from [Google AI Studio](https://aistudio.google.com)

### 🏃‍♂️ Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/random-quotes-server.git
   cd random-quotes-server
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the backend**
   ```bash
   npm install
   npm run dev
   ```

4. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/docs

### 🐳 Docker Setup

1. **Quick start with Docker Compose**
   ```bash
   # Set your Gemini API key (optional)
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   
   # Start all services
   docker-compose up --build
   ```

2. **Access the application**
   - Web App: http://localhost:8080
   - API Server: http://localhost:3000

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CHAT_RATE_LIMIT_WINDOW_MS=300000
CHAT_RATE_LIMIT_MAX=20

# AI Provider Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Optional: OpenAI Configuration (for future use)
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-3.5-turbo
```

### 🤖 Setting up Gemini AI

You can enable AI-powered chat responses using Google Gemini.

Steps:
1. Visit Google AI Studio: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Add the key to your .env file as `GEMINI_API_KEY`
5. Optional: ensure `AI_PROVIDER=gemini` and (optionally) set `GEMINI_MODEL=gemini-1.5-flash`
6. Restart the backend server

Quick .env example (AI section):
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

Note: The app works perfectly without an API key using intelligent fallback responses.

## 📖 API Reference

### Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check with system stats |
| GET | `/docs` | Interactive API documentation |
| GET | `/api/v1/quote` | Get a random quote |
| GET | `/api/v1/quotes` | Get paginated quotes with search |
| GET | `/api/v1/quotes/:id` | Get a specific quote by ID |
| POST | `/api/v1/chat` | AI chat endpoint |

### Chat API Example

```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Give me a quote about success",
    "language": "en",
    "history": []
  }'
```

Response:
```json
{
  "response": "Here's an inspiring quote about success...",
  "language": "en",
  "direction": "ltr",
  "provider": "gemini",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🧪 Testing

### Backend Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run lint              # Linting
```

### Frontend Tests
```bash
cd client
npm run lint              # Linting
npm run build             # Production build
```

### Integration Tests
```bash
docker-compose up -d --build
# Run your integration tests
docker-compose down
```

## 🚀 Deployment

### Production Environment

1. **Set production environment variables**
   ```env
   NODE_ENV=production
   ALLOWED_ORIGIN=https://your-domain.com
   GEMINI_API_KEY=your_production_api_key
   ```

2. **Build for production**
   ```bash
   # Backend is ready as-is
   npm install --production
   
   # Build frontend
   cd client
   npm run build
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

### Deployment Options

- **Render**: Excellent for Node.js apps with automatic deployments
- **Railway**: Simple container deployments
- **Netlify/Vercel**: Perfect for the React frontend
- **DigitalOcean App Platform**: Full-stack deployment
- **AWS/GCP/Azure**: Enterprise-grade deployments

## ♿ Accessibility

This application follows WCAG 2.1 guidelines:

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and ARIA labels  
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Color Contrast**: High contrast ratios for readability
- **RTL Support**: Proper right-to-left language support
- **Focus Management**: Clear focus indicators

## 🌍 Internationalization

### Supported Languages
- **English (en)**: Left-to-right
- **Arabic (ar)**: Right-to-left with Arabic text support
- **Sorani Kurdish (ckb)**: Right-to-left with Kurdish text support

### Adding New Languages

1. Update `LANGUAGE_CONFIG` in `client/src/hooks/useChat.js`
2. Add language option in `server/chatService.js`
3. Update language selector in the chat widget

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Ensure accessibility compliance
- Test with multiple languages and RTL support

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: Powering our multilingual AI chat
- **React Community**: Amazing ecosystem and tools
- **Contributors**: Everyone who helped make this project better

## 📞 Support

- 📧 **Email**: support@yourapp.com
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/random-quotes-server/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/random-quotes-server/discussions)
- 📚 **Documentation**: [API Docs](http://localhost:3000/docs)

---

**Made with ❤️ and powered by AI wisdom**