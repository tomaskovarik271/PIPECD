# Document Attachment to Notes - Manual Testing Guide

## Prerequisites
- ✅ Netlify dev running (localhost:8888)
- ✅ Supabase local instance running
- ✅ Migration `20250730000041_create_note_document_attachments.sql` applied
- ✅ Google Drive integration configured and working
- User with appropriate permissions (member or admin role)

## Test Environment Setup

### 1. Verify Migration Applied
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'note_document_attachments';

-- Should return the table
```

### 2. Check RLS Policies
```sql
-- Verify RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'note_document_attachments';
```

### 3. Verify Google Drive Access
- Ensure you have access to at least one Google Shared Drive
- Verify Google OAuth tokens are valid
- Test that the main Documents tab in deals shows Google Drive files

## Manual Test Scenarios

### Test Group 1: Basic Functionality

#### Test 1.1: Access Document Attachment Modal
**Objective**: Verify the document attachment modal opens correctly with full Google Drive browser

**Steps**:
1. Navigate to any deal detail page (e.g., `localhost:8888/deals/[deal-id]`)
2. Click on the "Notes" tab in the deal detail panel
3. Look for the "Attach File" button in the notes section
4. Click the "Attach File" button

**Expected Results**:
- ✅ Modal opens with title "Attach Document to Note"
- ✅ Modal shows full Google Drive browser interface
- ✅ Shared drive dropdown is visible and populated
- ✅ Three tabs are available: Browse, Search Results, Recent
- ✅ Category dropdown is visible with options
- ✅ Information alert explains dual attachment behavior
- ✅ "Attach Document" and "Cancel" buttons are present

#### Test 1.2: Google Drive Browser Interface
**Objective**: Verify the Google Drive browser works correctly

**Steps**:
1. Open the document attachment modal (from Test 1.1)
2. Select a shared drive from the dropdown
3. Browse through folders by clicking on them
4. Use the breadcrumb navigation to go back
5. Try the search functionality
6. Check the Recent files tab

**Expected Results**:
- ✅ Shared drives are loaded and selectable
- ✅ Files and folders are displayed correctly
- ✅ Folder navigation works (click to enter, breadcrumb to go back)
- ✅ File icons are appropriate for file types
- ✅ File metadata is displayed (size, date, owner)
- ✅ Search functionality works and switches to Search Results tab
- ✅ Recent files tab shows recently modified files
- ✅ Loading states are shown during API calls

#### Test 1.3: File Selection and Attachment
**Objective**: Test successful document attachment to note and deal

**Steps**:
1. Open document attachment modal
2. Browse to find a real document in your Google Drive
3. Click on a file to select it (or use the "Select" button)
4. Verify the file appears in the "Selected File" preview
5. Choose a category (e.g., "Contract")
6. Click "Attach Document"
7. Wait for the operation to complete
8. Check both the notes section and deal documents tab

**Expected Results**:
- ✅ File selection highlights the chosen file
- ✅ Selected file preview shows correct file information
- ✅ Success message appears
- ✅ Modal closes automatically
- ✅ Document appears in both note attachments and deal documents
- ✅ No error messages in browser console
- ✅ Database records created in `note_document_attachments` table

### Test Group 2: Permission Testing

#### Test 2.1: Admin User Permissions
**Objective**: Verify admin users can attach documents

**Steps**:
1. Login as admin user
2. Navigate to any deal
3. Try to attach a document to a note

**Expected Results**:
- ✅ "Attach File" button is visible and enabled
- ✅ Google Drive browser loads successfully
- ✅ Document attachment succeeds
- ✅ No permission errors

#### Test 2.2: Member User Permissions
**Objective**: Verify member users can attach documents to their deals

**Steps**:
1. Login as member user
2. Navigate to a deal they own or are assigned to
3. Try to attach a document to a note

**Expected Results**:
- ✅ "Attach File" button is visible and enabled
- ✅ Google Drive browser loads successfully
- ✅ Document attachment succeeds

#### Test 2.3: Read-Only User Restrictions
**Objective**: Verify read-only users cannot attach documents

**Steps**:
1. Login as read-only user
2. Navigate to any deal
3. Check for document attachment functionality

**Expected Results**:
- ✅ "Attach File" button should be disabled or hidden
- ✅ If somehow accessed, attachment should fail with permission error

### Test Group 3: Data Integrity

#### Test 3.1: Dual Attachment Verification
**Objective**: Verify documents are attached to both note and deal

**Steps**:
1. Attach a document to a note
2. Check the deal's documents section
3. Verify the document appears in both places with consistent metadata

**Expected Results**:
- ✅ Document appears in note attachments
- ✅ Same document appears in deal documents
- ✅ Document metadata is consistent in both locations
- ✅ Category is preserved in both attachments

#### Test 3.2: Database Record Verification
**Objective**: Verify correct database records are created

**Steps**:
1. Attach a document to a note
2. Check database records:

```sql
-- Check note_document_attachments table
SELECT * FROM note_document_attachments 
ORDER BY created_at DESC LIMIT 5;

-- Check deal_document_attachments table
SELECT * FROM deal_document_attachments 
ORDER BY created_at DESC LIMIT 5;
```

**Expected Results**:
- ✅ Record created in `note_document_attachments`
- ✅ Record created in `deal_document_attachments`
- ✅ Both records reference the same Google file ID
- ✅ Proper user_id, timestamps, and metadata

#### Test 3.3: Duplicate Prevention
**Objective**: Verify the same document cannot be attached twice to the same note

**Steps**:
1. Attach a document to a note
2. Try to attach the same document to the same note again

**Expected Results**:
- ✅ Second attachment attempt should fail gracefully
- ✅ Error message indicates document already attached
- ✅ No duplicate records in database

### Test Group 4: Google Drive Integration

#### Test 4.1: Multiple Shared Drives
**Objective**: Test browsing across multiple shared drives

**Steps**:
1. Open document attachment modal
2. Switch between different shared drives
3. Verify content loads correctly for each drive

**Expected Results**:
- ✅ All accessible shared drives are listed
- ✅ Switching drives loads the correct content
- ✅ Folder navigation resets when switching drives

#### Test 4.2: Search Functionality
**Objective**: Test document search across Google Drive

**Steps**:
1. Open document attachment modal
2. Enter a search term in the search box
3. Press Enter or click Search
4. Verify results are displayed

**Expected Results**:
- ✅ Search switches to "Search Results" tab
- ✅ Relevant files are displayed
- ✅ Search works across the selected shared drive
- ✅ "No results" message shown when appropriate

#### Test 4.3: Recent Files
**Objective**: Test recent files functionality

**Steps**:
1. Open document attachment modal
2. Click on the "Recent" tab
3. Verify recently modified files are shown

**Expected Results**:
- ✅ Recent files are displayed
- ✅ Files are sorted by modification date
- ✅ File selection works from recent files

#### Test 4.4: External Links
**Objective**: Test opening files in Google Drive

**Steps**:
1. Browse to any file in the document browser
2. Click the external link icon (↗)
3. Verify the file opens in Google Drive

**Expected Results**:
- ✅ File opens in new tab/window
- ✅ Correct Google Drive file is opened
- ✅ User has appropriate access to the file

### Test Group 5: Error Handling

#### Test 5.1: Network Error Handling
**Objective**: Test behavior when Google Drive API requests fail

**Steps**:
1. Open browser developer tools
2. Go to Network tab and simulate offline mode
3. Try to browse Google Drive or attach a document

**Expected Results**:
- ✅ Appropriate error messages displayed
- ✅ Modal remains functional for retry
- ✅ No JavaScript errors break the interface

#### Test 5.2: Invalid Google Drive Access
**Objective**: Test handling when user lacks Google Drive access

**Steps**:
1. Test with a user who doesn't have Google Drive configured
2. Try to open the document attachment modal

**Expected Results**:
- ✅ Clear error message about Google Drive access
- ✅ Guidance on how to configure Google Drive
- ✅ Modal doesn't crash or show empty state

#### Test 5.3: Large File Handling
**Objective**: Test attachment of large files

**Steps**:
1. Try to attach a very large file (>100MB)
2. Monitor the attachment process

**Expected Results**:
- ✅ Large files are handled gracefully
- ✅ Appropriate loading indicators shown
- ✅ Timeout handling if needed

### Test Group 6: UI/UX Testing

#### Test 6.1: Responsive Design
**Objective**: Verify modal works on different screen sizes

**Steps**:
1. Test on desktop (1920x1080)
2. Test on tablet (768px width)
3. Test on mobile (375px width)

**Expected Results**:
- ✅ Modal scales appropriately
- ✅ Google Drive browser remains functional
- ✅ All elements remain accessible
- ✅ Text remains readable

#### Test 6.2: Theme Integration
**Objective**: Verify modal respects theme settings

**Steps**:
1. Test in light theme
2. Test in dark theme (if available)
3. Check color consistency

**Expected Results**:
- ✅ Modal colors match current theme
- ✅ Google Drive browser integrates with theme
- ✅ Text contrast is appropriate
- ✅ Interactive elements are clearly visible

### Test Group 7: Integration Testing

#### Test 7.1: Notes System Integration
**Objective**: Verify integration with existing notes system

**Steps**:
1. Create a note with text content
2. Attach a document to the note
3. Edit the note text
4. Verify document attachment persists

**Expected Results**:
- ✅ Document attachment survives note edits
- ✅ Note functionality remains unaffected
- ✅ Document list updates correctly

#### Test 7.2: Deal Documents Integration
**Objective**: Verify integration with deal documents system

**Steps**:
1. Attach documents directly to deal via Documents tab
2. Attach documents via notes
3. View deal documents list
4. Verify both types appear correctly

**Expected Results**:
- ✅ Both direct and note-attached documents appear
- ✅ Source of attachment is clear
- ✅ Document management functions work for both types

## Database Verification Queries

### Check Attachment Records
```sql
-- View recent note document attachments
SELECT 
    nda.*,
    s.content as note_content,
    d.name as deal_name
FROM note_document_attachments nda
JOIN stickers s ON nda.sticker_id = s.id
JOIN deals d ON nda.deal_id = d.id
ORDER BY nda.created_at DESC
LIMIT 10;
```

### Check Dual Attachments
```sql
-- Verify documents attached to both note and deal
SELECT 
    nda.document_id,
    nda.document_name,
    'note' as attachment_type,
    nda.created_at
FROM note_document_attachments nda
UNION ALL
SELECT 
    dda.document_id,
    dda.document_name,
    'deal' as attachment_type,
    dda.created_at
FROM deal_document_attachments dda
ORDER BY document_id, created_at;
```

## Common Issues and Troubleshooting

### Issue 1: "Attach File" Button Not Visible
**Possible Causes**:
- User lacks permissions
- Component not properly integrated
- Deal context missing

**Debug Steps**:
1. Check user permissions in browser console
2. Verify `dealId` prop is passed to EnhancedSimpleNotes
3. Check browser console for JavaScript errors

### Issue 2: Google Drive Browser Not Loading
**Possible Causes**:
- Google OAuth tokens expired
- Google Drive API not configured
- Network connectivity issues

**Debug Steps**:
1. Check browser console for API errors
2. Verify Google OAuth configuration
3. Test Google Drive access in main Documents tab
4. Check network requests in developer tools

### Issue 3: Shared Drives Not Appearing
**Possible Causes**:
- User doesn't have access to shared drives
- Google Drive API permissions insufficient
- Shared drives not configured

**Debug Steps**:
1. Verify user has access to shared drives in Google Drive web interface
2. Check Google API permissions and scopes
3. Test shared drive access in main application

### Issue 4: File Selection Not Working
**Possible Causes**:
- JavaScript event handling issues
- State management problems
- File permissions in Google Drive

**Debug Steps**:
1. Check browser console for JavaScript errors
2. Verify file click handlers are working
3. Test with different file types
4. Check file permissions in Google Drive

### Issue 5: Attachment Fails
**Possible Causes**:
- Database connection issues
- Permission problems
- Invalid file metadata

**Debug Steps**:
1. Check network tab for failed GraphQL requests
2. Verify database migration applied
3. Check Supabase logs for errors
4. Verify file metadata is complete

## Success Criteria

The document attachment feature with full Google Drive integration is working correctly when:

- ✅ All Test Group 1 (Basic Functionality) tests pass
- ✅ All Test Group 2 (Permission Testing) tests pass  
- ✅ All Test Group 3 (Data Integrity) tests pass
- ✅ All Test Group 4 (Google Drive Integration) tests pass
- ✅ Documents appear in both note and deal contexts
- ✅ Google Drive browser is fully functional
- ✅ Search and recent files work correctly
- ✅ No console errors during normal operation
- ✅ Database records are created correctly
- ✅ User experience is smooth and intuitive

## Performance Testing

### Load Testing
1. Browse large folders with 100+ files
2. Perform searches with many results
3. Attach multiple documents to notes
4. Verify performance remains acceptable

### Memory Testing
1. Open/close modal multiple times
2. Browse through many folders
3. Perform multiple searches
4. Verify no memory leaks in browser

---

**Note**: This testing guide now covers the complete Google Drive integration. The demo file system has been replaced with full Google Drive browser functionality, providing users with access to their real shared drives, search capabilities, and recent files. 