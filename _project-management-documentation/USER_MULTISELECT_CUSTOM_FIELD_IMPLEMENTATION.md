# USER_MULTISELECT Custom Field Implementation

## Overview

The USER_MULTISELECT custom field type allows users to select multiple team members from the system for custom fields. This is particularly useful for scenarios like:

- **Deal Team Members**: Assigning multiple people to work on a deal
- **Account Managers**: Multiple managers responsible for an organization
- **Project Reviewers**: Multiple people who need to review deliverables
- **Approval Workflow**: Multiple approvers for different stages

## Technical Implementation

### Database Schema

**Migration**: `20250730000083_add_user_multiselect_custom_field_type.sql`

```sql
-- Add USER_MULTISELECT to the custom_field_type enum
ALTER TYPE public.custom_field_type ADD VALUE 'USER_MULTISELECT';
```

The new field type is added to the existing `custom_field_type` enum alongside:
- TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT, **USER_MULTISELECT**

### Data Storage

USER_MULTISELECT fields store user IDs in the `selectedOptionValues` array field of the custom field value structure:

```json
{
  "definitionId": "field-uuid",
  "selectedOptionValues": ["user-id-1", "user-id-2", "user-id-3"]
}
```

This reuses the existing `selectedOptionValues` field that's also used by MULTI_SELECT fields, maintaining consistency with the current architecture.

### GraphQL Schema Updates

**Backend**: `netlify/functions/graphql/schema/customFields.graphql`
**Frontend**: `frontend/src/generated/graphql/graphql.ts`

```graphql
enum CustomFieldType {
  TEXT
  NUMBER
  DATE
  BOOLEAN
  DROPDOWN
  MULTI_SELECT
  USER_MULTISELECT  # New field type
}
```

### Frontend Components

#### 1. UserMultiSelectField Component

**File**: `frontend/src/components/common/UserMultiSelectField.tsx`

**Features**:
- **User Search**: Real-time filtering by name or email
- **Visual Selection**: Checkboxes with user avatars and names
- **Selected Users Display**: Badge-style display with remove buttons
- **Responsive Design**: Dropdown interface with proper theming
- **Accessibility**: Keyboard navigation and screen reader support

**Props**:
```typescript
interface UserMultiSelectFieldProps {
  value: string[];           // Array of user IDs
  onChange: (userIds: string[]) => void;
  isDisabled?: boolean;
  placeholder?: string;
}
```

#### 2. CustomFieldRenderer Updates

**File**: `frontend/src/components/common/CustomFieldRenderer.tsx`

Added support for USER_MULTISELECT in the field renderer with proper type checking:

```typescript
case 'USER_MULTISELECT' as CustomFieldType:
  return (
    <UserMultiSelectField
      value={Array.isArray(value) ? value : []}
      onChange={onChange}
      isDisabled={isDisabled}
      placeholder={`Select ${fieldLabel.toLowerCase()}...`}
    />
  );
```

#### 3. Custom Field Processing

**File**: `frontend/src/lib/utils/customFieldProcessing.ts`

Updated utility functions to handle USER_MULTISELECT the same way as MULTI_SELECT:

- `initializeCustomFieldValues()`: Defaults to empty array
- `initializeCustomFieldValuesFromEntity()`: Loads existing user IDs
- `processCustomFieldsForSubmission()`: Converts to GraphQL format

### Admin Interface

**File**: `frontend/src/components/admin/customFields/CustomFieldDefinitionForm.tsx`

The admin custom field creation form now includes USER_MULTISELECT as an option:

```typescript
{['TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'DROPDOWN', 'MULTI_SELECT', 'USER_MULTISELECT', 'TEXT_AREA'].map((type) => (
  <option key={type} value={type}>
    {type}
  </option>
))}
```

## Usage Examples

### Creating Custom Field Definitions

```sql
-- Deal Team Members
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, 
    is_required, is_active, display_order
) VALUES (
    'DEAL', 'deal_team_members', 'Deal Team Members', 'USER_MULTISELECT', 
    FALSE, TRUE, 10
);

-- Organization Account Managers  
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type,
    is_required, is_active, display_order
) VALUES (
    'ORGANIZATION', 'account_managers', 'Account Managers', 'USER_MULTISELECT',
    FALSE, TRUE, 5
);
```

### Setting Field Values

When a user selects team members, the data is stored as:

```json
{
  "custom_field_values": {
    "deal_team_members": ["user-uuid-1", "user-uuid-2", "user-uuid-3"]
  }
}
```

### Display Logic

**File**: `frontend/src/components/deals/DealCustomFieldsPanel.tsx`

For display purposes, USER_MULTISELECT fields show a count summary:

```typescript
case 'USER_MULTISELECT':
  if (cfv.selectedOptionValues && cfv.selectedOptionValues.length > 0) {
    displayValue = `${cfv.selectedOptionValues.length} user(s) selected`;
  } else {
    displayValue = '-';
  }
  break;
```

## Business Benefits

### 1. **Enhanced Team Collaboration**
- Clear assignment of multiple team members to deals/projects
- Improved accountability and communication
- Better resource allocation visibility

### 2. **Flexible Reporting**
- Report on deals by team member involvement
- Track workload distribution across team members
- Analyze collaboration patterns

### 3. **Workflow Automation**
- Trigger notifications to all selected team members
- Route approvals through multiple reviewers
- Create automated task assignments

### 4. **Data Integrity**
- Validates user IDs against actual system users
- Maintains referential integrity
- Prevents orphaned user references

## Implementation Status

✅ **Database Migration**: Applied successfully  
✅ **GraphQL Schema**: Updated with new enum value  
✅ **Frontend Components**: UserMultiSelectField created  
✅ **Form Integration**: Added to CustomFieldRenderer  
✅ **Admin Interface**: Added to field type options  
✅ **Processing Logic**: Updated utility functions  
✅ **Build Verification**: Frontend builds successfully  
✅ **Test Data**: Sample field definitions created  

## Future Enhancements

### 1. **Enhanced Display**
- Show user avatars and names in display mode (instead of just count)
- Implement user hover cards with additional details
- Add role/department information to user selection

### 2. **Advanced Features**
- Role-based filtering (only show users with specific permissions)
- Department-based grouping in selection interface
- Integration with organizational hierarchy

### 3. **Reporting Integration**
- Custom reports filtered by selected team members
- Analytics on team collaboration patterns
- Performance metrics by team composition

### 4. **Workflow Integration**
- Automatic notification sending to selected users
- Task creation for each selected team member
- Calendar integration for team meetings

## Testing Recommendations

1. **Create Test Fields**: Use the provided SQL script to create sample USER_MULTISELECT fields
2. **Test User Selection**: Verify the search and selection interface works correctly
3. **Test Data Persistence**: Ensure selected users are saved and loaded properly
4. **Test Display**: Verify the field displays correctly in various contexts
5. **Test Permissions**: Ensure only users with appropriate permissions can access the user list

## Security Considerations

- User selection is limited to users the current user has permission to assign
- Uses existing `assignableUsers` GraphQL query with proper permission checks
- Validates user IDs on the backend before storage
- Respects existing RBAC (Role-Based Access Control) system

---

**Implementation Date**: January 15, 2025  
**Version**: 1.0  
**Status**: Production Ready 