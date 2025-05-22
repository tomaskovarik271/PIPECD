# Architecture Decision Record (ADR-006): WFM as Core Process Engine

**Status:** Adopted & Revised | **Date:** 2025-05-28 (Revised YYYY-MM-DD)

**Revision Note:** This ADR has been revised to reflect a "starting from scratch" approach for the WFM core components, incorporating learnings from the existing application's database patterns and RLS mechanisms. The strategic direction to establish WFM as the core process engine remains.

## 1. Context

The existing system development has included features for CRM (notably Sales Pipelines and Stages). A foundational Workflow Management System (WFM) intended to be generic and enterprise-wide (as envisioned in `feature_enterprise_task_workflow_system_plan.md`) is now being implemented from scratch. The WFM aims for JIRA-like configurability. Currently, Sales Pipelines/Stages represent a domain-specific process management feature.

The vision articulated in the original `ADR.md` is for a logically decomposed, extensible system. This ADR specifically addresses the strategic decision to elevate the WFM to be the central, underlying engine for all "flow-like" processes across different business domains, including the eventual refactoring of the existing Sales Pipeline functionality.

## 2. Decision

1.  **The Workflow Management System (WFM) will be established as the definitive core engine for managing all staged processes within the application.** This includes, but is not limited to, task management, issue tracking, project delivery, and CRM-related processes like sales deal progression. This involves building the WFM core components (database, API, UI) from the ground up.
2.  **Existing Sales Pipeline functionality (Pipelines, Stages, and their relation to Deals) will, in a later phase, be refactored to be built upon and leverage the core WFM.**
    *   **Mapping (Future Refactor):**
        *   `Deals` (as an entity) will be preserved. Each `Deal` will be tightly coupled with a WFM `Project` (e.g., of a specific `ProjectType` like "Sales Deal"). This WFM `Project` will utilize a "Sales Workflow."
        *   Sales "Stages" (e.g., "Lead," "Qualification," "Proposal") will be defined as global `Statuses` within the WFM.
        *   A sales "Pipeline" (e.g., "Standard Sales Process") will be configured as a `Workflow` within the WFM, composed of `Workflow Steps` that utilize the aforementioned sales-specific `Statuses`.
        *   The existing `pipelines` and `stages` tables will be deprecated, and their data migrated.
    *   Deal-specific attributes (e.g., value, probability, expected close date) will remain associated with the `Deal` entity or be managed via custom fields on the associated WFM `Project`. Option A (Deal associated with WFM Project) is preferred to retain Deal as a distinct CRM entity.
3.  Future "flow-like" processes for other business domains (HR, Operations, etc.) will also be implemented by configuring appropriate `Statuses`, `Workflows`, `Project Types`, and `Work Item Types` within the core WFM.

## 3. Rationale

*   **Universality & Consistency:** Aligns with the vision of a "universal system" by providing a single, consistent mechanism for defining and managing staged processes, similar to JIRA's flexibility.
*   **Reduced Redundancy:** Eliminates the need to build and maintain separate status/stage progression logic for different business domains.
*   **Enhanced Configurability:** Leverages the WFM's planned configurability (custom statuses, workflows, transitions, project types) for all process management needs.
*   **Modularity & Extensibility:** Reinforces the ADR's goal of a modular system. The WFM acts as a foundational service, and domain-specific modules (like CRM/Sales) become consumers or specialized layers on top of it.
*   **Focus on Core Strength:** Allows development to focus on making the WFM robust and feature-rich, benefiting all current and future modules that rely on it.
*   **Alignment with `feature_enterprise_task_workflow_system_plan.md`:** This decision makes the WFM plan central and critical to the overall system architecture.

## 4. Implications & Way Forward

This decision requires a clear plan for implementing the WFM core and, subsequently, refactoring Sales Pipeline functionality.

### 4.1. Core WFM Implementation Plan (From Scratch)

This phase focuses on building the foundational WFM components.

#### 4.1.1. Database Schema (Initial WFM Entities)

The following tables will be created, adhering to existing database patterns (UUID PKs, `created_at`/`updated_at` with triggers, RLS).

*   **`statuses`**: Stores global status definitions.
    *   `id`: UUID, PK
    *   `name`: TEXT, NOT NULL, UNIQUE
    *   `description`: TEXT, NULLABLE
    *   `color`: TEXT, NULLABLE (e.g., hex code for UI hints)
    *   `is_archived`: BOOLEAN, DEFAULT FALSE
    *   `created_at`, `updated_at`: TIMESTAMPTZ
    *   `created_by_user_id`, `updated_by_user_id`: UUID, FK to `auth.users` (for audit)
*   **`workflows`**: Stores workflow definitions.
    *   `id`: UUID, PK
    *   `name`: TEXT, NOT NULL, UNIQUE
    *   `description`: TEXT, NULLABLE
    *   `is_archived`: BOOLEAN, DEFAULT FALSE
    *   `created_at`, `updated_at`: TIMESTAMPTZ
    *   `created_by_user_id`, `updated_by_user_id`: UUID, FK to `auth.users` (for audit)
*   **`workflow_steps`**: Links statuses to workflows, defining order and properties.
    *   `id`: UUID, PK
    *   `workflow_id`: UUID, FK to `workflows.id`
    *   `status_id`: UUID, FK to `statuses.id`
    *   `step_order`: INTEGER, NOT NULL
    *   `is_initial_step`: BOOLEAN, DEFAULT FALSE
    *   `is_final_step`: BOOLEAN, DEFAULT FALSE
    *   `metadata`: JSONB, NULLABLE (for future extensibility, e.g., deal probability)
    *   `created_at`, `updated_at`: TIMESTAMPTZ
    *   Constraints: UNIQUE (`workflow_id`, `status_id`), UNIQUE (`workflow_id`, `step_order`)
*   **`workflow_transitions`**: Defines allowed movements between steps in a workflow.
    *   `id`: UUID, PK
    *   `workflow_id`: UUID, FK to `workflows.id`
    *   `from_step_id`: UUID, FK to `workflow_steps.id`
    *   `to_step_id`: UUID, FK to `workflow_steps.id`
    *   `name`: TEXT, NULLABLE (e.g., "Resolve", "Escalate" - action name for the transition)
    *   `created_at`, `updated_at`: TIMESTAMPTZ
    *   Constraint: UNIQUE (`workflow_id`, `from_step_id`, `to_step_id`)
*   **`project_types`**: Defines categories of projects, linking to a default workflow.
    *   `id`: UUID, PK
    *   `name`: TEXT, NOT NULL, UNIQUE
    *   `description`: TEXT, NULLABLE
    *   `default_workflow_id`: UUID, FK to `workflows.id` (NULLABLE, if a type can exist without a default)
    *   `icon_name`: TEXT, NULLABLE (for UI representation)
    *   `is_archived`: BOOLEAN, DEFAULT FALSE
    *   `created_at`, `updated_at`: TIMESTAMPTZ
    *   `created_by_user_id`, `updated_by_user_id`: UUID, FK to `auth.users` (for audit)
*   **(Future) `projects`**: Instances of `project_types`. Schema to be detailed later.
*   **(Future) `work_items`**: Tasks or items within `projects`. Schema to be detailed later.

#### 4.1.2. Row Level Security (RLS) for WFM Definitions
*   RLS will be enabled for all WFM tables.
*   For WFM definition tables (`statuses`, `workflows`, `workflow_steps`, `workflow_transitions`, `project_types`):
    *   CRUD operations will be restricted to users possessing a specific WFM admin permission (e.g., `wfm_definitions:manage`), checked via the existing `public.check_permission` function.
    *   All authenticated users will have `SELECT` (read) access to these definition tables to enable application functionality (e.g., displaying status lists, workflow options).
*   RLS for `projects` and `work_items` will be designed later, likely involving ownership, assignment, or team membership.

#### 4.1.3. GraphQL API and Resolvers
*   New GraphQL types, queries, and mutations will be created in `netlify/functions/graphql/` for WFM entities.
*   Resolvers will implement business logic, calling service functions.

#### 4.1.4. Service Layer (`/lib`)
*   New service files (e.g., `wfmStatusService.ts`, `wfmWorkflowService.ts`) will encapsulate logic for interacting with WFM tables.

#### 4.1.5. Admin User Interfaces (Frontend)
*   **Global Statuses Management:** UI for full CRUD operations on `statuses`.
*   **Workflows Management:** UI for CRUD on `workflows`.
*   **Workflow Steps & Transitions Editor:** UI to define `workflow_steps` within a workflow (order, initial/final flags) and manage `workflow_transitions` between these steps.
*   **Project Types Management:** UI for CRUD on `project_types`, including assigning a default workflow.

#### 4.1.6. Dynamic Project Board (`ProjectBoard.tsx`)
*   A new `ProjectBoard.tsx` component will be developed.
*   It will dynamically render columns based on the `workflow_steps` of a given project's assigned/effective workflow.
*   Status updates (e.g., via drag-and-drop) must query and respect defined `workflow_transitions`.

#### 4.1.7. Workflow Enforcement
*   A GraphQL mutation (e.g., `updateProjectStatus` or `updateWorkItemStatus`) will be implemented.
*   This mutation must rigorously enforce `workflow_transitions` before allowing a status change.

#### 4.1.8. Custom Fields for WFM Entities
*   When custom fields are extended to WFM entities (`Project Types`, `Work Item Types`), the `entity_type` ENUM in `public.custom_field_definitions` will be altered to include new values (e.g., `WFM_PROJECT_TYPE`, `WFM_WORK_ITEM_TYPE`).
*   Admin UI will be needed to manage custom field definitions for these WFM entity types.

### 4.2. Phase 2: Refactoring Sales Pipeline & Deal Management (Future)

This phase will occur after the core WFM is implemented and stable.

1.  **Status Migration/Creation:**
    *   Analyze existing sales `Stages`.
    *   Create corresponding global `Statuses` in the WFM (e.g., "Lead," "Qualified," "Proposal Sent," "Negotiation," "Closed Won," "Closed Lost") using the WFM Admin UI.
2.  **Sales Workflow Definition:**
    *   Define one or more "Sales Workflows" within WFM using the WFM Admin UI.
3.  **Deal Entity Adaptation (Option A Preferred):**
    *   Add a `wfm_project_id` FK to the `deals` table, linking to a `projects` record in WFM.
    *   When a `Deal` is created, a corresponding WFM `Project` (of `ProjectType` "Sales Deal") is automatically created.
    *   The `deals.stage_id` column will be deprecated.
4.  **UI Refactoring:**
    *   Adapt Sales Pipeline UI (deal board, list views) to fetch deal data along with its associated WFM `Project` status.
    *   Utilize or adapt the WFM `ProjectBoard.tsx` component.
5.  **Data Migration:**
    *   Develop a script to migrate existing `deals` and their `stage_id` values (from the current `stages` table) to the new WFM-based structure. Deprecate `pipelines` and `stages` tables.

### 4.3. Development Plan & Sequencing Priorities

1.  **Phase 1: Core WFM Foundational Implementation:**
    *   **Sprint 1.1 (DB & API Basics - COMPLETE for Definitions):**
        *   Implemented database schema (migrations) for `statuses`, `workflows`, `workflow_steps`, `workflow_transitions`, and `project_types`.
        *   Established RLS policies for these definition tables (admin-only CRUD, authenticated read).
        *   Added a database trigger function (`check_workflow_transition_steps`) for validating transitions.
        *   Created `wfm_definitions.graphql` schema with types, inputs, queries, and mutations for Statuses, Workflows, and Project Types.
        *   Updated main GraphQL schema loader (`netlify/functions/graphql.ts`) to include WFM definitions.
        *   Ran GraphQL codegen to generate TypeScript types.
        *   Created placeholder resolver files (e.g., `wfmStatus.ts`) using generated types and merged them into the main resolver map.
        *   Created placeholder service files (e.g., `wfmStatusService.ts`) using generated types, with basic Supabase query structures.
        *   Refined `GraphQLContext` to provide a request-scoped Supabase client (`supabaseClient`) to services, ensuring RLS is respected.
        *   **COMPLETED:** Implemented full CRUD logic and field resolvers in service and resolver layers for WFM definition entities (`WFMStatus`, `WFMWorkflow`, `WFMProjectType`).
    *   **Sprint 1.2 (Admin UIs for WFM Definitions - Part 1):**
        *   **COMPLETED:** Build Admin UI for `WFMStatus` (CRUD operations: List, Create, View, Update, Delete).
        *   **COMPLETED:** Build Admin UI for `WFMWorkflow` (CRUD operations: List, Create, View, Update, Archive/Unarchive - steps and transitions will be a separate, more complex editor).
    *   **Sprint 1.3 (Admin UIs for WFM Definitions - Part 2 & Workflow Editor):**
        *   **COMPLETED:** Build Admin UI for `WFMProjectType` (CRUD operations: List, Create, View, Update, Delete - including assigning a default workflow).
        *   **IN PROGRESS:** Develop advanced Workflow Editor UI (managing `workflow_steps` and `workflow_transitions` within a selected `WFMWorkflow`).
            *   **DONE:** Added modal (`EditWorkflowStepsModal`) to `WFMWorkflowsPage` for editing steps & transitions.
            *   **DONE:** Implemented fetching and display of existing steps and transitions for a selected workflow within the modal.
            *   **PARTIALLY DONE:** Implement UI for `workflow_steps` management:
                *   **DONE:** Reordering `workflow_steps` (backend logic and UI to trigger reorder).
                *   **IN PROGRESS:** Adding new `workflow_steps` (e.g., via `CreateWorkflowStepModal` - `stepOrder` field added, metadata for name/description handled).
                *   **DONE:** Editing existing `workflow_steps` (name via metadata, description via metadata, status, `isInitialStep`, and `isFinalStep` flags, using `EditWorkflowStepModal` and `WorkflowStepForm`).
                *   **DONE:** Deleting `workflow_steps` (frontend calls exist, backend implications verified).
            *   **DONE:** Implement UI for creating/deleting `workflow_transitions` between steps (Frontend UI, modals, and store actions `createWorkflowTransition` and `deleteWorkflowTransition` are implemented and functional).
            *   **TODO:** Implement UI for editing `workflow_transitions` (e.g., changing the transition name).
            *   **DONE:** Implement "Save" functionality for all step/transition changes (Step order saving is DONE. Saving for transitions is handled by individual create/delete/update actions. This item is now considered complete).
    *   **Sprint 1.4 (Project Board & Enforcement):**
        *   Develop initial `ProjectBoard.tsx` (rendering based on workflow, basic drag-drop).
        *   Implement `updateProjectStatus` (or similar) mutation with workflow transition enforcement.
2.  **Phase 2: Sales Pipeline Refactor (Details in Section 4.2):** To be planned after Phase 1 completion.
3.  **Ongoing:** Continue with other WFM features as per `feature_enterprise_task_workflow_system_plan.md` (Comments, History, etc.), which will now benefit all modules using WFM.

## 5. Risks

*   **Greenfield Development Alignment:** Ensuring new WFM components integrate smoothly with existing application structures and that assumptions are validated.
*   **Refactoring Complexity (Future Phase):** Modifying existing Sales Pipeline functionality carries risk.
*   **Data Migration Challenges (Future Phase):** Migrating live deal/stage data.
*   **Performance:** A highly generic WFM engine, if not optimized, could face challenges.
*   **User Experience (UX) for Sales (Future Phase):** Changes to Sales Pipeline UI will require user training.
*   **Scope Creep for WFM Core:** Defining "core" WFM vs. domain-specific layers is important.

## 6. Alternatives Considered

*   **Maintaining Separate Systems:** Continue developing Sales Pipelines and WFM independently.
    *   **Rejected because:** Leads to data/logic redundancy, missed opportunity for a unified process engine, and violates the "universal system" vision.
*   **WFM as a Lightweight Add-on:** WFM only for non-CRM tasks.
    *   **Rejected because:** Undersells the potential of a JIRA-like WFM and doesn't solve the consistency problem for sales processes.

This ADR supersedes previous informal discussions about the relationship between Sales Pipelines and the WFM, establishing the WFM as the foundational process engine to be built from scratch. 