import { gql } from 'graphql-request';

// Query to get shared drives
export const GET_SHARED_DRIVES = gql`
  query GetSharedDrives {
    getSharedDrives {
      id
      name
      createdTime
      capabilities {
        canAddChildren
        canListChildren
        canDownload
      }
    }
  }
`;

// Query to browse files in a shared drive
export const GET_SHARED_DRIVE_FILES = gql`
  query GetSharedDriveFiles($sharedDriveId: ID!, $folderId: ID, $query: String) {
    getSharedDriveFiles(sharedDriveId: $sharedDriveId, folderId: $folderId, query: $query) {
      id
      name
      mimeType
      size
      modifiedTime
      createdTime
      webViewLink
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

// Query to get shared drive folders for navigation
export const GET_SHARED_DRIVE_FOLDERS = gql`
  query GetSharedDriveFolders($sharedDriveId: ID!, $parentFolderId: ID) {
    getSharedDriveFolders(sharedDriveId: $sharedDriveId, parentFolderId: $parentFolderId) {
      id
      name
      parents
      webViewLink
      createdTime
      modifiedTime
    }
  }
`;

// Query to search files across shared drives
export const SEARCH_SHARED_DRIVE_FILES = gql`
  query SearchSharedDriveFiles($query: String!, $sharedDriveId: ID) {
    searchSharedDriveFiles(query: $query, sharedDriveId: $sharedDriveId) {
      id
      name
      mimeType
      size
      modifiedTime
      createdTime
      webViewLink
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

// Query to get recent files from shared drives
export const GET_RECENT_SHARED_DRIVE_FILES = gql`
  query GetRecentSharedDriveFiles($limit: Int) {
    getRecentSharedDriveFiles(limit: $limit) {
      id
      name
      mimeType
      size
      modifiedTime
      createdTime
      webViewLink
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

// Query to get deal document attachments
export const GET_DEAL_DOCUMENT_ATTACHMENTS = gql`
  query GetDealDocumentAttachments($dealId: ID!) {
    getDealDocumentAttachments(dealId: $dealId) {
      id
      dealId
      googleFileId
      fileName
      fileUrl
      sharedDriveId
      category
      attachedAt
      attachedBy
      mimeType
      fileSize
    }
  }
`;

// Mutation to attach document to deal
export const ATTACH_DOCUMENT_TO_DEAL = gql`
  mutation AttachDocumentToDeal($input: AttachDocumentInput!) {
    attachDocumentToDeal(input: $input) {
      id
      dealId
      googleFileId
      fileName
      fileUrl
      sharedDriveId
      category
      attachedAt
      attachedBy
      mimeType
      fileSize
    }
  }
`;

// Mutation to remove document attachment from deal
export const REMOVE_DOCUMENT_ATTACHMENT = gql`
  mutation RemoveDocumentAttachment($attachmentId: ID!) {
    removeDocumentAttachment(attachmentId: $attachmentId)
  }
`;

// Mutation to attach document to both note and deal
export const ATTACH_DOCUMENT_TO_NOTE_AND_DEAL = gql`
  mutation AttachDocumentToNoteAndDeal($input: AttachDocumentToNoteInput!) {
    attachDocumentToNoteAndDeal(input: $input) {
      noteAttachment {
        id
        noteId
        googleFileId
        fileName
        fileUrl
        attachedAt
      }
      dealAttachment {
        id
        dealId
        googleFileId
        fileName
        fileUrl
        sharedDriveId
        category
        attachedAt
        attachedBy
        mimeType
        fileSize
      }
    }
  }
`;

// Query to get note document attachments
export const GET_NOTE_DOCUMENT_ATTACHMENTS = gql`
  query GetNoteDocumentAttachments($noteId: ID!) {
    getNoteDocumentAttachments(noteId: $noteId) {
      id
      noteId
      googleFileId
      fileName
      fileUrl
      attachedAt
      attachedBy
      mimeType
      fileSize
    }
  }
`;

// Mutation to remove document attachment from note
export const REMOVE_NOTE_DOCUMENT_ATTACHMENT = gql`
  mutation RemoveNoteDocumentAttachment($attachmentId: ID!) {
    removeNoteDocumentAttachment(attachmentId: $attachmentId)
  }
`;

// Mutation to update document attachment category
export const UPDATE_DOCUMENT_ATTACHMENT_CATEGORY = gql`
  mutation UpdateDocumentAttachmentCategory($attachmentId: ID!, $category: DocumentCategory!) {
    updateDocumentAttachmentCategory(attachmentId: $attachmentId, category: $category) {
      id
      category
    }
  }
`; 