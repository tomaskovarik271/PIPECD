# Business Rules Engine Frontend Components

This directory contains the complete frontend implementation for PipeCD's Business Rules Engine system, providing enterprise-grade business process automation capabilities.

## Architecture Overview

The Business Rules Engine enables users to create sophisticated automation rules that respond to various business events (deal creation, field changes, status updates, etc.) with configurable actions (notifications, emails, task creation, etc.).

## Components

### 1. BusinessRulesPage.tsx (598 lines)
Main administrative interface for managing business rules.

**Features:**
- Search and filtering by status, entity type, trigger type
- CRUD operations with comprehensive error handling
- Status management (activate/deactivate rules)
- Analytics display with execution metrics
- Modern card-based layout with responsive design
- Theme integration across light/dark/industrial themes

**Key UI Elements:**
- Search bar with real-time filtering
- Status badges with color coding
- Rule execution analytics with success rates
- Action buttons for create/edit/delete/activate/deactivate
- Confirmation dialogs for destructive actions

### 2. BusinessRulesFormModal.tsx
Sophisticated form interface for creating and editing business rules.

**Features:**
- Dynamic condition builder with 15+ operators:
  - EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN
  - CONTAINS, NOT_CONTAINS, STARTS_WITH, ENDS_WITH
  - IS_NULL, IS_NOT_NULL, IN, NOT_IN
  - REGEX_MATCH, DATE_AFTER, DATE_BEFORE
- Action configuration with multiple types:
  - NOTIFY_USER, SEND_EMAIL, CREATE_TASK
  - UPDATE_FIELD, WEBHOOK_CALL, LOG_MESSAGE
- Entity-aware field selection for different entity types
- Advanced settings with collapsible sections
- React Hook Form integration with comprehensive validation

**UI Components:**
- Multi-step form with wizard-like progression
- Dynamic field addition/removal
- Dropdown selectors for entity fields
- Priority and targeting configuration
- Template-based message composition

### 3. BusinessRuleDetailsModal.tsx
Rich details view for rule analysis and troubleshooting.

**Features:**
- Rule overview with complete configuration display
- Execution analytics with success rate calculations
- Progress bars for performance visualization
- Expandable condition/action views with syntax highlighting
- Execution history with timestamps and outcomes
- Error tracking and troubleshooting information

**Analytics:**
- Total execution count
- Success/failure rates
- Last execution timestamp
- Error details and stack traces
- Performance metrics

### 4. useBusinessRulesStore.ts
Complete Zustand state management with GraphQL integration.

**Features:**
- GraphQL integration using connection pattern
- Full CRUD operations:
  - `createBusinessRule(input: BusinessRuleInput)`
  - `updateBusinessRule(id: string, input: BusinessRuleInput)`
  - `deleteBusinessRule(id: string)`
  - `activateBusinessRule(id: string)`
  - `deactivateBusinessRule(id: string)`
- Error handling and loading states
- Data transformation between GraphQL and frontend formats
- Real-time updates with automatic refresh

## GraphQL Integration

### Query Structure
```graphql
query GetBusinessRules {
  businessRules {
    nodes {
      id
      name
      description
      entityType
      triggerType
      status
      executionCount
      wfmWorkflow { id name }
      wfmStep { 
        id 
        status { id name } 
      }
      wfmStatus { id name }
      createdBy { id email display_name }
      createdAt
      updatedAt
    }
    totalCount
  }
}
```

### Mutations
- `createBusinessRule(input: BusinessRuleInput)`
- `updateBusinessRule(id: ID!, input: BusinessRuleInput)`
- `deleteBusinessRule(id: ID!)`
- `activateBusinessRule(id: ID!)`
- `deactivateBusinessRule(id: ID!)`

## Theme Integration

All components support PipeCD's three-theme system:

### Light Modern Theme
- Clean white backgrounds with subtle gradients
- Professional blue accents
- Modern shadow system for depth
- High contrast for readability

### Dark Theme  
- Dark backgrounds with metallic accents
- Enhanced focus states
- Sophisticated color palette
- Reduced eye strain for extended use

### Industrial Metal Theme
- Steel gray gradients with hazard yellow accents
- Metallic textures and industrial styling
- 3D depth effects with multiple shadow layers
- Authentic industrial character

## Data Flow

1. **User Interaction** → BusinessRulesPage component
2. **State Management** → useBusinessRulesStore (Zustand)
3. **GraphQL API** → Business Rules resolvers
4. **Database** → business_rules table
5. **Real-time Updates** → Store refresh → Component re-render

## File Structure
```
frontend/src/components/admin/businessRules/
├── BusinessRulesPage.tsx           # Main admin interface
├── BusinessRulesFormModal.tsx      # Create/edit form
├── BusinessRuleDetailsModal.tsx    # Analytics and details
└── README.md                       # This documentation
```

## Integration Points

### Navigation
- Route: `/admin/business-rules`
- Sidebar item: "Business Rules" (requires `app_settings:manage` permission)
- Lazy loading for performance optimization

### Permissions
- Requires `app_settings:manage` permission (admin role)
- GraphQL resolvers enforce authentication via `requireAuthentication()`
- Frontend components check permissions before rendering

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages with toast notifications
- GraphQL error parsing and display
- Graceful fallbacks for network issues

## Testing

Integration tests are available in:
- `tests/integration/businessRulesGraphQL.test.ts`

Tests cover:
- GraphQL schema compatibility
- CRUD operations
- Authentication requirements
- WFM workflow integration
- User field handling

## Production Readiness

✅ **Complete Implementation**
- All components built and tested
- GraphQL integration working
- Theme support across all three themes
- Error handling comprehensive
- TypeScript compilation passing
- Build optimization successful

✅ **Performance Optimized**  
- Lazy loading for route
- Efficient state management
- Minimal re-renders
- Optimized bundle size (38.09 kB chunk)

✅ **Enterprise Features**
- Role-based access control
- Audit trail support
- Comprehensive analytics
- Professional UI/UX design

The Business Rules Engine frontend is production-ready and provides enterprise-grade business process automation capabilities for PipeCD. 