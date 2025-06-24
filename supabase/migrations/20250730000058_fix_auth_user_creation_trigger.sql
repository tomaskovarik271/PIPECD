-- Fix auth user creation by removing remaining activity reminder trigger
-- This trigger was missed during activities system removal and is breaking user signup

BEGIN;

-- Remove the trigger that tries to create user reminder preferences
DROP TRIGGER IF EXISTS create_default_reminder_preferences_trigger ON auth.users;

-- Remove the function that tries to insert into non-existent user_reminder_preferences table
DROP FUNCTION IF EXISTS public.create_default_reminder_preferences() CASCADE;

-- Verification
DO $$
DECLARE
    trigger_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Check for any remaining reminder-related triggers on auth.users
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger pt
    JOIN pg_class pc ON pt.tgrelid = pc.oid
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'auth' 
    AND pc.relname = 'users' 
    AND pt.tgname LIKE '%reminder%';
    
    -- Check for any remaining reminder preference functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc pp
    JOIN pg_namespace pn ON pp.pronamespace = pn.oid
    WHERE pn.nspname = 'public'
    AND pp.proname LIKE '%reminder_preferences%';
    
    RAISE NOTICE 'Reminder triggers removed from auth.users: %', trigger_count;
    RAISE NOTICE 'Reminder preference functions removed: %', function_count;
    
    IF trigger_count = 0 AND function_count = 0 THEN
        RAISE NOTICE 'SUCCESS: Auth user creation should now work without reminder preference errors';
    ELSE
        RAISE WARNING 'WARNING: Some reminder-related objects may still exist';
    END IF;
END
$$;

COMMIT; 