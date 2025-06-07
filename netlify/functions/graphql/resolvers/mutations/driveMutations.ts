import { googleDriveService } from '../../../../../lib/googleDriveService';
import { requireAuthentication } from '../../helpers';
import { googleIntegrationService } from '../../../../../lib/googleIntegrationService';

export const driveMutations = {
  createDealFolder: async (_: any, { input }: any, context: any) => {
    const { accessToken, userId } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      const folderStructure = await googleDriveService.createDealFolder(googleTokens.access_token, input);
      
      // Store main folder info in database
      const { error } = await context.supabaseClient
        .from('deal_drive_folders')
        .insert({
          deal_id: input.dealId,
          folder_id: folderStructure.dealFolder.id,
          folder_name: folderStructure.dealFolder.name,
          folder_url: folderStructure.dealFolder.webViewLink,
          is_main_folder: true,
          created_by: userId,
        });
      
      if (error) {
        console.error('Error storing deal folder:', error);
        throw new Error('Failed to store deal folder in database');
      }
      
      // Store subfolders if they exist
      if (input.templateStructure && folderStructure.subfolders) {
        const subfolderInserts = Object.entries(folderStructure.subfolders)
          .filter(([_, folder]) => folder)
          .map(([type, folder]: [string, any]) => ({
            deal_id: input.dealId,
            folder_id: folder.id,
            folder_name: folder.name,
            folder_url: folder.webViewLink,
            parent_folder_id: folderStructure.dealFolder.id,
            is_main_folder: false,
            subfolder_type: type.toUpperCase(),
            created_by: userId,
          }));
        
        if (subfolderInserts.length > 0) {
          const { error: subError } = await context.supabaseClient
            .from('deal_drive_folders')
            .insert(subfolderInserts);
          
          if (subError) {
            console.error('Error storing subfolders:', subError);
          }
        }
      }
      
      return folderStructure;
    } catch (error) {
      console.error('Error in createDealFolder:', error);
      throw new Error(`Failed to create deal folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  uploadFileToDrive: async (_: any, { input }: any, context: any) => {
    const { accessToken, userId } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      // Convert base64 content to buffer
      const content = Buffer.from(input.content, 'base64');
      
      const uploadInput = {
        name: input.name,
        content,
        mimeType: input.mimeType,
        parentFolderId: input.parentFolderId,
      };
      
      const file = await googleDriveService.uploadFile(googleTokens.access_token, uploadInput);
      
      // TODO: If dealId provided, store in deal_documents table
      if (input.dealId) {
        console.log('Would attach file to deal:', input.dealId, 'category:', input.category, 'userId:', userId);
      }
      
      return file;
    } catch (error) {
      console.error('Error in uploadFileToDrive:', error);
      throw new Error(`Failed to upload file to Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  attachFileToDeal: async (_: any, { input }: any, context: any) => {
    const { accessToken, userId } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      console.log('attachFileToDeal: Using Google OAuth token for Drive API');
      
      // Get file details from Drive
      const file = await googleDriveService.getFile(googleTokens.access_token, input.fileId);
      
      // Store attachment in deal_documents table
      const { data: attachment, error } = await context.supabaseClient
        .from('deal_documents')
        .insert({
          deal_id: input.dealId,
          file_id: input.fileId,
          file_name: file.name,
          file_url: file.webViewLink || '',
          mime_type: file.mimeType,
          file_size: file.size ? parseInt(file.size.toString()) : null,
          category: input.category || 'OTHER',
          attached_by: userId,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error storing deal document:', error);
        throw new Error('Failed to attach file to deal');
      }
      
      console.log('attachFileToDeal: Successfully attached file to deal');
      
      // Transform database response to match GraphQL schema
      return {
        id: attachment.id,
        dealId: attachment.deal_id,
        fileId: attachment.file_id,
        fileName: attachment.file_name,
        fileUrl: attachment.file_url,
        category: attachment.category,
        attachedAt: attachment.attached_at,
        attachedBy: attachment.attached_by
      };
    } catch (error) {
      console.error('Error in attachFileToDeal:', error);
      throw new Error(`Failed to attach file to deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  detachFileFromDeal: async (_: any, { attachmentId }: any, context: any) => {
    const { userId } = requireAuthentication(context);
    
    // Remove from deal_documents table
    const { error } = await context.supabaseClient
      .from('deal_documents')
      .delete()
      .eq('id', attachmentId)
      .eq('attached_by', userId); // Only allow users to detach files they attached
    
    if (error) {
      console.error('Error detaching document:', error);
      throw new Error('Failed to detach file from deal');
    }
    
    return true;
  },

  shareDriveFolder: async (_: any, { folderId, permissions }: any, context: any) => {
    const { accessToken, userId } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      // Convert permission enums to Drive API format
      const drivePermissions = permissions.map((p: any) => ({
        type: p.type.toLowerCase(),
        role: p.role.toLowerCase().replace('_', ''),
        emailAddress: p.emailAddress,
        domain: p.domain,
      }));
      
      await googleDriveService.shareFolder(googleTokens.access_token, folderId, drivePermissions);
      
      console.log('Shared folder:', folderId, 'with permissions:', permissions, 'userId:', userId);
      
      return true;
    } catch (error) {
      console.error('Error in shareDriveFolder:', error);
      throw new Error(`Failed to share Drive folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  moveDriveFile: async (_: any, { fileId, newParentId, oldParentId }: any, context: any) => {
    const { accessToken, userId } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      return await googleDriveService.moveFile(googleTokens.access_token, fileId, newParentId, oldParentId);
    } catch (error) {
      console.error('Error in moveDriveFile:', error);
      throw new Error(`Failed to move Drive file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  copyDriveFile: async (_: any, { fileId, newParentId, newName }: any, context: any) => {
    const { accessToken, userId } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      return await googleDriveService.copyFile(googleTokens.access_token, fileId, newParentId, newName);
    } catch (error) {
      console.error('Error in copyDriveFile:', error);
      throw new Error(`Failed to copy Drive file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  deleteDriveFile: async (_: any, { fileId }: any, context: any) => {
    const { accessToken, userId } = requireAuthentication(context);
    
    try {
      // Get Google OAuth token from stored tokens
      const googleTokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      
      if (!googleTokens || !googleTokens.access_token) {
        throw new Error('Google Drive access not authorized. Please connect your Google account.');
      }
      
      await googleDriveService.deleteFile(googleTokens.access_token, fileId);
      
      console.log('Deleted file:', fileId, 'userId:', userId);
      
      return true;
    } catch (error) {
      console.error('Error in deleteDriveFile:', error);
      throw new Error(`Failed to delete Drive file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
}; 