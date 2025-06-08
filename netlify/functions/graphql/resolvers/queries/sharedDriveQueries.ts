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
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const drives = await googleDriveService.listSharedDrives(googleTokens.access_token);
      return drives;
    } catch (error) {
      console.error('Error fetching shared drives:', error);
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
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const files = await googleDriveService.listSharedDriveFiles(
        googleTokens.access_token,
        args.sharedDriveId,
        args.folderId,
        args.query
      );
      return files;
    } catch (error) {
      console.error('Error fetching shared drive files:', error);
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
        googleTokens.access_token,
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
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const files = await googleDriveService.searchSharedDriveFiles(
        googleTokens.access_token,
        args.query,
        args.sharedDriveId
      );
      return files;
    } catch (error) {
      console.error('Error searching shared drive files:', error);
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
        googleTokens.access_token,
        args.limit || 20
      );
      return files;
    } catch (error) {
      console.error('Error fetching recent shared drive files:', error);
      throw new Error('Failed to fetch recent shared drive files');
    }
  },

  /**
   * Get document attachments for a deal
   */
  async getDealDocumentAttachments(_: any, args: { dealId: string }, context: any) {
    requireAuthentication(context);
    
    try {
      const { data } = await context.supabaseClient
        .from('deal_document_attachments')
        .select('*')
        .eq('deal_id', args.dealId)
        .order('attached_at', { ascending: false });

      // Transform the response to match GraphQL schema (snake_case to camelCase)
      return (data || []).map((attachment: any) => ({
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
      console.error('Error fetching deal document attachments:', error);
      throw new Error('Failed to fetch deal document attachments');
    }
  },
}; 