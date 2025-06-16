import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const appSettingsQueries = {
  // Get all app settings (respects RLS - only admins can see private settings)
  appSettings: async (_: any, __: any, context: any) => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('id, setting_key, setting_value, setting_type, description, is_public, created_at, updated_at')
      .order('setting_key');

    if (error) {
      console.error('Error fetching app settings:', error);
      throw new Error('Failed to fetch app settings');
    }

    return data.map((setting: any) => ({
      id: setting.id.toString(),
      settingKey: setting.setting_key,
      settingValue: setting.setting_value,
      settingType: setting.setting_type,
      description: setting.description,
      isPublic: setting.is_public,
      createdAt: setting.created_at,
      updatedAt: setting.updated_at,
    }));
  },

  // Get a specific app setting by key
  appSetting: async (_: any, { settingKey }: { settingKey: string }, context: any) => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('id, setting_key, setting_value, setting_type, description, is_public, created_at, updated_at')
      .eq('setting_key', settingKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Setting not found
      }
      console.error('Error fetching app setting:', error);
      throw new Error('Failed to fetch app setting');
    }

    return {
      id: data.id.toString(),
      settingKey: data.setting_key,
      settingValue: data.setting_value,
      settingType: data.setting_type,
      description: data.description,
      isPublic: data.is_public,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Get Google Drive specific settings in a structured format
  googleDriveSettings: async (_: any, __: any, context: any) => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .like('setting_key', 'google_drive.%');

    if (error) {
      console.error('Error fetching Google Drive settings:', error);
      throw new Error('Failed to fetch Google Drive settings');
    }

    // Transform the array of settings into a structured object
    const settings = data.reduce((acc: any, setting: any) => {
      const key = setting.setting_key.replace('google_drive.', '');
      acc[key] = setting.setting_value;
      return acc;
    }, {});

    // Provide defaults for any missing settings
    return {
      pipecd_deals_folder_id: settings.pipecd_deals_folder_id === null ? null : settings.pipecd_deals_folder_id,
      auto_create_deal_folders: settings.auto_create_deal_folders ?? true,
      deal_folder_template: settings.deal_folder_template ?? true,
    };
  },
}; 