-- Google Calendar Integration Foundation
-- Creates the core tables and permissions for calendar-native CRM

BEGIN;

-- 1. User Calendar Preferences table
CREATE TABLE public.user_calendar_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Calendar Configuration
    primary_calendar_id TEXT, -- Google Calendar ID for main business calendar
    business_calendar_id TEXT, -- Separate business calendar if different
    auto_sync_enabled BOOLEAN DEFAULT true,
    
    -- Meeting Preferences
    default_meeting_duration INTEGER DEFAULT 30, -- minutes
    default_buffer_time INTEGER DEFAULT 5, -- minutes between meetings
    default_location TEXT DEFAULT 'Google Meet',
    auto_add_google_meet BOOLEAN DEFAULT true,
    
    -- Deal Context Integration
    include_deal_context BOOLEAN DEFAULT true, -- Add deal info to calendar events
    auto_add_deal_participants BOOLEAN DEFAULT false, -- Auto-invite deal contacts
    
    -- Sync Range
    sync_past_days INTEGER DEFAULT 7, -- How far back to sync
    sync_future_days INTEGER DEFAULT 90, -- How far forward to sync
    
    -- Working Hours (JSON format)
    working_hours JSONB DEFAULT '{
        "monday": {"start": "09:00", "end": "17:00", "enabled": true},
        "tuesday": {"start": "09:00", "end": "17:00", "enabled": true},
        "wednesday": {"start": "09:00", "end": "17:00", "enabled": true},
        "thursday": {"start": "09:00", "end": "17:00", "enabled": true},
        "friday": {"start": "09:00", "end": "17:00", "enabled": true},
        "saturday": {"start": "09:00", "end": "17:00", "enabled": false},
        "sunday": {"start": "09:00", "end": "17:00", "enabled": false}
    }'::jsonb,
    
    -- Reminder Preferences (JSON format)
    reminder_preferences JSONB DEFAULT '{
        "default_reminders": [
            {"method": "popup", "minutes": 15},
            {"method": "email", "minutes": 60}
        ],
        "deal_meeting_reminders": [
            {"method": "popup", "minutes": 30},
            {"method": "email", "minutes": 120}
        ]
    }'::jsonb,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Calendar Events (CRM-enhanced Google Calendar events)
CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Google Calendar Integration
    google_calendar_id TEXT NOT NULL, -- Which Google Calendar this belongs to
    google_event_id TEXT NOT NULL, -- Google Calendar Event ID
    
    -- CRM Context
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Event Classification
    event_type TEXT NOT NULL DEFAULT 'MEETING' CHECK (event_type IN (
        'MEETING', 'DEMO', 'CALL', 'PROPOSAL_PRESENTATION', 
        'CONTRACT_REVIEW', 'FOLLOW_UP', 'CHECK_IN', 'INTERNAL'
    )),
    
    -- Event Details (synced from Google Calendar)
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    timezone TEXT DEFAULT 'UTC',
    
    -- Meeting Details
    location TEXT,
    google_meet_link TEXT,
    
    -- CRM Business Logic
    outcome TEXT CHECK (outcome IN ('COMPLETED', 'RESCHEDULED', 'NO_SHOW', 'CANCELLED')),
    outcome_notes TEXT,
    next_actions TEXT[], -- Array of follow-up actions
    
    -- Status
    is_cancelled BOOLEAN DEFAULT false,
    
    -- Sync tracking
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Calendar Sync Log (for debugging and monitoring)
CREATE TABLE public.calendar_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Sync Details
    sync_action TEXT NOT NULL CHECK (sync_action IN (
        'FULL_SYNC', 'INCREMENTAL_SYNC', 'CREATE_EVENT', 
        'UPDATE_EVENT', 'DELETE_EVENT', 'ADD_CRM_CONTEXT'
    )),
    sync_direction TEXT NOT NULL CHECK (sync_direction IN ('GOOGLE_TO_CRM', 'CRM_TO_GOOGLE', 'BIDIRECTIONAL')),
    sync_source TEXT NOT NULL CHECK (sync_source IN ('MANUAL', 'AUTOMATIC', 'WEBHOOK', 'API')),
    
    -- Event Reference
    calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
    google_event_id TEXT,
    calendar_id TEXT,
    
    -- Sync Result
    success BOOLEAN NOT NULL,
    error_message TEXT,
    processing_time_ms INTEGER,
    
    -- API Response (for debugging)
    api_response JSONB,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Indexes for performance
CREATE INDEX idx_user_calendar_preferences_user_id ON user_calendar_preferences(user_id);
CREATE UNIQUE INDEX idx_user_calendar_preferences_unique_user ON user_calendar_preferences(user_id);

CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_deal_id ON calendar_events(deal_id);
CREATE INDEX idx_calendar_events_person_id ON calendar_events(person_id);
CREATE INDEX idx_calendar_events_organization_id ON calendar_events(organization_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_google_event_id ON calendar_events(google_event_id);
CREATE UNIQUE INDEX idx_calendar_events_google_unique ON calendar_events(google_calendar_id, google_event_id);

CREATE INDEX idx_calendar_sync_log_user_id ON calendar_sync_log(user_id);
CREATE INDEX idx_calendar_sync_log_created_at ON calendar_sync_log(created_at);
CREATE INDEX idx_calendar_sync_log_calendar_event_id ON calendar_sync_log(calendar_event_id);

-- 5. RLS Policies
ALTER TABLE user_calendar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_log ENABLE ROW LEVEL SECURITY;

-- User Calendar Preferences policies
CREATE POLICY "Users can view their own calendar preferences" ON user_calendar_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar preferences" ON user_calendar_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar preferences" ON user_calendar_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar preferences" ON user_calendar_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Calendar Events policies  
CREATE POLICY "Users can view their own calendar events" ON calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events" ON calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" ON calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" ON calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- Calendar Sync Log policies
CREATE POLICY "Users can view their own sync logs" ON calendar_sync_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs" ON calendar_sync_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_calendar_preferences_updated_at 
    BEFORE UPDATE ON user_calendar_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at 
    BEFORE UPDATE ON calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Add Calendar permissions to RBAC
INSERT INTO permissions (resource, action, description) VALUES
    ('calendar', 'read_own', 'View own calendar events and preferences'),
    ('calendar', 'read_any', 'View any calendar events and preferences'),
    ('calendar', 'create', 'Create calendar events and sync with Google Calendar'),
    ('calendar', 'update_own', 'Update own calendar events and preferences'),
    ('calendar', 'update_any', 'Update any calendar events and preferences'),
    ('calendar', 'delete_own', 'Delete own calendar events'),
    ('calendar', 'delete_any', 'Delete any calendar events'),
    ('calendar', 'sync', 'Sync calendar data with Google Calendar API');

-- 8. Assign calendar permissions to roles
-- Admin gets all calendar permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.resource = 'calendar';

-- Member gets own calendar permissions plus sync
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'member' 
AND p.resource = 'calendar' 
AND p.action IN ('read_own', 'create', 'update_own', 'delete_own', 'sync');

-- Read-only gets only read access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'read_only' 
AND p.resource = 'calendar' 
AND p.action = 'read_own';

-- 9. Add sample calendar preferences for existing users
INSERT INTO user_calendar_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Google Calendar foundation created successfully!';
    RAISE NOTICE 'Tables created: user_calendar_preferences, calendar_events, calendar_sync_log';
    RAISE NOTICE 'Permissions added: 8 calendar permissions assigned to roles';
    RAISE NOTICE 'Ready for Google Calendar API integration';
END $$; 