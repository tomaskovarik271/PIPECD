-- Migration to create the user_profiles table and related policies

-- 1. Create user_profiles table
CREATE TABLE public.user_profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text NULL,
    avatar_url text NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comment to the table
COMMENT ON TABLE public.user_profiles IS 'Stores user profile information like display name and avatar URL, linked to auth.users.';

-- 2. Add Indexes (optional, user_id is PK so already indexed)
-- CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id); -- Not strictly necessary due to PK

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS Policies
CREATE POLICY "Users can select their own profile" ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Note: DELETE policy is implicitly handled by ON DELETE CASCADE or could be added if direct deletes by users were allowed.
-- For now, profile deletion is tied to auth.users deletion.

-- 5. Add updated_at trigger
-- Ensure the moddatetime extension is enabled in your Supabase project.
-- You can enable it via the Supabase dashboard (Database > Extensions) or by running:
-- CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- 6. Grant Permissions to roles
-- The RLS policies effectively grant specific access. 
-- However, underlying table permissions are still needed for the roles to interact with the table before RLS policies are evaluated.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_profiles TO authenticated;
-- Service role will bypass RLS, so it has full access implicitly.

-- TODO: Consider if a function to create a user profile on new user signup (via trigger on auth.users) is desired in the future. 