-- Migration: Create note document attachments table
-- Description: Add support for attaching Google Drive documents to notes
-- Date: 2025-01-15

BEGIN;

-- Create note_document_attachments table
CREATE TABLE IF NOT EXISTS public.note_document_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL, -- References smart_stickers.id (notes are stored as stickers)
    google_file_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attached_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Optional metadata cache
    mime_type TEXT,
    file_size BIGINT,
    
    -- Prevent duplicate attachments to the same note
    UNIQUE(note_id, google_file_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_note_attachments_note_id ON note_document_attachments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_attachments_attached_by ON note_document_attachments(attached_by);
CREATE INDEX IF NOT EXISTS idx_note_attachments_attached_at ON note_document_attachments(attached_at DESC);

-- Enable Row Level Security
ALTER TABLE note_document_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for note_document_attachments
-- Users can view attachments for notes they have access to
CREATE POLICY "Users can view note attachments they have access to" ON note_document_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM smart_stickers s
            WHERE s.id = note_id
            AND (
                s.created_by_user_id = auth.uid()
                OR s.is_private = false
                OR (
                    SELECT get_user_permissions(auth.uid())::jsonb ? 'sticker:read_any'
                    OR get_user_permissions(auth.uid())::jsonb ? 'admin'
                )
            )
        )
    );

-- Users can attach documents to notes they can edit
CREATE POLICY "Users can attach documents to notes they can edit" ON note_document_attachments
    FOR INSERT WITH CHECK (
        attached_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM smart_stickers s
            WHERE s.id = note_id
            AND (
                s.created_by_user_id = auth.uid()
                OR (
                    SELECT get_user_permissions(auth.uid())::jsonb ? 'sticker:update_any'
                    OR get_user_permissions(auth.uid())::jsonb ? 'admin'
                )
            )
        )
    );

-- Users can remove attachments they created or if they can edit the note
CREATE POLICY "Users can remove note attachments they created or can edit" ON note_document_attachments
    FOR DELETE USING (
        attached_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM smart_stickers s
            WHERE s.id = note_id
            AND (
                s.created_by_user_id = auth.uid()
                OR (
                    SELECT get_user_permissions(auth.uid())::jsonb ? 'sticker:update_any'
                    OR get_user_permissions(auth.uid())::jsonb ? 'admin'
                )
            )
        )
    );

-- Add helpful comments
COMMENT ON TABLE note_document_attachments IS 'Stores Google Drive document attachments for notes (smart stickers)';
COMMENT ON COLUMN note_document_attachments.note_id IS 'References smart_stickers.id - notes are stored as stickers';
COMMENT ON COLUMN note_document_attachments.google_file_id IS 'Google Drive file ID for the attached document';
COMMENT ON COLUMN note_document_attachments.file_url IS 'Google Drive web view URL for the document';

COMMIT; 