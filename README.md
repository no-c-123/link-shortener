# 🔗 SnapLink - URL Shortener

A modern, full-stack URL shortener application built with Astro, React, Node.js, and Supabase. Features include custom short codes, analytics, payment integration, and API key management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## ✨ Features

### Core Functionality
- 🔗 **URL Shortening** - Convert long URLs into short, shareable links
- 🎨 **Custom Short Codes** - Create memorable, branded short links
- 📊 **Click Analytics** - Track link performance with detailed statistics
- 🔐 **User Authentication** - Secure login and registration with Supabase Auth
- 👤 **User Dashboard** - Manage all your links and settings in one place

### Advanced Features
- 💳 **Payment Integration** - Stripe-powered payment processing for premium plans
- 🔑 **API Key Management** - Generate and manage API keys for programmatic access
- 📈 **Transaction History** - View complete payment and subscription history
- 🎯 **Link Expiration** - Set expiration dates for temporary links
- 📱 **QR Code Generation** - Generate QR codes for any shortened link
- 📤 **Bulk Operations** - Shorten multiple links at once
- 📊 **Export Functionality** - Export your links and analytics data

### Security
- 🛡️ **Rate Limiting** - Protection against abuse and spam
- 🔒 **Data Encryption** - Secure storage of sensitive information
- ✅ **Input Validation** - Comprehensive input sanitization
- 🚫 **XSS Protection** - Security headers with Helmet.js
- 🔐 **Row Level Security** - Database-level access control

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/no-c-123/link-shortener.git
   cd link-shortener
   \`\`\`

2. **Install frontend dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Install backend dependencies**
   \`\`\`bash
   cd backend
   npm install
   cd ..
   \`\`\`

4. **Setup environment variables**
   
   Copy the example environment files and fill in your values:
   \`\`\`bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   \`\`\`

   Generate an encryption key for the backend:
   \`\`\`bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   \`\`\`

5. **Setup Supabase database**
   
   Run the migrations in your Supabase project:
   \`\`\`bash
   cd supabase
   # Copy the contents of migrations.sql and run in Supabase SQL Editor
   \`\`\`

6. **Start the development servers**
   
   Terminal 1 - Frontend:
   \`\`\`bash
   npm run dev
   \`\`\`
   
   Terminal 2 - Backend:
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

The frontend will be available at \`http://localhost:4321\` and the backend at \`http://localhost:8080\`.

## 📁 Project Structure

\`\`\`
link-shortener/
├── src/
│   ├── components/          # React components
│   │   ├── AccountDashboard.jsx
│   │   ├── Hero.jsx
│   │   ├── Payment.jsx
│   │   └── ...
│   ├── layouts/             # Astro layouts
│   ├── pages/               # Astro pages/routes
│   ├── lib/                 # Utility functions
│   └── styles/              # CSS files
├── backend/
│   ├── index.js             # Express server
│   ├── package.json
│   └── .env.example
├── supabase/
│   ├── migrations.sql       # Database schema
│   └── functions/           # Edge functions
├── public/                  # Static assets
├── .env.example
└── package.json
\`\`\`

## 🔧 Configuration

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`PUBLIC_SUPABASE_URL\` | Your Supabase project URL | Yes |
| \`PUBLIC_SUPABASE_ANON_KEY\` | Supabase anonymous key | Yes |
| \`PUBLIC_BACKEND_URL\` | Backend API URL | Yes |
| \`PUBLIC_STRIPE_PUBLISHABLE_KEY\` | Stripe public key | Yes |

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`PORT\` | Server port (default: 8080) | No |
| \`NODE_ENV\` | Environment mode | No |
| \`SUPABASE_URL\` | Supabase project URL | Yes |
| \`SUPABASE_ANON_KEY\` | Supabase anonymous key | Yes |
| \`SECRET_STRIPE_PUBLISHABLE_KEY\` | Stripe secret key | Yes |
| \`STRIPE_WEBHOOK_SECRET\` | Stripe webhook secret | Yes |
| \`ENCRYPTION_KEY\` | 32-byte base64 encryption key | Yes |
| \`ALLOWED_ORIGINS\` | Comma-separated CORS origins | No |

## �� API Documentation

### Public Endpoints

#### Shorten URL
\`\`\`http
POST /shorten
Content-Type: application/json
Authorization: Bearer <token> (optional)
X-API-Key: <api-key> (optional)

{
  "originalUrl": "https://example.com/very/long/url",
  "customCode": "my-link" (optional)
}
\`\`\`

#### Get Link Info
\`\`\`http
GET /info/:code
\`\`\`

#### Redirect
\`\`\`http
GET /:code
\`\`\`

### Authenticated Endpoints

#### Generate API Key
\`\`\`http
POST /api-key
Authorization: Bearer <token>

{
  "name": "My API Key"
}
\`\`\`

#### List API Keys
\`\`\`http
GET /api-keys
Authorization: Bearer <token>
\`\`\`

#### Delete API Key
\`\`\`http
DELETE /api-keys/:id
Authorization: Bearer <token>
\`\`\`

#### Get Payment History
\`\`\`http
GET /payments/:email
\`\`\`

#### Update Link
\`\`\`http
PATCH /links/:id
Authorization: Bearer <token>

{
  "original": "https://new-url.com",
  "expires_at": "2025-12-31T23:59:59Z"
}
\`\`\`

#### Bulk Shorten
\`\`\`http
POST /shorten/bulk
Authorization: Bearer <token>

{
  "urls": [
    { "originalUrl": "https://example.com/1" },
    { "originalUrl": "https://example.com/2", "customCode": "custom2" }
  ]
}
\`\`\`

## 🧪 Testing

Run the test suites:

\`\`\`bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage
\`\`\`

## 🐳 Docker

Build and run with Docker:

\`\`\`bash
# Build images
docker-compose build

# Start services
docker-compose up

# Stop services
docker-compose down
\`\`\`

## 📊 Database Schema

### Tables

- **links** - Stores shortened URLs
  - \`id\`, \`code\`, \`original\`, \`user_id\`, \`click_count\`, \`expires_at\`, \`created_at\`

- **payments** - Payment transaction history
  - \`id\`, \`stripe_payment_intent\`, \`amount\`, \`currency\`, \`plan\`, \`payer_email\`, etc.

- **api_keys** - User API keys
  - \`id\`, \`user_id\`, \`key_hash\`, \`name\`, \`created_at\`, \`last_used_at\`

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Connect your repository
2. Set environment variables
3. Deploy command: \`npm run build\`
4. Output directory: \`dist\`

### Backend (Railway/Heroku)

1. Connect your repository
2. Set environment variables
3. Start command: \`npm start\`
4. Set PORT environment variable

## 🔒 Security

- All user inputs are validated and sanitized
- Rate limiting on all endpoints
- CORS protection
- Helmet.js security headers
- Encrypted sensitive data (AES-256-GCM)
- Row Level Security in Supabase
- Secure password hashing

See [SECURITY.md](SECURITY.md) for detailed security information.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Hector Prieto**
- GitHub: [@no-c-123](https://github.com/no-c-123)
- Portfolio: [https://portfolio-seven-green-92.vercel.app/](https://portfolio-seven-green-92.vercel.app/)
- LinkedIn: [Héctor Emiliano Leal Prieto](https://www.linkedin.com/in/h%C3%A9ctor-emiliano-leal-prieto-b581a92b1/)

## 🙏 Acknowledgments

- [Astro](https://astro.build/) - Modern web framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Stripe](https://stripe.com/) - Payment processing
- [Express](https://expressjs.com/) - Backend framework

## 📚 Documentation

- [Features Implemented](FEATURES_IMPLEMENTED.md)
- [Stripe Setup Guide](STRIPE_SETUP.md)
- [Security Documentation](SECURITY.md)

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/no-c-123/link-shortener/issues) page to report bugs or request features.
