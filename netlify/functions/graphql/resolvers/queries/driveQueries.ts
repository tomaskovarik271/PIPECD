import { googleDriveService } from '../../../../../lib/googleDriveService';
import { requireAuthentication } from '../../helpers';
import { googleIntegrationService } from '../../../../../lib/googleIntegrationService';

export const driveQueries = {
  getDriveFiles: async (_: any, { input }: any, context: any) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      // Check if user has Drive scope
      const hasDriveScope = googleTokens.granted_scopes.includes('https://www.googleapis.com/auth/drive');
      if (!hasDriveScope) {
        throw new Error('Google Drive access not authorized. Please reconnect your Google account with Drive permissions.');
      }
      
      console.log('getDriveFiles: Using Google OAuth token for Drive API');
      console.log('getDriveFiles: Query parameters:', { folderId: input.folderId, query: input.query, limit: input.limit });
      const files = await googleDriveService.listFiles(
        googleTokens.access_token,
        input.folderId,
        input.query
      );
      console.log('getDriveFiles: Successfully retrieved', files.length, 'files');
      
      return {
        files: files.slice(0, input.limit || 20),
        totalCount: files.length,
      };
    } catch (error) {
      console.error('Error in getDriveFiles:', error);
      
      // Check if it's a scope issue
      if (error instanceof Error && error.message.includes('insufficient authentication scopes')) {
        throw new Error('Google Drive access not authorized. Please reconnect your Google account with Drive permissions.');
      }
      
      throw new Error(`Failed to load Google Drive files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getDriveFolders: async (_: any, { input }: any, context: any) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const folders = await googleDriveService.browseFolders(
        googleTokens.access_token,
        input.parentFolderId
      );
      
      return {
        folders,
        totalCount: folders.length,
      };
    } catch (error) {
      console.error('Error in getDriveFolders:', error);
      throw new Error(`Failed to load Google Drive folders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getDriveFile: async (_: any, { fileId }: any, context: any) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      return await googleDriveService.getFile(googleTokens.access_token, fileId);
    } catch (error) {
      console.error('Error in getDriveFile:', error);
      throw new Error(`Failed to load Google Drive file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  searchDriveFiles: async (_: any, { query }: any, context: any) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const files = await googleDriveService.searchFiles(googleTokens.access_token, query);
      
      return {
        files,
        totalCount: files.length,
      };
    } catch (error) {
      console.error('Error in searchDriveFiles:', error);
      throw new Error(`Failed to search Google Drive files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getRecentDriveFiles: async (_: any, { limit = 10 }: any, context: any) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const files = await googleDriveService.getRecentFiles(googleTokens.access_token, limit);
      
      return {
        files,
        totalCount: files.length,
      };
    } catch (error) {
      console.error('Error in getRecentDriveFiles:', error);
      throw new Error(`Failed to load recent Google Drive files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getDealDocuments: async (_: any, { dealId }: any, context: any) => {
    const { userId } = requireAuthentication(context);
    
    const { data: documents, error } = await context.supabaseClient
      .from('deal_documents')
      .select('*')
      .eq('deal_id', dealId)
      .order('attached_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching deal documents:', error);
      throw new Error('Failed to fetch deal documents');
    }
    
    return (documents || []).map((doc: any) => ({
      id: doc.id,
      dealId: doc.deal_id,
      fileId: doc.file_id,
      fileName: doc.file_name,
      fileUrl: doc.file_url,
      category: doc.category,
      attachedAt: doc.attached_at,
      attachedBy: doc.attached_by
    }));
  },

  getDealFolder: async (_: any, { dealId }: any, context: any) => {
    const { userId } = requireAuthentication(context);
    
    const { data: folder, error } = await context.supabaseClient
      .from('deal_drive_folders')
      .select('*')
      .eq('deal_id', dealId)
      .eq('is_main_folder', true)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching deal folder:', error);
      throw new Error('Failed to fetch deal folder');
    }
    
    if (!folder) {
      return null;
    }
    
    // Transform database record to DriveFolder format
    return {
      id: folder.folder_id,
      name: folder.folder_name,
      parents: folder.parent_folder_id ? [folder.parent_folder_id] : [],
      webViewLink: folder.folder_url,
      createdTime: folder.created_at,
      modifiedTime: folder.updated_at
    };
  },
}; 