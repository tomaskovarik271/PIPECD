-- Universal Notification System
-- Creates system notifications table and unified notification views
-- Complements existing business_rule_notifications table

BEGIN;

-- 1. Create system notifications table for built-in system behaviors
CREATE TABLE public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'task_due_today', 'task_overdue', 'task_assigned', 'deal_close_date_approaching', 
    'lead_follow_up_due', 'user_assigned', 'user_mentioned', 
    'file_shared', 'system_announcement'
  )),
  
  -- Priority levels (1=LOW, 2=NORMAL, 3=HIGH, 4=URGENT)
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 4),
  
  -- Entity linking for context
  entity_type TEXT CHECK (entity_type IN ('TASK', 'DEAL', 'LEAD', 'PERSON', 'ORGANIZATION', 'DOCUMENT')),
  entity_id UUID,
  
  -- Action and metadata
  action_url TEXT, -- Deep link to relevant page
  metadata JSONB DEFAULT '{}',
  
  -- Notification state
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- Lifecycle management
  expires_at TIMESTAMPTZ, -- Auto-cleanup old notifications
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create unified notification view that combines both sources
CREATE VIEW public.unified_notifications AS
SELECT 
  'BUSINESS_RULE' as source,
  id,
  user_id,
  title,
  message,
  notification_type,
  priority,
  entity_type::TEXT,
  entity_id,
  NULL as action_url,
  actions as metadata,
  (read_at IS NOT NULL) as is_read,
  read_at,
  dismissed_at,
  NULL as expires_at,
  created_at,
  created_at as updated_at
FROM public.business_rule_notifications

UNION ALL

SELECT 
  'SYSTEM' as source,
  id,
  user_id,
  title,
  message,
  notification_type,
  priority,
  entity_type,
  entity_id,
  action_url,
  metadata,
  is_read,
  read_at,
  dismissed_at,
  expires_at,
  created_at,
  updated_at
FROM public.system_notifications

ORDER BY created_at DESC;

-- 3. Create indexes for performance
CREATE INDEX idx_system_notifications_user_id ON public.system_notifications(user_id);
CREATE INDEX idx_system_notifications_is_read ON public.system_notifications(is_read);
CREATE INDEX idx_system_notifications_created_at ON public.system_notifications(created_at DESC);
CREATE INDEX idx_system_notifications_user_unread ON public.system_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_system_notifications_entity ON public.system_notifications(entity_type, entity_id);
CREATE INDEX idx_system_notifications_expires_at ON public.system_notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_system_notifications_type ON public.system_notifications(notification_type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for system_notifications

-- Users can view their own notifications
CREATE POLICY "Users can view their own system notifications" ON public.system_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read/dismissed)
CREATE POLICY "Users can update their own system notifications" ON public.system_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create system notifications" ON public.system_notifications
  FOR INSERT
  WITH CHECK (true);

-- System can delete expired notifications
CREATE POLICY "System can delete expired system notifications" ON public.system_notifications
  FOR DELETE
  USING (expires_at IS NOT NULL AND expires_at < NOW());

-- 6. Add updated_at trigger
CREATE TRIGGER update_system_notifications_updated_at
  BEFORE UPDATE ON public.system_notifications
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- 7. Create function to clean up expired system notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_system_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.system_notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to get unified notification summary for a user
CREATE OR REPLACE FUNCTION public.get_user_notification_summary(target_user_id UUID)
RETURNS TABLE(
  total_count INTEGER,
  unread_count INTEGER,
  business_rule_count INTEGER,
  system_count INTEGER,
  high_priority_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_count,
    COUNT(*) FILTER (WHERE NOT is_read)::INTEGER as unread_count,
    COUNT(*) FILTER (WHERE source = 'BUSINESS_RULE')::INTEGER as business_rule_count,
    COUNT(*) FILTER (WHERE source = 'SYSTEM')::INTEGER as system_count,
    COUNT(*) FILTER (WHERE priority >= 3 AND NOT is_read)::INTEGER as high_priority_count
  FROM public.unified_notifications
  WHERE user_id = target_user_id
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  business_rule_count INTEGER;
  system_count INTEGER;
BEGIN
  -- Mark business rule notifications as read
  UPDATE public.business_rule_notifications 
  SET read_at = NOW()
  WHERE user_id = target_user_id AND read_at IS NULL;
  
  GET DIAGNOSTICS business_rule_count = ROW_COUNT;
  
  -- Mark system notifications as read
  UPDATE public.system_notifications 
  SET is_read = true, read_at = NOW()
  WHERE user_id = target_user_id AND is_read = false;
  
  GET DIAGNOSTICS system_count = ROW_COUNT;
  
  updated_count := business_rule_count + system_count;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add comments for documentation
COMMENT ON TABLE public.system_notifications IS 
'System-generated notifications for built-in behaviors like due dates, assignments, and system events';

COMMENT ON VIEW public.unified_notifications IS 
'Unified view combining business rule notifications and system notifications with consistent interface';

COMMENT ON FUNCTION public.get_user_notification_summary(UUID) IS 
'Returns notification summary statistics for a user including counts by type and priority';

COMMENT ON FUNCTION public.mark_all_notifications_read(UUID) IS 
'Marks all notifications (both business rule and system) as read for a user';

COMMENT ON FUNCTION public.cleanup_expired_system_notifications() IS 
'Removes expired system notifications to keep the table clean';

COMMIT; 