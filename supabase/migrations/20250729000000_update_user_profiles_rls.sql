-- supabase/migrations/20250729000000_update_user_profiles_rls.sql
-- Goal: Allow any authenticated user to read any user profile for features like Deal History.

BEGIN;

-- 1. Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can select their own profile" ON public.user_profiles;

-- 2. Create a new policy to allow any authenticated user to read any profile
CREATE POLICY "Authenticated users can read any profile" ON public.user_profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Existing INSERT and UPDATE policies remain unchanged as they correctly restrict modifications to the owner.
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_profiles TO authenticated; (This should already exist from previous migration)

COMMIT; 