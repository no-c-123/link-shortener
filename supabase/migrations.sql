-- Add user_id to links table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'user_id') THEN
        ALTER TABLE links ADD COLUMN user_id UUID REFERENCES auth.users(id);
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

CREATE POLICY "Users can view their own API keys" 
    ON api_keys FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" 
    ON api_keys FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
    ON api_keys FOR DELETE 
    USING (auth.uid() = user_id);

-- Index for faster lookups (though we'll likely look up by key_hash which needs to be computed)
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
