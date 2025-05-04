-- Migration to create the activities table

-- Ensure moddatetime extension is available (should be from previous migrations)
-- CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- 1. Create Activities table
CREATE TABLE public.activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Activity details
    type text NOT NULL, -- e.g., 'TASK', 'MEETING', 'CALL', 'EMAIL', 'DEADLINE'
    subject text NOT NULL,
    due_date timestamp with time zone NULL,
    is_done boolean NOT NULL DEFAULT false,
    notes text NULL,

    -- Links to other entities (at least one should ideally be non-null, enforced by app logic for now)
    deal_id uuid NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    person_id uuid NULL REFERENCES public.people(id) ON DELETE CASCADE,
    organization_id uuid NULL REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- 2. Add Indexes
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_deal_id ON public.activities(deal_id);
CREATE INDEX idx_activities_person_id ON public.activities(person_id);
CREATE INDEX idx_activities_organization_id ON public.activities(organization_id);
CREATE INDEX idx_activities_due_date ON public.activities(due_date);
CREATE INDEX idx_activities_is_done ON public.activities(is_done);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS Policies
CREATE POLICY "Users can manage their own activities" ON public.activities
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Add updated_at trigger (using extensions schema)
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- 6. Grant Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.activities TO authenticated;

-- Optional: Add comment about enforcing links
COMMENT ON TABLE public.activities IS 'Stores user activities related to deals, people, or organizations. App logic should enforce that at least one link (deal_id, person_id, organization_id) is set.'; 