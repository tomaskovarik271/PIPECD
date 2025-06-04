# Project Backlog

## Task: Implement Robust User Lookup for Deal History

**ID:** HIST-001
**Status:** Done
**Priority:** High
**Reporter:** System (AI Assistant)
**Assignee:** AI Assistant / Dev Team

**Summary:**
The `DealHistoryEntry.user` GraphQL resolver previously used placeholder data for users who were not the currently authenticated user. This task aimed to implement a robust solution to display accurate user information (ID, display name) for *any* user appearing in the deal history.

**Resolution:**
Option A from the proposed solutions was implemented:
1.  **`public.user_profiles` Table Created:** A new table `public.user_profiles` was created (migration: `20250728000000_create_user_profiles.sql`) to store `user_id`, `display_name`, and `avatar_url`.
2.  **RLS Policies Updated:**
    *   Initially, users could only manage their own profiles.
    *   RLS was updated (migration: `20250729000000_update_user_profiles_rls.sql`) to allow any `authenticated` user to read any profile from `user_profiles`. This is essential for the deal history use case.
    *   Users can still only insert/update their own specific profile.
3.  **`userProfileService.ts` Utilized:** The existing `lib/userProfileService.ts` (with `getUserProfile` and `updateUserProfile` functions) is used to interact with the `user_profiles` table.
4.  **`DealHistoryEntry.user` Resolver Updated:** The resolver in `netlify/functions/graphql/resolvers/history.ts` was updated:
    *   For the `currentUser`, it fetches their profile from `userProfileService` to get `display_name` and `avatar_url`.
    *   For *other* users (not `currentUser`), it now also uses `userProfileService.getUserProfile` (leveraging the updated RLS) to fetch their `display_name` and `avatar_url`. A placeholder email is returned to satisfy the GraphQL schema's non-nullable `User.email` field, as actual emails of other users are not exposed here.
    *   If a profile cannot be fetched for any reason, it correctly falls back to `null`, resulting in "System Action" on the frontend.

**Affected Component:** `netlify/functions/graphql/resolvers/history.ts` (specifically the `DealHistoryEntry.user` resolver).

**Problem Details:**

*   The `deal_history` table stores `user_id` (from `auth.users.id`) for actions performed by users.
*   The GraphQL `User` type expects `id: ID!`, `email: String!`, `display_name: String`, `avatar_url: String`.
*   Previously, for users other than `currentUser`, it returned their `id` but `null` for `email` and a generic placeholder for `name`.

**Proposed Solutions (Choose One):**

1.  **Option A: Create a `public.user_profiles` Table (Recommended)** - Implemented.
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
*   Data for `email` and `name` should be `null` in the GraphQL response only if legitimately not available from the chosen data source (e.g., user has no email or display name set). It should not be `null` due to inability to fetch. (Partially Met: `display_name` is fetched; `email` for other users is a placeholder as actual emails are not exposed via this path to satisfy `String!`. This is an accepted trade-off for now.)
*   The solution is secure and does not expose sensitive user data inappropriately. (Met for `display_name` and `avatar_url`; email privacy for other users maintained by using a placeholder).
*   Relevant `console.warn` messages about placeholder data in `history.ts` are removed or updated. (Met)

**Notes/Considerations:**

*   The choice between Option A and B depends on project preference for data modeling and how user profile data (like display names) is intended to be managed system-wide. Option A is generally more flexible for future enhancements to user profiles.
*   Ensure any new database objects (tables, functions, triggers) are included in Supabase migrations. (Met)
*   Update `DEVELOPER_GUIDE_V2.md` if necessary to reflect the new user profile data strategy. (Met)

## Task: User Profile Management (View & Edit)

**ID:** USER-PROF-001
**Status:** Done
**Priority:** High
**Reporter:** System (AI Assistant)
**Assignee:** AI Assistant / Dev Team

**Summary:**
Implement functionality for users to view and manage their own profile information, specifically their display name and avatar URL. This includes creating the necessary database table, GraphQL API endpoints, and frontend interface.

**Resolution & Key Features:**

1.  **Database (`user_profiles` Table - See HIST-001 for details):**
    *   Created `public.user_profiles` table with `user_id`, `display_name`, `avatar_url`, and timestamps.
    *   RLS policies allow users to manage their own profile and authenticated users to read all profiles.
2.  **Backend (`userProfileService.ts`, GraphQL API):
    *   Created `lib/userProfileService.ts` with `getUserProfile` and `updateUserProfile`.
    *   GraphQL `User` type in `user.graphql` updated to include `display_name` and `avatar_url`.
    *   `Query.me: User` implemented to fetch the current user's profile.
    *   `Mutation.updateUserProfile(input: UpdateUserProfileInput!): User` implemented for users to update their own profiles.
3.  **Frontend (`ProfilePage.tsx`, `ProfileView.tsx`, `ProfileEditForm.tsx`):
    *   New "My Profile" page accessible from the sidebar.
    *   Users can view their current email (read-only from auth), display name, and avatar.
    *   Users can edit their display name and avatar URL.
    *   `graphql-request` is used for data fetching and mutations.
    *   Form handling with `react-hook-form`.
4.  **Integration with Deal History:** User display names from profiles are now shown in the Deal History section (see HIST-001).

**Acceptance Criteria:**
*   Users can navigate to a "My Profile" page.
*   Users can see their current email, display name, and avatar (or placeholders).
*   Users can edit their display name and avatar URL.
*   Changes are saved to the `user_profiles` table in Supabase.
*   The updated profile information is reflected immediately on the profile page.
*   The updated `display_name` is used in other parts of the application where the user is referenced (e.g., Deal History).
*   Appropriate RLS is in place for security.

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
*   `frontend/src/stores/useWFMWorkflowStore.ts`
*   `frontend/src/stores/useWFMStatusStore.ts`
*   `frontend/src/stores/useDealsStore.ts`
*   `frontend/src/stores/usePeopleStore.ts`
*   `frontend/src/stores/useOrganizationsStore.ts`
*   All pages and components that consume these stores and handle their error states (e.g., `AdminWFMWorkflowsPage.tsx`, `PeoplePage.tsx`, etc.).

**Acceptance Criteria:**
*   Stores are updated with distinct error state properties for fetch, create, update, and delete operations (as applicable).
*   Store actions correctly set these specific error states upon failure and clear them upon success or when a new action of that type begins.
*   UI components are updated to consume these granular error states.
*   Errors from specific actions (e.g., failing to create an entity due to validation) are shown locally (e.g., toast, modal alert) and do NOT cause previously fetched and valid list data to disappear from the page.
*   Errors from fetching data (e.g., `fetchStages` fails) can still result in a more prominent error display replacing the list if no data is available.

---

## Task: Implement UI and Backend for Stage Reordering within a Pipeline

**ID:** STAGE-002
**Status:** Obsolete
**Priority:** Medium
**Reporter:** User Request / System (AI Assistant)
**Assignee:** TBD

**Summary:**
Currently, the `order` of stages within a pipeline is set during stage creation or edit, but there is no dedicated UI for users to easily re-sequence existing stages (e.g., via drag-and-drop of stage columns or a list). This feature would allow users to dynamically adjust their pipeline process flow after initial setup.

**Goal:**
Provide a user-friendly interface for reordering stages within a specific pipeline. The backend must support updating the `order` property for multiple stages in a way that maintains unique order values.

**Resolution Note:** This task is now obsolete. Reordering of process steps is handled by the WFM system (specifically reordering `WFMWorkflowStep`s within a `WFMWorkflow`), and the UI for this is covered in the WFM Admin section (see ADR-006, Section 4.3, Sprint 1.3, which notes this as DONE).

**Key Requirements:**
*   **Frontend UI:** (Obsolete)
*   **Backend API (GraphQL):** (Obsolete)
*   **Backend Service (`stageService.ts`):** (Obsolete)

**Acceptance Criteria:** (Obsolete)

**Notes/Considerations:** (Obsolete)

---

## Task: Implement Pipeline and Stage Archiving Functionality

**ID:** ARCH-001
**Status:** Obsolete
**Priority:** Low-Medium
**Reporter:** User Request / System (AI Assistant)
**Assignee:** TBD

**Summary:**
Users may want to hide old or unused pipelines and stages from their primary views without permanently deleting them and losing associated historical data (like deals that once belonged to those pipelines/stages). Archiving provides a soft-delete mechanism.

**Goal:**
Allow users to archive and unarchive pipelines and stages. Archived items should typically be hidden from default lists and selectors but remain in the database for historical reference and potential unarchival.

**Resolution Note:** This task, as it pertains to the legacy Pipeline/Stage system, is now obsolete. Archiving functionality for WFM entities (e.g., `WFMWorkflow`, `WFMStatus`, `WFMProjectType`) is covered by the WFM system design (see ADR-006, which includes `is_archived` flags in schema and mentions Admin UI for archiving WFMWorkflows in Sprint 1.2 - COMPLETED).

**Key Requirements:** (Obsolete)

**Acceptance Criteria:** (Obsolete)

**Notes/Considerations:** (Obsolete)

--- 

## Task: Kanban View UX Enhancements (Quick Add & Stage Summaries)

**ID:** KANBAN-UX-001
**Status:** To Do
**Priority:** Medium
**Reporter:** System (Derived from Kanban Plan Non-Goals)
**Assignee:** TBD

**Summary:**
Enhance the Deals Kanban view by adding the ability to quickly create new deals directly from the Kanban interface and by displaying summary information (e.g., total deal amount, deal count) for each stage column.

**Goal:**
Improve the efficiency and informational value of the Kanban view, making it a more comprehensive tool for deal management.

**Key Requirements:**
*   **Quick Deal Creation:**
    *   Provide a UI mechanism (e.g., a "+" button on each stage column or a general "Add Deal" button within the Kanban view) to initiate new deal creation.
    *   If initiated from a specific stage, that stage (and the current pipeline) should be pre-selected in the deal creation form.
*   **Stage Summaries:**
    *   Display configurable summary metrics at the top or bottom of each stage column (e.g., total value of deals in the stage, count of deals).
    *   These summaries should update dynamically as deals are added, removed, or moved between stages, or when deal values change.

**Acceptance Criteria:**
*   Users can create a new deal directly from the Kanban view.
*   The process of creating a deal from Kanban is intuitive and pre-fills relevant context like pipeline and stage if applicable.
*   Each stage column on the Kanban board displays a summary of its contained deals (e.g., total amount and/or count).
*   Stage summary data is accurate and updates in real-time in response to deal movements, additions, or value changes affecting that stage.
*   The performance of the Kanban view remains acceptable with these additions.

---

## Task: Real-Time Collaborative Updates for Kanban View

**ID:** KANBAN-RT-001
**Status:** To Do
**Priority:** Medium
**Reporter:** System (Derived from Kanban Plan Non-Goals)
**Assignee:** TBD

**Summary:**
Implement real-time updates for the Deals Kanban view to ensure that changes made by one user (e.g., dragging deals, adding new deals) are automatically reflected on the boards of other users viewing the same pipeline, without requiring manual page refreshes.

**Goal:**
Enable seamless collaboration for teams using the Kanban board, providing a live and synchronized view of deal progression.

**Key Requirements:**
*   Utilize a suitable real-time communication technology (e.g., WebSockets, Supabase Realtime).
*   Broadcast relevant deal events (creation, stage change, updates to critical fields displayed on cards) to connected clients viewing the same pipeline's Kanban.
*   Frontend should listen for these events and update the Kanban board UI dynamically.
*   Consider optimistic updates on the client initiating the change, followed by reconciliation with server-sent events.

**Acceptance Criteria:**
*   When User A moves a deal card to a new stage on the Kanban board for Pipeline X, User B (also viewing Pipeline X Kanban) sees the deal card move to the new stage automatically and in near real-time.
*   When User A adds a new deal that appears on Pipeline X Kanban, User B sees the new deal card appear automatically.
*   If deal card information (e.g., name, amount) is updated and reflected on the card, these updates are also synchronized in real-time.
*   The solution is robust and handles connection issues or event ordering appropriately.
*   Performance of the Kanban view is not significantly degraded by the real-time update mechanism.

--- 

## Task: Implement Deal "Rotten" Indicators & Automation

**ID:** FEATURE-001
**Status:** To Do
**Priority:** Medium
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Provide visual cues for deals that have been inactive (e.g., no new activities, notes, or stage changes) for a configurable period. Optionally, allow automation for follow-up tasks or notifications for such deals.

**Goal:**
Help sales users identify and prioritize stale or neglected deals to prevent opportunities from being lost due to lack of follow-up.

**Key Requirements/Acceptance Criteria:**
*   System administrators can configure the "rotten" period (e.g., X days of inactivity).
*   Deals exceeding this inactivity threshold are visually highlighted in list and Kanban views.
*   (Optional) A background process identifies rotten deals.
*   (Optional) Users can be notified or tasks can be automatically created for rotten deals.
*   Inactivity considers linked activities, notes, and deal field updates.

---

## Task: Implement Product/Service Linking to Deals

**ID:** FEATURE-002
**Status:** To Do
**Priority:** High
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Allow users to define a catalog of products and services (with names, SKUs, prices, descriptions) and associate these items (including quantity and individual price overrides) to specific deals.

**Goal:**
Enable detailed tracking of what is being sold, improve sales forecasting accuracy, and facilitate reporting on product/service performance.

**Key Requirements/Acceptance Criteria:**
*   New database tables for `products` and `deal_products` (line items).
*   UI for managing the product catalog (CRUD operations for products).
*   UI on the Deal form/page to add/edit/remove products/services to a deal, specifying quantity and price.
*   Deal total amount can be automatically calculated from line items or manually entered.
*   GraphQL schema, resolvers, and services for products and deal line items.
*   Reports can be generated based on products sold.

---

## Task: Implement Advanced Filtering & Saved Views

**ID:** FEATURE-003
**Status:** To Do
**Priority:** High
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Provide a UI for users to build complex, multi-condition filters for list views (Deals, People, Organizations, Activities) and allow them to save these filter sets as named "views" for quick reuse.

**Goal:**
Empower users to segment and analyze their data more effectively, improving workflow efficiency and data discoverability.

**Key Requirements/Acceptance Criteria:**
*   UI component for constructing filters (e.g., field + operator + value, AND/OR conditions).
*   Applicable to all major list views (Deals, People, Orgs, Activities).
*   Users can save a set of applied filters as a named view (e.g., "My Hot Deals Q4").
*   Users can select and apply their saved views.
*   Views can be private to the user or potentially shared (future enhancement).
*   Backend support for dynamic query generation based on filter criteria.

---

## Task: Implement User-Definable Custom Fields

**ID:** FEATURE-004
**Status:** Almost done
**Priority:** High
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Allow administrators to create and configure custom data fields for standard entities (Deals, People, Organizations, potentially Activities). Supported field types should include text, number, date, dropdown, checkbox.

**Goal:**
Enable tailoring the CRM to specific business needs by capturing unique data points not covered by standard fields.

**Key Requirements/Acceptance Criteria:**
*   Admin UI for defining custom fields (name, type, target entity, options for dropdowns).
*   Database schema to store custom field definitions and their values (e.g., EAV pattern or JSONB columns).
*   Custom fields appear on the relevant entity's create/edit forms and detail views.
*   Custom fields can be included in list view columns and used in filtering (requires FEATURE-003).
*   GraphQL schema dynamically incorporates custom fields or provides a generic way to query/mutate them.

---

## Task: Implement Comprehensive Contact Timeline View

**ID:** FEATURE-005
**Status:** To Do
**Priority:** Medium
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
For Person and Organization detail views, display a chronological, aggregated timeline of all associated interactions and significant events.

**Goal:**
Provide a holistic view of the relationship history with a contact, making it easy to understand past interactions and prepare for future ones.

**Key Requirements/Acceptance Criteria:**
*   Timeline displays items like: completed activities (calls, meetings, tasks), notes, deal associations/stage changes, logged emails (if FEATURE-008 is implemented).
*   Items are sorted chronologically.
*   Users can filter the timeline by activity type (e.g., show only notes and emails).
*   Each timeline entry provides key details and a link to the source object if applicable.
*   Implemented on Person and Organization detail pages/views.

---

## Task: Implement Calendar View for Activities

**ID:** FEATURE-006
**Status:** To Do
**Priority:** Medium
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Provide a visual calendar interface (day, week, month views) for managing user activities (tasks, meetings, calls, emails with due dates).

**Goal:**
Offer users a more intuitive way to visualize their schedule, manage time-sensitive tasks, and plan their work.

**Key Requirements/Acceptance Criteria:**
*   Calendar displays activities based on their due dates.
*   Users can switch between day, week, and month views.
*   Users can create new activities by clicking on the calendar.
*   Users can drag and drop activities to reschedule them (updates due date).
*   Clicking an activity on the calendar shows its details or opens an edit modal.
*   Filtering options (e.g., by activity type, completion status).

---

## Task: Implement Proactive Activity Reminders & Notifications

**ID:** FEATURE-007
**Status:** To Do
**Priority:** Medium
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Implement a system for users to receive proactive reminders for upcoming or overdue activities. Also, establish a general in-app notification center for important system events or mentions.

**Goal:**
Help users stay on top of their tasks, reduce missed deadlines, and improve overall engagement with the CRM.

**Key Requirements/Acceptance Criteria:**
*   Users can configure reminder preferences (e.g., X minutes/hours before due date).
*   Reminders can be delivered via in-app notifications and optionally email.
*   An in-app notification center aggregates unread notifications.
*   Background jobs (e.g., Inngest) to check for upcoming activities and trigger reminders.

---

## Task: Implement Full Email Integration

**ID:** FEATURE-008
**Status:** To Do
**Priority:** High
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Enable deeper email integration, including BCC-to-CRM for logging correspondence, optional email inbox synchronization for selected users, and the ability to compose and send emails directly from within the CRM, automatically linking them to relevant records.

**Goal:**
Centralize customer communication, ensure all interactions are captured, and streamline sales workflows by reducing the need to switch between CRM and email client.

**Key Requirements/Acceptance Criteria:**
*   **BCC-to-CRM:** A unique CRM email address allows users to BCC emails, which are then parsed and automatically linked to matching contacts/deals.
*   **Send Email from App:** UI for composing and sending emails. Emails sent are logged as activities and linked. Templates support.
*   **(Optional) Email Sync:** Users can connect their email accounts (IMAP/OAuth) to sync incoming/outgoing emails with CRM records.
*   Emails are displayed in the Contact Timeline (FEATURE-005).

---

## Task: Implement "Leads" Entity & Management Workflow

**ID:** FEATURE-009
**Status:** To Do
**Priority:** High
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Introduce a "Leads" entity to manage unqualified prospects separately from Deals and verified Contacts (People/Organizations). Include a dedicated lead inbox/list and a process for converting leads.

**Goal:**
Streamline the top-of-funnel process, allowing sales teams to qualify prospects before cluttering the main contact and deal databases.

**Key Requirements/Acceptance Criteria:**
*   New `leads` database table and associated GraphQL types, resolvers, services.
*   UI for managing leads (list view, create/edit forms, lead status).
*   Process/UI for converting a qualified lead into a Person, Organization, and/or Deal.
*   Leads can be assigned to users.
*   Basic reporting on lead sources and conversion rates.

---

## Task: Implement Web Forms for Lead Capture

**ID:** FEATURE-010
**Status:** To Do
**Priority:** Medium
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Allow users (likely admins) to create simple web forms that can be embedded on external websites. Submissions to these forms should create new records in the CRM (e.g., as Leads under FEATURE-009, or directly as People/Deals).

**Goal:**
Automate lead generation from websites, ensuring new inquiries are captured directly and efficiently into the CRM.

**Key Requirements/Acceptance Criteria:**
*   UI for designing forms (selecting fields to include, basic styling).
*   Generated embed code (e.g., iframe or JavaScript snippet).
*   Backend endpoint to receive form submissions securely.
*   Configurable mapping of form fields to CRM entity fields.
*   New submissions create appropriate records and can trigger notifications.

---

## Task: Implement Sales Dashboard & Customizable Reporting

**ID:** FEATURE-011
**Status:** To Do
**Priority:** High
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Develop a configurable sales dashboard displaying key performance indicators (KPIs), charts (e.g., sales pipeline, deal conversion rates, activity summaries), and leaderboards. Also, create a module for users to build and save custom reports.

**Goal:**
Provide actionable insights into sales performance, team activity, and pipeline health, enabling data-driven decision-making.

**Key Requirements/Acceptance Criteria:**
*   **Dashboard:**
    *   Dedicated dashboard page.
    *   Configurable widgets for different metrics (e.g., deals won, revenue, activities completed, pipeline overview).
    *   Date range filters for dashboard data.
*   **Reporting Module:**
    *   UI for selecting data sources (Deals, Activities, etc.), fields, filters, groupings, and chart types.
    *   Ability to save and schedule reports.
    *   Export reports (e.g., CSV, PDF).

---

## Task: Implement User-Configurable Workflow Automation Engine

**ID:** FEATURE-012
**Status:** To Do
**Priority:** Low (High complexity, consider after core features)
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Create a system where users (likely admins or power users) can define simple automation rules based on triggers and actions (e.g., "IF a Deal's stage changes to 'Won', THEN send a thank you email and create a follow-up task for account management").

**Goal:**
Automate repetitive tasks, enforce business processes, and improve efficiency without requiring custom code for every workflow.

**Key Requirements/Acceptance Criteria:**
*   UI for defining workflows: trigger (e.g., "Deal Created," "Activity Updated"), conditions (e.g., "Deal Amount > $1000"), actions (e.g., "Create Activity," "Send Email," "Update Field").
*   Backend engine to execute these workflows (likely leveraging Inngest for asynchronous actions).
*   Logging and monitoring of workflow executions.
*   Initial set of supported triggers, conditions, and actions, extensible over time.

---

## Task: Implement UI for User Role & Team Management

**ID:** FEATURE-013
**Status:** To Do
**Priority:** Medium
**Reporter:** System (GAP Analysis)
**Assignee:** TBD

**Summary:**
Provide an admin interface for managing user access by assigning existing RBAC roles (e.g., "Sales Rep," "Manager") to users. Potentially, allow grouping users into sales teams for reporting and record visibility purposes.

**Goal:**
Enable administrators to easily manage user permissions and team structures within the application, aligning with the defined RBAC policies.

**Key Requirements/Acceptance Criteria:**
*   Admin UI to list users and their current roles.
*   Ability for admins to assign/unassign roles to users.
*   (Optional) UI for creating and managing teams, and assigning users to teams.
*   (Optional) Record visibility and reporting can be filtered by team.
*   Changes are reflected in user permissions and access.

--- 

## Task: Implement Labels/Tagging System

**ID:** TAGS-001
**Status:** To Do
**Priority:** Medium
**Reporter:** User Request / System (AI Assistant)
**Assignee:** TBD

**Summary:**
Implement a system allowing users to add free-form labels or tags to core entities (e.g., Deals, People, Organizations). These tags will provide a flexible, ad-hoc way for users to categorize records, flag items, and improve filterability beyond standard and custom fields.

**Goal:**
Enable users to create and apply multiple text-based tags to records. The system should support filtering records based on these tags.

**Key Requirements:**
*   **User Interface (UI):**
    *   On entity detail pages/forms, an input field to add new tags or select from existing tags (with autocomplete suggestions).
    *   Display applied tags clearly on the record (e.g., as pills/lozenges).
    *   Ability to remove tags from a record.
*   **Backend Implementation:**
    *   **Storage:** Choose a storage mechanism for tags and their associations with entities. Options:
        1.  Central `tags` table (`tag_id`, `tag_name`) and join tables (e.g., `deal_tags` with `deal_id`, `tag_id`). (Often preferred for querying).
        2.  A `TEXT[]` (array of text) column on each entity table that supports tags, with GIN indexing for efficient searching.
    *   **API (GraphQL):**
        *   Mutations to add/remove tags from an entity.
        *   Extend entity types (Deal, Person, etc.) to expose their associated `tags: [String!]!` or `tags: [Tag!]!`.
        *   Update query resolvers to allow filtering by tags (e.g., `deals(tags_include_any: ["urgent", "Q1"], tags_include_all: ["new-lead"])`).
*   **Functionality:**
    *   Tags should be case-insensitive for creation/matching (e.g., "Urgent" and "urgent" are the same tag) but preserve original casing for display if desired.
    *   Users should be able to filter lists of entities by one or more tags.

**Relationship to Custom Fields:**
*   This feature is distinct from the administrator-defined Custom Fields system.
*   Labels/Tags are user-driven and semi-structured, while Custom Fields are admin-defined and structured (typed).
*   It is recommended to implement this after the core Custom Fields functionality is in place.

**Acceptance Criteria:**
*   Users can add multiple tags to Deals, People, and Organizations.
*   Users can remove tags from these entities.
*   The system suggests existing tags as users type.
*   Tags are displayed on the entity records.
*   Users can filter entity list views by one or more tags (e.g., show all Deals tagged 'Urgent' AND 'Demo Scheduled').
*   The implementation is performant for adding, removing, and filtering tags.

--- 