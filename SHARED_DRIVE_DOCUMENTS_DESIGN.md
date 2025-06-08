# Shared Drive Document Attachment System - Design Document

## 🎯 Overview

A simplified document attachment system that leverages Google Shared Drives for organization-wide document management within PipeCD deals.

## 🏗️ Core Principles

1. **Shared Drives Only**: Focus exclusively on organization shared drives
2. **Google Drive Permissions**: Let Google handle all access control
3. **Simple Categories**: Streamlined document categorization
4. **Natural Access**: Users discover access issues when they try to open documents

## 📊 Database Schema

### Simplified deal_document_attachments table
```sql
CREATE TABLE deal_document_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    google_file_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    shared_drive_id TEXT, -- Which shared drive this came from
    category TEXT CHECK (category IN ('proposal', 'contract', 'presentation', 'correspondence', 'other')),
    attached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attached_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Optional metadata cache
    mime_type TEXT,
    file_size BIGINT,
    
    UNIQUE(deal_id, google_file_id) -- Prevent duplicate attachments
);

CREATE INDEX idx_deal_attachments_deal_id ON deal_document_attachments(deal_id);
CREATE INDEX idx_deal_attachments_category ON deal_document_attachments(category);
CREATE INDEX idx_deal_attachments_shared_drive ON deal_document_attachments(shared_drive_id);
```

## 🔍 Document Discovery Interface

### 1. Shared Drives Browser
```typescript
interface SharedDriveBrowser {
  // List all shared drives user has access to
  listSharedDrives(): Promise<SharedDrive[]>;
  
  // Browse folder contents within a shared drive
  browseFolderContents(driveId: string, folderId?: string): Promise<DriveFile[]>;
  
  // Search within specific shared drive
  searchInSharedDrive(driveId: string, query: string): Promise<DriveFile[]>;
  
  // Search across all accessible shared drives
  searchAllSharedDrives(query: string): Promise<DriveFile[]>;
}
```

### 2. Document Attachment Flow
```typescript
const attachDocument = async (input: {
  dealId: string;
  googleFileId: string;
  sharedDriveId: string;
  category: 'proposal' | 'contract' | 'presentation' | 'correspondence' | 'other';
}) => {
  // 1. Get file metadata from Google Drive
  const file = await googleDriveService.getFile(userToken, input.googleFileId);
  
  // 2. Store attachment in database
  const attachment = await supabase
    .from('deal_document_attachments')
    .insert({
      deal_id: input.dealId,
      google_file_id: input.googleFileId,
      file_name: file.name,
      file_url: file.webViewLink,
      shared_drive_id: input.sharedDriveId,
      category: input.category,
      mime_type: file.mimeType,
      file_size: file.size,
      attached_by: userId
    })
    .select()
    .single();
    
  return attachment;
};
```

## 🎨 User Interface Design

### Document Attachment Modal
```tsx
const DocumentAttachmentModal = ({ dealId, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Attach Document from Shared Drives</ModalHeader>
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Browse Shared Drives</Tab>
              <Tab>Search Documents</Tab>
              <Tab>Recent Files</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <SharedDrivesBrowser onSelect={handleDocumentSelect} />
              </TabPanel>
              <TabPanel>
                <DocumentSearch onSelect={handleDocumentSelect} />
              </TabPanel>
              <TabPanel>
                <RecentDocuments onSelect={handleDocumentSelect} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
```

### Document Display with Natural Access
```tsx
const AttachedDocumentsList = ({ documents }) => {
  return (
    <VStack spacing={3}>
      {documents.map(doc => (
        <DocumentCard 
          key={doc.id}
          document={doc}
          onOpen={() => window.open(doc.file_url, '_blank')} // Let Google handle access
          onRemove={() => handleRemoveAttachment(doc.id)}
        />
      ))}
    </VStack>
  );
};
```

## ⚡ Performance Optimizations

### 1. Shared Drive Caching
```typescript
// Cache shared drives list for session
const cachedSharedDrives = new Map<string, {
  drives: SharedDrive[];
  timestamp: number;
  ttl: number; // 30 minutes
}>();
```

### 2. Batch File Metadata
```typescript
// When displaying attached documents, batch fetch metadata
const refreshDocumentMetadata = async (attachments: DocumentAttachment[]) => {
  const fileIds = attachments.map(a => a.google_file_id);
  const batchResults = await googleDriveService.batchGetFiles(userToken, fileIds);
  
  // Update display with fresh metadata
  return attachments.map(attachment => ({
    ...attachment,
    accessible: batchResults.has(attachment.google_file_id),
    current_name: batchResults.get(attachment.google_file_id)?.name || attachment.file_name
  }));
};
```

## 🔄 Migration from Current System

### 1. Database Migration
```sql
-- Rename existing table and create new one
ALTER TABLE deal_documents RENAME TO deal_documents_old;

-- Create new simplified table
CREATE TABLE deal_document_attachments (
  -- schema as defined above
);

-- Optional: Migrate existing data
INSERT INTO deal_document_attachments (
  deal_id, google_file_id, file_name, file_url, category, attached_at, attached_by
)
SELECT 
  deal_id, file_id, file_name, file_url, 
  LOWER(category), attached_at, attached_by
FROM deal_documents_old;
```

### 2. Component Updates
- Update `DealDocumentsPanel` to use shared drives browser
- Remove folder creation functionality
- Simplify category selection
- Add shared drive context to document display

## 🎯 Benefits

### For Users
- ✅ Familiar Google Drive interface
- ✅ No complex folder structures to manage
- ✅ Works with existing organization structure
- ✅ Natural access control

### For Administrators
- ✅ Simpler system to maintain
- ✅ Leverages existing Google Workspace setup
- ✅ No duplicate permission management
- ✅ Reduced complexity

### For Developers
- ✅ Cleaner codebase
- ✅ Fewer edge cases to handle
- ✅ Better alignment with Google's APIs
- ✅ More maintainable architecture

## 🚀 Implementation Steps

1. **Database Migration**: Create new simplified schema
2. **Backend Services**: Update Google Drive service for shared drives focus
3. **GraphQL Schema**: Simplify document attachment mutations/queries
4. **Frontend Components**: Replace current document panel with shared drives browser
5. **Testing**: Verify shared drive access and attachment flow
6. **Migration**: Move existing attachments to new system

## 📝 Future Enhancements

- **Smart Categories**: Auto-suggest categories based on file names/types
- **Bulk Attachment**: Select multiple files at once
- **Drive Integration**: Quick access to drive context (which shared drive, folder path)
- **Activity Tracking**: Log when documents are attached/accessed 