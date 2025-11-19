# Security Configuration Guide

This document outlines the security improvements made to the link-shortener application and how to configure environment variables.

## Security Features Implemented

### ✅ 1. Environment Variables Protection
- **Stripe Publishable Key**: Moved from hardcoded value to `PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable
- All sensitive keys are now stored in environment variables

### ✅ 2. Rate Limiting
- **General Rate Limiting**: 100 requests per 15 minutes per IP
- **Strict Rate Limiting**: 20 requests per 15 minutes for URL shortening
- **Payment Rate Limiting**: 10 payment requests per hour per IP

### ✅ 3. Input Validation & Sanitization
- **URL Validation**: 
  - Only allows `http://` and `https://` protocols
  - Blocks localhost and private IPs in production
  - Maximum URL length: 2048 characters
- **Code Validation**: 
  - Only alphanumeric characters and hyphens
  - Maximum length: 20 characters
- **Email Validation**: Standard email format validation
- **Name Validation**: Only letters, spaces, hyphens, and apostrophes
- **Amount Validation**: Between 50 and 99,999,999 cents

### ✅ 4. Security Headers (Helmet)
- Security headers configured via Helmet middleware
- Content Security Policy can be customized per route if needed

### ✅ 5. Enhanced Encryption
- **Encryption Key Validation**: Validates that ENCRYPTION_KEY is exactly 32 bytes (base64)
- **Error Handling**: Proper error handling for encryption/decryption failures
- **Input Sanitization**: All inputs are sanitized before encryption

### ✅ 6. CORS Configuration
- Configurable allowed origins via `ALLOWED_ORIGINS` environment variable
- Credentials support enabled

## Environment Variables Required

### Backend (.env in `/backend` directory)

```env
# Server Configuration
PORT=8080
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
SECRET_STRIPE_PUBLISHABLE_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Encryption Key (32 bytes, base64 encoded)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=your_32_byte_base64_encryption_key

# Backend URL (for generating short URLs)
BACKEND_URL=https://link-shortener-backend-production.up.railway.app

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:4321,http://localhost:3000,https://your-production-domain.com

# Stripe Redirect URLs
STRIPE_SUCCESS_URL=https://your-frontend-domain.com/success
STRIPE_CANCEL_URL=https://your-frontend-domain.com/cancel
```

### Frontend (.env in root directory)

```env
# Astro Public Environment Variables
# Note: In Astro, public env vars must be prefixed with PUBLIC_

# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (Publishable Key - Safe to expose in frontend)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Backend API URL
PUBLIC_BACKEND_URL=https://link-shortener-backend-production.up.railway.app
```

## Generating Encryption Key

To generate a secure 32-byte encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and set it as `ENCRYPTION_KEY` in your backend `.env` file.

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate encryption keys** periodically (requires re-encrypting existing data)
4. **Monitor rate limit logs** for suspicious activity
5. **Keep dependencies updated** with `npm audit` and `npm update`
6. **Use HTTPS** in production
7. **Restrict CORS origins** to only your production domains

## API Endpoint Security

All endpoints now include:
- Input validation using `express-validator`
- Input sanitization (removes null bytes, trims whitespace)
- Rate limiting appropriate to the endpoint
- Error messages that don't leak sensitive information in production

## Testing Security Features

1. **Rate Limiting**: Make multiple rapid requests to test rate limits
2. **Input Validation**: Try submitting invalid URLs, codes, or emails
3. **URL Validation**: Try submitting localhost URLs, invalid protocols, or private IPs
4. **Encryption**: Verify that encrypted data in database cannot be read without the key

## Additional Recommendations

1. **Add authentication** for sensitive endpoints (payment history, etc.)
2. **Implement request logging** for security monitoring
3. **Add IP whitelisting** for admin endpoints if needed
4. **Consider using a WAF** (Web Application Firewall) in production
5. **Set up monitoring** for failed authentication attempts and rate limit violations
6. **Regular security audits** of dependencies and code

