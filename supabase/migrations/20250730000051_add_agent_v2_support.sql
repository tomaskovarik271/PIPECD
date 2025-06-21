BEGIN;

-- Migration to add AI Agent V2 support to existing agent tables
-- Extends current schema without breaking V1 compatibility

-- =====================================================
-- 1. Add V2 support to agent_conversations table
-- =====================================================

-- Add agent version tracking (defaults to 'v1' for existing records)
ALTER TABLE public.agent_conversations 
ADD COLUMN agent_version text DEFAULT 'v1' CHECK (agent_version IN ('v1', 'v2'));

-- Add V2-specific configuration fields
ALTER TABLE public.agent_conversations 
ADD COLUMN extended_thinking_enabled boolean DEFAULT false,
ADD COLUMN thinking_budget text DEFAULT 'standard' CHECK (thinking_budget IN ('standard', 'think', 'think_hard', 'think_harder', 'ultrathink'));

-- Add comments for new columns
COMMENT ON COLUMN public.agent_conversations.agent_version IS 'Version of AI agent used: v1 (legacy) or v2 (extended thinking)';
COMMENT ON COLUMN public.agent_conversations.extended_thinking_enabled IS 'Whether Claude extended thinking mode is enabled for this conversation';
COMMENT ON COLUMN public.agent_conversations.thinking_budget IS 'Claude thinking budget level for extended reasoning';

-- =====================================================
-- 2. Add V2 support to agent_thoughts table  
-- =====================================================

-- Add extended thinking support fields
ALTER TABLE public.agent_thoughts 
ADD COLUMN thinking_budget text CHECK (thinking_budget IN ('standard', 'think', 'think_hard', 'think_harder', 'ultrathink')),
ADD COLUMN reflection_data jsonb DEFAULT '{}',
ADD COLUMN reasoning text,
ADD COLUMN strategy text,
ADD COLUMN concerns text,
ADD COLUMN next_steps text;

-- Add comments for new columns
COMMENT ON COLUMN public.agent_thoughts.thinking_budget IS 'Claude thinking budget used for this thought';
COMMENT ON COLUMN public.agent_thoughts.reflection_data IS 'Structured reflection data about tool results and plan modifications';
COMMENT ON COLUMN public.agent_thoughts.reasoning IS 'Detailed reasoning content from Claude extended thinking';
COMMENT ON COLUMN public.agent_thoughts.strategy IS 'Strategic approach identified during thinking process';
COMMENT ON COLUMN public.agent_thoughts.concerns IS 'Concerns or potential issues identified during reasoning';
COMMENT ON COLUMN public.agent_thoughts.next_steps IS 'Specific next steps planned during thinking process';

-- =====================================================
-- 3. Add indexes for V2 performance
-- =====================================================

-- Index for V2 conversation filtering
CREATE INDEX idx_agent_conversations_v2 ON public.agent_conversations(agent_version) WHERE agent_version = 'v2';

-- Index for extended thinking lookups
CREATE INDEX idx_agent_conversations_extended_thinking ON public.agent_conversations(extended_thinking_enabled) WHERE extended_thinking_enabled = true;

-- Index for thinking budget analysis
CREATE INDEX idx_agent_thoughts_thinking_budget ON public.agent_thoughts(thinking_budget) WHERE thinking_budget IS NOT NULL;

-- =====================================================
-- 4. Update example data structure comments
-- =====================================================

COMMENT ON COLUMN public.agent_conversations.context IS 
'V1 Example: {"agentConfig": {"enableExtendedThinking": true}, "lastActivity": "2025-01-03T10:00:00Z"}
V2 Example: {"agentConfig": {"enableExtendedThinking": true, "thinkingBudget": "think_hard"}, "systemState": {"dealsCount": 45, "organizationsCount": 12}, "lastActivity": "2025-01-03T10:00:00Z"}';

COMMENT ON COLUMN public.agent_thoughts.metadata IS 
'V1 Example: {"toolName": "search_deals", "executionTime": 1.2}
V2 Example: {"toolName": "search_deals", "executionTime": 1.2, "reflectionTriggered": true, "planModified": false, "confidenceScore": 0.95}';

COMMIT; 