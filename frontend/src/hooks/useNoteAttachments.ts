import { useState, useEffect } from 'react';
import { gqlClient } from '../lib/graphqlClient';

// GraphQL query for note document attachments
const GET_NOTE_DOCUMENT_ATTACHMENTS_QUERY = `
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

interface NoteAttachment {
  id: string;
  noteId: string;
  googleFileId: string;
  fileName: string;
  fileUrl: string;
  attachedAt: string;
  attachedBy: string;
  mimeType?: string;
  fileSize?: number;
}

interface UseNoteAttachmentsResult {
  attachmentsData: Record<string, NoteAttachment[]>;
  loading: boolean;
  error: string | null;
  refetchAttachments: () => Promise<void>;
}

export const useNoteAttachments = (noteIds: string[]): UseNoteAttachmentsResult => {
  const [attachmentsData, setAttachmentsData] = useState<Record<string, NoteAttachment[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = async () => {
    if (noteIds.length === 0) {
      setAttachmentsData({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const attachmentPromises = noteIds.map(async (noteId) => {
        try {
          const result = await gqlClient.request(GET_NOTE_DOCUMENT_ATTACHMENTS_QUERY, { noteId }) as any;
          return { 
            noteId, 
            attachments: result.getNoteDocumentAttachments || [] 
          };
        } catch (error) {
          console.error(`Error fetching attachments for note ${noteId}:`, error);
          return { noteId, attachments: [] };
        }
      });

      const results = await Promise.all(attachmentPromises);
      const newAttachmentsData: Record<string, NoteAttachment[]> = {};
      
      results.forEach(({ noteId, attachments }) => {
        newAttachmentsData[noteId] = attachments;
      });

      setAttachmentsData(newAttachmentsData);
    } catch (err) {
      console.error('Error fetching note attachments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [noteIds.join(',')]); // Re-fetch when noteIds change

  const refetchAttachments = async () => {
    await fetchAttachments();
  };

  return {
    attachmentsData,
    loading,
    error,
    refetchAttachments,
  };
}; 