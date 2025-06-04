# PipeCD Leads Management System - Testing Script

**Version**: 2.0  
**Date**: January 31, 2025  
**System**: PipeCD CRM - Leads Module  
**Test Environment**: Local Development

---

## Test Overview

This testing script validates the complete leads management system implementation, including:
- ✅ Navigation and routing
- ✅ Lead CRUD operations with WFM integration
- ✅ Table and Kanban views with workflow progression
- ✅ Custom fields integration (optimized)
- ✅ WFM-based qualification system (no standalone qualification fields)
- ✅ AI Agent integration with lead-specific tools
- ✅ Search and filtering with updated statistics
- ✅ Drag-and-drop workflow management
- ✅ Error handling and permissions
- ✅ UI/UX responsiveness

---

## Pre-Test Setup

### Prerequisites
1. **Database**: Ensure all lead management migrations are applied (through 20250730000017)
2. **Environment**: Local development server running
3. **Authentication**: User logged into the system
4. **Permissions**: User has lead management permissions
5. **Test Data**: Clean slate recommended for consistent testing
6. **WFM Setup**: Lead qualification workflow must be properly configured

### Required Migrations Status
Verify these migrations are applied:
- ✅ `20250730000006_create_leads_management_schema.sql` - Core schema
- ✅ `20250730000009_setup_lead_qualification_wfm.sql` - WFM integration
- ✅ `20250730000017_move_lead_qualification_to_wfm_metadata.sql` - WFM-based qualification

### Test User Permissions
Ensure the test user has the following permissions:
- `lead:create`
- `lead:read_own` or `lead:read_any`
- `lead:update_own` or `lead:update_any`
- `lead:delete_own` or `lead:delete_any`

---

## Test Suite 1: Navigation & Basic Access

### Test 1.1: Sidebar Navigation
**Objective**: Verify leads page is accessible from sidebar

**Steps**:
1. Navigate to the main application dashboard
2. Locate the sidebar navigation menu
3. Look for "Leads" navigation item with star icon
4. Click on "Leads" navigation item

**Expected Results**:
- ✅ "Leads" item visible in sidebar between "Deals" and "People"
- ✅ Star icon displays correctly
- ✅ Clicking navigates to `/leads` route
- ✅ URL changes to `/leads`
- ✅ Page loads without errors

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 1.2: Direct URL Access
**Objective**: Verify direct URL navigation works

**Steps**:
1. Navigate directly to `http://localhost:5173/leads`
2. Verify page loads correctly

**Expected Results**:
- ✅ Page loads without errors
- ✅ Leads page content displays
- ✅ No console errors

**Status**: [x] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 2: Leads Page Layout & Updated Statistics

### Test 2.1: Page Header & Updated Statistics Dashboard
**Objective**: Verify page header and new statistics dashboard

**Steps**:
1. Navigate to leads page
2. Examine page header and statistics section

**Expected Results**:
- ✅ Page title "Leads" is displayed
- ✅ Statistics cards show **updated metrics**:
  - **Total Value** (with currency formatting)
  - **Average Score** (out of 100, not percentage)
  - **Qualification Rate** (percentage of qualified leads)
  - **Unqualified Leads** (count of leads needing qualification)
- ✅ Statistics load with proper formatting
- ✅ Loading states display if data is being fetched
- ✅ Statistics update dynamically with filtering

**Status**: [x] Pass [ ] Fail  
**Notes**: ________________

### Test 2.2: View Mode Toggle
**Objective**: Verify table/kanban view switching with WFM integration

**Steps**:
1. Locate view mode toggle buttons (Table/Kanban)
2. Click "Table" button
3. Click "Kanban" button
4. Return to "Table" button

**Expected Results**:
- ✅ Toggle buttons are visible and styled correctly
- ✅ Active view is highlighted
- ✅ Clicking "Table" shows table view
- ✅ Clicking "Kanban" shows **WFM workflow columns**
- ✅ View preference persists on page refresh
- ✅ Smooth transition between views
- ✅ **Kanban view displays workflow steps correctly**

**Status**: [x] Pass [ ] Fail  
**Notes**: ________________

### Test 2.3: Search Functionality
**Objective**: Verify search input works correctly

**Steps**:
1. Locate search input field
2. Enter search term (lead name, contact email, company)
3. Clear search field
4. Test with various search terms

**Expected Results**:
- ✅ Search input is properly styled and accessible
- ✅ Placeholder text guides user
- ✅ Search filters results in real-time
- ✅ Clearing search shows all results
- ✅ Search works across multiple fields (name, contact info, company)
- ✅ Search works in both table and kanban views

**Status**: [x] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 3: Lead Creation with WFM Integration

### Test 3.1: Create Lead Modal Access
**Objective**: Verify create lead modal opens correctly

**Steps**:
1. Click "Create Lead" button
2. Examine modal appearance and fields

**Expected Results**:
- ✅ "Create Lead" button is visible and styled
- ✅ Modal opens on click
- ✅ Modal overlay prevents background interaction
- ✅ Modal can be closed with X button or escape key
- ✅ All required form fields are present
- ✅ **WFM Project Type selection available** (auto-populated)

**Status**: [x] Pass [ ] Fail  
**Notes**: ________________

### Test 3.2: Lead Creation - Valid Data with WFM Integration
**Objective**: Create a new lead with valid data and verify WFM project creation

**Test Data**:
```
Name: "Acme Corporation Lead"
Source: "Website"
Contact Name: "John Smith"
Contact Email: "john.smith@acme.com"
Contact Phone: "+1 (555) 123-4567"
Company Name: "Acme Corporation"
Estimated Value: "50000"
Estimated Close Date: [Future date]
Description: "Interested in our enterprise solution"
WFM Project Type: "Lead Qualification and Conversion Process"
```

**Steps**:
1. Open create lead modal
2. Fill in all fields with test data
3. Click "Create Lead" button
4. Verify lead appears in list

**Expected Results**:
- ✅ All form fields accept input correctly
- ✅ Form validation passes for valid data
- ✅ Success message displays
- ✅ Modal closes after creation
- ✅ New lead appears in leads list
- ✅ Lead data displays correctly in table/cards
- ✅ **Lead has WFM project created automatically**
- ✅ **Lead starts in "New Lead" workflow step**
- ✅ **Qualification status shows as "Not Qualified" initially**
- ✅ **Lead score shows as 0 initially**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 3.3: Lead Creation - Validation
**Objective**: Test form validation with invalid data

**Steps**:
1. Open create lead modal
2. Submit form with empty required fields
3. Test invalid email format
4. Test invalid phone format
5. Test invalid estimated value (negative number)

**Expected Results**:
- ✅ Required field validation prevents submission
- ✅ Email validation shows error for invalid format
- ✅ Phone validation works correctly
- ✅ Estimated value validation prevents negative numbers
- ✅ Error messages are clear and helpful
- ✅ Form doesn't submit with validation errors

**Status**: [x] Pass [ ] Fail  
**Notes**: ________________

### Test 3.4: Lead Creation - Custom Fields Integration
**Objective**: Verify optimized custom fields integration

**Steps**:
1. Open create lead modal
2. Locate custom fields section
3. Fill in available custom fields
4. Create lead and verify custom field data

**Expected Results**:
- ✅ Custom fields display in modal using **optimized custom fields hook**
- ✅ Custom field types work correctly (text, dropdown, etc.)
- ✅ Custom field validation works
- ✅ Custom field data saves with lead
- ✅ Custom field data displays in lead views
- ✅ **No duplicate custom field definitions loaded**

**Status**: [x] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 4: Lead Display & Table View

### Test 4.1: Table Layout with WFM Status
**Objective**: Verify table displays leads correctly with WFM integration

**Steps**:
1. Switch to table view
2. Examine table headers and data
3. Test column sorting
4. Test column selector

**Expected Results**:
- ✅ Table displays with proper headers
- ✅ Lead data populates correctly in columns:
  - Name
  - Source
  - Contact Info (name, email, phone)
  - Company
  - Score (with visual indicator)
  - **WFM Status** (current workflow step)
  - **Qualification Status** (computed from WFM metadata)
  - Estimated Value (formatted currency)
  - Created Date
  - Actions
- ✅ Columns are sortable
- ✅ Column selector allows hiding/showing columns
- ✅ Table is responsive on smaller screens
- ✅ **WFM status badges show correct workflow step**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 4.2: Lead Score Display
**Objective**: Verify lead scoring visualization

**Steps**:
1. Examine lead score column in table
2. Look for score indicators (progress bars, colors)
3. Verify score tooltips and details

**Expected Results**:
- ✅ Lead scores display as progress bars or numeric values
- ✅ Color coding indicates score ranges (red/yellow/green)
- ✅ Scores are properly formatted (0-100)
- ✅ Tooltips provide score breakdown if available

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 4.3: WFM-Based Qualification Status
**Objective**: Verify WFM-computed qualification status indicators

**Steps**:
1. Examine qualification status in table
2. Look for different qualification states
3. Verify status badges and colors

**Expected Results**:
- ✅ Qualification status displays as colored badges
- ✅ **Status computed from WFM step metadata (not standalone field)**
- ✅ Different states have distinct colors:
  - Not Qualified: Gray/Red (steps 1-4, 7-8)
  - Qualified: Green (steps 5-6)
- ✅ Status text is clear and readable
- ✅ **No standalone is_qualified field used**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 4.4: Row Actions with Permissions
**Objective**: Test table row action buttons with proper permissions

**Steps**:
1. Locate action buttons in table rows
2. Test edit button
3. Test delete button
4. Test any additional actions

**Expected Results**:
- ✅ Action buttons are visible and accessible
- ✅ Edit button opens edit modal
- ✅ Delete button shows confirmation dialog
- ✅ Actions are disabled for unauthorized users
- ✅ Button tooltips provide helpful information
- ✅ **Permissions checked against user permissions store**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 5: Kanban View & WFM Workflow Management

### Test 5.1: WFM Workflow Kanban Layout
**Objective**: Verify kanban view displays WFM workflow correctly

**Steps**:
1. Switch to kanban view
2. Examine workflow columns
3. Verify lead cards in columns

**Expected Results**:
- ✅ Kanban view displays **WFM workflow columns**:
  - **New Lead** (initial step)
  - **Initial Contact**
  - **Contacted - Follow Up**
  - **Qualifying**
  - **Qualified Lead**
  - **Converted** (final success)
  - **Disqualified** (final loss)
  - **Nurturing** (parallel track)
- ✅ Columns have proper headers and styling
- ✅ Lead cards display in appropriate columns based on **WFM project current_step**
- ✅ Columns show lead count
- ✅ Layout is responsive
- ✅ **Workflow step metadata drives column behavior**

**Status**: [x] Pass [ ] Fail  
**Notes**: ________________

### Test 5.2: Lead Cards with Enhanced Information
**Objective**: Verify lead card design and information

**Steps**:
1. Examine individual lead cards
2. Verify card content and styling
3. Test card interactions

**Expected Results**:
- ✅ Cards display essential information:
  - Lead name
  - Contact info
  - Company name
  - Lead score (with color coding)
  - Estimated value
  - **WFM workflow status**
- ✅ Cards are visually appealing and consistent
- ✅ Cards show status indicators
- ✅ Cards have hover effects
- ✅ Cards can be clicked for details
- ✅ **Cards show qualification level visually**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 5.3: WFM Workflow Drag and Drop
**Objective**: Test workflow progression via drag and drop with WFM integration

**Steps**:
1. Drag a lead card from "New Lead" to "Initial Contact"
2. Drag a lead card to "Qualified Lead"
3. Try dragging to "Converted"
4. Try invalid drag operations

**Expected Results**:
- ✅ Cards can be dragged smoothly
- ✅ Drop zones highlight when dragging over
- ✅ Valid drops update **WFM project current_step**
- ✅ **WFM workflow transitions validated**
- ✅ Invalid drops are rejected with proper error messages
- ✅ Optimistic UI updates occur immediately
- ✅ Changes persist after page refresh
- ✅ **GraphQL updateLeadWFMProgress mutation called**
- ✅ Error handling for failed updates
- ✅ **Qualification status updates automatically via WFM metadata**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 5.4: WFM Workflow Status Updates
**Objective**: Verify WFM workflow status changes correctly

**Steps**:
1. Move lead through workflow stages
2. Check database updates
3. Verify status changes in table view

**Expected Results**:
- ✅ **WFM project current_step updates in database**
- ✅ Status changes reflect in table view
- ✅ **WFM workflow history is maintained**
- ✅ **Qualification status computed from new step metadata**
- ✅ Invalid workflow transitions are prevented
- ✅ **Step metadata (qualification level, outcome type) applied correctly**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 6: Lead Editing with WFM Context

### Test 6.1: Edit Modal Access
**Objective**: Verify edit functionality access

**Steps**:
1. Click edit button on a lead (table or card)
2. Examine edit modal appearance

**Expected Results**:
- ✅ Edit button opens modal for correct lead
- ✅ Modal pre-populates with existing data
- ✅ All editable fields are present
- ✅ Modal title indicates editing mode
- ✅ **WFM project information displayed**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 6.2: Data Editing with Custom Fields
**Objective**: Test editing lead information with optimized custom fields

**Test Changes**:
```
Name: "Updated Lead Name"
Contact Email: "updated.email@company.com"
Estimated Value: "75000"
Description: "Updated description with new details"
Custom Fields: [Update available custom field values]
```

**Steps**:
1. Open edit modal for an existing lead
2. Modify several fields with test changes
3. Save changes
4. Verify updates in lead display

**Expected Results**:
- ✅ All fields can be edited
- ✅ **Custom fields load using optimized hook**
- ✅ Changes save successfully
- ✅ Modal closes after saving
- ✅ Updates reflect immediately in UI
- ✅ Success message displays
- ✅ Data persists after page refresh
- ✅ **Lead history tracks changes properly**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 6.3: Edit Validation
**Objective**: Test validation during editing

**Steps**:
1. Open edit modal
2. Clear required fields
3. Enter invalid data formats
4. Attempt to save

**Expected Results**:
- ✅ Validation prevents saving invalid data
- ✅ Error messages display for invalid fields
- ✅ Required field validation works
- ✅ Format validation (email, phone) works

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 6.4: Custom Fields Editing with Optimization
**Objective**: Verify optimized custom fields can be edited

**Steps**:
1. Open edit modal for lead with custom field data
2. Modify custom field values
3. Save changes
4. Verify custom field updates

**Expected Results**:
- ✅ Custom fields display current values
- ✅ Custom fields can be modified
- ✅ Custom field changes save correctly
- ✅ Custom field validation works during editing
- ✅ **No duplicate API calls for custom field definitions**
- ✅ **Optimized custom fields hook prevents unnecessary re-renders**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 7: Lead Deletion with WFM Cleanup

### Test 7.1: Delete Confirmation with WFM Context
**Objective**: Test delete workflow and confirmation

**Steps**:
1. Click delete button on a lead
2. Examine confirmation dialog
3. Test cancel option
4. Test confirm deletion

**Expected Results**:
- ✅ Delete button triggers confirmation dialog
- ✅ Confirmation dialog explains consequences
- ✅ Cancel button closes dialog without action
- ✅ Confirm button deletes the lead
- ✅ Success message displays after deletion
- ✅ Lead disappears from UI immediately
- ✅ **WFM project is properly cleaned up/archived**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 7.2: Delete Validation with WFM Dependencies
**Objective**: Test deletion permissions and WFM-related restrictions

**Steps**:
1. Try deleting leads as different user types
2. Test deleting leads with WFM history
3. Verify proper authorization

**Expected Results**:
- ✅ Only authorized users can delete leads
- ✅ Proper error messages for unauthorized attempts
- ✅ **WFM project data handling (archive vs delete)**
- ✅ **Workflow history preservation**
- ✅ Soft delete vs hard delete works correctly

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 8: Search & Filtering with WFM Integration

### Test 8.1: Text Search Across Lead Fields
**Objective**: Test search functionality across lead fields

**Test Searches**:
- Lead name: "Acme"
- Contact email: "@acme.com"
- Company name: "Corporation"
- Phone number: "555"

**Steps**:
1. Enter each search term
2. Verify filtered results
3. Clear search and verify all results return

**Expected Results**:
- ✅ Search filters results correctly for each field
- ✅ Search is case-insensitive
- ✅ Partial matches work
- ✅ Search works in both table and kanban views
- ✅ No results state displays when appropriate
- ✅ **Search maintains WFM workflow organization in kanban**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 8.2: WFM-Based Filtering
**Objective**: Test filtering with WFM workflow status

**Steps**:
1. Filter by workflow status (if implemented)
2. Filter by qualification status (computed from WFM)
3. Filter by score range
4. Filter by assigned user

**Expected Results**:
- ✅ **WFM status filtering works correctly**
- ✅ **Qualification status filter uses WFM metadata**
- ✅ Multiple filters can be combined
- ✅ Filter reset functionality works
- ✅ Filter state persists during navigation
- ✅ **No reference to deprecated standalone qualification fields**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 9: AI Agent Integration

### Test 9.1: AI Agent Lead Tools Access
**Objective**: Test AI Agent integration with lead-specific tools

**Steps**:
1. Open AI Agent chat interface
2. Test lead search commands
3. Test lead creation commands
4. Test lead qualification commands

**Expected AI Commands to Test**:
```
"Search for leads from Acme Corporation"
"Create a new lead for John Smith at Acme Corp"
"Show me details for lead [lead_id]"
"Update the score for lead [lead_id]"
"Qualify lead [lead_id] as ready for conversion"
```

**Expected Results**:
- ✅ **AI Agent recognizes lead-specific commands**
- ✅ **search_leads tool works correctly**
- ✅ **create_lead tool creates leads with WFM integration**
- ✅ **get_lead_details tool provides comprehensive information**
- ✅ **update_lead_score tool recalculates scoring**
- ✅ **Tools integrate with WFM workflow system**
- ✅ Error handling for invalid operations
- ✅ **AI responses include lead-specific formatting**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 9.2: AI Lead Conversion (Limited)
**Objective**: Test AI Agent lead conversion capabilities

**Steps**:
1. Try AI Agent lead conversion commands
2. Verify current implementation status

**Expected AI Commands to Test**:
```
"Convert lead [lead_id] to a deal"
"What's the conversion status for lead [lead_id]?"
```

**Expected Results**:
- ✅ **AI Agent indicates conversion not yet implemented**
- ✅ **Proper error message directing to web interface**
- ✅ **AI suggests using manual conversion workflow**
- ✅ No system errors or crashes

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 10: Error Handling & WFM Edge Cases

### Test 10.1: WFM Workflow Errors
**Objective**: Test behavior when WFM operations fail

**Steps**:
1. Try to move lead to invalid workflow step
2. Test with leads missing WFM projects
3. Test workflow transition validation

**Expected Results**:
- ✅ **Invalid workflow transitions are rejected**
- ✅ **Clear error messages for WFM failures**
- ✅ **Leads without WFM projects handle gracefully**
- ✅ **Workflow validation prevents invalid states**
- ✅ User can retry failed operations
- ✅ No silent failures occur
- ✅ Data integrity maintained

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 10.2: Network and GraphQL Errors
**Objective**: Test behavior when network requests fail

**Steps**:
1. Disconnect internet/network
2. Try creating a lead
3. Try updating a lead
4. Try WFM workflow progression

**Expected Results**:
- ✅ Appropriate error messages display
- ✅ Loading states handle gracefully
- ✅ User can retry failed operations
- ✅ **WFM state remains consistent**
- ✅ No silent failures occur
- ✅ Data integrity maintained

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 10.3: Custom Fields and Validation Errors
**Objective**: Test handling of custom field and server-side errors

**Steps**:
1. Test custom field validation edge cases
2. Test server-side validation responses
3. Test concurrent edit scenarios

**Expected Results**:
- ✅ All validation errors display clearly
- ✅ Field-specific errors highlight problem areas
- ✅ Validation messages are helpful
- ✅ Validation doesn't prevent valid submissions
- ✅ **Custom field errors handled by optimized hook**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 11: Performance & UX with WFM

### Test 11.1: Loading Performance with WFM Data
**Objective**: Test page load and interaction performance

**Steps**:
1. Measure initial page load time
2. Test large dataset performance (100+ leads)
3. Test search performance with large datasets
4. Test kanban drag performance with WFM calls

**Expected Results**:
- ✅ Initial page load < 3 seconds
- ✅ Search results appear < 500ms
- ✅ Drag operations feel responsive
- ✅ **WFM workflow updates don't cause UI lag**
- ✅ No performance degradation with large datasets
- ✅ Proper loading states during operations
- ✅ **Optimized custom fields hook prevents excessive API calls**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 11.2: Responsive Design with Enhanced Statistics
**Objective**: Test mobile and tablet compatibility

**Screen Sizes to Test**:
- Mobile: 375px width
- Tablet: 768px width  
- Desktop: 1024px+ width

**Steps**:
1. Test each screen size
2. Verify layout adaptations
3. Test touch interactions on mobile

**Expected Results**:
- ✅ Layout adapts properly to all screen sizes
- ✅ All functionality accessible on mobile
- ✅ Touch targets are appropriately sized
- ✅ Text remains readable at all sizes
- ✅ Tables/kanban boards work on mobile
- ✅ **Enhanced statistics cards stack properly on mobile**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 11.3: Accessibility Compliance
**Objective**: Test accessibility compliance

**Steps**:
1. Test keyboard navigation
2. Test screen reader compatibility
3. Test color contrast
4. Test focus indicators

**Expected Results**:
- ✅ All interactive elements keyboard accessible
- ✅ Screen reader can navigate and understand content
- ✅ Color contrast meets WCAG guidelines
- ✅ Focus indicators clearly visible
- ✅ ARIA labels provided where needed
- ✅ **WFM workflow steps announced properly**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Suite 12: Integration Tests with WFM

### Test 12.1: WFM Workflow Integration
**Objective**: Verify WFM workflow system works seamlessly

**Steps**:
1. Create lead and verify WFM project creation
2. Progress lead through workflow steps
3. Verify qualification status computation
4. Test workflow transition validation

**Expected Results**:
- ✅ **WFM project created automatically for new leads**
- ✅ **Workflow progression updates lead status**
- ✅ **Qualification computed from WFM step metadata**
- ✅ **Workflow transitions properly validated**
- ✅ **Step metadata drives UI behavior**
- ✅ **No standalone qualification fields used**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 12.2: Optimized Custom Fields Integration
**Objective**: Verify optimized custom fields work seamlessly

**Steps**:
1. Create custom field definitions for leads
2. Use custom fields in lead creation
3. Edit custom field values
4. Verify custom field data in all views

**Expected Results**:
- ✅ Custom fields appear in create/edit forms
- ✅ Custom field data saves and loads correctly
- ✅ Custom field validation works
- ✅ Custom fields display in table/kanban views
- ✅ **Optimized hook prevents duplicate API calls**
- ✅ **Custom field definitions cached properly**

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 12.3: Activity Integration with Leads
**Objective**: Test activity system integration

**Steps**:
1. Create activities for leads
2. View lead activities in detail view
3. Verify activity filtering by lead

**Expected Results**:
- ✅ Activities can be created for leads
- ✅ Lead activities display correctly
- ✅ Activity filtering works
- ✅ Activity creation from lead context works

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

### Test 12.4: User Assignment and Permissions
**Objective**: Test lead assignment functionality

**Steps**:
1. Assign leads to different users
2. Test permission-based visibility
3. Verify assignment filters

**Expected Results**:
- ✅ Leads can be assigned to users
- ✅ Users see appropriate leads based on permissions
- ✅ Assignment displays correctly in UI
- ✅ Assignment filtering works

**Status**: [ ] Pass [ ] Fail  
**Notes**: ________________

---

## Test Results Summary

### Overall Test Results
- **Total Tests**: _____ / _____
- **Passed**: _____
- **Failed**: _____
- **Skipped**: _____

### WFM Integration Results
- **Workflow Creation**: [ ] Pass [ ] Fail
- **Workflow Progression**: [ ] Pass [ ] Fail
- **Qualification Computation**: [ ] Pass [ ] Fail
- **Transition Validation**: [ ] Pass [ ] Fail

### AI Agent Integration Results
- **Lead Search Tools**: [ ] Pass [ ] Fail
- **Lead Creation Tools**: [ ] Pass [ ] Fail
- **Lead Update Tools**: [ ] Pass [ ] Fail
- **Error Handling**: [ ] Pass [ ] Fail

### Critical Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Minor Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Performance Notes
- Page Load Time: _______ seconds
- Search Response Time: _______ ms
- Drag Performance: _______
- WFM Update Time: _______ ms

### Recommendations
1. ________________________________
2. ________________________________
3. ________________________________

---

## WFM Workflow Verification Checklist

### Required Workflow Steps
- [ ] New Lead (initial, step_order=1)
- [ ] Initial Contact (step_order=2)
- [ ] Contacted - Follow Up (step_order=3)
- [ ] Qualifying (step_order=4)
- [ ] Qualified Lead (step_order=5)
- [ ] Converted (final, step_order=6)
- [ ] Disqualified (final, step_order=7)
- [ ] Nurturing (step_order=8)

### Required Metadata Verification
- [ ] is_qualified values (0 or 1)
- [ ] lead_qualification_level values (0.0 to 1.0)
- [ ] outcome_type values (OPEN, CONVERTED, DISQUALIFIED)
- [ ] stage_name values match UI display

### Migration Status
- [ ] `20250730000017_move_lead_qualification_to_wfm_metadata.sql` applied
- [ ] Standalone qualification fields removed
- [ ] WFM metadata drives all qualification logic

---

## Tester Information

**Tester Name**: ________________________  
**Date Tested**: ________________________  
**Environment**: ________________________  
**Browser**: ___________________________  
**Screen Resolution**: __________________  
**WFM Workflow ID**: ___________________
**Lead Project Type ID**: _______________

**Testing Notes**:
________________________________________________
________________________________________________
________________________________________________

---

## Approval

**Test Completion**: [ ] Complete [ ] Incomplete  
**WFM Integration Working**: [ ] Yes [ ] No  
**AI Agent Integration Working**: [ ] Yes [ ] No  
**Ready for Production**: [ ] Yes [ ] No  
**Additional Testing Required**: [ ] Yes [ ] No  

**Tester Signature**: ________________________  
**Date**: __________________________________

---

*This updated testing script ensures comprehensive validation of the PipeCD Leads Management System with full WFM integration, AI Agent capabilities, and optimized custom fields. All test cases should be completed before production deployment.* 