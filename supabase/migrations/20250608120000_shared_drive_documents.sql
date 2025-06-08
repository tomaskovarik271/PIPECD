-- Create simplified deal_document_attachments table for shared drive documents
-- This replaces the complex folder management with simple document attachment tracking

CREATE TABLE IF NOT EXISTS deal_document_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    google_file_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    shared_drive_id TEXT, -- Which shared drive this came from
    category TEXT CHECK (category IN ('proposal', 'contract', 'presentation', 'client_request', 'client_document', 'correspondence', 'other')),
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attached_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Optional metadata cache for performance
    mime_type TEXT,
    file_size BIGINT,
    
    -- Prevent duplicate attachments of same file to same deal
    UNIQUE(deal_id, google_file_id)
);

-- Add performance indexes
CREATE INDEX idx_deal_attachments_deal_id ON deal_document_attachments(deal_id);
CREATE INDEX idx_deal_attachments_category ON deal_document_attachments(category);
CREATE INDEX idx_deal_attachments_shared_drive ON deal_document_attachments(shared_drive_id);
CREATE INDEX idx_deal_attachments_attached_at ON deal_document_attachments(attached_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add RLS policies
ALTER TABLE deal_document_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view document attachments for their deals
CREATE POLICY "Users can view deal document attachments for their deals" 
ON deal_document_attachments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM deals 
        WHERE deals.id = deal_document_attachments.deal_id 
        AND deals.user_id = auth.uid()
    )
);

-- Users can attach documents to their deals
CREATE POLICY "Users can attach documents to their deals" 
ON deal_document_attachments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM deals 
        WHERE deals.id = deal_document_attachments.deal_id 
        AND deals.user_id = auth.uid()
    )
    AND attached_by = auth.uid()
);

-- Users can remove attachments they created
CREATE POLICY "Users can remove attachments they created" 
ON deal_document_attachments FOR DELETE
USING (attached_by = auth.uid());

-- Users can update attachments they created (for category changes)
CREATE POLICY "Users can update attachments they created" 
ON deal_document_attachments FOR UPDATE
USING (attached_by = auth.uid());

-- Add comment
COMMENT ON TABLE deal_document_attachments IS 'Tracks Google Drive documents attached to deals. Uses shared drives with Google permission system as single source of truth.'; 