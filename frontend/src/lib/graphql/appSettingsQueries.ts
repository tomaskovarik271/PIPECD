import { gql } from 'graphql-request';

export const GET_GOOGLE_DRIVE_SETTINGS = gql`
  query GetGoogleDriveSettings {
    googleDriveSettings {
      pipecd_deals_folder_id
      auto_create_deal_folders
      deal_folder_template
    }
  }
`;

export const GET_APP_SETTING = gql`
  query GetAppSetting($settingKey: String!) {
    appSetting(settingKey: $settingKey) {
      id
      settingKey
      settingValue
      settingType
      description
      isPublic
    }
  }
`;

export const GET_ALL_APP_SETTINGS = gql`
  query GetAllAppSettings {
    appSettings {
      id
      settingKey
      settingValue
      settingType
      description
      isPublic
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_APP_SETTING = gql`
  mutation UpdateAppSetting($input: UpdateAppSettingInput!) {
    updateAppSetting(input: $input) {
      id
      settingKey
      settingValue
      settingType
      description
      isPublic
      updatedAt
    }
  }
`;

// Type definitions for TypeScript
export interface GoogleDriveSettings {
  pipecd_deals_folder_id: string | null;
  auto_create_deal_folders: boolean;
  deal_folder_template: boolean;
}

export interface AppSetting {
  id: string;
  settingKey: string;
  settingValue: any;
  settingType: string;
  description: string | null;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateAppSettingInput {
  settingKey: string;
  settingValue: any;
} 