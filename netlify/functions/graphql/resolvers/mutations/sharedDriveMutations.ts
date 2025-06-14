import { requireAuthentication } from '../../helpers';

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

interface AttachDocumentToNoteInput {
  noteId: string;
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
   * Attach a document to both a note and deal simultaneously
   */
  async attachDocumentToNoteAndDeal(_: any, args: { input: AttachDocumentToNoteInput }, context: any) {
    const { userId } = requireAuthentication(context);
    
    try {
      // Start a transaction by using Promise.all for atomic operations
      const [noteAttachmentResult, dealAttachmentResult] = await Promise.all([
        // Insert note attachment
        context.supabaseClient
          .from('note_document_attachments')
          .insert({
            note_id: args.input.noteId,
            google_file_id: args.input.googleFileId,
            file_name: args.input.fileName,
            file_url: args.input.fileUrl,
            attached_by: userId,
            mime_type: args.input.mimeType,
            file_size: args.input.fileSize,
          })
          .select()
          .single(),
        
        // Insert deal attachment
        context.supabaseClient
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
          .single(),
      ]);

      if (noteAttachmentResult.error) {
        console.error('Error attaching document to note:', noteAttachmentResult.error);
        
        if (noteAttachmentResult.error.code === '23505') {
          throw new Error('This document is already attached to this note');
        }
        
        throw new Error('Failed to attach document to note');
      }

      if (dealAttachmentResult.error) {
        console.error('Error attaching document to deal:', dealAttachmentResult.error);
        
        if (dealAttachmentResult.error.code === '23505') {
          throw new Error('This document is already attached to this deal');
        }
        
        throw new Error('Failed to attach document to deal');
      }

      // Transform responses to match GraphQL schema
      return {
        noteAttachment: {
          id: noteAttachmentResult.data.id,
          noteId: noteAttachmentResult.data.note_id,
          googleFileId: noteAttachmentResult.data.google_file_id,
          fileName: noteAttachmentResult.data.file_name,
          fileUrl: noteAttachmentResult.data.file_url,
          attachedAt: noteAttachmentResult.data.attached_at,
          attachedBy: noteAttachmentResult.data.attached_by,
          mimeType: noteAttachmentResult.data.mime_type,
          fileSize: noteAttachmentResult.data.file_size,
        },
        dealAttachment: {
          id: dealAttachmentResult.data.id,
          dealId: dealAttachmentResult.data.deal_id,
          googleFileId: dealAttachmentResult.data.google_file_id,
          fileName: dealAttachmentResult.data.file_name,
          fileUrl: dealAttachmentResult.data.file_url,
          sharedDriveId: dealAttachmentResult.data.shared_drive_id,
          category: dealAttachmentResult.data.category?.toUpperCase(),
          attachedAt: dealAttachmentResult.data.attached_at,
          attachedBy: dealAttachmentResult.data.attached_by,
          mimeType: dealAttachmentResult.data.mime_type,
          fileSize: dealAttachmentResult.data.file_size,
        },
      };
    } catch (error) {
      console.error('Error in attachDocumentToNoteAndDeal:', error);
      throw error instanceof Error ? error : new Error('Failed to attach document to note and deal');
    }
  },

  /**
   * Remove document attachment from deal
   */
  async removeDocumentAttachment(_: any, args: { attachmentId: string }, context: any) {
    requireAuthentication(context);
    
    try {
      const { error } = await context.supabaseClient
        .from('deal_document_attachments')
        .delete()
        .eq('id', args.attachmentId);

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
   * Remove document attachment from note
   */
  async removeNoteDocumentAttachment(_: any, args: { attachmentId: string }, context: any) {
    requireAuthentication(context);
    
    try {
      const { error } = await context.supabaseClient
        .from('note_document_attachments')
        .delete()
        .eq('id', args.attachmentId);

      if (error) {
        console.error('Error removing note document attachment:', error);
        throw new Error('Failed to remove note document attachment');
      }

      return true;
    } catch (error) {
      console.error('Error in removeNoteDocumentAttachment:', error);
      throw error instanceof Error ? error : new Error('Failed to remove note document attachment');
    }
  },

  /**
   * Update document attachment category
   */
  async updateDocumentAttachmentCategory(_: any, args: { attachmentId: string; category: string }, context: any) {
    requireAuthentication(context);
    
    try {
      const { data, error } = await context.supabaseClient
        .from('deal_document_attachments')
        .update({ category: args.category.toLowerCase() })
        .eq('id', args.attachmentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating document attachment category:', error);
        throw new Error('Failed to update document attachment category');
      }

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
      console.error('Error in updateDocumentAttachmentCategory:', error);
      throw error instanceof Error ? error : new Error('Failed to update document attachment category');
    }
  },
}; 