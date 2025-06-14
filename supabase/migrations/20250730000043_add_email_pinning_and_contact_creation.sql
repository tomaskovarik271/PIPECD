BEGIN;

-- Add email pinning functionality
CREATE TABLE IF NOT EXISTS email_pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    email_id TEXT NOT NULL, -- Gmail message ID
    thread_id TEXT NOT NULL, -- Gmail thread ID
    subject TEXT,
    from_email TEXT,
    pinned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT, -- Optional user notes about why this email is pinned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique pins per user/deal/email combination
    UNIQUE(user_id, deal_id, email_id)
);

-- Add indexes for performance
CREATE INDEX idx_email_pins_user_deal ON email_pins(user_id, deal_id);
CREATE INDEX idx_email_pins_deal ON email_pins(deal_id);
CREATE INDEX idx_email_pins_thread ON email_pins(thread_id);

-- Add RLS policies for email pins
ALTER TABLE email_pins ENABLE ROW LEVEL SECURITY;

-- Users can only see their own pinned emails
CREATE POLICY "Users can view their own pinned emails" ON email_pins
    FOR SELECT USING (auth.uid() = user_id);

-- Users can pin emails for deals they have access to
CREATE POLICY "Users can pin emails for accessible deals" ON email_pins
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE id = deal_id 
            AND (user_id = auth.uid() OR assigned_to_user_id = auth.uid())
        )
    );

-- Users can update their own pinned emails
CREATE POLICY "Users can update their own pinned emails" ON email_pins
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own pinned emails
CREATE POLICY "Users can delete their own pinned emails" ON email_pins
    FOR DELETE USING (auth.uid() = user_id);

-- Add contact creation tracking to people table
ALTER TABLE people ADD COLUMN IF NOT EXISTS created_from_email_id TEXT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS created_from_email_subject TEXT;

-- Add index for email-created contacts
CREATE INDEX IF NOT EXISTS idx_people_created_from_email ON people(created_from_email_id) WHERE created_from_email_id IS NOT NULL;

-- Add trigger to update updated_at timestamp for email_pins
CREATE OR REPLACE FUNCTION update_email_pins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_pins_updated_at
    BEFORE UPDATE ON email_pins
    FOR EACH ROW
    EXECUTE FUNCTION update_email_pins_updated_at();

COMMIT; 