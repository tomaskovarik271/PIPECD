import { gql } from 'graphql-request';

// Simplified queries that use existing backend structure
export const GET_DEAL_FOLDER_INFO = gql`
  query GetDealFolderInfo($dealId: ID!) {
    getDealFolder(dealId: $dealId) {
      id
      name
      parents
      webViewLink
      createdTime
      modifiedTime
    }
  }
`;

export const GET_DEAL_FOLDER_FILES = gql`
  query GetDealFolderFiles($dealId: ID!, $folderId: ID) {
    getDriveFiles(input: { folderId: $folderId, limit: 50 }) {
      files {
        id
        name
        mimeType
        size
        modifiedTime
        createdTime
        webViewLink
        webContentLink
        thumbnailLink
        iconLink
        owners {
          displayName
          emailAddress
        }
        parents
      }
    }
  }
`;

// TypeScript interfaces for simplified version
export interface DealFolderInfo {
  exists: boolean;
  dealFolder?: {
    id: string;
    name: string;
    webViewLink: string;
    createdTime: string;
    modifiedTime: string;
  };
  subfolders?: {
    proposals?: SubfolderInfo;
    contracts?: SubfolderInfo;
    legal?: SubfolderInfo;
    presentations?: SubfolderInfo;
    correspondence?: SubfolderInfo;
    financial?: SubfolderInfo;
    technical?: SubfolderInfo;
    other?: SubfolderInfo;
  };
}

export interface SubfolderInfo {
  id: string;
  name: string;
  webViewLink: string;
}

export interface DealFolderFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
  createdTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
  }>;
  parents?: string[];
} 