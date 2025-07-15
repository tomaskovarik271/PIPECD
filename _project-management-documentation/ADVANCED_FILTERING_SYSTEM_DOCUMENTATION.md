# PipeCD Advanced Filtering System Documentation

## Overview

PipeCD's Advanced Filtering System provides sophisticated filtering capabilities for deals, leads, and other entities. The system supports complex multi-criteria filters with proper GraphQL integration, database compatibility, and saved filter functionality.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Filter Types and Operators](#filter-types-and-operators)
4. [Saved Filters](#saved-filters)
5. [Technical Implementation](#technical-implementation)
6. [GraphQL Integration](#graphql-integration)
7. [Database Compatibility](#database-compatibility)
8. [Usage Examples](#usage-examples)
9. [Developer Guide](#developer-guide)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The filtering system follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                Frontend Layer                           │
├─────────────────────────────────────────────────────────┤
│ • AdvancedFilterBuilder.tsx                            │
│ • FilterValueInput.tsx                                 │
│ • useSavedFiltersStore.ts                             │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                GraphQL Layer                           │
├─────────────────────────────────────────────────────────┤
│ • DealFiltersInput schema                              │
│ • DealSortInput schema                                 │
│ • dealsFiltered query                                  │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│               Service Layer                            │
├─────────────────────────────────────────────────────────┤
│ • dealService.getDealsFiltered()                       │
│ • GraphQL enum to DB column mapping                   │
│ • Filter application logic                            │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│               Database Layer                           │
├─────────────────────────────────────────────────────────┤
│ • Supabase queries with proper column names           │
│ • Optimized filtering and sorting                     │
│ • RLS policies and permissions                        │
└─────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. AdvancedFilterBuilder Component

**Location:** `frontend/src/components/common/AdvancedFilterBuilder.tsx`

**Purpose:** Main component for building complex filters with visual criteria builder.

**Key Features:**
- Dynamic filter criteria creation
- Field-specific value inputs
- Operator selection
- Real-time filter conversion
- Saved filter management

**Props:**
```typescript
interface AdvancedFilterBuilderProps {
  onFiltersChange: (filters: DealFilters) => void;
  initialFilters?: DealFilters;
  availableFields: FilterField[];
  onSaveFilter?: (filter: SavedFilter) => void;
  savedFilters?: SavedFilter[];
}
```

### 2. FilterValueInput Component

**Location:** `frontend/src/components/common/FilterValueInput.tsx`

**Purpose:** Dynamic input component that renders appropriate controls based on field type.

**Supported Input Types:**
- Text inputs with autocomplete
- Number inputs with currency support
- Date pickers with range selection
- Dropdown selects with search
- Organization/Person selectors
- Multi-select options

### 3. Saved Filters Store

**Location:** `frontend/src/stores/useSavedFiltersStore.ts`

**Purpose:** Zustand store for managing saved filters with localStorage persistence.

**Key Methods:**
```typescript
interface SavedFiltersStore {
  savedFilters: SavedFilter[];
  addSavedFilter: (filter: SavedFilter) => void;
  removeSavedFilter: (id: string) => void;
  updateSavedFilter: (id: string, updates: Partial<SavedFilter>) => void;
  clearAllSavedFilters: () => void;
}
```

---

## Filter Types and Operators

### Available Field Types

#### 1. Text Fields
- **Fields:** Deal name, notes, descriptions
- **Operators:** EQUALS, NOT_EQUALS, CONTAINS, STARTS_WITH, ENDS_WITH
- **Example:** `name CONTAINS "ORVIL"`

#### 2. Numeric Fields
- **Fields:** Amount, probability, exchange rates
- **Operators:** EQUALS, GREATER_THAN, LESS_THAN, GREATER_EQUAL, LESS_EQUAL, BETWEEN
- **Example:** `amount GREATER_THAN 150000`

#### 3. Date Fields
- **Fields:** Expected close date, created date, updated date
- **Operators:** EQUALS, GREATER_THAN, LESS_THAN, BETWEEN
- **Example:** `expected_close_date BETWEEN "2024-01-01" AND "2024-12-31"`

#### 4. Relationship Fields
- **Fields:** Organization, Person, Assigned User
- **Operators:** EQUALS, IN, NOT_IN
- **Example:** `organization_id IN ["uuid-1", "uuid-2"]`

#### 5. Status Fields
- **Fields:** WFM Status, Pipeline Stage
- **Operators:** EQUALS, IN, NOT_IN
- **Example:** `wfm_status_id EQUALS "active-status-uuid"`

### Filter Operators

```typescript
enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS_EQUAL = 'LESS_EQUAL',
  BETWEEN = 'BETWEEN',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL',
  IN = 'IN',
  NOT_IN = 'NOT_IN'
}
```

---

## Saved Filters

### Filter Structure

```typescript
interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: DealFilters;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Example Saved Filters

```typescript
// High-value European deals
{
  id: "high-value-eu",
  name: "High-Value EU Deals",
  description: "Deals over €100k in European currencies",
  filters: {
    amountMin: 100000,
    currency: "EUR",
    organizationIds: ["eu-org-1", "eu-org-2"]
  }
}

// Closing this month
{
  id: "closing-soon", 
  name: "Closing This Month",
  description: "Deals expected to close this month",
  filters: {
    closingThisMonth: true,
    overdue: false
  }
}
```

### Persistence

Saved filters are automatically persisted to localStorage with the key `pipecd-saved-filters` and synchronized across browser sessions.

---

## Technical Implementation

### GraphQL Schema

#### DealFiltersInput

```graphql
input DealFiltersInput {
  # Basic search
  search: String
  
  # Amount filtering
  amountMin: Float
  amountMax: Float
  currency: String
  
  # Date filtering
  expectedCloseDateFrom: DateTime
  expectedCloseDateTo: DateTime
  createdDateFrom: DateTime
  createdDateTo: DateTime
  
  # Relationship filtering
  organizationIds: [ID!]
  personIds: [ID!]
  assignedToUserIds: [ID!]
  unassigned: Boolean
  
  # WFM/Pipeline filtering
  wfmWorkflowIds: [ID!]
  wfmStepIds: [ID!]
  wfmStatusIds: [ID!]
  wfmProjectTypeIds: [ID!]
  
  # Quick filters
  createdToday: Boolean
  createdThisWeek: Boolean
  createdThisMonth: Boolean
  closingToday: Boolean
  closingThisWeek: Boolean
  closingThisMonth: Boolean
  overdue: Boolean
  
  # Advanced filters
  hasActivities: Boolean
  hasCustomFields: Boolean
  hasPerson: Boolean
  hasOrganization: Boolean
  
  # Custom field filtering
  customFieldFilters: [CustomFieldFilterInput!]
  
  # Label filtering
  labelTexts: [String!]
  labelFilterLogic: LabelFilterLogic
}
```

#### DealSortInput

```graphql
input DealSortInput {
  field: DealSortField!
  direction: SortDirection!
}

enum DealSortField {
  NAME
  AMOUNT
  AMOUNT_USD
  EXPECTED_CLOSE_DATE
  CREATED_AT
  UPDATED_AT
  DEAL_SPECIFIC_PROBABILITY
  WEIGHTED_AMOUNT
  PROJECT_ID
}

enum SortDirection {
  ASC
  DESC
}
```

### Service Layer Implementation

#### GraphQL Enum to Database Column Mapping

```typescript
const SORT_FIELD_MAPPING: Record<string, string> = {
  'NAME': 'name',
  'AMOUNT': 'amount',
  'AMOUNT_USD': 'amount_usd',
  'EXPECTED_CLOSE_DATE': 'expected_close_date',
  'CREATED_AT': 'created_at',
  'UPDATED_AT': 'updated_at',
  'DEAL_SPECIFIC_PROBABILITY': 'deal_specific_probability',
  'WEIGHTED_AMOUNT': 'weighted_amount',
  'PROJECT_ID': 'project_id'
};
```

#### Filter Application Logic

```typescript
function applyDealFilters(query: any, filters: DealFilters) {
  // Amount filters
  if (filters.amountMin !== undefined) {
    query = query.gte('amount', filters.amountMin);
  }
  if (filters.amountMax !== undefined) {
    query = query.lte('amount', filters.amountMax);
  }
  
  // Date filters
  if (filters.expectedCloseDateFrom) {
    query = query.gte('expected_close_date', filters.expectedCloseDateFrom);
  }
  if (filters.expectedCloseDateTo) {
    query = query.lte('expected_close_date', filters.expectedCloseDateTo);
  }
  
  // Relationship filters
  if (filters.organizationIds && filters.organizationIds.length > 0) {
    query = query.in('organization_id', filters.organizationIds);
  }
  
  // Continue for other filter types...
  return query;
}
```

---

## GraphQL Integration

### Query Example

```graphql
query GetDealsFiltered(
  $filters: DealFiltersInput
  $sort: DealSortInput
  $first: Int
  $after: String
) {
  dealsFiltered(
    filters: $filters
    sort: $sort
    first: $first
    after: $after
  ) {
    nodes {
      id
      name
      amount
      currency
      expected_close_date
      organization {
        id
        name
      }
      assignedToUser {
        id
        display_name
        email
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Variables Example

```typescript
{
  "filters": {
    "organizationIds": ["6d19962b-0719-4288-8fc9-b0cecab42f58"],
    "amountMin": 170000,
    "currency": "EUR"
  },
  "sort": {
    "field": "EXPECTED_CLOSE_DATE",
    "direction": "ASC"
  },
  "first": 50
}
```

---

## Database Compatibility

### Key Compatibility Features

1. **Enum Mapping:** GraphQL enum values are properly mapped to database column names
2. **Relationship Handling:** Complex relationships resolved via GraphQL resolvers, not database joins
3. **Performance Optimization:** Efficient Supabase queries with proper indexing
4. **Schema Validation:** All queries validated against actual database schema

### Database Schema Alignment

```sql
-- Example of proper column usage
SELECT 
  id, name, amount, currency, 
  expected_close_date,  -- NOT EXPECTED_CLOSE_DATE
  created_at,           -- NOT CREATED_AT
  organization_id
FROM deals 
WHERE amount >= 170000 
  AND organization_id IN ('uuid-1', 'uuid-2')
ORDER BY expected_close_date ASC;
```

---

## Usage Examples

### Basic Text Search

```typescript
const filters: DealFilters = {
  search: "ORVIL"
};
```

### Amount Range Filter

```typescript
const filters: DealFilters = {
  amountMin: 50000,
  amountMax: 500000,
  currency: "EUR"
};
```

### Organization-Specific Filter

```typescript
const filters: DealFilters = {
  organizationIds: ["org-uuid-1", "org-uuid-2"],
  amountMin: 100000
};
```

### Date Range Filter

```typescript
const filters: DealFilters = {
  expectedCloseDateFrom: "2024-01-01",
  expectedCloseDateTo: "2024-12-31"
};
```

### Complex Multi-Criteria Filter

```typescript
const filters: DealFilters = {
  organizationIds: ["6d19962b-0719-4288-8fc9-b0cecab42f58"],
  amountMin: 170000,
  currency: "EUR",
  assignedToUserIds: ["user-uuid-1"],
  hasActivities: true,
  closingThisMonth: true
};
```

### Quick Filters

```typescript
// Deals closing today
const todayFilters: DealFilters = {
  closingToday: true
};

// Overdue deals
const overdueFilters: DealFilters = {
  overdue: true
};

// High-value deals
const highValueFilters: DealFilters = {
  amountMin: 100000,
  currency: "EUR"
};
```

---

## Developer Guide

### Adding New Filter Fields

1. **Add to GraphQL Schema** (`deal.graphql`):
```graphql
input DealFiltersInput {
  # ... existing fields
  newField: String
}
```

2. **Update TypeScript Interface** (`types/filters.ts`):
```typescript
export interface DealFilters {
  // ... existing fields
  newField?: string;
}
```

3. **Add Filter Logic** (`dealService/dealCrud.ts`):
```typescript
function applyDealFilters(query: any, filters: DealFilters) {
  // ... existing filters
  if (filters.newField) {
    query = query.eq('new_field_column', filters.newField);
  }
  return query;
}
```

4. **Add Field Definition** (`utils/filterFields.ts`):
```typescript
export const DEAL_FILTER_FIELDS: FilterField[] = [
  // ... existing fields
  {
    id: 'new_field',
    label: 'New Field',
    type: 'text',
    operators: ['EQUALS', 'CONTAINS']
  }
];
```

### Testing Filters

```typescript
// Test filter conversion
const criteria: FilterCriteria[] = [
  {
    id: 'test-1',
    field: { id: 'amount', label: 'Amount', type: 'number' },
    operator: 'GREATER_THAN',
    value: { amount: 100000, currency: 'EUR' }
  }
];

const filters = convertCriteriaToFilters(criteria);
expect(filters.amountMin).toBe(100000);
expect(filters.currency).toBe('EUR');
```

---

## Troubleshooting

### Common Issues

#### 1. "Column does not exist" Error

**Problem:** GraphQL enum values being used as database column names
**Solution:** Ensure proper enum-to-column mapping in service layer

```typescript
// ❌ Wrong - using GraphQL enum directly
query.order('EXPECTED_CLOSE_DATE', { ascending: true })

// ✅ Correct - using mapped database column
const dbColumn = SORT_FIELD_MAPPING['EXPECTED_CLOSE_DATE']; // 'expected_close_date'
query.order(dbColumn, { ascending: true })
```

#### 2. "Relationship not found" Error

**Problem:** Trying to use non-existent foreign key relationships
**Solution:** Use GraphQL resolvers for complex relationships

```typescript
// ❌ Wrong - complex database join
assignedToUser:user_profiles!deals_assigned_to_user_id_fkey(user_id, display_name)

// ✅ Correct - simple field selection, resolve via GraphQL
assigned_to_user_id
// Then resolve in GraphQL resolver using getServiceLevelUserProfileData()
```

#### 3. Filter Not Applying

**Problem:** Filter criteria not being converted properly
**Solution:** Check filter conversion logic and field mappings

```typescript
// Debug filter conversion
console.log('Input criteria:', criteria);
const filters = convertCriteriaToFilters(criteria);
console.log('Converted filters:', filters);
```

#### 4. Saved Filters Not Persisting

**Problem:** localStorage not saving properly
**Solution:** Check browser localStorage and store initialization

```typescript
// Check localStorage
const saved = localStorage.getItem('pipecd-saved-filters');
console.log('Saved filters:', JSON.parse(saved || '[]'));
```

### Performance Optimization

1. **Use Proper Indexing:** Ensure database columns used in filters are properly indexed
2. **Limit Result Sets:** Always use pagination with reasonable limits
3. **Optimize Queries:** Avoid N+1 queries in GraphQL resolvers
4. **Cache Frequently Used Filters:** Consider caching popular saved filters

### Security Considerations

1. **RLS Policies:** All filtering respects Row Level Security policies
2. **Permission Checks:** Users can only filter data they have access to
3. **Input Validation:** All filter inputs are validated on both client and server
4. **SQL Injection Prevention:** All queries use parameterized statements

---

## Conclusion

PipeCD's Advanced Filtering System provides a robust, scalable solution for complex data filtering with proper GraphQL integration and database compatibility. The system is designed for extensibility, performance, and maintainability while providing an excellent user experience.

For questions or contributions, please refer to the development team or create an issue in the project repository. 