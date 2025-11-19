# Stripe Setup Guide

## Error: "Please call Stripe() with your publishable key. You used an empty string."

This error means your Stripe publishable key is not configured. Follow these steps:

### Frontend Setup (Astro)

1. Create a `.env` file in the **root directory** of your project (same level as `package.json`)

2. Add your Stripe publishable key:
```env
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
PUBLIC_BACKEND_URL=https://link-shortener-backend-production.up.railway.app
```

**Important Notes:**
- The `PUBLIC_` prefix is required for Astro to expose the variable to the frontend
- Use `pk_test_...` for testing or `pk_live_...` for production
- Get your keys from: https://dashboard.stripe.com/apikeys

3. **Restart your dev server** after adding environment variables:
```bash
npm run dev
```

### Backend Setup

1. Create a `.env` file in the `/backend` directory

2. Add your Stripe secret key:
```env
SECRET_STRIPE_PUBLISHABLE_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important Notes:**
- Use `sk_test_...` for testing or `sk_live_...` for production
- Never commit `.env` files to git
- The webhook secret is only needed if you're using Stripe webhooks

3. **Restart your backend server** after adding environment variables

### Getting Your Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys
2. If you don't have an account, create one (it's free for testing)
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
5. Click "Reveal test key" if needed

### Testing

After setting up your keys:

1. **Frontend**: The payment page should load without the "empty string" error
2. **Backend**: The `/create-payment-intent` endpoint should return a 200 status instead of 500

### Common Issues

#### Issue: Still getting "empty string" error after adding key
- Make sure the variable name is exactly `PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Make sure you restarted the dev server
- Check that there are no spaces around the `=` sign
- Verify the key starts with `pk_test_` or `pk_live_`

#### Issue: Backend 500 errors
- Check that `SECRET_STRIPE_PUBLISHABLE_KEY` is set in `/backend/.env`
- Make sure the secret key starts with `sk_test_` or `sk_live_`
- Restart the backend server
- Check backend logs for specific error messages

#### Issue: ERR_BLOCKED_BY_CLIENT
- This might be caused by an ad blocker
- Try disabling browser extensions
- Check if your firewall is blocking Stripe domains

### Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform (Vercel, Railway, etc.)
2. Use **live keys** (`pk_live_` and `sk_live_`) instead of test keys
3. Make sure webhook URLs are configured in Stripe dashboard
4. Test the payment flow thoroughly before going live

### Security Reminders

- ✅ Never commit `.env` files
- ✅ Never expose secret keys in frontend code
- ✅ Use test keys for development
- ✅ Rotate keys if they're accidentally exposed
- ✅ Use environment variables, not hardcoded values

