-- Migration to add email to user_profiles and backfill from auth.users

BEGIN;

-- 1. Add the email column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN email TEXT;

-- Add a comment for the new column
COMMENT ON COLUMN public.user_profiles.email IS 'Stores the user''s email, copied from auth.users for easier querying.';

-- 2. Backfill email addresses for existing users
-- This assumes that for every user_id in user_profiles, there's a corresponding entry in auth.users
UPDATE public.user_profiles p
SET email = (
    SELECT u.email
    FROM auth.users u
    WHERE u.id = p.user_id
)
WHERE p.email IS NULL; -- Only update if email is not already set (e.g., if migration is re-run)

-- 3. (Optional but Recommended) Add an index on the new email column if frequently queried
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- 4. Make the email column NOT NULL after backfilling, if desired.
-- This depends on whether a profile can exist without an email (should not if linked to auth.users).
-- For now, we'll keep it nullable to avoid issues if a profile somehow exists for a user without an email in auth.users,
-- or if the backfill fails for some entries. The GraphQL layer expects it to be non-null, so resolver logic
-- should handle potential nulls from DB if this is not made NOT NULL.
-- Consider changing to NOT NULL in a subsequent step after verification.
-- Example to make it NOT NULL (if confident all emails are populated):
-- ALTER TABLE public.user_profiles ALTER COLUMN email SET NOT NULL;


-- 5. (Future Consideration / Manual Step) Create a trigger to keep email in sync
-- This part is more complex and often handled by application logic or a more involved trigger.
-- Example of a trigger concept (requires a function and trigger):
--
-- CREATE OR REPLACE FUNCTION public.sync_user_email_to_profile()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   UPDATE public.user_profiles
--   SET email = NEW.email
--   WHERE user_id = NEW.id;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE TRIGGER on_auth_user_created_sync_email
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE PROCEDURE public.sync_user_email_to_profile();
--
-- CREATE TRIGGER on_auth_user_updated_sync_email
-- AFTER UPDATE OF email ON auth.users
-- FOR EACH ROW
-- WHEN (OLD.email IS DISTINCT FROM NEW.email)
-- EXECUTE PROCEDURE public.sync_user_email_to_profile();

COMMIT; 