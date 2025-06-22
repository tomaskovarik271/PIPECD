import { google } from 'googleapis';
import { requireAuthentication } from '../netlify/functions/graphql/helpers';
import { googleIntegrationService } from './googleIntegrationService';
import { getAuthenticatedClient } from './serviceUtils';

// Types
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
  createdTime: string;
  webViewLink?: string;
  webContentLink?: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
  }>;
  parents?: string[];
  thumbnailLink?: string;
  iconLink?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  parents?: string[];
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
  sharingUser?: {
    displayName: string;
    emailAddress: string;
  };
  shared?: boolean;
  ownedByMe?: boolean;
}

export interface SharedDrive {
  id: string;
  name: string;
  createdTime: string;
  capabilities?: {
    canAddChildren?: boolean;
    canComment?: boolean;
    canCopy?: boolean;
    canDeleteDrive?: boolean;
    canDownload?: boolean;
    canEdit?: boolean;
    canListChildren?: boolean;
    canManageMembers?: boolean;
    canReadRevisions?: boolean;
    canRename?: boolean;
    canRenameDrive?: boolean;
    canShare?: boolean;
  };
  backgroundImageFile?: {
    id: string;
    webViewLink: string;
  };
  colorRgb?: string;
  restrictions?: {
    adminManagedRestrictions?: boolean;
    copyRequiresWriterPermission?: boolean;
    domainUsersOnly?: boolean;
    driveMembersOnly?: boolean;
  };
}

export interface DriveFolderStructure {
  dealFolder: DriveFolder;
  subfolders: {
    proposals: DriveFolder;
    contracts: DriveFolder;
    legal: DriveFolder;
    presentations: DriveFolder;
    correspondence: DriveFolder;
  };
}

export interface UploadFileInput {
  name: string;
  content: Buffer;
  mimeType: string;
  parentFolderId?: string;
}

export interface CreateDealFolderInput {
  dealName: string;
  dealId: string;
  parentFolderId?: string; // Where to create the deal folder
  templateStructure?: boolean; // Whether to create subfolders
}

export interface AttachFileInput {
  fileId: string;
  dealId: string;
  category?: string; // proposals, contracts, etc.
}

export interface DrivePermission {
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  emailAddress?: string;
  domain?: string;
}

export interface FileAttachment {
  id: string;
  entityType: string;
  entityId: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  category?: string;
  attachedAt: string;
  attachedBy: string;
}

/**
 * Smart attachment suggestions based on file names and deal context
 */
export interface AttachmentSuggestion {
  fileId: string;
  fileName: string;
  confidence: number;
  reasons: string[];
  file: DriveFile;
}

export interface FileSearchFilter {
  query?: string;
  mimeTypes?: string[];
  modifiedAfter?: string;
  ownedByMe?: boolean;
  inFolder?: string;
}

// Common MIME types for filtering
export const COMMON_MIME_TYPES = {
  DOCUMENT: 'application/vnd.google-apps.document',
  SPREADSHEET: 'application/vnd.google-apps.spreadsheet',
  PRESENTATION: 'application/vnd.google-apps.presentation',
  PDF: 'application/pdf',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  POWERPOINT: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  IMAGE: 'image/*',
  FOLDER: 'application/vnd.google-apps.folder'
};

class GoogleDriveService {
  private async getDriveClient(userId: string, accessToken: string) {
    try {
      const tokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      if (!tokens) {
        throw new Error('DRIVE_NOT_CONNECTED');
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      // Set up automatic token refresh
      oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
          // Info: Google Drive refresh token updated
          // If we get a new refresh token, update our stored tokens
          await googleIntegrationService.storeExtendedTokens(
            userId,
            {
              access_token: newTokens.access_token!,
              refresh_token: newTokens.refresh_token,
              expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : undefined,
              granted_scopes: tokens.granted_scopes // Preserve existing scopes
            },
            accessToken
          );
        } else if (newTokens.access_token) {
          // Info: Google Drive access token refreshed
          // Just update the access token and expiry
          const supabase = getAuthenticatedClient(accessToken);
          await supabase
            .from('google_oauth_tokens')
            .update({
              access_token: newTokens.access_token,
              expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
              last_used_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      });

      return google.drive({ version: 'v3', auth: oauth2Client });
    } catch (error) {
      console.error('Failed to get Drive client:', error);
      if (error instanceof Error && error.message === 'DRIVE_NOT_CONNECTED') {
        throw new Error('Google Drive integration not connected. Please reconnect your Google account.');
      }
      if (error instanceof Error && error.message.includes('refresh')) {
        throw new Error('Google Drive authentication expired. Please reconnect your Google account.');
      }
      throw new Error('Failed to authenticate with Google Drive. Please check your Google integration.');
    }
  }

  /**
   * Create a deal folder structure in Google Drive
   */
  async createDealFolder(
    userId: string,
    accessToken: string,
    input: CreateDealFolderInput
  ): Promise<DriveFolderStructure> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    // Create main deal folder
    const dealFolderName = `${input.dealName} (ID: ${input.dealId})`;
    const dealFolderMetadata: any = {
      name: dealFolderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    
    if (input.parentFolderId) {
      dealFolderMetadata.parents = [input.parentFolderId];
    }

    const dealFolderResponse = await drive.files.create({
      requestBody: dealFolderMetadata,
      fields: 'id,name,parents,webViewLink,createdTime,modifiedTime',
    });

    const dealFolder = dealFolderResponse.data as DriveFolder;

    // Create subfolders if requested
    let subfolders: any = {};
    if (input.templateStructure) {
      const subfolderNames = [
        'Proposals',
        'Contracts', 
        'Legal Documents',
        'Presentations',
        'Correspondence'
      ];

      const subfolderPromises = subfolderNames.map(async (name) => {
        const response = await drive.files.create({
          requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [dealFolder.id],
          },
          fields: 'id,name,parents,webViewLink,createdTime,modifiedTime',
        });
        return { key: name.toLowerCase().replace(' ', ''), folder: response.data };
      });

      const subfolderResults = await Promise.all(subfolderPromises);
      subfolders = Object.fromEntries(
        subfolderResults.map(({ key, folder }) => [key, folder])
      );
    }

    return {
      dealFolder,
      subfolders: {
        proposals: subfolders.proposals || null,
        contracts: subfolders.contracts || null,
        legal: subfolders.legaldocuments || null,
        presentations: subfolders.presentations || null,
        correspondence: subfolders.correspondence || null,
      },
    };
  }

  /**
   * List files in a folder
   */
  async listFiles(
    userId: string,
    accessToken: string,
    folderId?: string,
    query?: string
  ): Promise<DriveFile[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    let q = 'trashed = false';
    
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }
    
    if (query) {
      q += ` and name contains '${query}'`;
    }

    const response = await drive.files.list({
      q,
      fields: 'files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink)',
      orderBy: 'modifiedTime desc',
    });

    return response.data.files as DriveFile[];
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(
    userId: string,
    accessToken: string,
    input: UploadFileInput
  ): Promise<DriveFile> {
    const drive = await this.getDriveClient(userId, accessToken);

    const fileMetadata: any = {
      name: input.name,
    };
    
    if (input.parentFolderId) {
      fileMetadata.parents = [input.parentFolderId];
    }

    const media = {
      mimeType: input.mimeType,
      body: input.content,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink',
    });

    return response.data as DriveFile;
  }

  /**
   * Get file details
   */
  async getFile(userId: string, accessToken: string, fileId: string): Promise<DriveFile> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    const response = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink',
    });

    return response.data as DriveFile;
  }

  /**
   * Search files across Drive
   */
  async searchFiles(
    userId: string,
    accessToken: string,
    searchQuery: string
  ): Promise<DriveFile[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    const response = await drive.files.list({
      q: `name contains '${searchQuery}' and trashed = false`,
      fields: 'files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink)',
      orderBy: 'relevance',
    });

    return response.data.files as DriveFile[];
  }

  /**
   * Browse folders - get folder structure including shared folders
   */
  async browseFolders(
    userId: string,
    accessToken: string,
    parentFolderId?: string
  ): Promise<DriveFolder[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    if (parentFolderId) {
      // When browsing inside a specific folder, just get its children
      const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and trashed = false and '${parentFolderId}' in parents`,
        fields: 'files(id,name,parents,webViewLink,createdTime,modifiedTime,sharingUser,shared,ownedByMe)',
        orderBy: 'name',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
      });
      
      return response.data.files as DriveFolder[];
    } else {
      // Root level: Get both personal and shared folders in parallel for better performance
      const [myDriveFolders, sharedFolders] = await Promise.all([
        // Get "My Drive" root folders
        drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and trashed = false and 'root' in parents",
          fields: 'files(id,name,parents,webViewLink,createdTime,modifiedTime,sharingUser,shared,ownedByMe)',
          orderBy: 'name',
        }),
        // Get shared folders (folders shared with me that aren't in My Drive)
        drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and trashed = false and sharedWithMe = true",
          fields: 'files(id,name,parents,webViewLink,createdTime,modifiedTime,sharingUser,shared,ownedByMe)',
          orderBy: 'name',
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        })
      ]);

      // Combine and deduplicate folders (in case a shared folder is also in My Drive)
      const allFolders = [...(myDriveFolders.data.files || []), ...(sharedFolders.data.files || [])];
      const uniqueFolders = allFolders.filter((folder, index, self) => 
        index === self.findIndex(f => f.id === folder.id)
      );

      return uniqueFolders as DriveFolder[];
    }
  }

  /**
   * Share folder with specific permissions
   */
  async shareFolder(
    userId: string,
    accessToken: string,
    folderId: string,
    permissions: DrivePermission[]
  ): Promise<void> {
    const drive = await this.getDriveClient(userId, accessToken);

    const permissionPromises = permissions.map(permission => 
      drive.permissions.create({
        fileId: folderId,
        requestBody: permission,
      })
    );

    await Promise.all(permissionPromises);
  }

  /**
   * Move file to folder
   */
  async moveFile(
    userId: string,
    accessToken: string,
    fileId: string,
    newParentId: string,
    oldParentId?: string
  ): Promise<DriveFile> {
    const drive = await this.getDriveClient(userId, accessToken);

    // Get current parents if not provided
    if (!oldParentId) {
      const file = await drive.files.get({
        fileId,
        fields: 'parents',
      });
      oldParentId = file.data.parents?.[0];
    }

    const response = await drive.files.update({
      fileId,
      addParents: newParentId,
      removeParents: oldParentId,
      fields: 'id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink',
    });

    return response.data as DriveFile;
  }

  /**
   * Copy file to folder (creates a new copy)
   */
  async copyFile(
    userId: string,
    accessToken: string,
    fileId: string,
    newParentId: string,
    newName?: string
  ): Promise<DriveFile> {
    const drive = await this.getDriveClient(userId, accessToken);

    const copyMetadata: any = {
      parents: [newParentId],
    };
    
    if (newName) {
      copyMetadata.name = newName;
    }

    const response = await drive.files.copy({
      fileId,
      requestBody: copyMetadata,
      fields: 'id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink',
    });

    return response.data as DriveFile;
  }

  /**
   * Delete file or folder
   */
  async deleteFile(userId: string, accessToken: string, fileId: string): Promise<void> {
    const drive = await this.getDriveClient(userId, accessToken);
    await drive.files.delete({ fileId });
  }

  /**
   * Get recent files for quick access
   */
  async getRecentFiles(userId: string, accessToken: string, limit = 10): Promise<DriveFile[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    const response = await drive.files.list({
      q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
      fields: 'files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink)',
      orderBy: 'viewedByMeTime desc',
      pageSize: limit,
    });

    return response.data.files as DriveFile[];
  }

  /**
   * List shared drives the user has access to
   */
  async listSharedDrives(userId: string, accessToken: string): Promise<SharedDrive[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    const response = await drive.drives.list({
      fields: 'drives(id,name,createdTime,capabilities,backgroundImageFile,colorRgb,restrictions)',
      pageSize: 100 // Typically organizations don't have many shared drives
    });

    return response.data.drives as SharedDrive[];
  }

  /**
   * Browse files within a shared drive
   */
  async listSharedDriveFiles(
    userId: string,
    accessToken: string,
    sharedDriveId: string,
    folderId?: string,
    query?: string
  ): Promise<DriveFile[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    let q = 'trashed = false';
    
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    } else {
      // If no folder specified, search in the root of the shared drive
      q += ` and parents in '${sharedDriveId}'`;
    }
    
    if (query) {
      q += ` and name contains '${query}'`;
    }

    const response = await drive.files.list({
      q,
      driveId: sharedDriveId,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: 'drive',
      fields: 'files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 100
    });

    return response.data.files as DriveFile[];
  }

  /**
   * Search files across all shared drives
   */
  async searchSharedDriveFiles(
    userId: string,
    accessToken: string,
    searchQuery: string,
    sharedDriveId?: string
  ): Promise<DriveFile[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    const q = `name contains '${searchQuery}' and trashed = false`;
    
    const searchParams: any = {
      q,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      fields: 'files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink)',
      orderBy: 'relevance',
      pageSize: 50
    };

    if (sharedDriveId) {
      // Search within specific shared drive
      searchParams.driveId = sharedDriveId;
      searchParams.corpora = 'drive';
    } else {
      // Search across all accessible shared drives
      searchParams.corpora = 'allDrives';
    }

    const response = await drive.files.list(searchParams);

    return response.data.files as DriveFile[];
  }

  /**
   * Get shared drive folders for browsing
   */
  async listSharedDriveFolders(
    userId: string,
    accessToken: string,
    sharedDriveId: string,
    parentFolderId?: string
  ): Promise<DriveFolder[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    let q = "mimeType='application/vnd.google-apps.folder' and trashed = false";
    
    if (parentFolderId) {
      q += ` and '${parentFolderId}' in parents`;
    } else {
      // Root level folders in the shared drive
      q += ` and parents in '${sharedDriveId}'`;
    }

    const response = await drive.files.list({
      q,
      driveId: sharedDriveId,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: 'drive',
      fields: 'files(id,name,parents,webViewLink,createdTime,modifiedTime,shared,ownedByMe)',
      orderBy: 'name',
      pageSize: 100
    });

    return response.data.files as DriveFolder[];
  }

  /**
   * Get recent files from shared drives only
   */
  async getRecentSharedDriveFiles(userId: string, accessToken: string, limit = 20): Promise<DriveFile[]> {
    const drive = await this.getDriveClient(userId, accessToken);
    
    const response = await drive.files.list({
      q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: 'allDrives',
      fields: 'files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,owners,parents,thumbnailLink,iconLink)',
      orderBy: 'viewedByMeTime desc',
      pageSize: limit,
    });

    return response.data.files as DriveFile[];
  }
}

export const googleDriveService = new GoogleDriveService(); 