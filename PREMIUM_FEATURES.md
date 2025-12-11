# Premium Features Implementation

## Overview
The payment system now properly grants premium access to users who complete payment. Premium features are enforced at the API level.

## Database Changes

### New Table: `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    plan TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    stripe_payment_intent TEXT,
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Premium Feature Enforcement

### 🎯 Protected Features

#### 1. **Link Expiration** (Pro & Enterprise)
- Endpoint: `POST /shorten` with `expiresAt` parameter
- Requires authentication + premium subscription
- Error Response: `403 Premium feature required`

#### 2. **Link Editing** (Pro & Enterprise)
- Endpoint: `PATCH /links/:id`
- Requires authentication + premium subscription via `requiresPremium` middleware
- Allows updating destination URL and expiration date

#### 3. **Bulk URL Shortening** (Pro & Enterprise)
- Endpoint: `POST /shorten/bulk`
- Requires authentication + premium subscription via `requiresPremium` middleware
- Process up to 100 URLs at once

### 🆓 Free Features
- Basic URL shortening (without expiration)
- Link analytics and click tracking
- Custom short codes
- QR code generation
- Link deletion
- Export functionality (CSV/JSON)
- API key generation

## How Premium Access is Granted

### Payment Flow
1. User completes payment via Stripe
2. Stripe webhook fires `payment_intent.succeeded` event
3. Backend receives webhook at `POST /webhook`
4. System:
   - Saves payment to `payments` table
   - Looks up user by email from payment metadata
   - Creates/updates entry in `user_subscriptions` table
   - Sets `plan` to the purchased plan (pro/enterprise)
   - Sets `expires_at` based on plan duration:
     - Pro: 30 days from purchase
     - Enterprise: 365 days from purchase
   - Sets `status` to 'active'

### Subscription Validation
```javascript
// Helper function checks:
async function getUserSubscription(userId) {
  1. Query user_subscriptions for active subscription
  2. Check if expires_at has passed
  3. Update status to 'expired' if needed
  4. Return subscription object or default to 'free'
}
```

### Premium Middleware
```javascript
async function requiresPremium(req, res, next) {
  1. Extract user ID from Bearer token or API key
  2. Fetch subscription status
  3. If plan === 'free', return 403 error
  4. Otherwise, attach subscription to req object and continue
}
```

## API Endpoints

### Check Subscription Status
```
GET /subscription/status
Authorization: Bearer <token>

Response:
{
  "plan": "pro",
  "status": "active",
  "expiresAt": "2026-01-11T00:00:00Z",
  "features": {
    "linkExpiration": true,
    "bulkShortening": true,
    "linkEditing": true,
    "advancedAnalytics": true,
    "customBranding": false,
    "prioritySupport": true
  }
}
```

## Plan Comparison

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Basic URL Shortening | ✅ | ✅ | ✅ |
| Custom Codes | ✅ | ✅ | ✅ |
| QR Codes | ✅ | ✅ | ✅ |
| Click Analytics | ✅ | ✅ | ✅ |
| API Access | ✅ | ✅ | ✅ |
| **Link Expiration** | ❌ | ✅ | ✅ |
| **Link Editing** | ❌ | ✅ | ✅ |
| **Bulk Shortening** | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ |
| Duration | Forever | 30 days | 365 days |

## Error Responses

### Authentication Required
```json
{
  "error": "Authentication required",
  "message": "Please log in to access premium features"
}
```

### Premium Required
```json
{
  "error": "Premium feature",
  "message": "This feature requires a premium subscription. Please upgrade your plan.",
  "currentPlan": "free"
}
```

## Testing Premium Access

### 1. Without Payment (Free User)
```bash
# Try to use link expiration
curl -X POST https://api.snaplink.com/shorten \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "expiresAt": "2025-12-31T00:00:00Z"}'

# Response: 403 Premium feature required
```

### 2. After Payment (Premium User)
```bash
# Same request succeeds
curl -X POST https://api.snaplink.com/shorten \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "expiresAt": "2025-12-31T00:00:00Z"}'

# Response: 200 Success with expiration set
```

### 3. Check Subscription Status
```bash
curl -X GET https://api.snaplink.com/subscription/status \
  -H "Authorization: Bearer <token>"
```

## Migration Steps

1. **Run Database Migration**
   ```sql
   -- In Supabase SQL Editor
   -- Paste contents of supabase/migrations.sql
   ```

2. **Restart Backend Server**
   ```bash
   npm run start
   ```

3. **Test Payment Flow**
   - Complete a test payment with Stripe
   - Check `user_subscriptions` table in Supabase
   - Verify premium features are now accessible

## Future Enhancements

- [ ] Automatic renewal reminders (email 7 days before expiration)
- [ ] Stripe subscription integration (recurring billing)
- [ ] Usage analytics per plan
- [ ] Plan downgrade handling (what happens to premium links?)
- [ ] Grace period after expiration
- [ ] Proration for plan upgrades
- [ ] Webhook for subscription cancellation
- [ ] Admin panel to manually grant/revoke premium access

## Notes

- Subscription expiration is checked on every premium feature request
- Expired subscriptions automatically update to 'expired' status
- Users revert to 'free' plan features when subscription expires
- Payment metadata must include user email for subscription assignment
- Stripe webhook secret must be configured in environment variables
