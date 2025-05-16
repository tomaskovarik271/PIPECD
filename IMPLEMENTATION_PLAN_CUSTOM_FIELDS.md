# Implementation Plan: Custom Fields

**Feature Goal:** To allow users to define, manage, and utilize custom fields for various entities within the application (e.g., Deals, People, Organizations). This will provide flexibility to capture specific data points relevant to their business processes beyond the standard fields.

**Core Idea:**
*   **Custom Field Definitions:** A dedicated table (`custom_field_definitions`) will store the schema for each custom field (name, label, type, associated entity, validation rules, options for dropdowns, etc.).
*   **Custom Field Values:** A JSONB column (e.g., `custom_field_values`) will be added to each entity table that supports custom fields. This column will store a JSON object where keys are definition IDs (not field names) and values are the actual data entered by the user for that entity instance.

**Key Design Decisions:**
* **JSONB Keys:** We will use `definition_id` (UUID) as keys in the JSONB object rather than `field_name` to avoid data integrity issues if field names change.
* **Deletion Protection:** We will implement safeguards against deleting custom field definitions that are in use.
* **Validation:** Both frontend and backend will implement strict validation based on field types and rules.

---

## Phase 1: Backend Foundation & Database Changes

### 0: Mental Validation & Dry Run
*   **Action:** Before writing code or running migrations, perform a step-by-step mental walkthrough of all planned changes in this phase. Validate assumptions, simulate the process, and update the plan if any new risks or questions arise.

### 1.1: Database Migrations

*   **Action 1.1.1:** Create `custom_field_definitions` table.
    *   **Migration:** `supabase migrations new create_custom_field_definitions_table`
    *   **SQL Definition:**
        ```sql
        CREATE TYPE custom_field_type AS ENUM (
            'TEXT',
            'NUMBER',
            'DATE',
            'BOOLEAN',
            'DROPDOWN',
            'MULTI_SELECT'
        );

        CREATE TYPE entity_type AS ENUM (
            'DEAL',
            'PERSON',
            'ORGANIZATION'
            -- Add more as needed
        );

        CREATE TABLE public.custom_field_definitions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            entity_type entity_type NOT NULL,
            field_name TEXT NOT NULL, -- Internal name, unique per entity_type
            field_label TEXT NOT NULL, -- Display name for UI
            field_type custom_field_type NOT NULL,
            is_required BOOLEAN DEFAULT FALSE,
            dropdown_options JSONB NULL, -- For 'DROPDOWN' or 'MULTI_SELECT' types
            is_active BOOLEAN DEFAULT TRUE, -- For soft deletion
            display_order INT DEFAULT 0, -- For ordering fields in UI
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            CONSTRAINT unique_field_name_per_entity UNIQUE (entity_type, field_name)
        );

        COMMENT ON TABLE public.custom_field_definitions IS 'Stores definitions for user-created custom fields.';
        COMMENT ON COLUMN public.custom_field_definitions.dropdown_options IS 'Stores options for dropdown or multi-select field types as [{"value": "opt1", "label": "Option 1"}]';
        COMMENT ON COLUMN public.custom_field_definitions.is_active IS 'When false, the field is hidden but not deleted to preserve data integrity';

        -- Indexes
        CREATE INDEX idx_custom_field_definitions_entity_type ON public.custom_field_definitions(entity_type);
        CREATE INDEX idx_custom_field_definitions_active ON public.custom_field_definitions(is_active);

        -- RLS
        ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;

        -- Read policy - all authenticated users can read definitions
        CREATE POLICY "Allow authenticated users to read custom field definitions"
        ON public.custom_field_definitions
        FOR SELECT
        USING (auth.role() = 'authenticated');
        
        -- Write policies - only admins can manage definitions
        -- Note: Replace with actual admin role check based on your permission system
        CREATE POLICY "Allow admins to insert custom field definitions"
        ON public.custom_field_definitions
        FOR INSERT
        WITH CHECK (auth.role() = 'authenticated'); -- Replace with admin check
        
        CREATE POLICY "Allow admins to update custom field definitions"
        ON public.custom_field_definitions
        FOR UPDATE
        USING (auth.role() = 'authenticated') -- Replace with admin check
        WITH CHECK (auth.role() = 'authenticated'); -- Replace with admin check
        
        -- No DELETE policy - use soft deletion via is_active instead
        ```
    *   **Status:** Not Started
*   **Action 1.1.2:** Add JSONB column to entity tables.
    *   For each entity (e.g., `deals`, `people`, `organizations`) that will support custom fields:
        *   **Migration:** `supabase migrations new add_custom_fields_to_deals_table` (and similarly for other tables)
        *   **SQL Alteration (example for `deals`):**
            ```sql
            ALTER TABLE public.deals
            ADD COLUMN custom_field_values JSONB DEFAULT '{}' NOT NULL;

            COMMENT ON COLUMN public.deals.custom_field_values IS 'Stores key-value pairs of custom field data, where key is custom_field_definition_id and value is the user-provided data.';
            
            -- Add index for potential future queries on JSONB data
            CREATE INDEX idx_deals_custom_field_values ON public.deals USING GIN (custom_field_values);
            ```
    *   **Status:** Not Started
*   **Action 1.1.3:** Apply migrations with careful verification.
    *   **Verification Steps:**
        1. Review migration files for completeness and accuracy
        2. Run `supabase db reset` in development environment
        3. Manually verify table structure with `\d custom_field_definitions` in psql
        4. Test RLS policies with different user roles
    *   **Status:** Not Started

### 1.1R: Risk Mitigation for Database Changes

* **Migration Verification:** Create a checklist to verify migration files before applying them:
  * Ensure files are not empty
  * Verify SQL syntax with a linter
  * Check that all required fields, constraints, and indexes are defined
  * Verify RLS policies are complete (SELECT, INSERT, UPDATE as needed)

* **Rollback Plan:** Create a rollback migration for each migration file:
  ```sql
  -- Example rollback for custom_field_definitions
  DROP TABLE IF EXISTS public.custom_field_definitions;
  DROP TYPE IF EXISTS custom_field_type;
  DROP TYPE IF EXISTS entity_type;
  
  -- Example rollback for entity table changes
  ALTER TABLE public.deals DROP COLUMN IF EXISTS custom_field_values;
  ```

* **Soft Deletion:** Use `is_active` flag instead of hard deletion to preserve data integrity when a field definition is "deleted".

### 1.2: GraphQL Schema Updates

*   **Action 1.2.1:** Create `customFields.graphql` (or similar).
    ```graphql
    # netlify/functions/graphql/schema/customFields.graphql

    enum CustomFieldType {
      TEXT
      NUMBER
      DATE
      BOOLEAN
      DROPDOWN
      MULTI_SELECT
    }

    enum CustomFieldEntityType {
      DEAL
      PERSON
      ORGANIZATION
    }

    type CustomFieldOption {
      value: String!
      label: String!
    }

    type CustomFieldDefinition {
      id: ID!
      entityType: CustomFieldEntityType!
      fieldName: String!
      fieldLabel: String!
      fieldType: CustomFieldType!
      isRequired: Boolean!
      dropdownOptions: [CustomFieldOption!]
      isActive: Boolean!
      displayOrder: Int!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    # Input for creating/updating definitions
    input CustomFieldDefinitionInput {
      entityType: CustomFieldEntityType!
      fieldName: String!
      fieldLabel: String!
      fieldType: CustomFieldType!
      isRequired: Boolean
      dropdownOptions: [CustomFieldOptionInput!]
      displayOrder: Int
    }

    input CustomFieldOptionInput {
      value: String!
      label: String!
    }

    # How custom field values are represented when fetched with an entity
    type CustomFieldValue {
      definitionId: ID!
      definition: CustomFieldDefinition
      # Type-specific value fields - only one will be non-null based on the field type
      stringValue: String
      numberValue: Float
      booleanValue: Boolean
      dateValue: DateTime
      selectedOptionValues: [String!]
    }

    # Input for setting custom field values
    input CustomFieldValueInput {
      definitionId: ID!
      stringValue: String
      numberValue: Float
      booleanValue: Boolean
      dateValue: DateTime
      selectedOptionValues: [String!]
    }

    extend type Query {
      customFieldDefinitions(entityType: CustomFieldEntityType!, includeInactive: Boolean): [CustomFieldDefinition!]!
      customFieldDefinition(id: ID!): CustomFieldDefinition
    }

    extend type Mutation {
      createCustomFieldDefinition(input: CustomFieldDefinitionInput!): CustomFieldDefinition!
      updateCustomFieldDefinition(id: ID!, input: CustomFieldDefinitionInput!): CustomFieldDefinition!
      deactivateCustomFieldDefinition(id: ID!): Boolean! # Soft delete - returns true if successful
      reactivateCustomFieldDefinition(id: ID!): Boolean! # Un-delete - returns true if successful
    }
    ```
    *   **Status:** Not Started
*   **Action 1.2.2:** Extend entity GraphQL types to expose their custom field values.
    ```graphql
    # In netlify/functions/graphql/schema/deal.graphql (and person.graphql, etc.)
    extend type Deal {
      # ... existing fields
      customFieldValues: [CustomFieldValue!]!
    }

    # In input types
    input DealInput {
      # ... existing fields
      customFields: [CustomFieldValueInput!]
    }

    input DealUpdateInput {
      # ... existing fields
      customFields: [CustomFieldValueInput!]
    }
    ```
    *   **Status:** Not Started
*   **Action 1.2.3:** Add scalar definitions to ensure they're properly recognized.
    ```graphql
    # In netlify/functions/graphql/schema/scalars.graphql (create if not exists)
    scalar DateTime
    scalar JSON
    ```
    *   **Status:** Not Started

### 1.2R: Risk Mitigation for GraphQL Schema

* **Scalar Verification:** Ensure all required scalars (`DateTime`, `JSON`) are properly defined and mapped in `codegen.ts`.
* **Type Safety:** Use explicit nullable/non-nullable annotations (`!`) consistently.
* **Schema Validation:** After creating schema files, run a validation step before codegen:
  ```bash
  # Add a script to package.json
  "validate-schema": "graphql-schema-linter netlify/functions/graphql/schema/*.graphql"
  ```

### 1.3: Implement GraphQL Resolvers

*   **Action 1.3.1:** Create `netlify/functions/graphql/resolvers/customFields.ts`.
    *   Implement resolvers for `Query.customFieldDefinitions`, `Query.customFieldDefinition`.
    *   Implement resolvers for `Mutation.createCustomFieldDefinition`, `Mutation.updateCustomFieldDefinition`, `Mutation.deactivateCustomFieldDefinition`.
    *   **Status:** Not Started
*   **Action 1.3.2:** Update entity resolvers (e.g., `deal.ts`).
    *   Implement `Deal.customFieldValues` resolver with proper error handling.
    *   **Status:** Not Started
*   **Action 1.3.3:** Add new resolvers to `netlify/functions/graphql.ts`.
    *   **Status:** Not Started

### 1.3R: Risk Mitigation for GraphQL Resolvers

* **Error Handling:** Add robust error handling in all resolvers, especially when parsing JSONB data:
  ```typescript
  // Example error handling in Deal.customFieldValues resolver
  customFieldValues: async (parent, _args, context) => {
    try {
      requireAuthentication(context);
      const { supabase } = getAuthenticatedClient(context);
      
      // Safe access to JSONB - handle null/undefined cases
      const customFieldValues = parent.custom_field_values || {};
      
      // Get all definitions for this entity to properly type values
      const { data: definitions } = await supabase
        .from('custom_field_definitions')
        .select('*')
        .eq('entity_type', 'DEAL')
        .order('display_order', { ascending: true });
      
      // Transform JSONB to GraphQL type with proper typing
      return Object.entries(customFieldValues).map(([definitionId, value]) => {
        const definition = definitions?.find(d => d.id === definitionId);
        if (!definition) {
          console.warn(`Definition ${definitionId} not found for deal ${parent.id}`);
          return null;
        }
        
        // Type-specific value mapping
        const result: any = { definitionId };
        switch (definition.field_type) {
          case 'TEXT':
            result.stringValue = value as string;
            break;
          case 'NUMBER':
            result.numberValue = value as number;
            break;
          // ... other types
        }
        
        return result;
      }).filter(Boolean); // Remove null entries for missing definitions
    } catch (error) {
      console.error('Error resolving customFieldValues:', error);
      return []; // Return empty array rather than null to avoid breaking UI
    }
  }
  ```

* **Authorization Checks:** Ensure all mutation resolvers verify appropriate permissions.

### 1.4: Update Service Layer (e.g., `dealService.ts`)

*   **Action 1.4.1:** Create a dedicated `customFieldService.ts` for common operations.
    ```typescript
    // Example structure for customFieldService.ts
    export class CustomFieldService {
      // Fetch definitions for a specific entity type
      async getDefinitionsForEntity(supabase, entityType, includeInactive = false) { /* ... */ }
      
      // Validate a single field value against its definition
      validateFieldValue(definition, value) { /* ... */ }
      
      // Validate an entire set of custom field values for an entity
      async validateCustomFields(supabase, entityType, customFields) { /* ... */ }
      
      // Transform input format to storage format
      transformCustomFieldsForStorage(customFieldInputs) { /* ... */ }
      
      // Check if a definition can be safely deactivated
      async canDeactivateDefinition(supabase, definitionId) { /* ... */ }
    }
    ```
    *   **Status:** Not Started
*   **Action 1.4.2:** Modify entity services to handle custom fields.
    *   Update `createDeal`, `updateDeal` to validate and store custom field values.
    *   **Status:** Not Started

### 1.4R: Risk Mitigation for Service Layer

* **Validation Strategy:** Implement a comprehensive validation function that:
  * Checks required fields are provided
  * Verifies data types match field types
  * Validates dropdown options exist in the definition
  * Handles empty/null values appropriately
  
* **Usage Tracking:** Before deactivating a field definition, check if it's in use:
  ```typescript
  async function isDefinitionInUse(supabase, definitionId, entityType) {
    // Example for deals - repeat for each entity type
    if (entityType === 'DEAL') {
      const { count } = await supabase.rpc('count_deals_with_custom_field', { 
        definition_id: definitionId 
      });
      if (count > 0) return true;
    }
    // ... check other entity types
    return false;
  }
  ```

* **Transaction Support:** Use transactions for operations that update multiple tables:
  ```typescript
  // Example transaction for updating a deal with custom fields
  const { data, error } = await supabase.rpc('update_deal_with_custom_fields', {
    p_deal_id: dealId,
    p_deal_data: dealUpdateData,
    p_custom_fields: customFieldsJson
  });
  ```

### 1.5: Regenerate GraphQL Types

*   **Action:** Run `npm run codegen` with verification steps.
    *   **Verification:**
        1. Check for errors in codegen output
        2. Verify all types are generated correctly
        3. Test with a simple query to ensure types work
    *   **Status:** Not Started

### 1.5R: Risk Mitigation for GraphQL Types

* **Pre-codegen Check:** Add a script that validates all schema files before running codegen:
  ```bash
  # Add to package.json scripts
  "precodegen": "node scripts/validate-schema.js && echo 'Schema validation passed!'"
  ```

* **Type Testing:** Create a simple test file that imports and uses the generated types to catch any issues:
  ```typescript
  // tests/types.test.ts
  import { CustomFieldType, CustomFieldEntityType } from '../lib/generated/graphql';
  
  describe('GraphQL Types', () => {
    it('should have correct enum values', () => {
      expect(CustomFieldType.TEXT).toBe('TEXT');
      expect(CustomFieldEntityType.DEAL).toBe('DEAL');
    });
  });
  ```

---

## Phase 2: Frontend - Custom Field Definition Management UI

### 0: Mental Validation & Dry Run
*   **Action:** Before implementing UI or store changes, mentally simulate the user/admin experience, data flows, and error cases. Adjust the plan as needed based on findings.

### 2.1: Create Admin Section/Pages for Custom Fields

*   **Action:** Develop UI components for managing custom field definitions.
    *   **Components:**
        *   `CustomFieldDefinitionListPage.tsx`: List and filter definitions
        *   `CustomFieldDefinitionForm.tsx`: Create/edit form with validation
        *   `CustomFieldOptionEditor.tsx`: Sub-component for managing dropdown options
    *   **Status:** Not Started

### 2.1R: Risk Mitigation for Admin UI

* **Field Name Generation:** Auto-generate `field_name` from `field_label` with validation:
  ```typescript
  // Helper function to generate safe field names
  function generateFieldName(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_') // Replace non-alphanumeric with underscore
      .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
      .replace(/^_|_$/g, '')       // Remove leading/trailing underscores
      .substring(0, 63);           // Enforce max length
  }
  ```

* **Unique Name Validation:** Check field name uniqueness before saving:
  ```typescript
  // In form submit handler
  const checkUniqueName = async () => {
    const { data } = await supabase
      .from('custom_field_definitions')
      .select('id')
      .eq('entity_type', formValues.entityType)
      .eq('field_name', formValues.fieldName)
      .neq('id', formValues.id || ''); // Exclude current record when editing
      
    return data?.length === 0;
  };
  ```

* **Option Value Uniqueness:** Ensure dropdown option values are unique:
  ```typescript
  // Validation function for options
  function validateOptions(options: Array<{value: string, label: string}>): string | null {
    const values = new Set();
    for (const option of options) {
      if (values.has(option.value)) {
        return `Duplicate option value: ${option.value}`;
      }
      values.add(option.value);
    }
    return null;
  }
  ```

### 2.2: Update Zustand Store

*   **Action:** Create a new `useCustomFieldsStore.ts` for definition management.
    *   **State & Actions:**
        *   `definitions`, `isLoading`, `error` state
        *   CRUD actions for definitions
        *   Utility functions for field validation
    *   **Status:** Not Started

### 2.2R: Risk Mitigation for State Management

* **Cache Invalidation:** Ensure store is updated when definitions change:
  ```typescript
  // After creating/updating/deactivating a definition
  invalidateDefinitionsCache: (entityType: string) => {
    set(state => ({
      ...state,
      definitionsByEntityType: {
        ...state.definitionsByEntityType,
        [entityType]: undefined // Force refetch
      }
    }));
  }
  ```

* **Error Handling:** Comprehensive error handling in all API calls:
  ```typescript
  fetchDefinitions: async (entityType) => {
    set({ isLoading: true, error: null });
    try {
      const result = await client.query({
        query: GET_CUSTOM_FIELD_DEFINITIONS,
        variables: { entityType }
      });
      set({ 
        definitions: result.data.customFieldDefinitions,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching definitions:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  }
  ```

---

## Phase 3: Frontend - Using Custom Fields in Entity Forms & Displays

### 0: Mental Validation & Dry Run
*   **Action:** Before integrating custom fields into forms and displays, mentally walk through the user journey, edge cases, and data transformations. Update the plan if any new issues are identified.

### 3.1: Dynamically Render Custom Fields in Entity Forms

*   **Action:** Create reusable components for custom field inputs.
    *   **Components:**
        *   `DynamicCustomFieldInput.tsx`: Renders appropriate input based on field type
        *   `CustomFieldsSection.tsx`: Container for all custom fields in a form
    *   **Status:** Not Started

### 3.1R: Risk Mitigation for Dynamic Forms

* **Type Safety:** Ensure each field type has proper validation and type handling:
  ```typescript
  // Example validation by field type
  const validateByType = (value: any, definition: CustomFieldDefinition): string | null => {
    if (definition.isRequired && (value === null || value === undefined || value === '')) {
      return `${definition.fieldLabel} is required`;
    }
    
    switch (definition.fieldType) {
      case 'NUMBER':
        if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
          return `${definition.fieldLabel} must be a number`;
        }
        break;
      case 'DATE':
        if (value !== null && value !== undefined && value !== '' && isNaN(Date.parse(value))) {
          return `${definition.fieldLabel} must be a valid date`;
        }
        break;
      case 'DROPDOWN':
        if (value !== null && value !== undefined && value !== '') {
          const validOptions = (definition.dropdownOptions || []).map(opt => opt.value);
          if (!validOptions.includes(value)) {
            return `${definition.fieldLabel} has an invalid option selected`;
          }
        }
        break;
      // ... other types
    }
    
    return null;
  };
  ```

* **Error Boundaries:** Wrap dynamic field components in error boundaries:
  ```tsx
  class CustomFieldErrorBoundary extends React.Component {
    state = { hasError: false };
    
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    
    render() {
      if (this.state.hasError) {
        return <FormControl isInvalid>
          <FormErrorMessage>Error rendering this field</FormErrorMessage>
        </FormControl>;
      }
      
      return this.props.children;
    }
  }
  
  // Usage
  <CustomFieldErrorBoundary>
    <DynamicCustomFieldInput definition={definition} />
  </CustomFieldErrorBoundary>
  ```

### 3.2: Display Custom Field Values on Entity Detail Pages

*   **Action:** Create components for displaying custom field values.
    *   **Components:**
        *   `CustomFieldValueDisplay.tsx`: Formats and displays a single field value
        *   `CustomFieldsPanel.tsx`: Container for all custom fields on detail page
    *   **Status:** Not Started

### 3.2R: Risk Mitigation for Value Display

* **Missing Definition Handling:** Gracefully handle missing definitions:
  ```tsx
  const CustomFieldValueDisplay = ({ value, definitions }) => {
    const definition = definitions.find(d => d.id === value.definitionId);
    
    if (!definition) {
      return <Text color="gray.500" fontSize="sm">Unknown field ({value.definitionId.substring(0, 8)})</Text>;
    }
    
    // Normal rendering based on definition.fieldType
    // ...
  };
  ```

* **Type-Specific Formatting:** Format values appropriately by field type:
  ```tsx
  const formatValue = (value: CustomFieldValue, definition: CustomFieldDefinition) => {
    switch (definition.fieldType) {
      case 'DATE':
        return value.dateValue ? format(new Date(value.dateValue), 'PP') : '';
      case 'DROPDOWN':
        const option = definition.dropdownOptions?.find(o => o.value === value.stringValue);
        return option?.label || value.stringValue || '';
      case 'MULTI_SELECT':
        return value.selectedOptionValues?.map(v => {
          const option = definition.dropdownOptions?.find(o => o.value === v);
          return option?.label || v;
        }).join(', ') || '';
      // ... other types
    }
  };
  ```

### 3.3: Update Entity-Specific Zustand Stores

*   **Action:** Enhance entity stores to handle custom field operations.
    *   **Status:** Not Started

### 3.3R: Risk Mitigation for Entity Stores

* **Form State Management:** Properly initialize and update form state with custom fields:
  ```typescript
  // Initialize form with custom fields
  const initializeForm = (deal) => {
    const formValues = { ...deal };
    
    // Transform custom field values to form format
    formValues.customFields = deal.customFieldValues?.map(field => ({
      definitionId: field.definitionId,
      value: getValueForFieldType(field)
    })) || [];
    
    return formValues;
  };
  
  // Helper to extract the right value based on field type
  const getValueForFieldType = (field) => {
    if (field.stringValue !== undefined) return field.stringValue;
    if (field.numberValue !== undefined) return field.numberValue;
    // ... other types
    return null;
  };
  ```

* **Data Transformation:** Ensure consistent transformation between API and UI formats:
  ```typescript
  // Transform form values to API format before saving
  const prepareForSubmission = (formValues) => {
    const apiData = { ...formValues };
    
    // Transform custom fields to API format
    apiData.customFields = formValues.customFields?.map(field => {
      const definition = definitions.find(d => d.id === field.definitionId);
      if (!definition) return null;
      
      const result = { definitionId: field.definitionId };
      
      // Set the right property based on field type
      switch (definition.fieldType) {
        case 'TEXT':
          result.stringValue = field.value;
          break;
        case 'NUMBER':
          result.numberValue = parseFloat(field.value);
          break;
        // ... other types
      }
      
      return result;
    }).filter(Boolean);
    
    return apiData;
  };
  ```

---

## Phase 4: Advanced Considerations & Future Refinements

### 0: Mental Validation & Dry Run
*   **Action:** Before implementing advanced features (search, permissions, migrations, etc.), mentally simulate the impact on existing data, performance, and user experience. Adjust the plan as needed.

### X.X: Extending Custom Fields to New Entities (NEW SECTION)

The custom fields system is designed with reusability and future expansion in mind, allowing it to be extended beyond initial CRM entities (Deals, People, Organizations) to other parts of the application or new domains.

**Reusable Core Infrastructure:**
*   **`custom_field_definitions` Table:** This central table stores definitions for any entity type via the `entity_type` ENUM.
*   **`customFieldService.ts`:** Service logic for managing definitions (CRUD operations, validation) is designed to be generic.
*   **Dynamic Frontend Components:** UI components like `DynamicCustomFieldInput.tsx` and `CustomFieldValueDisplay.tsx` are built to render fields based on their type definition, making them reusable across different entities.

**Per-Entity Integration Steps:**
While the core infrastructure is reusable, enabling custom fields for a *new* entity type requires the following specific integration steps:

1.  **Database Schema Updates:**
    *   Add the new entity identifier (e.g., `'PROJECT'`, `'TICKET'`) to the `entity_type` ENUM in the database (requires a migration).
    *   Add the `custom_field_values JSONB DEFAULT \'{}\' NOT NULL` column to the new entity's database table (e.g., `public.projects`). Don't forget to add a GIN index to this column.

2.  **Backend (GraphQL & Service Layer) Updates:**
    *   Add the new entity identifier to the `CustomFieldEntityType` GraphQL ENUM in your schema files.
    *   Extend the GraphQL type for the new entity to include the `customFieldValues: [CustomFieldValue!]!` field (e.g., `type Project { ... customFieldValues: [CustomFieldValue!]! }`).
    *   Update or create GraphQL input types (e.g., `ProjectInput`, `ProjectUpdateInput`) to include `customFields: [CustomFieldValueInput!]`.
    *   Implement the GraphQL resolver for the new entity's `customFieldValues` field (e.g., `Project.customFieldValues`). This resolver will fetch definitions and map the JSONB data to the `CustomFieldValue` GraphQL type.
    *   Update the service layer for the new entity (e.g., `projectService.ts`) to:
        *   Accept `customFields` data in its create and update methods.
        *   Utilize the `customFieldService.ts` to validate the incoming custom field data against their definitions.
        *   Correctly format and save the custom field data into the entity's `custom_field_values` JSONB column.

3.  **Frontend Integration:**
    *   Integrate the reusable custom field components (e.g., `CustomFieldsSection.tsx`) into the creation and editing forms for the new entity.
    *   Integrate the display components (e.g., `CustomFieldsPanel.tsx`) into the detail view page for the new entity.
    *   Ensure the entity-specific Zustand store (if applicable) correctly handles fetching and submitting custom field data for the new entity.

By following these steps, the custom fields functionality can be systematically rolled out to any new part of the application that requires enhanced data flexibility.

### 4.1: Performance Optimization

*   **Action:** Optimize database queries and indexing for JSONB.
    *   **Database Functions:**
        *   Create database functions for efficient JSONB operations
        *   Add specific GIN indexes for common query patterns
    *   **Status:** Not Started

### 4.2: Search & Filtering

*   **Action:** Implement search and filtering on custom fields.
    *   **Approaches:**
        *   For critical fields: Consider denormalization to separate columns
        *   For general search: Use GIN indexes and JSONB operators
    *   **Status:** Not Started

### 4.3: Permissions & Security

*   **Action:** Implement granular permissions for custom fields.
    *   **Features:**
        *   Field-level visibility control
        *   Role-based access to specific custom fields
    *   **Status:** Not Started

### 4.4: Data Migration & Integrity

*   **Action:** Develop tools and procedures for safe schema changes.
    *   **Procedures:**
        *   Field type conversion utilities
        *   Data validation and cleanup scripts
    *   **Status:** Not Started

### 4.5: Testing Strategy

*   **Action:** Create comprehensive test suite for custom fields.
    *   **Test Types:**
        *   Unit tests for validation logic
        *   Integration tests for CRUD operations
        *   E2E tests for form submission and display
    *   **Status:** Not Started

### 4.6 User Interface Personalization Enhancements (Potential Phase 2 consideration)

Once the core custom fields functionality is implemented and stable, the following UI/UX enhancements could be considered to allow users more control over their views:

*   **List View Column Configuration:**
    *   **Functionality:** Allow users to choose which custom fields (and standard fields) appear as columns in table/list views (e.g., the main Deals table, People list). Users could select fields, hide fields, and reorder columns.
    *   **Benefit:** Provides a personalized view tailored to what each user finds most relevant in list views, improving efficiency.
    *   **Implementation Note:** Would require storing user preferences for column visibility and order per entity list view.
    *   **Status:** Future Enhancement (Post-MVP)

*   **"Show/Hide Empty Fields" Toggle:**
    *   **Functionality:** Provide a toggle on entity detail pages that allows users to hide any custom fields (and potentially standard fields) that do not have a value entered for the currently viewed record.
    *   **Benefit:** Reduces clutter on detail pages, especially for entities with many custom fields where only a subset might be filled out for any given record.
    *   **Implementation Note:** Frontend logic to check field values and conditionally render them based on the toggle state.
    *   **Status:** Future Enhancement (Post-MVP)

### 4R: Risk Mitigation for Advanced Features

* **Backup Strategy:** Implement regular backups before schema changes:
  ```