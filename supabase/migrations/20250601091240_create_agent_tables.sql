-- Migration to create agent conversation and thought tables for autonomous AI agent feature

-- =====================================================
-- 1. Create agent_conversations table
-- =====================================================
CREATE TABLE public.agent_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    messages jsonb NOT NULL DEFAULT '[]'::jsonb,
    plan jsonb NULL,
    context jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to the table and columns
COMMENT ON TABLE public.agent_conversations IS 'Stores AI agent conversations with messages, plans, and context for each user.';
COMMENT ON COLUMN public.agent_conversations.user_id IS 'User who owns this conversation, references auth.users.';
COMMENT ON COLUMN public.agent_conversations.messages IS 'Array of conversation messages in JSONB format.';
COMMENT ON COLUMN public.agent_conversations.plan IS 'Current execution plan for multi-step operations, nullable.';
COMMENT ON COLUMN public.agent_conversations.context IS 'Conversation context and metadata in JSONB format.';

-- =====================================================
-- 2. Create agent_thoughts table (for detailed thought tracking)
-- =====================================================
CREATE TABLE public.agent_thoughts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('reasoning', 'question', 'tool_call', 'observation', 'plan')),
    content text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to the table and columns
COMMENT ON TABLE public.agent_thoughts IS 'Stores detailed thought processes for AI agent conversations.';
COMMENT ON COLUMN public.agent_thoughts.conversation_id IS 'References the conversation this thought belongs to.';
COMMENT ON COLUMN public.agent_thoughts.type IS 'Type of thought: reasoning, question, tool_call, observation, or plan.';
COMMENT ON COLUMN public.agent_thoughts.content IS 'The actual thought content or description.';
COMMENT ON COLUMN public.agent_thoughts.metadata IS 'Additional metadata about the thought in JSONB format.';

-- =====================================================
-- 3. Add Indexes for performance
-- =====================================================

-- Index for agent_conversations
CREATE INDEX idx_agent_conversations_user_id ON public.agent_conversations(user_id);
CREATE INDEX idx_agent_conversations_updated_at ON public.agent_conversations(updated_at DESC);
CREATE INDEX idx_agent_conversations_created_at ON public.agent_conversations(created_at DESC);

-- Index for agent_thoughts
CREATE INDEX idx_agent_thoughts_conversation_id ON public.agent_thoughts(conversation_id);
CREATE INDEX idx_agent_thoughts_type ON public.agent_thoughts(type);
CREATE INDEX idx_agent_thoughts_timestamp ON public.agent_thoughts(timestamp DESC);

-- =====================================================
-- 4. Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_thoughts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Create RLS Policies for agent_conversations
-- =====================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own agent conversations" ON public.agent_conversations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "Users can create own agent conversations" ON public.agent_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own agent conversations" ON public.agent_conversations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own agent conversations" ON public.agent_conversations
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. Create RLS Policies for agent_thoughts
-- =====================================================

-- Users can view thoughts from their own conversations
CREATE POLICY "Users can view thoughts from own conversations" ON public.agent_thoughts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agent_conversations 
            WHERE id = agent_thoughts.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- Users can create thoughts for their own conversations
CREATE POLICY "Users can create thoughts for own conversations" ON public.agent_thoughts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agent_conversations 
            WHERE id = agent_thoughts.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- Users can update thoughts from their own conversations
CREATE POLICY "Users can update thoughts from own conversations" ON public.agent_thoughts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.agent_conversations 
            WHERE id = agent_thoughts.conversation_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agent_conversations 
            WHERE id = agent_thoughts.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- Users can delete thoughts from their own conversations
CREATE POLICY "Users can delete thoughts from own conversations" ON public.agent_thoughts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.agent_conversations 
            WHERE id = agent_thoughts.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- =====================================================
-- 7. Add updated_at triggers
-- =====================================================

-- Trigger for agent_conversations updated_at
CREATE TRIGGER handle_updated_at_agent_conversations 
    BEFORE UPDATE ON public.agent_conversations
    FOR EACH ROW 
    EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- =====================================================
-- 8. Grant permissions to authenticated users
-- =====================================================

-- Grant basic permissions to authenticated users (RLS policies control actual access)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agent_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agent_thoughts TO authenticated;

-- Grant usage on the sequences (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 9. Add example data structure comments
-- =====================================================

COMMENT ON COLUMN public.agent_conversations.messages IS 
'Example structure: [{"role": "user", "content": "Hello", "timestamp": "2025-01-03T10:00:00Z", "thoughts": [...]}, {"role": "assistant", "content": "Hi there!", "timestamp": "2025-01-03T10:00:01Z"}]';

COMMENT ON COLUMN public.agent_conversations.plan IS 
'Example structure: {"goal": "Create a deal", "steps": [{"id": "1", "description": "Search contacts", "toolName": "search_contacts", "status": "completed"}], "context": {}}';

COMMENT ON COLUMN public.agent_conversations.context IS 
'Example structure: {"agentConfig": {"enableExtendedThinking": true, "thinkingBudget": "think_hard"}, "lastActivity": "2025-01-03T10:00:00Z"}'; 