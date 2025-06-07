-- Create app_settings table for storing application configuration
CREATE TABLE app_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Whether this setting can be read by non-admin users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_app_settings_key ON app_settings(setting_key);

-- Add RLS policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all settings
CREATE POLICY "Admin users can manage app settings" ON app_settings
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid() 
      AND (p.resource = 'app_settings' AND p.action = 'manage')
    )
  );

-- All authenticated users can read public settings
CREATE POLICY "All users can read public app settings" ON app_settings
  FOR SELECT 
  USING (is_public = true AND auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER app_settings_updated_at_trigger
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_updated_at();

-- Add app_settings permission to permissions table
INSERT INTO public.permissions (resource, action, description) VALUES
  ('app_settings', 'manage', 'Manage application settings')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign app_settings permission to admin role
DO $$
DECLARE
    admin_role_id UUID;
    app_settings_perm_id UUID;
BEGIN
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO app_settings_perm_id FROM public.permissions WHERE resource = 'app_settings' AND action = 'manage';

    IF admin_role_id IS NOT NULL AND app_settings_perm_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        VALUES (admin_role_id, app_settings_perm_id)
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
END $$;

-- Insert default Google Drive settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  ('google_drive.pipecd_deals_folder_id', 'null'::jsonb, 'string', 'Google Drive folder ID where PipeCD will create deal folders', false),
  ('google_drive.auto_create_deal_folders', 'true'::jsonb, 'boolean', 'Whether to automatically create deal folders when opening Documents tab', true),
  ('google_drive.deal_folder_template', 'true'::jsonb, 'boolean', 'Whether to create standard subfolder structure in deal folders', true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON app_settings TO authenticated;
GRANT USAGE, SELECT ON app_settings_id_seq TO authenticated; 