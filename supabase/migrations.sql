-- Add user_id to links table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'user_id') THEN
        ALTER TABLE links ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add expires_at column to links table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'expires_at') THEN
        ALTER TABLE links ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    key_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
CREATE POLICY "Users can view their own API keys" 
    ON api_keys FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own API keys" ON api_keys;
CREATE POLICY "Users can create their own API keys" 
    ON api_keys FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;
CREATE POLICY "Users can delete their own API keys" 
    ON api_keys FOR DELETE 
    USING (auth.uid() = user_id);

-- Index for faster lookups (though we'll likely look up by key_hash which needs to be computed)
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Create user_subscriptions table to track premium access
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    stripe_payment_intent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
CREATE POLICY "Users can view their own subscription" 
    ON user_subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_subscriptions
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for links table
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read links (for redirect functionality)
DROP POLICY IF EXISTS "Anyone can read links" ON links;
CREATE POLICY "Anyone can read links" 
    ON links FOR SELECT 
    USING (true);

-- Allow authenticated users to create links
DROP POLICY IF EXISTS "Authenticated users can create links" ON links;
CREATE POLICY "Authenticated users can create links" 
    ON links FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own links
DROP POLICY IF EXISTS "Users can update their own links" ON links;
CREATE POLICY "Users can update their own links" 
    ON links FOR UPDATE 
    USING (auth.uid() = user_id);

-- Allow users to delete their own links
DROP POLICY IF EXISTS "Users can delete their own links" ON links;
CREATE POLICY "Users can delete their own links" 
    ON links FOR DELETE 
    USING (auth.uid() = user_id);
