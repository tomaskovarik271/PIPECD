-- Remove Activities and Notifications System
-- This migration removes all activity and notification infrastructure
-- to prepare for Google Calendar integration as the primary activity system

BEGIN;

-- Drop all indexes first to avoid dependency issues
DROP INDEX IF EXISTS idx_activity_reminders_activity_id;
DROP INDEX IF EXISTS idx_activity_reminders_user_id;
DROP INDEX IF EXISTS idx_activity_reminders_scheduled_for;
DROP INDEX IF EXISTS idx_activity_reminders_is_sent;
DROP INDEX IF EXISTS idx_activity_reminders_type_scheduled;

DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_user_unread;
DROP INDEX IF EXISTS idx_notifications_entity;
DROP INDEX IF EXISTS idx_notifications_expires_at;

DROP INDEX IF EXISTS idx_user_reminder_preferences_user_id;

-- Drop activity-related indexes from main tables
DROP INDEX IF EXISTS idx_activities_user_id;
DROP INDEX IF EXISTS idx_activities_deal_id;
DROP INDEX IF EXISTS idx_activities_lead_id;
DROP INDEX IF EXISTS idx_activities_person_id;
DROP INDEX IF EXISTS idx_activities_organization_id;
DROP INDEX IF EXISTS idx_activities_due_date;
DROP INDEX IF EXISTS idx_activities_status;
DROP INDEX IF EXISTS idx_activities_type;
DROP INDEX IF EXISTS idx_activities_created_at;

-- Drop all activity and notification related tables
DROP TABLE IF EXISTS public.activity_reminders CASCADE;
DROP TABLE IF EXISTS public.user_reminder_preferences CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.email_activities CASCADE;

-- Drop the main activities table
DROP TABLE IF EXISTS public.activities CASCADE;

-- Remove activity-related columns from other tables if they exist
-- (Some might not exist depending on schema evolution)
ALTER TABLE public.deals DROP COLUMN IF EXISTS last_activity_date;
ALTER TABLE public.leads DROP COLUMN IF EXISTS last_activity_date; 
ALTER TABLE public.people DROP COLUMN IF EXISTS last_activity_date;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS last_activity_date;

-- Drop any activity-related functions
DROP FUNCTION IF EXISTS cleanup_expired_notifications() CASCADE;
DROP FUNCTION IF EXISTS get_overdue_activities(uuid) CASCADE;
DROP FUNCTION IF EXISTS schedule_activity_reminders(uuid) CASCADE;
DROP FUNCTION IF EXISTS cancel_activity_reminders(uuid) CASCADE;

-- Drop any activity-related stored procedures
DROP FUNCTION IF EXISTS create_activity_with_reminders(
  p_subject text,
  p_description text,
  p_type text,
  p_status text,
  p_due_date timestamptz,
  p_assigned_to_user_id uuid,
  p_deal_id uuid,
  p_lead_id uuid,
  p_person_id uuid,
  p_organization_id uuid
) CASCADE;

-- Drop any activity-related triggers (only if activities table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activities') THEN
        DROP TRIGGER IF EXISTS trigger_activity_reminder_schedule ON public.activities;
        DROP TRIGGER IF EXISTS trigger_activity_notification ON public.activities;
    END IF;
END $$;

-- Drop any activity-related enum types
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS activity_status CASCADE;
DROP TYPE IF EXISTS reminder_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;

-- Remove any activity-related RLS policies (they should be dropped with tables, but being explicit)
-- These will be handled automatically when tables are dropped

COMMIT;

-- Add comment for documentation
COMMENT ON SCHEMA public IS 'Activities and notifications system removed in favor of Google Calendar integration'; 