-- supabase/migrations/20250511182101_create_deal_history_table.sql

CREATE TABLE public.deal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who performed the action
    event_type TEXT NOT NULL, -- e.g., 'DEAL_CREATED', 'DEAL_UPDATED', 'DEAL_DELETED'
    changes JSONB NULL, -- Stores details of what changed or initial state
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: Add a comment to describe the table
COMMENT ON TABLE public.deal_history IS 'Stores audit trail/history of changes for deals.';

-- Indexes for performance
CREATE INDEX idx_deal_history_deal_id ON public.deal_history(deal_id);
CREATE INDEX idx_deal_history_created_at ON public.deal_history(created_at DESC);
CREATE INDEX idx_deal_history_user_id ON public.deal_history(user_id);

-- Enable RLS
ALTER TABLE public.deal_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Example: Allow users to see history for deals they can access)
-- This policy assumes that if a user can read a deal, they can read its history.
-- It might need to be more granular based on specific permissions for viewing history.
CREATE POLICY "Allow users to read history for accessible deals"
ON public.deal_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.deals d
    WHERE d.id = deal_history.deal_id
    -- Assuming RLS on 'deals' table correctly filters what deals the current user can see.
    -- If 'deals' RLS is based on 'SELECT TRUE', this implies direct access.
    -- If 'deals' RLS is more complex (e.g., check_permission), that logic might need to be
    -- considered or replicated here if direct deal access doesn't imply history access.
    -- For simplicity, we'll start with the assumption that deal visibility implies history visibility.
  )
);

-- Only authenticated users can be linked to history entries (implicitly handled by FK and app logic)
-- No specific INSERT/UPDATE/DELETE policies are defined here for users on this table directly,
-- as history records are created by the backend service logic.
