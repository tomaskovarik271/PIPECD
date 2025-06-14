-- Activity Reminders System Implementation
-- This migration creates the infrastructure for proactive activity reminders
-- including user preferences, notifications, and reminder scheduling

BEGIN;

-- 1. Create user reminder preferences table
CREATE TABLE public.user_reminder_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Email reminder settings
    email_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
    email_reminder_minutes_before INTEGER NOT NULL DEFAULT 60, -- 1 hour before
    email_daily_digest_enabled BOOLEAN NOT NULL DEFAULT true,
    email_daily_digest_time TIME NOT NULL DEFAULT '09:00:00', -- 9 AM
    
    -- In-app notification settings
    in_app_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_reminder_minutes_before INTEGER NOT NULL DEFAULT 15, -- 15 minutes before
    
    -- Push notification settings (for future mobile app)
    push_reminders_enabled BOOLEAN NOT NULL DEFAULT false,
    push_reminder_minutes_before INTEGER NOT NULL DEFAULT 30, -- 30 minutes before
    
    -- Overdue activity notifications
    overdue_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    overdue_notification_frequency_hours INTEGER NOT NULL DEFAULT 24, -- Daily for overdue
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one preference record per user
    CONSTRAINT unique_user_reminder_preferences UNIQUE (user_id)
);

-- 2. Create activity reminders table (for scheduled reminders)
CREATE TABLE public.activity_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Reminder details
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('email', 'in_app', 'push')),
    scheduled_for TIMESTAMPTZ NOT NULL, -- When to send the reminder
    
    -- Status tracking
    is_sent BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMPTZ NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT NULL,
    
    -- Metadata
    reminder_content JSONB DEFAULT '{}', -- Store email subject, body, etc.
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create in-app notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'activity_reminder', 'activity_overdue', 'deal_assigned', 'lead_assigned', 
        'system_announcement', 'custom'
    )),
    
    -- Status
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ NULL,
    
    -- Links and metadata
    entity_type VARCHAR(20) NULL CHECK (entity_type IN ('ACTIVITY', 'DEAL', 'LEAD', 'PERSON', 'ORGANIZATION')),
    entity_id UUID NULL,
    action_url VARCHAR(500) NULL, -- Deep link to relevant page
    metadata JSONB DEFAULT '{}',
    
    -- Priority and expiration
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMPTZ NULL, -- Auto-cleanup old notifications
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX idx_user_reminder_preferences_user_id ON public.user_reminder_preferences(user_id);

CREATE INDEX idx_activity_reminders_activity_id ON public.activity_reminders(activity_id);
CREATE INDEX idx_activity_reminders_user_id ON public.activity_reminders(user_id);
CREATE INDEX idx_activity_reminders_scheduled_for ON public.activity_reminders(scheduled_for);
CREATE INDEX idx_activity_reminders_is_sent ON public.activity_reminders(is_sent);
CREATE INDEX idx_activity_reminders_type_scheduled ON public.activity_reminders(reminder_type, scheduled_for) WHERE is_sent = false;

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_entity ON public.notifications(entity_type, entity_id);
CREATE INDEX idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.user_reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- User reminder preferences: Users can only manage their own preferences
CREATE POLICY "Users can manage their own reminder preferences" ON public.user_reminder_preferences
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Activity reminders: Users can only see reminders for their activities
CREATE POLICY "Users can view their own activity reminders" ON public.activity_reminders
    FOR SELECT
    USING (auth.uid() = user_id);

-- System can create/update reminders (for background jobs)
CREATE POLICY "System can manage activity reminders" ON public.activity_reminders
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- 7. Add updated_at triggers
CREATE TRIGGER update_user_reminder_preferences_updated_at
    BEFORE UPDATE ON public.user_reminder_preferences
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER update_activity_reminders_updated_at
    BEFORE UPDATE ON public.activity_reminders
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- 8. Create function to automatically create default reminder preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_reminder_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_reminder_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger to auto-create preferences for new users
CREATE TRIGGER create_default_reminder_preferences_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_reminder_preferences();

-- 10. Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Add comments for documentation
COMMENT ON TABLE public.user_reminder_preferences IS 
'User preferences for activity reminders including email, in-app, and push notification settings';

COMMENT ON TABLE public.activity_reminders IS 
'Scheduled reminders for activities, managed by background jobs';

COMMENT ON TABLE public.notifications IS 
'In-app notifications for users including activity reminders, assignments, and system messages';

COMMENT ON FUNCTION public.create_default_reminder_preferences() IS 
'Automatically creates default reminder preferences when a new user is created';

COMMENT ON FUNCTION public.cleanup_expired_notifications() IS 
'Removes expired notifications to keep the table clean';

COMMIT; 