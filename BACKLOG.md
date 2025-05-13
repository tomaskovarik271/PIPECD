# Project Backlog

## Task: Implement Robust User Lookup for Deal History

**ID:** HIST-001
**Status:** To Do
**Priority:** High
**Reporter:** System (AI Assistant)
**Assignee:** TBD

**Summary:**

The `DealHistoryEntry.user` GraphQL resolver currently uses placeholder data when displaying users who are not the currently authenticated user. This is because it was previously fetching from the incorrect `people` (CRM contacts) table. While the immediate bug of incorrect data is fixed, a robust solution is needed to display accurate information (ID, email, name) for *any* user who appears in the deal history.

**Affected Component:** `netlify/functions/graphql/resolvers/history.ts` (specifically the `DealHistoryEntry.user` resolver).

**Problem Details:**

*   The `deal_history` table stores `user_id` (from `auth.users.id`) for actions performed by users.
*   The GraphQL `User` type expects `id: ID!`, `email: String`, `name: String`.
*   The current resolver correctly fetches details for the `currentUser` from the GraphQL context.
*   For other users, it returns their `id` but `null` for `email` and a generic placeholder for `name` (e.g., "User abc123de...").
*   This is because there's currently no direct, secure mechanism in that resolver to fetch display information (like email or a display name) for an arbitrary `user_id` from `auth.users` or a dedicated profiles table.

**Proposed Solutions (Choose One):**

1.  **Option A: Create a `public.user_profiles` Table (Recommended)**
    *   **Description:** Introduce a new table in the public schema to store display-related information for application users.
    *   **Schema Definition (`public.user_profiles`):**
        *   `id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
        *   `email`: `TEXT` (kept in sync or fetched as needed, can be unique)
        *   `display_name`: `TEXT` (nullable, users can set this)
        *   `avatar_url`: `TEXT` (nullable)
        *   `created_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`
        *   `updated_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`
    *   **Data Synchronization:**
        *   Create a PostgreSQL trigger on `auth.users` (after insert) to automatically create a corresponding row in `public.user_profiles`. This trigger should populate the `id` and `email`.
        *   Consider a trigger for updates to `auth.users.email` if emails are also stored and kept in sync in `user_profiles`.
    *   **Resolver Update:** Modify the `DealHistoryEntry.user` resolver in `history.ts` to query `public.user_profiles` using the `parent.user_id` when the user is not the `currentUser`.
    *   **RLS:** Define appropriate Row-Level Security policies for `public.user_profiles` (e.g., users can update their own profile, authenticated users can read basic info like `id`, `display_name`, `avatar_url`).
    *   **Pros:** Clean separation of concerns, dedicated place for user profile data, easily extensible, standard practice.
    *   **Cons:** Requires a new table and a trigger.

2.  **Option B: Create a PostgreSQL RPC Function to Fetch from `auth.users`**
    *   **Description:** Create a `SECURITY DEFINER` PostgreSQL function that safely exposes limited, necessary user data from `auth.users`.
    *   **SQL Function Definition (Example: `get_user_display_info(user_id_to_lookup uuid)`):**
        ```sql
        CREATE OR REPLACE FUNCTION get_user_display_info(user_id_to_lookup uuid)
        RETURNS TABLE (id uuid, email text, name text) -- Or a JSON object
        LANGUAGE sql
        SECURITY DEFINER
        AS $$
          SELECT
              u.id,
              u.email,
              COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', u.email) AS name
          FROM auth.users u
          WHERE u.id = user_id_to_lookup;
        $$;
        ```
    *   **Permissions:** Grant `EXECUTE` permission on this function to the `authenticated` role (or the role used by your backend).
    *   **Resolver Update:** Modify the `DealHistoryEntry.user` resolver in `history.ts` to call this RPC function (`supabase.rpc('get_user_display_info', { user_id_to_lookup: parent.user_id })`) when the user is not the `currentUser`.
    *   **Pros:** No new table, directly uses `auth.users` data.
    *   **Cons:** User profile data (like a canonical `display_name`) is solely managed within `auth.users.raw_user_meta_data`, which might be less structured. `SECURITY DEFINER` functions require careful auditing.

**Acceptance Criteria:**

*   The `DealHistoryEntry.user` resolver no longer uses the `people` table. (Already partially met)
*   When a deal history entry is viewed, the associated user's correct `id`, `email`, and `name` are displayed, regardless of whether they are the currently logged-in user.
*   If Option A is chosen:
    *   The `public.user_profiles` table exists and is populated correctly via a trigger.
    *   RLS policies for `user_profiles` are in place and tested.
    *   The resolver queries `user_profiles`.
*   If Option B is chosen:
    *   The PostgreSQL RPC function `get_user_display_info` (or similar) exists and works correctly.
    *   The resolver calls this RPC function.
*   Data for `email` and `name` should be `null` in the GraphQL response only if legitimately not available from the chosen data source (e.g., user has no email or display name set). It should not be `null` due to inability to fetch.
*   The solution is secure and does not expose sensitive user data inappropriately.
*   Relevant `console.warn` messages about placeholder data in `history.ts` are removed or updated.

**Notes/Considerations:**

*   The choice between Option A and B depends on project preference for data modeling and how user profile data (like display names) is intended to be managed system-wide. Option A is generally more flexible for future enhancements to user profiles.
*   Ensure any new database objects (tables, functions, triggers) are included in Supabase migrations.
*   Update `DEVELOPER_GUIDE_V2.md` if necessary to reflect the new user profile data strategy.

## Task: Refactor Store Error State Granularity

**ID:** STORE-001
**Status:** To Do
**Priority:** Medium
**Reporter:** System (AI Assistant)
**Assignee:** TBD

**Summary:**
Currently, Zustand stores (e.g., `useStagesStore`, `usePipelinesStore`) use a single error state property (e.g., `stagesError`). When an action (like `createStage`) fails, it populates this generic error state. UI components displaying lists of items (e.g., `StagesPage.tsx`) can become confusing if they hide the entire list or show a global error message just because a specific action (like a form submission in a modal) failed. This can make the UI feel broken when the underlying data is still valid and displayable.

**Goal:**
Refactor the stores to use more granular error states for different types of operations. For example, instead of a single `stagesError`, have `fetchStagesError`, `createStageError`, `updateStageError`, `deleteStageError`.

**Benefits:**
*   **Improved UI Resilience:** UI components can distinguish between a failure to load data (where hiding the list or showing a full-page error might be appropriate) and a failure of a specific action (where the error should be displayed locally, e.g., in a toast or modal, without tearing down the main data display).
*   **Clearer Error Attribution:** Easier to pinpoint in the UI and for debugging exactly which operation failed.
*   **Better User Experience:** Users receive more targeted feedback, and the application feels more stable as unrelated parts of the UI are not affected by localized errors.

**Affected Components (Examples):**
*   `frontend/src/stores/useStagesStore.ts`
*   `frontend/src/stores/usePipelinesStore.ts`
*   `frontend/src/stores/useDealsStore.ts`
*   `frontend/src/stores/usePeopleStore.ts`
*   `frontend/src/stores/useOrganizationsStore.ts`
*   All pages and components that consume these stores and handle their error states (e.g., `StagesPage.tsx`, `PeoplePage.tsx`, etc.).

**Acceptance Criteria:**
*   Stores are updated with distinct error state properties for fetch, create, update, and delete operations (as applicable).
*   Store actions correctly set these specific error states upon failure and clear them upon success or when a new action of that type begins.
*   UI components are updated to consume these granular error states.
*   Errors from specific actions (e.g., failing to create an entity due to validation) are shown locally (e.g., toast, modal alert) and do NOT cause previously fetched and valid list data to disappear from the page.
*   Errors from fetching data (e.g., `fetchStages` fails) can still result in a more prominent error display replacing the list if no data is available.

---

## Task: Implement UI and Backend for Stage Reordering within a Pipeline

**ID:** STAGE-002
**Status:** To Do
**Priority:** Medium
**Reporter:** User Request / System (AI Assistant)
**Assignee:** TBD

**Summary:**
Currently, the `order` of stages within a pipeline is set during stage creation or edit, but there is no dedicated UI for users to easily re-sequence existing stages (e.g., via drag-and-drop of stage columns or a list). This feature would allow users to dynamically adjust their pipeline process flow after initial setup.

**Goal:**
Provide a user-friendly interface for reordering stages within a specific pipeline. The backend must support updating the `order` property for multiple stages in a way that maintains unique order values.

**Key Requirements:**
*   **Frontend UI:**
    *   A visual way to reorder stages for a selected pipeline (e.g., a dedicated settings page for a pipeline, or drag-and-drop directly on a representation of the pipeline stages).
    *   Changes should be explicitly saved by the user.
*   **Backend API (GraphQL):**
    *   A new mutation, e.g., `updateStageOrders(pipelineId: ID!, stageOrders: [StageOrderInput!]!): [Stage!]!`, where `StageOrderInput` could be `{ stageId: ID!, newOrder: Int! }`.
    *   This mutation must handle updating multiple stages within a transaction.
    *   It needs to ensure that the `order` values remain unique within the pipeline after the update (this can be complex, might involve shifting existing orders).
*   **Backend Service (`stageService.ts`):**
    *   New service function to implement the logic for `updateStageOrders`.
    *   Careful handling of order conflicts and transactional updates.

**Acceptance Criteria:**
*   Users can visually reorder stages for a given pipeline.
*   Saving the new order updates the `order` property of the affected stages in the database.
*   The uniqueness of `order` per pipeline is maintained.
*   The Kanban view (and any other UI relying on stage order) correctly reflects the new stage sequence.

**Notes/Considerations:**
*   The backend logic for re-assigning unique order numbers can be challenging. Strategies include: temporarily assigning very large numbers then re-sequencing, or carefully shifting existing numbers.
*   Consider impact on performance if many stages are reordered.

---

## Task: Implement Pipeline and Stage Archiving Functionality

**ID:** ARCH-001
**Status:** To Do
**Priority:** Low-Medium
**Reporter:** User Request / System (AI Assistant)
**Assignee:** TBD

**Summary:**
Users may want to hide old or unused pipelines and stages from their primary views without permanently deleting them and losing associated historical data (like deals that once belonged to those pipelines/stages). Archiving provides a soft-delete mechanism.

**Goal:**
Allow users to archive and unarchive pipelines and stages. Archived items should typically be hidden from default lists and selectors but remain in the database for historical reference and potential unarchival.

**Key Requirements:**
*   **Database Schema:**
    *   Add `archived_at: TIMESTAMPTZ NULL` to `public.pipelines` table.
    *   Add `archived_at: TIMESTAMPTZ NULL` to `public.stages` table.
*   **Backend Services (`pipelineService.ts`, `stageService.ts`):**
    *   New functions: `archivePipeline(id)`, `unarchivePipeline(id)`, `archiveStage(id)`, `unarchiveStage(id)`.
    *   These functions would set or clear the `archived_at` timestamp.
    *   Existing fetch functions (e.g., `getPipelines`, `getStagesByPipelineId`) should be updated to typically exclude archived items by default (e.g., `WHERE archived_at IS NULL`), but offer an option to include them.
*   **Backend API (GraphQL):**
    *   New mutations: `archivePipeline`, `unarchivePipeline`, `archiveStage`, `unarchiveStage`.
    *   Queries for pipelines and stages should accept an optional filter argument (e.g., `includeArchived: Boolean`) or have separate queries for fetching archived items.
*   **Frontend UI:**
    *   UI elements (e.g., buttons, menu options) to archive/unarchive pipelines and stages.
    *   Default views (pipeline lists, stage lists, selectors) should hide archived items.
    *   Potentially a separate settings area or view to see and manage archived items.

**Acceptance Criteria:**
*   Users can mark pipelines and stages as archived.
*   Archived items are hidden from default views but not deleted from the database.
*   Users can view and unarchive previously archived items.
*   Deals associated with archived stages/pipelines remain, but their context (the archived pipeline/stage) is appropriately indicated if viewed.
*   Kanban view should likely only show stages from active (non-archived) pipelines.

**Notes/Considerations:**
*   What happens if a user archives a pipeline that contains active stages? Should the stages also be implicitly archived, or should archiving be prevented?
*   What happens to deals in a stage that gets archived? They remain in that stage, but the stage itself becomes hidden.

--- 