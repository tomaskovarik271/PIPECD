-- Check Activity Changes and Reminder Updates
-- Run this to see what happened when you modified your activity

-- 1. Check the current state of your "Call IMR" activity
SELECT 
    id,
    subject,
    due_date,
    status,
    created_at,
    updated_at,
    (updated_at != created_at) as was_modified
FROM public.activities 
WHERE subject ILIKE '%Call IMR%'
ORDER BY updated_at DESC;

-- 2. Check all reminders for this activity (including cancelled ones)
SELECT 
    ar.id as reminder_id,
    ar.reminder_type,
    ar.scheduled_for,
    ar.is_sent,
    ar.sent_at,
    ar.failed_attempts,
    ar.last_error,
    ar.created_at as reminder_created,
    ar.updated_at as reminder_updated,
    a.subject,
    a.due_date as current_due_date,
    a.updated_at as activity_updated
FROM public.activity_reminders ar
JOIN public.activities a ON ar.activity_id = a.id
WHERE a.subject ILIKE '%Call IMR%'
ORDER BY ar.created_at, ar.reminder_type;

-- 3. Check for any orphaned/cancelled reminders
SELECT 
    ar.id,
    ar.reminder_type,
    ar.scheduled_for,
    ar.is_sent,
    'Orphaned - Activity not found' as status
FROM public.activity_reminders ar
LEFT JOIN public.activities a ON ar.activity_id = a.id
WHERE a.id IS NULL;

-- 4. Check recent reminder creation/cancellation activity
SELECT 
    ar.id,
    a.subject,
    ar.reminder_type,
    ar.scheduled_for,
    ar.is_sent,
    ar.created_at,
    (ar.created_at > a.updated_at - INTERVAL '1 minute') as created_after_activity_update
FROM public.activity_reminders ar
JOIN public.activities a ON ar.activity_id = a.id
WHERE ar.created_at > NOW() - INTERVAL '1 hour'
ORDER BY ar.created_at DESC;

-- 5. Summary: Count reminders per activity
SELECT 
    a.subject,
    a.due_date,
    a.status,
    COUNT(ar.id) as total_reminders,
    COUNT(CASE WHEN ar.is_sent = false THEN 1 END) as pending_reminders,
    COUNT(CASE WHEN ar.is_sent = true THEN 1 END) as sent_reminders
FROM public.activities a
LEFT JOIN public.activity_reminders ar ON a.id = ar.activity_id
WHERE a.due_date IS NOT NULL
  AND a.updated_at > NOW() - INTERVAL '1 day'
GROUP BY a.id, a.subject, a.due_date, a.status
ORDER BY a.updated_at DESC; 