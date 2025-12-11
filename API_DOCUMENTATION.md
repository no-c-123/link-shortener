# SnapLink API Documentation

Complete API reference for the SnapLink URL Shortener backend.

**Base URL**: `http://localhost:8080` (development) or your production URL

## Table of Contents
- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Authenticated Endpoints](#authenticated-endpoints)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)

## Authentication

Most endpoints require authentication using a Bearer token obtained from Supabase Auth.

```http
Authorization: Bearer <your_access_token>
```

Some endpoints also support API key authentication:

```http
X-API-Key: <your_api_key>
```

## Public Endpoints

### Shorten URL

Create a shortened URL.

**Endpoint**: `POST /shorten`

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (optional - for user association)
- `X-API-Key: <api_key>` (optional - alternative auth)

**Request Body**:
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "customCode": "my-link"  // optional, 1-20 chars, alphanumeric + hyphens
}
```

**Response** (200 OK):
```json
{
  "shortUrl": "https://your-domain.com/abc123",
  "linkData": {
    "id": "uuid",
    "code": "abc123",
    "original": "https://example.com/very/long/url",
    "user_id": "uuid",  // null if not authenticated
    "click_count": 0,
    "created_at": "2025-12-11T12:00:00Z",
    "expires_at": null
  }
}
```

**Error Responses**:
- `400`: Invalid URL or custom code format
- `409`: Custom code already exists
- `500`: Database error

### Get Link Info

Retrieve information about a shortened link without redirecting.

**Endpoint**: `GET /info/:code`

**Response** (200 OK):
```json
{
  "id": "uuid",
  "code": "abc123",
  "original": "https://example.com/very/long/url",
  "user_id": "uuid",
  "click_count": 42,
  "created_at": "2025-12-11T12:00:00Z",
  "expires_at": null
}
```

**Error Responses**:
- `400`: Invalid code format
- `404`: Link not found

### Redirect to Original URL

Follow a shortened link (redirects to original URL).

**Endpoint**: `GET /:code`

**Response**:
- `301`: Redirect to original URL
- `400`: Invalid code format
- `404`: Link not found
- `410`: Link has expired
- `500`: Database or validation error

### Health Check

Check API server health.

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-12-11T12:00:00Z",
  "uptime": 3600.5,
  "environment": "production"
}
```

## Authenticated Endpoints

### Generate API Key

Create a new API key for programmatic access.

**Endpoint**: `POST /api-key`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "name": "My API Key"  // optional
}
```

**Response** (200 OK):
```json
{
  "apiKey": "sk_abc123...",  // ONLY SHOWN ONCE - SAVE IT!
  "id": "uuid",
  "name": "My API Key"
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Failed to create API key

### List API Keys

Get all API keys for the authenticated user.

**Endpoint**: `GET /api-keys`

**Authentication**: Required (Bearer token)

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "name": "My API Key",
    "created_at": "2025-12-11T12:00:00Z",
    "last_used_at": "2025-12-11T14:30:00Z"
  }
]
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Failed to fetch API keys

### Delete API Key

Delete a specific API key.

**Endpoint**: `DELETE /api-keys/:id`

**Authentication**: Required (Bearer token)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

**Error Responses**:
- `400`: Invalid API key ID
- `401`: Unauthorized
- `403`: Forbidden (not your key)
- `404`: API key not found
- `500`: Failed to delete API key

### Update Link

Update an existing link's destination or expiration.

**Endpoint**: `PATCH /links/:id`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "original": "https://new-destination.com",  // optional
  "expires_at": "2025-12-31T23:59:59Z"       // optional, ISO 8601 format
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "code": "abc123",
  "original": "https://new-destination.com",
  "user_id": "uuid",
  "click_count": 42,
  "created_at": "2025-12-11T12:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Error Responses**:
- `400`: Invalid link ID, URL format, or date format / No updates provided
- `401`: Unauthorized
- `403`: Forbidden (not your link)
- `404`: Link not found
- `500`: Failed to update link

### Bulk Shorten URLs

Shorten multiple URLs in a single request.

**Endpoint**: `POST /shorten/bulk`

**Authentication**: Optional (Bearer token for user association)

**Request Body**:
```json
{
  "urls": [
    {
      "originalUrl": "https://example.com/1"
    },
    {
      "originalUrl": "https://example.com/2",
      "customCode": "custom2"  // optional
    }
  ]
}
```

**Limits**: 1-100 URLs per request

**Response** (200 OK):
```json
{
  "success": 2,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "shortUrl": "https://your-domain.com/abc123",
      "linkData": {
        "id": "uuid",
        "code": "abc123",
        "original": "https://example.com/1",
        "user_id": "uuid",
        "click_count": 0,
        "created_at": "2025-12-11T12:00:00Z"
      }
    }
  ],
  "errors": []
}
```

**Error Response Example** (partial failure):
```json
{
  "success": 1,
  "failed": 1,
  "results": [...],
  "errors": [
    {
      "index": 1,
      "error": "Invalid URL format",
      "url": "not-a-valid-url"
    }
  ]
}
```

**Error Responses**:
- `400`: Validation errors (must provide 1-100 URLs)
- `401`: Unauthorized (if using Bearer token)
- `500`: Unexpected server error

### Get Payment History

Retrieve payment transactions for a user by email.

**Endpoint**: `GET /payments/:email`

**Authentication**: Not required (email-based lookup)

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "stripe_payment_intent": "pi_...",
    "amount": 500,  // cents
    "currency": "usd",
    "plan": "starter",
    "payer_first_name": "John",  // decrypted
    "payer_last_name": "Doe",    // decrypted
    "payer_email": "john@example.com",
    "card_last4": "4242",
    "card_brand": "visa",
    "created_at": "2025-12-11T12:00:00Z"
  }
]
```

**Error Responses**:
- `400`: Invalid email format
- `500`: Database error

## Payment Endpoints

### Create Payment Intent

Create a Stripe payment intent for checkout.

**Endpoint**: `POST /create-payment-intent`

**Request Body**:
```json
{
  "amount": 500,  // required, in cents
  "currency": "usd",  // optional, default: "usd"
  "plan": "starter",  // optional
  "firstName": "John",  // optional
  "lastName": "Doe",  // optional
  "email": "john@example.com"  // optional
}
```

**Response** (200 OK):
```json
{
  "clientSecret": "pi_..._secret_...",
  "id": "pi_..."
}
```

### Create Checkout Session

Create a Stripe checkout session for subscriptions.

**Endpoint**: `POST /create-checkout-session`

**Request Body**:
```json
{
  "priceId": "price_..."  // Stripe price ID
}
```

**Response** (200 OK):
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Webhook Handler

Stripe webhook endpoint for payment confirmations.

**Endpoint**: `POST /webhook`

**Headers**:
- `stripe-signature`: Stripe signature header

**Body**: Raw Stripe event (handled automatically)

**Response**: `200 { received: true }`

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Detailed error information (development mode only)"
}
```

### Common HTTP Status Codes

- `200`: Success
- `301`: Redirect (for shortened URLs)
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `410`: Gone (expired link)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

### General Endpoints
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Response**: 429 with retry-after header

### Strict Endpoints (POST /shorten, POST /shorten/bulk)
- **Window**: 15 minutes
- **Limit**: 20 requests per IP

### Payment Endpoints
- **Window**: 1 hour
- **Limit**: 10 requests per IP

### Response Headers

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit resets

## Security

### Input Validation

All inputs are validated and sanitized:
- URLs: Must be valid http/https URLs (localhost blocked in production)
- Codes: Alphanumeric + hyphens, 1-20 characters
- Email: Valid email format
- IDs: Valid UUID format

### Encryption

Sensitive data is encrypted using AES-256-GCM:
- Payment: First name, last name
- Storage: Base64-encoded ciphertext

### CORS

Allowed origins are configurable via `ALLOWED_ORIGINS` environment variable.

Default allowed origins:
- `http://localhost:4321`
- `http://localhost:3000`

## Code Examples

### JavaScript (Node.js)

```javascript
// Shorten URL
const response = await fetch('http://localhost:8080/shorten', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    originalUrl: 'https://example.com',
    customCode: 'my-link'
  })
});
const data = await response.json();
console.log(data.shortUrl);
```

### cURL

```bash
# Shorten URL
curl -X POST http://localhost:8080/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"originalUrl": "https://example.com", "customCode": "my-link"}'

# Get link info
curl http://localhost:8080/info/my-link

# List API keys
curl http://localhost:8080/api-keys \
  -H "Authorization: Bearer your-token"
```

### Python

```python
import requests

# Shorten URL
response = requests.post(
    'http://localhost:8080/shorten',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token'
    },
    json={
        'originalUrl': 'https://example.com',
        'customCode': 'my-link'
    }
)
data = response.json()
print(data['shortUrl'])
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/no-c-123/link-shortener/issues
- Documentation: See README.md and FEATURES_IMPLEMENTED.md
