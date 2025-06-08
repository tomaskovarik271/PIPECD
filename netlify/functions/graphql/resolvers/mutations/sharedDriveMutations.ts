import { googleDriveService } from '../../../../../lib/googleDriveService';
import { requireAuthentication } from '../../helpers';
import { googleIntegrationService } from '../../../../../lib/googleIntegrationService';

interface AttachDocumentInput {
  dealId: string;
  googleFileId: string;
  fileName: string;
  fileUrl: string;
  sharedDriveId?: string;
  category?: string;
  mimeType?: string;
  fileSize?: number;
}

export const sharedDriveMutations = {
  /**
   * Attach a document from shared drive to a deal
   */
  async attachDocumentToDeal(_: any, args: { input: AttachDocumentInput }, context: any) {
    const { userId } = requireAuthentication(context);
    
    try {
      // Insert the attachment record
      const { data, error } = await context.supabaseClient
        .from('deal_document_attachments')
        .insert({
          deal_id: args.input.dealId,
          google_file_id: args.input.googleFileId,
          file_name: args.input.fileName,
          file_url: args.input.fileUrl,
          shared_drive_id: args.input.sharedDriveId,
          category: args.input.category?.toLowerCase(),
          attached_by: userId,
          mime_type: args.input.mimeType,
          file_size: args.input.fileSize,
        })
        .select()
        .single();

      if (error) {
        console.error('Error attaching document to deal:', error);
        
        // Handle duplicate attachment
        if (error.code === '23505') { // unique_violation
          throw new Error('This document is already attached to this deal');
        }
        
        throw new Error('Failed to attach document to deal');
      }

      // Transform the response to match GraphQL schema
      return {
        id: data.id,
        dealId: data.deal_id,
        googleFileId: data.google_file_id,
        fileName: data.file_name,
        fileUrl: data.file_url,
        sharedDriveId: data.shared_drive_id,
        category: data.category?.toUpperCase(),
        attachedAt: data.attached_at,
        attachedBy: data.attached_by,
        mimeType: data.mime_type,
        fileSize: data.file_size,
      };
    } catch (error) {
      console.error('Error in attachDocumentToDeal:', error);
      throw error instanceof Error ? error : new Error('Failed to attach document to deal');
    }
  },

  /**
   * Remove a document attachment from a deal
   */
  async removeDocumentAttachment(_: any, args: { attachmentId: string }, context: any) {
    const { userId } = requireAuthentication(context);
    
    try {
      const { error } = await context.supabaseClient
        .from('deal_document_attachments')
        .delete()
        .eq('id', args.attachmentId)
        .eq('attached_by', userId); // Users can only remove their own attachments

      if (error) {
        console.error('Error removing document attachment:', error);
        throw new Error('Failed to remove document attachment');
      }

      return true;
    } catch (error) {
      console.error('Error in removeDocumentAttachment:', error);
      throw error instanceof Error ? error : new Error('Failed to remove document attachment');
    }
  },

  /**
   * Update the category of a document attachment
   */
  async updateDocumentAttachmentCategory(_: any, args: { attachmentId: string; category: string }, context: any) {
    const { userId } = requireAuthentication(context);
    
    try {
      const { data, error } = await context.supabaseClient
        .from('deal_document_attachments')
        .update({ category: args.category.toLowerCase() })
        .eq('id', args.attachmentId)
        .eq('attached_by', userId) // Users can only update their own attachments
        .select()
        .single();

      if (error) {
        console.error('Error updating document attachment category:', error);
        throw new Error('Failed to update document attachment category');
      }

      return {
        id: data.id,
        category: data.category?.toUpperCase(),
      };
    } catch (error) {
      console.error('Error in updateDocumentAttachmentCategory:', error);
      throw error instanceof Error ? error : new Error('Failed to update document attachment category');
    }
  },
}; 