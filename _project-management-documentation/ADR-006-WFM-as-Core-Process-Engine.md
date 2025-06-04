# Architecture Decision Record (ADR-006): WFM as Core Process Engine

**Status:** Adopted & Revised | **Date:** 2025-05-28 (Revised 2024-07-31)

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

This phase will occur after the core WFM is implemented and stable. The goal is to transition the existing Sales Pipeline functionality to be powered by the WFM system.

1.  **Prerequisites & WFM Configuration for Sales:**
    *   **DONE:** Verify WFM Stability: Confirm all Phase 1 WFM components (DB, API, Admin UIs) are stable.
    *   **DONE:** Analyze Existing Sales `stages`: Query the `public.stages` table to understand current stage names, typical order, probabilities, and types (OPEN, WON, LOST).
    *   **DONE:** Create Global `WFMStatus` Records: Using the WFM Admin UI, create `WFMStatus` entries for each distinct sales stage (e.g., "Lead", "Qualification", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost").
    *   **DONE:** Define "Sales" `WFMWorkflow`(s):
        *   Using the WFM Admin UI, create `WFMWorkflow`(s) (e.g., "Standard Sales Process").
        *   Within each workflow, add `WFMWorkflowSteps` using the created `WFMStatus` records, define `stepOrder`, `isInitialStep`, `isFinalStep` flags.
        *   Populate `WFMWorkflowStep.metadata` for sales-specific attributes (e.g., `{"deal_probability": 0.25}`, `{"outcome_type": "WON"}`). (Initial population done, UI for easy editing is **DONE**).
        *   Define all necessary `WFMWorkflowTransitions` between these steps.
    *   **DONE:** Define "Sales Deal" `WFMProjectType`: Using the WFM Admin UI, create a `WFMProjectType` (e.g., "Sales Deal") and assign the relevant "Sales Workflow" as its default.

2.  **Database Schema Changes:**
    *   **DONE:** Create `wfm_projects` Table: This table will store instances of WFM-managed processes.
        *   Key columns: `id` (PK), `project_type_id` (FK to `project_types`), `workflow_id` (FK to `workflows`), `current_step_id` (FK to `workflow_steps`), `name`, `created_at`, `updated_at`.
        *   Implement RLS (initially service role, future user-based if needed).
    *   **DONE:** Add `wfm_project_id` to `deals` Table: Add a nullable FK column `wfm_project_id` to `public.deals` referencing `public.wfm_projects(id)`.
    *   **DONE:** Apply Migrations: Create and run Supabase migration scripts for these schema changes.

3.  **Backend: API & Service Layer Refactoring:**
    *   **DONE:** Create `WFMProjectService` (`lib/wfmProjectService.ts`):
        *   Implement functions:
            *   `createWFMProject(input: { projectTypeId: string, workflowId: string, name: string, initialStepId?: string, description?: string, createdByUserId?: string }, context: Context): Promise<WFMProject>`
            *   `getWFMProjectById(id: string, context: Context): Promise<WFMProject | null>`
            *   `updateWFMProjectStep(projectId: string, targetStepId: string, userId: string, context: Context): Promise<WFMProject>` (This service will be responsible for updating `wfm_projects.current_step_id`).
    *   **DONE:** Refactor `DealService` (primarily in `lib/dealService/dealCrud.ts` and `lib/dealService/dealProbability.ts`):
        *   Modify **`createDealInternal`** (in `dealCrud.ts`):
            *   After successfully creating a `Deal` record:
                *   Fetch the "Sales Deal" `WFMProjectType` to get its `defaultWorkflowId`.
                *   Fetch the default `WFMWorkflow` to find its `isInitialStep` `WFMWorkflowStep`.
                *   Call `wfmProjectService.createWFMProject` to create a linked WFM project, passing the deal's name, project type ID, workflow ID, initial step ID, and user ID.
                *   Update the newly created `Deal` record with the `wfm_project_id` from the created WFM project.
                *   **Cease populating `deals.stage_id`**. The deal's stage/status will be derived from the linked WFM project's current step.
        *   Modify **`updateDealInternal`** (in `dealCrud.ts`):
            *   This function **must no longer accept or process `stage_id` or `pipeline_id` for deal progression**. It should focus on updates to core `Deal` attributes (e.g., `name`, `amount`, `customFields`).
            *   If `stage_id` or `pipeline_id` are passed, they should be ignored, or a warning logged, to enforce the new progression mechanism.
        *   Refactor **`calculateDealProbabilityFields`** (in `dealProbability.ts`):
            *   **DONE:** This function (or a new complementary function) will need to operate based on WFM data.
            *   **DONE:** It should take a `targetWfmWorkflowStep: WFMWorkflowStep` (which includes its `metadata` like `deal_probability` and `outcome_type`) as input, instead of relying on `dealUpdateInput.stage_id` to fetch from the `stages` table.
            *   **DONE:** When determining `oldDealData`'s probability context, it must fetch the linked `WFMProject`, its `current_step_id`, and that step's `metadata`.
    *   **DONE (Schema updated, deprecation directive TODO):** GraphQL Schema Changes (`netlify/functions/graphql/schema/`):
        *   In `deal.graphql`:
            *   Add `wfmProject: WFMProject`, `currentWfmStep: WFMWorkflowStep`, `currentWfmStatus: WFMStatus` to the `Deal` type.
            *   Mark `pipeline_id`, `pipeline`, `stage_id`, `stage` fields as `@deprecated`. (**TODO:** Add actual `@deprecated` directives).
        *   Create `wfm_project.graphql` (or similar) defining the `WFMProject` type (if not already covered by WFM definitions, likely just needs to ensure it's resolvable).
        *   Extend `Mutation` type with `updateDealWFMProgress(dealId: ID!, targetWfmWorkflowStepId: ID!): Deal!`.
    *   **DONE:** Implement/Update GraphQL Resolvers (`netlify/functions/graphql/resolvers/`):
        *   In `deal.ts`:
            *   Add resolvers for `Deal.wfmProject`, `Deal.currentWfmStep`, `Deal.currentWfmStatus` using `deal.wfm_project_id` to fetch data via services.
            *   **DONE (Implicit):** The `Deal.weighted_amount` field resolver was simplified to directly pass through the value from its parent (the `Query.deal` or `Mutation.updateDeal` resolver), as the backend service layer already correctly calculates and stores this value.
            *   The resolver for `Mutation.updateDeal` should no longer pass `stage_id` or `pipeline_id` from `args.input` to the underlying service for progression.
        *   Implement the resolver for **`Mutation.updateDealWFMProgress`**:
            1.  Fetch the `Deal` to get `deal.wfm_project_id`. If no project, handle error (deal not set up for WFM).
            2.  Fetch the `WFMProject` using `wfm_project_id` to get its `workflow_id` and `current_step_id`.
            3.  Call `wfmWorkflowService.validateTransition(workflow_id, current_step_id, args.targetWfmWorkflowStepId, context)` (ensure this validation function exists and is robust in `wfmWorkflowService`).
            4.  If valid, call `wfmProjectService.updateWFMProjectStep(wfm_project_id, args.targetWfmWorkflowStepId, userId, context)`.
            5.  Fetch the updated `WFMWorkflowStep` (the `targetWfmWorkflowStepId`).
            6.  Call the refactored `calculateDealProbabilityFields` (passing the target WFM step's data including metadata) to get new probability/weighted amount.
            7.  Update `deals.deal_specific_probability` and `deals.weighted_amount` based on the calculation.
            8.  Return the updated `Deal`.
    *   **DONE:** Run Codegen: Update generated GraphQL types (`npm run codegen`).

4.  **Frontend: UI Refactoring:**
    *   **Deal Kanban Board:**
        *   **DONE:** Columns: Fetch `WFMWorkflowSteps` from the "Sales Deal" `WFMProjectType`'s default `WFMWorkflow`.
        *   **DONE:** Card Rendering: Use `Deal.currentWfmStep.id` (or status ID) for column placement.
        *   **DONE:** Drag-and-Drop: Call `updateDealWFMProgress` mutation.
        *   **TODO:** Adapt display of `deal_probability` on Deal Cards based on `Deal.deal_specific_probability` (which is influenced by `WFMWorkflowStep.metadata` or manual override).
    *   **Deal Detail Page/View:**
        *   **TODO:** Refactor the existing Deal Detail page/view.
            *   Display `Deal.currentWfmStatus.name` prominently as the current stage.
            *   Display `Deal.deal_specific_probability` (e.g., as a percentage) and `Deal.weighted_amount`. (**Note:** The issue where `weighted_amount` showed "N/A" when `deal_specific_probability` was null has been **RESOLVED**. The backend service correctly calculates and stores it, and the GraphQL resolver chain ensures this value is passed to the frontend.)
            *   Provide a mechanism to manually override `Deal.deal_specific_probability` if business rules allow (this may require a new mutation or an extension to `updateDeal`).
            *   Implement UI elements (e.g., buttons like "Move to Next Step: [Step Name]" or a dropdown of valid next steps) to trigger `updateDealWFMProgress`. These elements must only show valid transitions based on `wfmWorkflowService.getAllowedTransitions(workflowId, currentStepId)`.
            *   Ensure all other existing deal information (e.g., amount, contacts, company, custom field values, activities) remains visible and editable as appropriate.
            *   Remove any UI elements related to the old `pipeline_id` or `stage_id` selection for progression.
    *   **Deal Create/Edit Modals:**
        *   **DONE:** Remove old `Pipeline`/`Stage` selectors.
        *   **DONE:** New deals automatically use default WFM setup for "Sales Deal" `ProjectType` (via `wfmProjectTypeId` passed in `createDeal` mutation).
        *   **TODO:** The "Edit Deal" modal should also reflect WFM status and not allow direct stage editing (progression only via WFM actions, potentially on Detail Page or Kanban). Core deal attributes (name, amount) remain editable.
    *   **Deal List Views:**
        *   **DONE:** Update table columns to show `Deal.currentWfmStatus.name` instead of the old stage.
        *   **TODO:** Update filtering and sorting options to use `Deal.currentWfmStatus.name` or other WFM-derived fields.

5.  **Testing & Validation:**
    *   **IN PROGRESS:** Conduct comprehensive backend (unit, integration) and frontend (E2E) testing.
    *   **TODO:** Perform post-migration data validation and User Acceptance Testing (UAT) (relevant once data migration is performed in a future phase, but general UAT for new functionality is ongoing).

6.  **Deprecation & Cleanup (Post-Rollout & Stabilization):**
    *   **TODO:** After a stability period, add `@deprecated` directives to GraphQL fields (`Deal.pipeline_id`, etc.).
    *   **TODO:** Remove old database columns (`deals.pipeline_id`, `deals.stage_id`).
    *   **TODO:** Archive and then delete old `public.pipelines` and `public.stages` tables.
    *   **TODO:** Clean up unused code related to the old system.

### 4.3. Phase 3: Lead Management Integration with WFM (COMPLETED)

Following the successful integration of deals with the WFM system, lead management has been implemented to leverage the same WFM infrastructure, providing a consistent process management approach across the CRM.

#### 4.3.1. Lead-Specific WFM Configuration

**COMPLETED:** Lead Qualification Workflow Definition
*   **Lead Qualification Statuses**: Created global `WFMStatus` records for lead-specific stages:
    *   "New Lead" (initial step)
    *   "Initial Contact"
    *   "Follow Up"
    *   "Qualifying"
    *   "Qualified Lead"
    *   "Converted" (final step)
    *   "Disqualified" (final step)
    *   "Nurturing"

*   **Lead Qualification Workflow**: Defined "Lead Qualification and Conversion Process" `WFMWorkflow`
    *   Configured `WFMWorkflowSteps` with appropriate order and flags
    *   Populated `metadata` for lead-specific attributes (e.g., `lead_score_threshold`, `qualification_required`, `stage_name`)
    *   Established `WFMWorkflowTransitions` between all valid step combinations

*   **Lead Project Type**: Created "Lead Qualification and Conversion Process" `WFMProjectType`
    *   Assigned lead qualification workflow as default
    *   Configured with appropriate icon and description

#### 4.3.2. Lead Database Schema Implementation

**COMPLETED:** Lead Management Tables
*   **`leads` Table**: Core lead entity with comprehensive tracking:
    *   Standard fields: `id`, `name`, `source`, `description`, `contact_*` fields
    *   Qualification tracking: `is_qualified`, `qualification_notes`, `qualified_at`
    *   Scoring system: `lead_score`, `lead_score_factors`, `ai_insights`
    *   Assignment: `assigned_to_user_id`, `assigned_at`
    *   Conversion tracking: `converted_at`, `converted_to_*` fields
    *   **WFM Integration**: `wfm_project_id` FK to `wfm_projects(id)`
    *   **Custom Fields**: `custom_field_values` JSONB column

*   **RLS Policies**: Implemented comprehensive row-level security following deal patterns
*   **Performance Indexes**: Created optimized indexes for lead queries and filtering
*   **Custom Fields Support**: Full integration with existing custom fields system

#### 4.3.3. Lead Service Layer Implementation

**COMPLETED:** Lead Service Architecture
*   **`lib/leadService/`** directory structure following `dealService` patterns:
    *   `leadCrud.ts` - Core CRUD operations with WFM integration
    *   `leadScoring.ts` - AI-powered lead scoring engine
    *   `leadConversion.ts` - Lead-to-entity conversion workflows
    *   `leadQualification.ts` - AI-powered qualification logic

*   **WFM Project Creation**: Automatic WFM project initialization during lead creation
*   **Lead Scoring Engine**: Advanced scoring with demographic, behavioral, and AI factors
*   **Conversion Workflows**: Seamless lead conversion to deals/contacts/organizations

#### 4.3.4. Lead GraphQL API Implementation

**COMPLETED:** GraphQL Schema and Resolvers
*   **Schema Definition**: Complete `lead.graphql` with all entity relationships
*   **Resolvers**: Full resolver implementation following deal patterns
*   **WFM Integration**: Lead resolvers include WFM status and project data
*   **Mutations**: Complete set including `updateLeadWFMProgress` for workflow progression

#### 4.3.5. Lead Frontend Implementation

**COMPLETED:** UI Components and Views
*   **Lead Management Pages**: Complete table and kanban views
*   **Kanban Board**: WFM-driven columns with drag-and-drop progression
*   **Lead Cards**: Rich display of lead information and status
*   **Modals**: Create/edit lead modals with custom fields support
*   **Detail Page**: Comprehensive lead detail view with activities and conversion options

#### 4.3.6. AI Agent Integration

**COMPLETED:** Lead-Specific AI Tools
*   **6 Specialized Tools**: search_leads, get_lead_details, create_lead, qualify_lead, convert_lead, update_lead_score
*   **Custom Fields Democratization**: AI can create custom fields for leads on-demand
*   **Sequential Workflows**: Multi-step lead qualification and conversion processes
*   **Intelligence Engine**: AI-powered lead scoring and qualification recommendations

#### 4.3.7. Lead Management Benefits from WFM

The integration of leads with the WFM system provides:

*   **Consistent Process Management**: Same workflow engine for leads and deals
*   **Configurable Qualification Stages**: Easily modify lead progression steps
*   **Transition Validation**: Enforced workflow transitions prevent invalid state changes
*   **Extensibility**: Can easily add new lead types or qualification processes
*   **Reporting Consistency**: Unified reporting across all WFM-managed processes
*   **AI Integration**: WFM metadata enables intelligent automation and scoring

This implementation demonstrates the strategic value of WFM as the core process engine, successfully extending beyond deals to encompass complete lead lifecycle management with advanced AI capabilities.

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
            *   **DONE:** Implement UI for editing `workflow_transitions` (e.g., changing the transition name).
            *   **DONE:** Enhance `WorkflowStepForm` (or a dedicated section in `EditWorkflowStepsModal`) to allow admins to easily configure sales-specific metadata like `deal_probability` and `outcome_type` (e.g. WON, LOST, OPEN) when a step is part of a "Sales" workflow or used by "Sales Deal" project type. This makes setting up sales processes more intuitive.
            *   **DONE:** Implement "Save" functionality for all step/transition changes (Step order saving is DONE. Saving for transitions is handled by individual create/delete/update actions. This item is now considered complete).
    *   **Sprint 1.4 (Project Board & Enforcement):**
        *   **TODO:** Develop initial `ProjectBoard.tsx` (rendering based on workflow, basic drag-drop) - *Note: This overlaps with Sales Kanban refactor and can be considered partially done for Sales. A generic project board is still TODO.*
        *   **TODO:** Implement `updateProjectStatus` (or similar) mutation with workflow transition enforcement for generic WFM Projects.
2.  **Phase 2: Sales Pipeline Refactor (Details in Section 4.2):**
    *   **IN PROGRESS** (significant portions DONE as detailed in section 4.2)
3.  **Ongoing:** Continue with other WFM features as per `feature_enterprise_task_workflow_system_plan.md` (Comments, History, etc.), which will now benefit all modules using WFM.

## 5. Risks

*   **Greenfield Development Alignment:** Ensuring new WFM components integrate smoothly with existing application structures and that assumptions are validated.
*   **Refactoring Complexity (Future Phase):** Modifying existing Sales Pipeline functionality carries risk.
*   **Data Migration Challenges (Future Phase):** Migrating live deal/stage data (Note: Data migration section removed for now as per request, but risk remains if/when it becomes necessary).
*   **Performance:** A highly generic WFM engine, if not optimized, could face challenges.
*   **User Experience (UX) for Sales (Future Phase):** Changes to Sales Pipeline UI will require user training.
*   **Scope Creep for WFM Core:** Defining "core" WFM vs. domain-specific layers is important.

## 6. Alternatives Considered

*   **Maintaining Separate Systems:** Continue developing Sales Pipelines and WFM independently.
    *   **Rejected because:** Leads to data/logic redundancy, missed opportunity for a unified process engine, and violates the "universal system" vision.
*   **WFM as a Lightweight Add-on:** WFM only for non-CRM tasks.
    *   **Rejected because:** Undersells the potential of a JIRA-like WFM and doesn't solve the consistency problem for sales processes.

This ADR supersedes previous informal discussions about the relationship between Sales Pipelines and the WFM, establishing the WFM as the foundational process engine to be built from scratch. 