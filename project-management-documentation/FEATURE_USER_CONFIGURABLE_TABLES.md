# Feature: User-Configurable Table Column Visibility

## 1. Overview & Goals

This feature will empower users to customize their table views by allowing them to select which columns are visible. This includes both standard entity fields and any defined custom fields. The primary goal is to enhance user experience by providing tailored data views that suit individual workflows and preferences.

**Key Objectives:**

*   Allow users to show/hide columns in data tables (e.g., People, Deals tables).
*   Support standard fields and custom fields in the column selector.
*   Persist user preferences for column visibility.
*   Initially target the "People" table, with a design that's extensible to other tables.

## 2. Data Model & Persistence Strategy

User preferences for column visibility need to be stored. We have a few options:

*   **Option A: Frontend Only (localStorage or Zustand)**
    *   Pros: Faster initial implementation. No backend changes needed immediately.
    *   Cons: Preferences are not synced across browsers/devices. Lost if local storage is cleared.
*   **Option B: Backend Persistence (Recommended for long-term)**
    *   Store preferences in the database, associated with the user.
    *   Pros: Preferences are persistent and synced.
    *   Cons: Requires database schema changes, API endpoints, and service logic.

**This plan will outline a phased approach, starting with frontend-only persistence (via Zustand and potentially localStorage for session-to-session persistence on the same browser) and then detailing backend persistence as a subsequent phase.**

### 2.1. Backend Data Model (Phase 2)

If/When implementing backend persistence:

*   **New Table**: `user_display_preferences`
    *   `id`: UUID, Primary Key
    *   `user_id`: UUID, Foreign Key to `auth.users.id` (indexed)
    *   `table_key`: TEXT, Identifier for the table (e.g., "people_list", "deals_list") (indexed)
    *   `visible_columns`: JSONB, Array of strings representing the `key` of visible columns (e.g., `["name", "email", "cf_website_url"]`).
    *   `column_order`: JSONB, (Optional - for column reordering) Array of strings representing the ordered `key` of columns.
    *   `created_at`: TIMESTAMPTZ
    *   `updated_at`: TIMESTAMPTZ
    *   Constraint: `UNIQUE (user_id, table_key)`

*   **GraphQL Schema (Phase 2)**:
    *   `type UserDisplayPreference { id: ID!, tableKey: String!, visibleColumns: [String!]!, columnOrder: [String!] }`
    *   `input UserDisplayPreferenceInput { tableKey: String!, visibleColumns: [String!]!, columnOrder: [String!] }`
    *   `Query.myDisplayPreference(tableKey: String!): UserDisplayPreference`
    *   `Mutation.updateDisplayPreference(input: UserDisplayPreferenceInput!): UserDisplayPreference`

### 2.2. Backend Service & Resolvers (Phase 2)

*   New service: `userDisplayPreferenceService.ts`
    *   `getPreference(userId, tableKey)`
    *   `updatePreference(userId, input)`
*   Update GraphQL resolvers (`query.ts`, `mutation.ts`) to use this service.

## 3. Frontend State Management (Zustand)

We'll create a new Zustand store or a slice within an existing store (e.g., `useAppStore` or a new `useViewPreferencesStore`) to manage table view settings.

*   **State**:
    *   `tableSettings: { [tableKey: string]: { visibleColumns: string[], defaultColumns: string[], allAvailableColumns: ColumnDefinition[] } }`
    *   `isLoading: { [tableKey: string]: boolean }`
*   **Actions**:
    *   `initTableSettings(tableKey: string, allAvailableColumns: ColumnDefinition[], defaultColumns: string[])`: Initializes settings for a table, loads from localStorage if available, else uses defaults.
    *   `setVisibleColumns(tableKey: string, visibleColumns: string[])`: Updates visible columns and saves to localStorage.
    *   `resetToDefaults(tableKey: string)`: Resets to default columns.
    *   `(Phase 2)` `loadTableSettingsFromBackend(tableKey: string)`
    *   `(Phase 2)` `saveTableSettingsToBackend(tableKey: string)`

## 4. Frontend UI Components

### 4.1. Column Selector Component (`<ColumnSelector />`)

*   **Trigger**: A button (e.g., "Columns" or an icon) placed near the table, likely in the `ListPageLayout` or table header area.
*   **Display**: A dropdown, popover, or modal.
*   **Content**:
    *   A searchable list of all available columns for the current table.
    *   Each column will have a checkbox indicating its visibility.
    *   Columns grouped by "Standard Fields" and "Custom Fields".
    *   Buttons: "Apply", "Cancel", "Reset to Default".
*   **Props**:
    *   `tableKey: string`
    *   `allAvailableColumns: ColumnDefinition[]` (includes standard and custom field definitions)
    *   `currentVisibleColumns: string[]`
    *   `onApply: (newVisibleColumns: string[]) => void`
    *   `onReset: () => void`

### 4.2. `SortableTable` Component Modification

The existing `frontend/src/components/common/SortableTable.tsx` needs to be adapted or used in a way that its `columns` prop is dynamically generated based on user preferences.

*   Currently, `PeoplePage.tsx` defines a static `columns` array. This will need to change.
*   The `SortableTable` itself might not need much modification if the `columns` prop it receives is already filtered and ordered. The primary change will be in how the `columns` prop is constructed *before* being passed to `SortableTable`.

## 5. Integration with People Table (`PeoplePage.tsx`)

File: `frontend/src/pages/PeoplePage.tsx`

1.  **Define All Available Columns**:
    *   Create a comprehensive list of all potential columns for People. This includes:
        *   Standard person fields (first\_name, last\_name, email, phone, organization.name, etc.).
        *   Custom fields: Fetch `CustomFieldDefinition`s where `entityType` is `PERSON`. Each definition will form the basis of an available column.
    *   Each item in this list should conform to the `ColumnDefinition<Person>` type, specifying `key`, `header`, `renderCell`, and `sortAccessor`.
        *   For custom fields, `key` could be `cf_{fieldName}` (e.g., `cf_website_url`).
        *   `header` would be `fieldLabel` from the custom field definition.
        *   `renderCell` will need to find the correct `CustomFieldValue` from `person.customFieldValues` based on `fieldName` and render its `stringValue`, `numberValue`, etc., appropriately. If the field is a URL (identified by `fieldName` convention or content inspection), render an `<a>` tag.
        *   `sortAccessor` for custom fields will also need to access the specific `CustomFieldValue`.

2.  **Initialize and Use Preferences**:
    *   On page load, use the Zustand store actions to `initTableSettings` for `"people_list"`, providing the `allAvailableColumns` and a list of default visible column keys.
    *   Get `visibleColumns` for `"people_list"` from the store.
    *   Filter the `allAvailableColumns` list based on the `visibleColumns` from the store to generate the actual `columns` array to pass to `<SortableTable />`.

3.  **Integrate `<ColumnSelector />`**:
    *   Add the trigger button for the `<ColumnSelector />`.
    *   Pass the necessary props (all available Person columns, current visible Person columns from store).
    *   When `onApply` is called from `<ColumnSelector />`, update the Zustand store using `setVisibleColumns`.

## 6. Handling Custom Fields Dynamically

*   **Fetching Definitions**: The list of available custom fields for the selector must be fetched from `customFieldDefinitions` query (filtered by `entityType: PERSON`). This can be done in `PeoplePage.tsx` or a higher-level component.
*   **Rendering Values**: The `renderCell` function for custom field columns needs to:
    *   Receive the `Person` object.
    *   Find the relevant `CustomFieldValue` object within `person.customFieldValues` (matching `definition.fieldName`).
    *   Render the appropriate value (`stringValue`, `numberValue`, etc.) based on `customFieldValue.definition.fieldType`.
    *   **For URLs**: If `customFieldValue.definition.fieldType` is `TEXT` and the `stringValue` is a URL (or if `definition.fieldName` suggests it's a URL, e.g., "website\_url"), render it as `<a href={value} target="_blank">{value}</a>`.

## 7. Other User Data Display Preferences (Future Enhancements)

Beyond column visibility, consider these related features for user customization:

*   **Column Reordering**: Allow users to drag-and-drop columns to change their order. (Store order in `column_order` JSONB field).
*   **Default Sort**: Allow users to set a default sort column and direction for each table.
*   **Row Density**: Options for "compact", "standard", "comfortable" row spacing.
*   **Items Per Page**: If using pagination, allow users to set a preferred number of items per page.
*   **Persistent Filters**: (More complex) Allow users to save commonly used filter sets.

## 7A. Broader Customization & Information Needs (Long-Term Vision)

Drawing inspiration from established platforms like Jira, Pipedrive, and Salesforce, the following areas represent a longer-term vision for enhancing user customization and addressing broader information needs within the CRM:

### Saved Views & Advanced Filtering
*   **User-Defined Saved Views**: Allow users to create, name, and save complex filter criteria sets for any table (e.g., "My High-Value Leads in California").
*   **Sharing Views**: Options to keep views private, share with specific teams/users, or make them accessible to all users (with appropriate permissions).
*   **Default Views**: Allow users (or admins) to set a default view for each entity type (e.g., the view that loads when navigating to the Deals page).
*   **Quick Filters**: Contextual, pre-defined filters directly on tables for common use cases (e.g., "My Open Activities," "Recently Modified People").
    *   **Implementation Plan for Quick Filters:**
        *   **1. UI/UX Design:**
            *   Determine placement: e.g., a dropdown menu or a button group above relevant data tables.
            *   Selection mechanism: Allow users to select one quick filter at a time.
            *   Indication: Clearly indicate the active quick filter.
            *   Interaction: Define how quick filters interact with existing column sorting and any manual filters (e.g., quick filter might reset manual filters or be mutually exclusive).
        *   **2. Definition of Quick Filters:**
            *   Structure: Each quick filter will have a user-facing `label` (e.g., "My Open Activities") and a corresponding `filterCriteria` object.
            *   Storage: Initially, quick filters can be hardcoded per entity type (e.g., in the respective page component like `ActivitiesPage.tsx`). Future enhancement could involve admin-configurable quick filters.
            *   Examples:
                *   Activities:
                    *   "My Open Activities": `{ user_id: { eq: currentUserId }, is_done: { eq: false } }`
                    *   "Due Today": `{ due_date: { gte: today_start_iso, lte: today_end_iso } }`
                    *   "Overdue": `{ due_date: { lt: today_start_iso }, is_done: { eq: false } }`
                *   People:
                    *   "Recently Added (Last 7 Days)": `{ created_at: { gte: seven_days_ago_iso } }`
                    *   "Without Organization": `{ organization_id: { isNull: true } }`
                *   Deals:
                    *   "My Open Deals": `{ user_id: { eq: currentUserId }, stage_is_open: { eq: true } }` (Requires `stage_is_open` or similar logic based on stage type/category)
                    *   "Closing This Month": `{ expected_close_date: { gte: month_start_iso, lte: month_end_iso } }`
        *   **3. State Management:**
            *   Store the key/identifier of the currently active quick filter (e.g., in component state using `useState`, or in the URL query params for shareability).
            *   When a quick filter is selected, its `filterCriteria` should be applied.
        *   **4. Data Fetching Integration:**
            *   The `fetch<Entity>s` functions in Zustand stores (e.g., `fetchActivities`, `fetchDeals`) need to accept the `filterCriteria` from the active quick filter.
            *   Ensure the GraphQL `FilterInput` types for each entity (Activity, Person, Deal, Organization) support the fields and operations required by the defined quick filters (e.g., date ranges, user ID matching, null checks, boolean checks). This may require backend schema/resolver adjustments if not already supported.
        *   **5. Component Implementation:**
            *   Create a reusable `QuickFilterControls` component (e.g., `frontend/src/components/common/QuickFilterControls.tsx`).
                *   Props: `availableFilters: { label: string, key: string, criteria: object }[]`, `activeFilterKey: string | null`, `onSelectFilter: (key: string | null) => void`.
            *   Integrate this component into relevant list page layouts or page components (e.g., `ActivitiesPage`, `PeoplePage`, `DealsPage`, `OrganizationsPage`).
            *   When a filter is selected via `onSelectFilter`, update the active filter state and re-fetch data with the new criteria. An option to "clear" the quick filter should also be available.
        *   **6. Phased Rollout:**
            *   Start with one entity (e.g., Activities) to implement and test the core mechanism.
            *   Then, roll out to other entities, defining specific quick filters for each.
        *   **Current Status (as of last update):**
            *   Client-side Quick Filters have been implemented for the Activities, People, Organizations, and Deals pages.
            *   The `QuickFilterControls.tsx` component has been created and integrated.
            *   Filtering logic is currently handled client-side as the GraphQL `FilterInput` types for these entities do not yet support all necessary server-side filtering capabilities for the defined quick filters (e.g., filtering by `user_id` on activities, or specific date logic directly in the query for all entities). All data is fetched, and then filtered in the browser.

### Detail Page Layout Customization
*   **Admin-Configurable Layouts**: Allow administrators to customize the layout of fields on record detail pages (e.g., for People, Deals, Organizations).
    *   Organize fields into sections, tabs, or columns.
    *   Control field visibility and order within these sections.
    *   Define which related lists (e.g., activities for a person, contacts for an organization) are displayed and the columns within those lists.
*   **(Potentially) User-Level Personalization**: Allow individual users minor personalization of their detail view layouts within admin-defined constraints.

### Alternative Data Visualizations
*   **Kanban/Board Views**: For entities like Deals or Activities, provide a Kanban board visualization where users can:
    *   Define the field used for columns (e.g., Deal Stage, Activity Status).
    *   Customize the information displayed on cards within the Kanban board.
    *   View summary information per column (e.g., total deal amount, count of tasks).

### Dashboards & Reporting
*   **Customizable Dashboards**: Enable users to create personal dashboards or use shared dashboards.
    *   Add, remove, and rearrange widgets (charts, key metrics, tables, activity feeds).
    *   Widgets based on saved reports or custom data queries.
*   **Advanced Report Builder**: Allow users to generate detailed reports with features like:
    *   Complex filtering and grouping.
    *   Data aggregation (sum, average, count).
    *   Various chart types (bar, line, pie, funnel).
    *   Scheduled report generation and export capabilities.

### Granular Custom Field Controls (Admin Focused, User Impacting)
*   **Expanded Custom Field Types**: Introduce more specialized custom field types (e.g., dedicated URL, Email, Phone, Currency, Formula fields, Lookup relationships to other entities).
*   **Field-Level Security**: Administrator control over which user roles/profiles can view or edit specific custom fields.
*   **Advanced Validation Rules**: Define complex validation rules for custom (and standard) fields beyond simple "required" checks.

### User Interaction & Workflow Preferences
*   **Configurable Notifications**: Allow users to specify which events they want to be notified about (e.g., deal stage changes, new task assignments, mentions) and through which channels (in-app, email).
*   **Record Following/Subscriptions**: Enable users to "follow" or "subscribe" to specific records to receive updates about changes.
*   **Task & Activity Management Views**: Provide customizable list views and filters for tasks and activities, focusing on due dates, priorities, and status.

These broader capabilities, while significant undertakings, represent the evolution towards a highly adaptable and user-centric CRM platform.

## 8. Phased Implementation Steps

**Phase 1: Frontend-Only Column Visibility for People Table**

1.  **Zustand Store**: Implement the state and actions for `tableSettings` in a new store (e.g., `useViewPreferencesStore.ts`) or relevant existing store. Use `localStorage` for persistence in this phase.
2.  **`PeoplePage.tsx` - Define All Columns**:
    *   Fetch `CustomFieldDefinition`s for `PERSON`.
    *   Create the `allAvailableColumns: ColumnDefinition<Person>[]` list, including logic for rendering standard and custom fields (with URL handling for text fields).
    *   Define `defaultVisibleColumnKeys: string[]`.
3.  **`PeoplePage.tsx` - Store Integration**:
    *   Call `initTableSettings("people_list", allAvailableColumns, defaultVisibleColumnKeys)`.
    *   Subscribe to `tableSettings["people_list"].visibleColumns` from the store.
    *   Dynamically generate the `columns` prop for `<SortableTable />` by filtering `allAvailableColumns` based on `visibleColumns` from the store.
4.  **`ColumnSelector` Component**:
    *   Build the UI for listing all columns with checkboxes.
    *   Implement "Apply" (calls `setVisibleColumns` in store) and "Reset" (calls `resetToDefaults` in store).
5.  **Integrate `ColumnSelector`**: Add it to `PeoplePage.tsx`.
6.  **Test**: Thoroughly test showing/hiding standard and custom fields (including URL rendering).

**Phase 1A: Quick Filters Implementation (Client-Side)**
*   **Status: DONE**
*   Implemented `QuickFilterControls.tsx` component.
*   Integrated quick filters for Activities, People, Organizations, and Deals pages.
*   Filtering is performed client-side. Future work may involve enhancing backend GraphQL filters to support server-side filtering for these quick filters.

**Phase 2: Backend Persistence (Optional, for full persistence)**

1.  **Database**: Create `user_display_preferences` table.
2.  **GraphQL**: Add `UserDisplayPreference` type, query, and mutation.
3.  **Backend Service**: Implement `userDisplayPreferenceService.ts`.
4.  **Resolvers**: Implement GraphQL resolvers.
5.  **Zustand Store**: Modify actions to fetch from and save to the backend. Fallback to localStorage/defaults if backend call fails or for optimistic updates.

## 9. Potential Challenges & Considerations

*   **Performance**: Rendering tables with many dynamic columns, especially if `renderCell` functions become complex.
*   **Custom Field Definition Changes**: If custom fields are deactivated or changed, the "all available columns" list and rendering logic must adapt gracefully. Preferences might refer to outdated fields.
*   **Initial Setup**: Determining a sensible set of default visible columns for each table.
*   **Complexity of `ColumnDefinition`**: Managing a potentially large list of `ColumnDefinition` objects, especially the `renderCell` and `sortAccessor` logic for custom fields.
*   **UX of Column Selector**: Making it user-friendly, especially if there are many columns. Search/filter within the selector might be needed.

This plan provides a structured approach to implementing this valuable feature.

## 10. Recent Fixes & Small Enhancements

*   **Deal Modals - `expected_close_date` Format Fix**:
    *   **Issue**: The `expected_close_date` was being sent to the backend in `YYYY-MM-DD` format from the Create and Edit Deal modals, causing a `ZodError` because the backend expected a full ISO 8601 timestamp.
    *   **Fix**: Modified `CreateDealModal.tsx` and `EditDealModal.tsx` to ensure `expected_close_date`, if provided, is converted to a full ISO string (`new Date(dateString).toISOString()`) before being included in the `DealInput` for the `createDeal` and `updateDeal` mutations. This resolved the internal server error during deal creation/updates.
