-- Create deal_documents table for tracking file attachments
CREATE TABLE IF NOT EXISTS deal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    file_id TEXT NOT NULL, -- Google Drive file ID
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Google Drive web view link
    mime_type TEXT,
    file_size BIGINT,
    category TEXT CHECK (category IN ('PROPOSALS', 'CONTRACTS', 'LEGAL', 'PRESENTATIONS', 'CORRESPONDENCE', 'OTHER')),
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attached_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX idx_deal_documents_file_id ON deal_documents(file_id);
CREATE INDEX idx_deal_documents_category ON deal_documents(category);
CREATE INDEX idx_deal_documents_attached_at ON deal_documents(attached_at);

-- Create deal_drive_folders table for tracking auto-created folders
CREATE TABLE IF NOT EXISTS deal_drive_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    folder_id TEXT NOT NULL UNIQUE, -- Google Drive folder ID
    folder_name TEXT NOT NULL,
    folder_url TEXT NOT NULL, -- Google Drive web view link
    parent_folder_id TEXT, -- Parent folder ID in Drive
    is_main_folder BOOLEAN DEFAULT true, -- Main deal folder vs subfolder
    subfolder_type TEXT CHECK (subfolder_type IN ('PROPOSALS', 'CONTRACTS', 'LEGAL', 'PRESENTATIONS', 'CORRESPONDENCE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_deal_drive_folders_deal_id ON deal_drive_folders(deal_id);
CREATE INDEX idx_deal_drive_folders_folder_id ON deal_drive_folders(folder_id);
CREATE INDEX idx_deal_drive_folders_is_main ON deal_drive_folders(is_main_folder);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deal_documents_updated_at BEFORE UPDATE ON deal_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_drive_folders_updated_at BEFORE UPDATE ON deal_drive_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_drive_folders ENABLE ROW LEVEL SECURITY;

-- Deal documents policies (simplified for now)
CREATE POLICY "Users can view deal documents for their deals" 
ON deal_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM deals 
        WHERE deals.id = deal_documents.deal_id 
        AND deals.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert deal documents for their deals" 
ON deal_documents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM deals 
        WHERE deals.id = deal_documents.deal_id 
        AND deals.user_id = auth.uid()
    )
    AND attached_by = auth.uid()
);

CREATE POLICY "Users can update deal documents they created" 
ON deal_documents FOR UPDATE
USING (attached_by = auth.uid());

CREATE POLICY "Users can delete deal documents they created" 
ON deal_documents FOR DELETE
USING (attached_by = auth.uid());

-- Deal drive folders policies (simplified for now)
CREATE POLICY "Users can view deal folders for their deals" 
ON deal_drive_folders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM deals 
        WHERE deals.id = deal_drive_folders.deal_id 
        AND deals.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert deal folders for their deals" 
ON deal_drive_folders FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM deals 
        WHERE deals.id = deal_drive_folders.deal_id 
        AND deals.user_id = auth.uid()
    )
    AND created_by = auth.uid()
);

CREATE POLICY "Users can update deal folders they created" 
ON deal_drive_folders FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Users can delete deal folders they created" 
ON deal_drive_folders FOR DELETE
USING (created_by = auth.uid()); 