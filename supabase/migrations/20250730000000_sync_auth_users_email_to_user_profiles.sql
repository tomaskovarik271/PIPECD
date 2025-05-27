BEGIN;

-- Function to sync user data from auth.users to public.user_profiles
CREATE OR REPLACE FUNCTION public.sync_user_profile_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Necessary to access auth.users and write to user_profiles
SET search_path = public -- Ensures correct schema context
AS $$
BEGIN
    -- On new user creation in auth.users
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.user_profiles (user_id, email, display_name, avatar_url)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email), -- Default display_name
            NEW.raw_user_meta_data->>'avatar_url' -- Default avatar_url if present
        )
        ON CONFLICT (user_id) DO UPDATE 
        SET 
            email = EXCLUDED.email,
            -- Only update display_name and avatar_url if they are currently NULL in user_profiles
            -- to avoid overwriting user's explicit profile changes.
            display_name = CASE 
                                WHEN public.user_profiles.display_name IS NULL THEN EXCLUDED.display_name 
                                ELSE public.user_profiles.display_name 
                           END,
            avatar_url = CASE 
                             WHEN public.user_profiles.avatar_url IS NULL THEN EXCLUDED.avatar_url 
                             ELSE public.user_profiles.avatar_url 
                         END,
            updated_at = timezone('utc'::text, now());
            
    -- On user email update in auth.users (or other relevant fields if needed)
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.email IS DISTINCT FROM NEW.email THEN -- Only run if email actually changed
            UPDATE public.user_profiles
            SET email = NEW.email,
                updated_at = timezone('utc'::text, now())
            WHERE user_id = NEW.id;
        END IF;
        -- Potentially update other fields from raw_user_meta_data if they change and should be synced,
        -- similar to the INSERT ... ON CONFLICT logic, e.g., if avatar_url changes in auth provider.
        -- For now, only email is actively synced on UPDATE.
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_sync_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_sync_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile_from_auth_user();

COMMENT ON TRIGGER on_auth_user_created_sync_profile ON auth.users IS 'When a new user is created in auth.users, sync relevant data to user_profiles.';

-- Trigger for user email updates
DROP TRIGGER IF EXISTS on_auth_user_email_updated_sync_profile ON auth.users;
CREATE TRIGGER on_auth_user_email_updated_sync_profile
    AFTER UPDATE OF email ON auth.users -- Only fire if email column is part of the UPDATE statement
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile_from_auth_user();

COMMENT ON TRIGGER on_auth_user_email_updated_sync_profile ON auth.users IS 'When a user''s email is updated in auth.users, sync it to user_profiles.';

-- Backfill existing user_profiles with email from auth.users where email is currently NULL
-- This is important for data consistency for users created before this trigger.
UPDATE public.user_profiles up
SET email = (SELECT au.email FROM auth.users au WHERE au.id = up.user_id)
WHERE up.email IS NULL AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = up.user_id AND au.email IS NOT NULL);

COMMIT; 