import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateAppSettingInput {
  settingKey: string;
  settingValue: any;
}

export const appSettingsMutations = {
  // Update an app setting (admin only - enforced by RLS)
  updateAppSetting: async (_: any, { input }: { input: UpdateAppSettingInput }, context: any) => {
    const { settingKey, settingValue } = input;

    // Use upsert to insert or update the setting
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(
        {
          setting_key: settingKey,
          setting_value: settingValue,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'setting_key',
          ignoreDuplicates: false,
        }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Error updating app setting:', error);
      throw new Error('Failed to update app setting. Make sure you have admin permissions.');
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
}; 