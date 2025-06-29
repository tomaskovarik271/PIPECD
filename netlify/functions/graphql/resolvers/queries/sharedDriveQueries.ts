import { googleDriveService } from '../../../../../lib/googleDriveService';
import { requireAuthentication } from '../../helpers';
import { googleIntegrationService } from '../../../../../lib/googleIntegrationService';

export const sharedDriveQueries = {
  /**
   * Get shared drives the user has access to
   */
  async getSharedDrives(_: any, __: any, context: any) {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account in Google Integration settings.');
      }
      
      const drives = await googleDriveService.listSharedDrives(userId, accessToken);
      return drives;
    } catch (error) {
      console.error('Error fetching shared drives:', error);
      
      // Preserve specific Google integration error messages
      if (error instanceof Error) {
        if (error.message.includes('not authorized') || 
            error.message.includes('authentication') || 
            error.message.includes('integration') ||
            error.message.includes('insufficient authentication scopes')) {
          throw error; // Re-throw the specific error message
        }
      }
      
      throw new Error('Failed to fetch shared drives');
    }
  },

  /**
   * Get files within a shared drive
   */
  async getSharedDriveFiles(_: any, args: { sharedDriveId: string; folderId?: string; query?: string }, context: any) {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please reconnect your Google account with Drive permissions.');
      }
      
      const files = await googleDriveService.listSharedDriveFiles(
        userId,
        accessToken,
        args.sharedDriveId,
        args.folderId,
        args.query
      );
      return files;
    } catch (error) {
      console.error('Error fetching shared drive files:', error);
      
      // Preserve specific Google integration error messages
      if (error instanceof Error) {
        if (error.message.includes('not authorized') || 
            error.message.includes('authentication') || 
            error.message.includes('integration') ||
            error.message.includes('insufficient authentication scopes')) {
          throw error; // Re-throw the specific error message
        }
      }
      
      throw new Error('Failed to fetch shared drive files');
    }
  },

  /**
   * Get folders within a shared drive
   */
  async getSharedDriveFolders(_: any, args: { sharedDriveId: string; parentFolderId?: string }, context: any) {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const folders = await googleDriveService.listSharedDriveFolders(
        userId,
        accessToken,
        args.sharedDriveId,
        args.parentFolderId
      );
      return folders;
    } catch (error) {
      console.error('Error fetching shared drive folders:', error);
      throw new Error('Failed to fetch shared drive folders');
    }
  },

  /**
   * Search files across shared drives
   */
  async searchSharedDriveFiles(_: any, args: { query: string; sharedDriveId?: string }, context: any) {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please ensure your Google account is connected with Drive permissions.');
      }
      
      const files = await googleDriveService.searchSharedDriveFiles(
        userId,
        accessToken,
        args.query,
        args.sharedDriveId
      );
      return files;
    } catch (error) {
      console.error('Error searching shared drive files:', error);
      
      // Preserve specific Google integration error messages
      if (error instanceof Error) {
        if (error.message.includes('not authorized') || 
            error.message.includes('authentication') || 
            error.message.includes('integration') ||
            error.message.includes('insufficient authentication scopes')) {
          throw error; // Re-throw the specific error message
        }
      }
      
      throw new Error('Failed to search shared drive files');
    }
  },

  /**
   * Get recent files from shared drives
   */
  async getRecentSharedDriveFiles(_: any, args: { limit?: number }, context: any) {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const files = await googleDriveService.getRecentSharedDriveFiles(
        userId,
        accessToken,
        args.limit || 20
      );
      return files;
    } catch (error) {
      console.error('Error fetching recent shared drive files:', error);
      throw new Error('Failed to fetch recent shared drive files');
    }
  },

  /**
   * Get document attachments for a specific deal
   */
  async getDealDocumentAttachments(_: any, args: { dealId: string }, context: any) {
    requireAuthentication(context);
    
    try {
      const { data, error } = await context.supabaseClient
        .from('deal_document_attachments')
        .select('*')
        .eq('deal_id', args.dealId)
        .order('attached_at', { ascending: false });

      if (error) {
        console.error('Error fetching deal document attachments:', error);
        throw new Error('Failed to fetch deal document attachments');
      }

      return data.map((attachment: any) => ({
        id: attachment.id,
        dealId: attachment.deal_id,
        googleFileId: attachment.google_file_id,
        fileName: attachment.file_name,
        fileUrl: attachment.file_url,
        sharedDriveId: attachment.shared_drive_id,
        category: attachment.category?.toUpperCase(),
        attachedAt: attachment.attached_at,
        attachedBy: attachment.attached_by,
        mimeType: attachment.mime_type,
        fileSize: attachment.file_size,
      }));
    } catch (error) {
      console.error('Error in getDealDocumentAttachments:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch deal document attachments');
    }
  },

  /**
   * Get document attachments for a specific note
   */
  async getNoteDocumentAttachments(_: any, args: { noteId: string }, context: any) {
    requireAuthentication(context);
    
    try {
      const { data, error } = await context.supabaseClient
        .from('note_document_attachments')
        .select('*')
        .eq('note_id', args.noteId)
        .order('attached_at', { ascending: false });

      if (error) {
        console.error('Error fetching note document attachments:', error);
        throw new Error('Failed to fetch note document attachments');
      }

      return data.map((attachment: any) => ({
        id: attachment.id,
        noteId: attachment.note_id,
        googleFileId: attachment.google_file_id,
        fileName: attachment.file_name,
        fileUrl: attachment.file_url,
        attachedAt: attachment.attached_at,
        attachedBy: attachment.attached_by,
        mimeType: attachment.mime_type,
        fileSize: attachment.file_size,
      }));
    } catch (error) {
      console.error('Error in getNoteDocumentAttachments:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch note document attachments');
    }
  },
}; 