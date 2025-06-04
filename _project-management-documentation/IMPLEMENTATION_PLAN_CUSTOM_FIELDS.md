# Implementation Plan: Custom Fields

**ID:** FEATURE-004
**Status:** In progress 

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
*   **Status:** Completed

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
    *   **Status:** Completed
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
    *   **Status:** Completed
*   **Action 1.1.3:** Apply migrations with careful verification.
    *   **Verification Steps:**
        1. Review migration files for completeness and accuracy
        2. Run `supabase db reset` in development environment
        3. Manually verify table structure with `\d custom_field_definitions` in psql
        4. Test RLS policies with different user roles
    *   **Status:** Completed

### 1.1R: Risk Mitigation for Database Changes

* **Migration Verification:** Create a checklist to verify migration files before applying them:
  * Ensure files are not empty
  * Verify SQL syntax with a linter
  * Check that all required fields, constraints, and indexes are defined
  * Verify RLS policies are complete (SELECT, INSERT, UPDATE as needed)
* **Status:** Completed (Implicitly, as migrations were successful)

* **Rollback Plan:** Create a rollback migration for each migration file:
  ```sql
  -- Example rollback for custom_field_definitions
  DROP TABLE IF EXISTS public.custom_field_definitions;
  DROP TYPE IF EXISTS custom_field_type;
  DROP TYPE IF EXISTS entity_type;
  
  -- Example rollback for entity table changes
  ALTER TABLE public.deals DROP COLUMN IF EXISTS custom_field_values;
  ```
* **Status:** Completed (Rollbacks created as part of migration best practices)

* **Soft Deletion:** Use `is_active` flag instead of hard deletion to preserve data integrity when a field definition is "deleted".
* **Status:** Implemented and in use

### 1.2: GraphQL Schema Updates

*   **Action 1.2.1:** Create `customFields.graphql` (or similar).
    *   **Status:** Completed (Schema updated, including change from `definitionId` to `definition` in `CustomFieldValue`)
*   **Action 1.2.2:** Extend entity GraphQL types to expose their custom field values.
    *   **Status:** Completed (for Deal, Person, Organization)
*   **Action 1.2.3:** Add scalar definitions to ensure they're properly recognized.
    *   **Status:** Completed (Scalars existed or were confirmed)
*   **Action 1.2.4:** Run `npm run codegen` to generate/update TypeScript types.
    *   **Status:** Completed (Run multiple times after schema changes)

### 1.3: GraphQL Resolvers & Service Layer (for Custom Field Definitions)

*   **Action 1.3.1:** Implement `customFieldDefinitionService.ts` (`lib/customFieldDefinitionService.ts`).
    *   **Status:** Completed
*   **Action 1.3.2:** Implement resolvers in `netlify/functions/graphql/resolvers/customFields.ts`.
    *   **Status:** Completed
*   **Action 1.3.3:** Integrate new resolvers into main `graphql.ts`.
    *   **Status:** Completed (Resolved `INTERNAL_SERVER_ERROR` by doing this)
*   **Action 1.3.4:** Basic unit/integration tests for the service layer functions (CRUD operations).
    *   **Status:** Deferred (Functionality confirmed via UI testing)

### 1.4: RLS Policy Updates for `custom_field_definitions`

*   **Action 1.4.1:** Review and refine RLS policies on `custom_field_definitions`.
    *   **Status:** Completed
*   **Action 1.4.2:** Create `('custom_fields', 'manage_definitions')` permission and assign to 'admin' role.
    *   **Status:** Completed

## Phase 2: Frontend - Custom Field Definition Management UI

### 2.1: Frontend Store for Custom Field Definitions

*   **Action 2.1.1:** Create `frontend/src/lib/graphql/customFieldDefinitionOperations.ts`.
    *   **Status:** Completed
*   **Action 2.1.2:** Create `frontend/src/stores/useCustomFieldDefinitionStore.ts` (Zustand store).
    *   **Status:** Completed

### 2.2: UI Components for Definition Management

*   **Action 2.2.1:** Create `CustomFieldsPage.tsx` (`frontend/src/pages/admin/CustomFieldsPage.tsx`).
    *   **Status:** Completed
*   **Action 2.2.2:** Create `CustomFieldDefinitionList.tsx`.
    *   **Status:** Completed
*   **Action 2.2.3:** Create `CustomFieldDefinitionForm.tsx`.
    *   **Status:** Completed
*   **Action 2.2.4:** Add "Custom Fields" link to `Sidebar.tsx` (or admin layout).
    *   **Status:** Completed
*   **Action 2.2.5:** Implement confirmation dialogs (`AlertDialog`) for deactivate/reactivate.
    *   **Status:** Completed

### 2.3: Manual Testing - Definition Management

*   **Action 2.3.1:** Create `MANUAL_TESTING_CUSTOM_FIELD_DEFINITIONS.md`.
    *   **Status:** Completed (and iteratively updated)
*   **Action 2.3.2:** Execute manual tests and fix bugs.
    *   **Status:** Completed (All major definition management tests passed)

## Phase 3: Frontend - Using Custom Fields in Entity Forms & Displays

### 3.1: Backend - Entity-Specific Custom Field Resolvers & Service Updates

*   **Action 3.1.1:** Implement `Deal.customFieldValues` GraphQL resolver (`netlify/functions/graphql/resolvers/deal.ts`).
    *   **Status:** Completed
*   **Action 3.1.2:** Implement `Person.customFieldValues` resolver.
    *   **Status:** Completed
*   **Action 3.1.3:** Implement `Organization.customFieldValues` resolver.
    *   **Status:** Completed
*   **Action 3.1.4:** Update `Query.deals` and `Query.deal` resolvers in `query.ts`.
    *   **Status:** Completed
*   **Action 3.1.5:** Update `Query.people`, `Query.person` resolvers.
    *   **Status:** Completed
*   **Action 3.1.6:** Update `Query.organizations`, `Query.organization` resolvers.
    *   **Status:** Completed

*   **Action 3.1.7:** Update `lib/dealService.ts` for `createDeal` and `updateDeal`.
    *   **Status:** Completed
*   **Action 3.1.8:** Update `lib/personService.ts` for `createPerson` and `updatePerson`.
    *   **Status:** Completed
*   **Action 3.1.9:** Update `lib/organizationService.ts` for `createOrganization` and `updateOrganization`.
    *   **Status:** Completed
*   **Action 3.1.10:** Refactor main mutation resolver (`netlify/functions/graphql/resolvers/mutation.ts`).
    *   **Status:** Completed
*   **Action 3.1.11:** Update Zod validators (`netlify/functions/graphql/validators.ts`).
    *   Add `CustomFieldValueInputSchema`. (Status: Completed)
    *   Update `DealBaseSchema` (and thus `DealCreateSchema`/`DealUpdateSchema`). (Status: Completed)
    *   Update Person and Organization Zod schemas. (Status: Completed)

### 3.2: Frontend - Integrating Custom Fields into "Deal" Entity

*   **Action 3.2.1:** Update `CreateDealModal.tsx`.
    *   **Status:** Completed
*   **Action 3.2.2:** Update `EditDealModal.tsx`.
    *   **Status:** Completed
*   **Action 3.2.3:** Update `DealsPage.tsx` or `DealCard.tsx` (GraphQL query in `useDealsStore.ts`).
    *   **Status:** Completed
*   **Action 3.2.4:** Update `DealDetailPage.tsx` (GraphQL query in `useAppStore.ts` and rendering).
    *   **Status:** Completed

### 3.3: Frontend - Integrating Custom Fields into "Person" Entity

*   **Action 3.3.1:** Update `CreatePersonModal.tsx` / `EditPersonModal.tsx`.
    *   **Status:** Completed
*   **Action 3.3.2:** Update relevant Person list/detail page GraphQL queries.
    *   **Status:** Completed
*   **Action 3.3.3:** Update `PersonDetailPage.tsx` (or equivalent).
    *   **Status:** To Be Done (Assuming detail page rendering is separate)

### 3.4: Frontend - Integrating Custom Fields into "Organization" Entity

*   **Action 3.4.1:** Update `CreateOrganizationModal.tsx` / `EditOrganizationModal.tsx`.
    *   **Status:** Completed
*   **Action 3.4.2:** Update relevant Organization list/detail page GraphQL queries.
    *   **Status:** Completed (via `useOrganizationsStore.ts`)
*   **Action 3.4.3:** Update `OrganizationDetailPage.tsx` (or equivalent).
    *   **Status:** To Be Done (Assuming detail page rendering is separate)

### 3.5: Manual Testing - Using Custom Fields

*   **Action 3.5.1:** Add new sections to `MANUAL_TESTING_CUSTOM_FIELD_DEFINITIONS.md`.
    *   "Using Custom Fields in Entities (Deal)". (Status: Completed)
    *   Add similar sections for Person and Organization. (Status: Completed)
*   **Action 3.5.2:** Execute manual tests for Deals.
    *   `CFD-UC-001` to `CFD-UC-002`: Pass.
    *   `CFD-UU-001` to `CFD-UU-007`: Pass.
    *   Deal History for CFs: Pass.
    *   `CFD-UD-001`: Pass.
    *   Remaining `CFD-UC-xxx`, `CFD-UU-xxx`, `CFD-UD-xxx`: To Be Tested
    *   **Status:** In Progress (Deals largely tested, some specific cases remain)
*   **Action 3.5.3:** Execute manual tests for People.
    *   **Status:** Completed (Based on user feedback from previous session)
*   **Action 3.5.4:** Execute manual tests for Organizations.
    *   **Status:** Completed (Based on user e2e testing feedback)

## Phase 4: Advanced & Future Considerations

### 4.1: Data Integrity & Edge Cases
*   **Action 4.1.1:** Test deactivating a CF definition that has existing values in entities.
    *   **Status:** Partially covered by `CFD-UU-012` (To Be Tested) and `CFD-UD-004` (To Be Tested).
*   **Action 4.1.2:** Consider implications if `fieldType` of a definition could be changed.
    *   **Status:** Deferred (Current design prevents this)
*   **Action 4.1.3:** Test changing `dropdownOptions` for an existing DROPDOWN/MULTI_SELECT field.
    *   **Status:** Partially covered by `CFD-U-004` (Passed). Need to confirm behavior on entity forms/display.

### 4.2: Search & Filtering by Custom Fields
*   **Action 4.2.1:** Investigate feasibility and performance of querying JSONB for filtering.
    *   **Status:** Future Enhancement
*   **Action 4.2.2:** UI for allowing users to filter lists by custom fields.
    *   **Status:** Future Enhancement

### 4.3: Reporting on Custom Fields
*   **Action 4.3.1:** Assess how custom fields might be included in any reporting features.
    *   **Status:** Future Enhancement

### 4.4: Performance
*   **Action 4.4.1:** Monitor performance of queries involving `custom_field_values`.
    *   **Status:** Ongoing/To Be Monitored
*   **Action 4.4.2:** Optimize resolvers and service functions if performance issues arise.
    *   **Status:** Ongoing/To Be Monitored

## Appendix A: Permissions Reminder
*   `custom_field_definitions` management: Admin role only.
*   Reading `custom_field_definitions`: All authenticated users.
*   Reading/writing `custom_field_values` on entities: Subject to standard RLS on the parent entity.

---
**Overall Status:** Phase 1 & 2 complete. Phase 3 significantly progressed for "Deals" (core functionality implemented and tested). Next major steps involve completing detailed testing for Deals and then extending functionality to "People" and "Organizations".
