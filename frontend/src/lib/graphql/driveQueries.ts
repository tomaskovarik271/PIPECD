import { gql } from 'graphql-request';

// Query to get deal documents (legacy)
export const GET_DEAL_DOCUMENTS = gql`
  query GetDealDocuments($dealId: ID!) {
    getDealDocuments(dealId: $dealId) {
      id
      dealId
      googleFileId
      fileName
      fileUrl
      category
      attachedAt
      attachedBy
    }
  }
`;

// Query to get deal folder
export const GET_DEAL_FOLDER = gql`
  query GetDealFolder($dealId: ID!) {
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

// Query to get Google Drive files
export const GET_DRIVE_FILES = gql`
  query GetDriveFiles($input: DriveSearchInput!) {
    getDriveFiles(input: $input) {
      files {
        id
        name
        mimeType
        size
        modifiedTime
        createdTime
        webViewLink
        webContentLink
        owners {
          displayName
          emailAddress
        }
        parents
        thumbnailLink
        iconLink
      }
      totalCount
    }
  }
`;

// Query to get Google Drive folders
export const GET_DRIVE_FOLDERS = gql`
  query GetDriveFolders($input: DriveFolderBrowseInput!) {
    getDriveFolders(input: $input) {
      folders {
        id
        name
        parents
        webViewLink
        createdTime
        modifiedTime
      }
      totalCount
    }
  }
`;

// Query to search Google Drive files
export const SEARCH_DRIVE_FILES = gql`
  query SearchDriveFiles($query: String!) {
    searchDriveFiles(query: $query) {
      files {
        id
        name
        mimeType
        size
        modifiedTime
        createdTime
        webViewLink
        webContentLink
        owners {
          displayName
          emailAddress
        }
        parents
        thumbnailLink
        iconLink
      }
      totalCount
    }
  }
`;

// Query to get recent Drive files
export const GET_RECENT_DRIVE_FILES = gql`
  query GetRecentDriveFiles($limit: Int) {
    getRecentDriveFiles(limit: $limit) {
      files {
        id
        name
        mimeType
        size
        modifiedTime
        createdTime
        webViewLink
        webContentLink
        owners {
          displayName
          emailAddress
        }
        parents
        thumbnailLink
        iconLink
      }
      totalCount
    }
  }
`;

// Mutation to create deal folder
export const CREATE_DEAL_FOLDER = gql`
  mutation CreateDealFolder($input: CreateDealFolderInput!) {
    createDealFolder(input: $input) {
      dealFolder {
        id
        name
        parents
        webViewLink
        createdTime
        modifiedTime
      }
      subfolders {
        proposals {
          id
          name
          parents
          webViewLink
          createdTime
          modifiedTime
        }
        contracts {
          id
          name
          parents
          webViewLink
          createdTime
          modifiedTime
        }
        legal {
          id
          name
          parents
          webViewLink
          createdTime
          modifiedTime
        }
        presentations {
          id
          name
          parents
          webViewLink
          createdTime
          modifiedTime
        }
        correspondence {
          id
          name
          parents
          webViewLink
          createdTime
          modifiedTime
        }
      }
    }
  }
`;

// Mutation to attach file to deal (legacy)
export const ATTACH_FILE_TO_DEAL = gql`
  mutation AttachFileToDeal($input: AttachFileInput!) {
    attachFileToDeal(input: $input) {
      id
      dealId
      googleFileId
      fileName
      fileUrl
      category
      attachedAt
      attachedBy
    }
  }
`;

// Mutation to detach file from deal
export const DETACH_FILE_FROM_DEAL = gql`
  mutation DetachFileFromDeal($attachmentId: ID!) {
    detachFileFromDeal(attachmentId: $attachmentId)
  }
`;

// Mutation to upload file to Drive
export const UPLOAD_FILE_TO_DRIVE = gql`
  mutation UploadFileToDrive($input: UploadFileInput!) {
    uploadFileToDrive(input: $input) {
      id
      name
      mimeType
      size
      modifiedTime
      createdTime
      webViewLink
      webContentLink
      owners {
        displayName
        emailAddress
      }
      parents
      thumbnailLink
      iconLink
    }
  }
`; 