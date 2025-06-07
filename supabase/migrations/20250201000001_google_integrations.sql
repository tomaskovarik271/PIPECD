-- Migration: Google Drive and Gmail Integration Support
-- Leverages existing Supabase Google OAuth with extended scopes

-- Store extended Google OAuth tokens for Drive/Gmail access
CREATE TABLE public.google_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- OAuth token data
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Granted scopes for this token
  granted_scopes TEXT[] NOT NULL DEFAULT '{}',
  
  -- Integration status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one active token per user
  UNIQUE(user_id)
);

-- Documents attached to CRM entities
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic entity attachment
  entity_type TEXT NOT NULL CHECK (entity_type IN ('DEAL', 'PERSON', 'ORGANIZATION', 'LEAD')),
  entity_id UUID NOT NULL,
  
  -- Google Drive integration
  google_drive_file_id TEXT,
  google_drive_web_view_link TEXT,
  google_drive_download_link TEXT,
  google_drive_folder_id TEXT,
  
  -- Document metadata
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size_bytes BIGINT,
  
  -- Permissions and sharing
  is_public BOOLEAN NOT NULL DEFAULT false,
  shared_with_users UUID[] DEFAULT '{}',
  
  -- Audit fields
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emails associated with CRM entities
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Gmail integration
  gmail_message_id TEXT UNIQUE,
  gmail_thread_id TEXT,
  
  -- Polymorphic entity attachment
  entity_type TEXT CHECK (entity_type IN ('DEAL', 'PERSON', 'ORGANIZATION', 'LEAD')),
  entity_id UUID,
  
  -- Email metadata
  subject TEXT NOT NULL,
  body_preview TEXT,
  full_body TEXT,
  
  -- Participants
  from_email TEXT NOT NULL,
  to_emails TEXT[] NOT NULL DEFAULT '{}',
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',
  
  -- Status
  is_outbound BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  
  -- Gmail labels
  gmail_labels TEXT[] DEFAULT '{}',
  
  -- Timing
  sent_at TIMESTAMPTZ NOT NULL,
  
  -- Audit fields
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email activities (opens, replies, forwards, etc.)
CREATE TABLE public.email_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  
  activity_type TEXT NOT NULL CHECK (activity_type IN ('sent', 'delivered', 'opened', 'replied', 'forwarded', 'clicked_link')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Additional metadata (link clicked, device info, etc.)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_google_oauth_tokens_user_id ON public.google_oauth_tokens(user_id);
CREATE INDEX idx_google_oauth_tokens_expires_at ON public.google_oauth_tokens(expires_at);

CREATE INDEX idx_documents_entity ON public.documents(entity_type, entity_id);
CREATE INDEX idx_documents_google_drive_file_id ON public.documents(google_drive_file_id);
CREATE INDEX idx_documents_created_by ON public.documents(created_by_user_id);

CREATE INDEX idx_emails_entity ON public.emails(entity_type, entity_id);
CREATE INDEX idx_emails_gmail_message_id ON public.emails(gmail_message_id);
CREATE INDEX idx_emails_gmail_thread_id ON public.emails(gmail_thread_id);
CREATE INDEX idx_emails_from_email ON public.emails(from_email);
CREATE INDEX idx_emails_sent_at ON public.emails(sent_at);

CREATE INDEX idx_email_activities_email_id ON public.email_activities(email_id);
CREATE INDEX idx_email_activities_type_time ON public.email_activities(activity_type, occurred_at);

-- RLS Policies for security
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_activities ENABLE ROW LEVEL SECURITY;

-- Google OAuth tokens: users can only see their own
CREATE POLICY "Users can view own Google tokens" ON public.google_oauth_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Documents: users can see documents for entities they have access to
CREATE POLICY "Users can view accessible documents" ON public.documents
  FOR SELECT USING (
    auth.uid() = created_by_user_id OR
    auth.uid() = ANY(shared_with_users) OR
    -- Check entity access based on entity type
    CASE entity_type
      WHEN 'DEAL' THEN EXISTS (
        SELECT 1 FROM public.deals WHERE id = entity_id AND user_id = auth.uid()
      )
      WHEN 'PERSON' THEN EXISTS (
        SELECT 1 FROM public.people WHERE id = entity_id AND user_id = auth.uid()
      )
      WHEN 'ORGANIZATION' THEN EXISTS (
        SELECT 1 FROM public.organizations WHERE id = entity_id AND user_id = auth.uid()
      )
      WHEN 'LEAD' THEN EXISTS (
        SELECT 1 FROM public.leads WHERE id = entity_id AND user_id = auth.uid()
      )
      ELSE false
    END
  );

-- Users can create/update documents for entities they own
CREATE POLICY "Users can manage documents for owned entities" ON public.documents
  FOR ALL USING (auth.uid() = created_by_user_id);

-- Similar policies for emails
CREATE POLICY "Users can view accessible emails" ON public.emails
  FOR SELECT USING (
    auth.uid() = created_by_user_id OR
    -- Check entity access
    (entity_type IS NOT NULL AND entity_id IS NOT NULL AND
     CASE entity_type
       WHEN 'DEAL' THEN EXISTS (
         SELECT 1 FROM public.deals WHERE id = entity_id AND user_id = auth.uid()
       )
       WHEN 'PERSON' THEN EXISTS (
         SELECT 1 FROM public.people WHERE id = entity_id AND user_id = auth.uid()
       )
       WHEN 'ORGANIZATION' THEN EXISTS (
         SELECT 1 FROM public.organizations WHERE id = entity_id AND user_id = auth.uid()
       )
       WHEN 'LEAD' THEN EXISTS (
         SELECT 1 FROM public.leads WHERE id = entity_id AND user_id = auth.uid()
       )
       ELSE false
     END)
  );

CREATE POLICY "Users can manage own emails" ON public.emails
  FOR ALL USING (auth.uid() = created_by_user_id);

-- Email activities inherit email permissions
CREATE POLICY "Users can view email activities" ON public.email_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.emails 
      WHERE id = email_id AND created_by_user_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON public.google_oauth_tokens TO authenticated;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.emails TO authenticated;
GRANT ALL ON public.email_activities TO authenticated; 