-- Check Activity Reminders Status
-- Run this after creating activities with due dates

-- 1. Check if any reminders exist
SELECT 
    ar.*,
    a.subject as activity_subject,
    a.due_date as activity_due_date,
    (ar.scheduled_for - NOW()) as time_until_reminder
FROM public.activity_reminders ar
JOIN public.activities a ON ar.activity_id = a.id
ORDER BY ar.scheduled_for ASC;

-- 2. Check user preferences
SELECT * FROM public.user_reminder_preferences 
WHERE user_id = auth.uid();

-- 3. Check recent activities with due dates
SELECT 
    id,
    subject,
    due_date,
    status,
    created_at
FROM public.activities 
WHERE due_date IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check if reminders were created for recent activities
SELECT 
    a.subject as activity,
    a.due_date,
    a.status,
    COUNT(ar.id) as reminder_count,
    STRING_AGG(ar.reminder_type, ', ') as reminder_types
FROM public.activities a
LEFT JOIN public.activity_reminders ar ON a.id = ar.activity_id
WHERE a.due_date IS NOT NULL 
  AND a.created_at > NOW() - INTERVAL '1 day'
GROUP BY a.id, a.subject, a.due_date, a.status
ORDER BY a.due_date;

-- 5. Check notification center
SELECT 
    title,
    message,
    notification_type,
    is_read,
    created_at
FROM public.notifications 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5; 