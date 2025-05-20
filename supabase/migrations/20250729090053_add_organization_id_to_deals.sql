ALTER TABLE public.deals
ADD COLUMN organization_id UUID NULL,
ADD CONSTRAINT fk_deals_organization_id
  FOREIGN KEY (organization_id)
  REFERENCES public.organizations (id)
  ON DELETE SET NULL;

-- Optional: Add a comment to the column
COMMENT ON COLUMN public.deals.organization_id IS 'Reference to the organization associated with this deal.';

-- Since we altered the table, it's good practice to refresh the PostgREST schema cache.
-- This is usually handled automatically by Supabase, but in some local dev environments or specific setups,
-- a notification might be needed. For Supabase CLI managed projects, `supabase stop` and `supabase start` 
-- or `supabase db reset` (if you are okay with losing data) would refresh it.
-- For a live database, Supabase handles this. During local dev, if issues persist after migration,
-- restarting Supabase services can help.
-- We can also try to notify PostgREST directly, though this is more of an advanced step.
-- For now, we'll rely on Supabase CLI to handle the cache refresh upon applying migrations.

-- Consider if RLS policies on `deals` need to be updated due to this new column, 
-- though typically adding a nullable FK column for linking doesn't immediately impact existing RLS 
-- unless visibility depends on the organization.
-- For now, assuming existing RLS is sufficient for basic CRUD with this new link. 