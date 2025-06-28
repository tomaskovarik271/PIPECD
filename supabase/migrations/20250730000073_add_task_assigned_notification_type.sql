-- Add task_assigned notification type to system_notifications table
-- This migration adds the new notification type to the existing constraint

-- Drop the existing constraint
ALTER TABLE public.system_notifications 
DROP CONSTRAINT IF EXISTS system_notifications_notification_type_check;

-- Add the new constraint with task_assigned included
ALTER TABLE public.system_notifications 
ADD CONSTRAINT system_notifications_notification_type_check 
CHECK (notification_type IN (
  'task_due_today', 'task_overdue', 'task_assigned', 'deal_close_date_approaching', 
  'lead_follow_up_due', 'user_assigned', 'user_mentioned', 
  'file_shared', 'system_announcement'
));

-- Add comment for documentation
COMMENT ON CONSTRAINT system_notifications_notification_type_check ON public.system_notifications IS 
'Validates notification_type values including task_assigned for task assignment notifications'; 