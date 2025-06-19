-- Add agent_stream_chunks table for real-time AI Agent V2 streaming
-- Migration: 20250730000052_add_agent_stream_chunks_table.sql

BEGIN;

-- Create agent_stream_chunks table for streaming data
CREATE TABLE agent_stream_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    conversation_id UUID REFERENCES agent_conversations(id) ON DELETE CASCADE,
    chunk_type TEXT NOT NULL CHECK (chunk_type IN ('content', 'thinking', 'complete', 'error')),
    content TEXT,
    thinking_data JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX idx_agent_stream_chunks_session_id ON agent_stream_chunks(session_id);
CREATE INDEX idx_agent_stream_chunks_conversation_id ON agent_stream_chunks(conversation_id);
CREATE INDEX idx_agent_stream_chunks_timestamp ON agent_stream_chunks(timestamp);

-- Add RLS policies
ALTER TABLE agent_stream_chunks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own stream chunks
CREATE POLICY "Users can access own stream chunks" ON agent_stream_chunks
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM agent_conversations 
            WHERE user_id = auth.uid()
        )
    );

-- Add comment
COMMENT ON TABLE agent_stream_chunks IS 'Stores real-time streaming chunks for AI Agent V2 responses';

COMMIT; 