# Project Roadmap V2 - Technical Backlog

**Date:** May 15, 2025
**Version:** 2.1
**Status:** Active Technical Backlog

**Purpose:** This document serves as the primary technical backlog for Project PipeCD. It tracks tasks related to improving the codebase's stability, maintainability, performance, test coverage, developer experience, and core technical infrastructure. Functional feature development beyond immediate bug fixes or core technical enablement is primarily tracked in `BACKLOG.md`.

## Overarching Goals (Technical Focus)
*   Achieve robust test coverage across all layers of the application.
*   Ensure the Role-Based Access Control (RBAC) system is secure, granular, and comprehensively tested.
*   Establish a fully automated CI/CD pipeline for consistent quality checks and deployments.
*   Significantly improve code quality, maintainability, and developer experience.
*   Resolve technical debt and enhance system performance and scalability.

---

## Phase 1: Critical Stability & Foundations (Target: Immediate & Ongoing)
*Focus: Immediately address critical gaps, implement high-priority technical debt items impacting stability and developer velocity, and establish essential CI/CD processes.*

### 1.1. Testing Infrastructure & Critical E2E Coverage
*   **Task:** `[ ]` Establish a testing environment/strategy for Netlify functions/GraphQL resolvers (e.g., using MSW, integration tests with a test DB utility).
    *   *Source: ROADMAP.md (Post-Refactor Plan #5), CIO Report (Gap)*
    *   *Priority: CRITICAL*
*   **Task:** `[ ]` Write E2E Test (Playwright): Deal CRUD (covering create, view, edit, delete, list).
    *   *Source: CIO Report (Gap in Phase 4 Testing)*
    *   *Priority: CRITICAL*
*   **Task:** `[ ]` Write E2E Test (Playwright): Organization CRUD (covering create, view, edit, delete, list).
    *   *Source: CIO Report (Gap in Phase 4 Testing)*
    *   *Priority: CRITICAL*
*   **Task:** `[ ]` Write E2E Test (Playwright): Pipeline CRUD.
    *   *Source: CIO Report (Gap in Phase 4 Testing)*
    *   *Priority: HIGH*
*   **Task:** `[ ]` Write E2E Test (Playwright): Stage CRUD (within a pipeline context).
    *   *Source: Derived from Pipeline E2E need*
    *   *Priority: HIGH*
*   **Task:** `[ ]` Write E2E Test (Playwright): Activity CRUD (covering create, view, edit, delete, list from ActivitiesPage).
    *   *Source: Derived from Activity feature existence*
    *   *Priority: HIGH*

### 1.2. CI/CD Pipeline - Initial Setup
*   **Task:** `[ ]` Setup basic CI/CD with GitHub Actions:
    *   `[ ]` Workflow for linting and formatting checks (Prettier, ESLint) on push/PR.
    *   `[ ]` Workflow for running Vitest unit/integration tests on push/PR.
    *   *Source: CIO Report (Critical Gap & Recommendation #3)*
    *   *Priority: CRITICAL*

### 1.3. Role-Based Access Control (RBAC) - Verification & Hardening
*   **Task:** `[x]` Design the full RBAC schema (user roles, permissions, mapping tables).
    *   *Source: CIO Report (Critical Gap & Recommendation #2), ROADMAP.md (Post-Refactor Plan #6) - Correction: Schema design verified via migrations.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Create `user_roles` and `role_permissions` tables in Supabase (with migrations).
    *   *Source: ROADMAP.md (Post-Refactor Plan #6) - Correction: Verified complete via migration `20250505072153_rbac_schema_and_policies.sql`.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Write RLS policies based on user roles for `user_roles` and `role_permissions` tables (and core data tables using `check_permission` helper).
    *   *Source: ROADMAP.md (Post-Refactor Plan #6) - Correction: Verified complete via migration `20250505072153_rbac_schema_and_policies.sql`.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Create database helper function `public.get_my_permissions()` to fetch permissions for the authenticated user.
    *   *Source: Correction: Verified complete via migration `20250505105042_rbac_permission_helpers.sql`.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Update GraphQL context factory (`netlify/functions/graphql.ts`) to call `public.get_my_permissions()` to fetch and provide actual user permissions.
    *   *Source: ROADMAP.md (Post-Refactor Plan #6) - Correction: Verified this is already implemented in `graphql.ts` context creation.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Review and Update relevant GraphQL mutations (`mutation.ts`) to consistently use fetched `userPermissions` from context for authorization.
    *   *Source: ROADMAP.md (Post-Refactor Plan #6) - Mutations verified. Query RLS reliance noted.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[ ]` Conduct thorough E2E testing of RLS and RBAC policies, ensuring GraphQL operations respect permissions for different user roles (e.g., admin vs. member access to various resources).
    *   *Source: CIO Report (Gap in Phase 4 Hardening) - Remains critical.*
    *   *Priority: CRITICAL*
*   **Task:** `[ ]` (Query Resolvers) Consider Adding Explicit Permission Checks if RLS proves insufficient for specific query patterns or for defense-in-depth.
    *   *Source: Developer Review (Current: Relies on RLS for query authorization).*
    *   *Priority: MEDIUM (Technical Debt/Refinement).*

### 1.4. Critical Code Quality & Developer Experience Improvements
*   **Task:** `[x]` Generate Backend Types (GraphQL Codegen): Implement `@graphql-codegen/typescript` and `@graphql-codegen/typescript-resolvers` for backend type generation (`lib/generated/graphql.ts`). Refactor resolvers and services to use these generated types.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #15)*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Fix GraphQL Client Header Inconsistency: Ensured `requestMiddleware` in `frontend/src/lib/graphqlClient.ts` is the sole source for auth headers.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #6)*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[-]` Clarify/Refactor `frontend/src/stores/useAppStore.ts`: Migrate state and actions to domain-specific stores (e.g., `usePeopleStore`, `useDealsStore`).
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #7)*
    *   *Priority: HIGH*
    *   **Detailed Refactoring Plan (Updated Status):**
        *   **I. Preparation & Setup:**
            *   `[x]` Create Store Directory Structure.
            *   `[x]` Define Common Utility Types (`GraphQLErrorWithMessage`).
            *   `[x]` Decide on GraphQL Operations Management (Moved with stores).
        *   **II. Domain Store Creation & Migration:**
            *   `[x]` Create `useAuthStore.ts`.
            *   `[x]` Create `useDealsStore.ts`.
            *   `[x]` Create `usePeopleStore.ts`.
            *   `[x]` Create `useOrganizationsStore.ts`.
            *   `[x]` Create `usePipelinesStore.ts`.
            *   `[x]` Create `useStagesStore.ts`.
            *   `[x]` Create `useActivitiesStore.ts`.
            *   `[x]` Create `useThemeStore.ts`.
        *   **III. Updating Component Usage:**
            *   `[-]` Systematically Replace `useAppStore` imports and usage with new specific store hooks throughout `frontend/src/pages` and `frontend/src/components`. (Partially done, needs full sweep)
        *   **IV. Refactoring `useAppStore.ts`:**
            *   `[-]` Remove Migrated Code from `useAppStore.ts` as component updates complete. (Partially done)
            *   `[ ]` Final Action: Delete `useAppStore.ts` if empty, or rename if minimal essential global setup remains (aim to eliminate).
        *   **V. Testing & Validation:**
            *   `[ ]` Update/Split Unit Tests for `useAppStore.test.ts`.
            *   `[ ]` Create New Unit Tests for each new domain store.
            *   `[ ]` Run All E2E Tests (`npm run test:e2e`) and ensure they pass after refactor.
            *   `[ ]` Perform Thorough Manual Testing of all application areas.
        *   **VI. Code Review & Cleanup:**
            *   `[ ]` Conduct Peer Review of all changes.
            *   `[ ]` Remove Dead Code.
            *   `[ ]` Consistency Check.
            *   `[ ]` Documentation: Update `DEVELOPER_GUIDE_V2.md`.
*   **Task:** `[ ]` Implement Prettier for automated code formatting and integrate with ESLint.
    *   *Source: CIO Report (Gap), `DEVELOPER_GUIDE_V2.md` (Prettier status)*
    *   *Priority: HIGH*

### 1.5. Roadmap & Task Management
*   **Task:** `[x]` This document (`PROJECT_ROADMAP_V2.md`) has been updated to serve as the Active Technical Backlog.
    *   *Source: User Request*
    *   *Priority: IMMEDIATE PROCESS (Completed)*

---

## Phase 2: Core Technical Debt & DX Enhancements (Target: Ongoing)
*Focus: Address remaining technical debt, further enhance developer experience, expand test coverage significantly.*

### 2.1. Testing Overhaul - Comprehensive Coverage
*   **Task:** `[ ]` Write Integration Tests for all critical GraphQL Resolvers (e.g., testing resolver logic, service calls, context usage, error handling).
    *   *Source: CIO Report (Gap in Phase 4 Testing), ROADMAP.md (Post-Refactor Plan #5)*
    *   *Priority: CRITICAL*
*   **Task:** `[ ]` Write Unit/Integration Tests for Key Frontend UI Components (using React Testing Library, focusing on props, state, interactions, and store connections).
    *   *Source: CIO Report (Gap in Phase 4 Testing), ROADMAP.md (Post-Refactor Plan #5)*
    *   *Priority: HIGH*
*   **Task:** `[ ]` Test authorization thoroughly in GraphQL resolvers (ensure unauthorized access attempts fail, mocking auth context as needed).
    *   *Source: ROADMAP.md (Post-Refactor Plan #5)*
    *   *Priority: CRITICAL*
*   **Task:** `[ ]` Write Unit tests for `activityService.ts`.
    *   *Source: CIO Report (Gap)*
    *   *Priority: HIGH*

### 2.2. CI/CD Pipeline - Enhancements
*   **Task:** `[ ]` Enhance CI/CD GitHub Actions:
    *   `[ ]` Add Playwright E2E tests to the CI pipeline (e.g., on PRs to `main`/`develop`).
    *   `[ ]` Configure automated deployment to Netlify Staging/Preview environments on PRs.
    *   `[ ]` Configure automated deployment to Netlify Production on merge to `main`.
    *   *Source: CIO Report (Recommendation #3)*
    *   *Priority: HIGH*

### 2.3. Developer Experience & Code Quality
*   **Task:** `[ ]` Implement Frontend Path Aliases: Configure and refactor imports in `frontend/src` to use `@/` alias (e.g., in `frontend/tsconfig.json` and `frontend/vite.config.ts`).
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #5)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Consolidate Duplicate GraphQL Query Fields: Make `netlify/functions/graphql/schema/schema.graphql` (or a dedicated root query file) the single definition point for the root `Query` type if duplication exists across schema files.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #11)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Review database schema for potential indexing opportunities on frequently queried/filtered columns (e.g., based on `filter` arguments in GraphQL queries). Add indexes via migrations.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #7)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Simplify Modal Error Handling: Refactor `handleSubmit` in modal components (e.g., `CreateDealModal.tsx`) to rely primarily on store error state and display errors consistently, reducing local error state management.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #9)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Service Layer: Refine error handling in all services (`lib/*.service.ts`) for consistent and specific error types (e.g., custom error classes, standardized error responses).
    *   *Source: ROADMAP.md (Post-Refactor Plan #1)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Implement Specific Service Layer Error Handling: Enhance `lib/serviceUtils.ts#handleSupabaseError` for more granular error mapping from Supabase errors to application-specific errors.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #12)*
    *   *Priority: LOW*

### 2.4. Completing Core Features (Technical Aspects & Testing)
    *Source: Original ROADMAP.md Phase X & Y. Foundational DB/Service work largely done.*
*   **Task:** `[x]` Pipelines & Stages: Database Schema, Backend Logic (Services), GraphQL API, Basic Frontend UI, Store integration.
    *   *Status based on existing code and previous roadmap updates.*
*   **Task:** `[x]` Activities: Database Schema, Backend Logic (Service), GraphQL API, Basic Frontend UI (`ActivitiesPage.tsx`), Store integration.
    *   *Status based on existing code and previous roadmap updates.*
*   **Task:** `[ ]` Ensure comprehensive RLS policies are in place and verified for Pipelines, Stages, and Activities tables.
    *   *Priority: HIGH*
*   **Task:** `[ ]` Resolve `Organization.people` resolver TODO to correctly fetch people associated with an organization.
    *   *Source: CIO Report (Gap)*
    *   *Priority: HIGH*
*   **Task:** `[ ]` Frontend UI: Display linked activities on Deal, Person, Organization detail views/pages.
    *   *Source: Original Roadmap (Phase 6 Activities)*
    *   *Priority: MEDIUM (Considered technical debt if data model supports it but UI is missing)*

---

## Phase 3: Advanced Technical Enhancements & Future Feature Enablement (Target: Future Sprints)
*Focus: Implement advanced technical patterns for performance and scalability, further harden the system, and prepare for more complex features.*

### 3.1. Performance & Scalability
*   **Task:** `[ ]` GraphQL Layer: Review all resolvers for N+1 issues and implement `dataloader` pattern where beneficial (e.g., fetching related entities like `Person.organization`, `Deal.contact`, `Deal.stage`).
    *   *Source: ROADMAP.md (Post-Refactor Plan #2, Post-Code-Analysis Action Plan #13)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` GraphQL Layer: Implement cursor-based pagination for all list queries (e.g., `people`, `deals`, `activities`) to handle large datasets efficiently.
    *   *Source: ROADMAP.md (Post-Refactor Plan #2)*
    *   *Priority: MEDIUM*

### 3.2. Advanced DX & Maintainability
*   **Task:** `[ ]` Frontend Enhancements:
    *   `[ ]` Implement a global, consistent loading indicators system (e.g., for page transitions, full data loads).
    *   `[ ]` Implement a global, consistent toast notifications system for user feedback (success, error, info). (Some auth toasts exist, make it generic).
    *   `[ ]` Evaluate and implement optimistic updates in Zustand stores for critical mutations to improve perceived performance.
    *   *Source: Post-Refactor Plan #3*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Inngest:
    *   `[ ]` Resolve `TODO` for client ID in `netlify/functions/inngest.ts` if still present; ensure production readiness.
    *   `[ ]` Review main Netlify handler export in `inngest.ts`; ensure it's robust for production Inngest event handling.
    *   `[ ]` Implement more meaningful Inngest functions beyond simple logging (e.g., sending a welcome email on user signup - requires email service, or data sync tasks if applicable). This borders on functional, prioritize technical enablers.
    *   *Source: ROADMAP.md (Post-Refactor Plan #4), CIO Report (Gap)*
    *   *Priority: MEDIUM (for core Inngest setup), LOW (for new complex functions unless technically enabling)*

### 3.3. New Feature Technical Enablement
*   **Task:** `[x]` User Profile Feature - Technical Foundation:
    *   `[x]` Database Schema: `user_profiles` table created (distinct from `auth.users` or `people`).
    *   `[x]` Backend Logic: `userProfileService.ts` created and functional.
    *   `[x]` GraphQL API: `User` type augmented, `Query.me` and `Mutation.updateUserProfile` implemented.
    *   *This feature has been implemented, providing user profile view/edit capabilities and integration with Deal History for user name display.*
    *   *Priority: Was LOW, Now DONE*
*   **Task:** `[ ]` Full Text Search - Investigation & PoC: Investigate Supabase FTS capabilities or alternative search solutions for core entities.
    *   *Priority: LOW*
*   **Task:** `[ ]` Email Integration (Basic) - Technical PoC: Investigate options for sending transactional emails (e.g., via Supabase an external SMTP service triggered by Inngest).
    *   *Priority: LOW*

---
*Items from original Phase 7 & 8 (Advanced Features & Polish, Production Readiness & Iteration) like Dashboard, i18n, comprehensive user docs, advanced security audits, and performance optimization campaigns are considered out of scope for this immediate technical backlog unless they surface as critical technical debt. They would typically be tracked in `BACKLOG.md` or a future iteration of this technical roadmap.*

---
**Note:** Sprint durations are indicative. Priorities and timelines should be reviewed and adjusted regularly by the development team based on progress and evolving business needs.

---

## Technical Epic: Custom Fields Architecture

**ID:** TECH-EPIC-001
**Status:** To Do
**Priority:** High
**Related Features:** FEATURE-004

**Summary:**
Design and implement the core backend and frontend architecture for a user-definable custom fields system. This will allow administrators to add new data fields to entities like Deals, People, and Organizations without code changes.

**Key Technical Considerations:**
*   **Database Schema:** Evaluate and choose a storage strategy for custom field definitions and values (e.g., EAV, JSONB columns, or dedicated tables per entity type).
*   **Service Layer:** Develop services for managing custom field definitions (CRUD) and for getting/setting custom field values on entities.
*   **GraphQL Integration:** Design how custom fields will be exposed via the GraphQL API. This might involve dynamic schema generation, generic field resolvers, or a structured JSON approach.
*   **Data Validation:** Implement validation for custom field inputs based on their defined type and constraints.
*   **Indexing & Performance:** Ensure custom field data can be queried and filtered efficiently.
*   **UI Infrastructure:** Create reusable frontend components for rendering input controls for various custom field types (text, number, date, dropdown, etc.) and for displaying custom field data.

**Acceptance Criteria (Technical):**
*   A chosen database schema for custom fields is implemented and migrated.
*   Backend services and GraphQL mutations/queries allow for managing custom field definitions.
*   Backend services and GraphQL mutations/queries allow for setting and retrieving custom field values for supported entities.
*   The system supports common field types (e.g., Text, Number, Date, Boolean, Single-Select Dropdown, Multi-Select).
*   Basic data validation is in place for custom field inputs.

---

## Technical Epic: Advanced Email Integration Core

**ID:** TECH-EPIC-002
**Status:** To Do
**Priority:** High
**Related Features:** FEATURE-008

**Summary:**
Develop the core backend infrastructure for advanced email integration, including BCC-to-CRM functionality, and a system for sending emails directly from the application. Lay groundwork for optional full inbox synchronization.

**Key Technical Considerations:**
*   **BCC-to-CRM:**
    *   Set up a dedicated email address (e.g., using an email sub-addressing service or a dedicated mailbox).
    *   Implement an Inngest function or a webhook endpoint to process incoming emails to this address.
    *   Develop robust email parsing logic (headers, body, attachments) to extract relevant information.
    *   Implement heuristics for matching emails to existing CRM contacts (People, Organizations) and Deals.
*   **Send Email from App:**
    *   Integrate with a scalable email sending service (e.g., extend existing SendGrid usage or an alternative like AWS SES) for non-transactional emails.
    *   Develop services for composing, sending, and logging outgoing emails as activities.
    *   Address security considerations for sending emails on behalf of users (SPF, DKIM alignment if using user's domain).
*   **(Future) Inbox Synchronization:**
    *   Research and select OAuth libraries for major email providers (Google, Microsoft).
    *   Design database schema for storing email sync metadata and user credentials securely.
    *   Plan for background jobs to perform periodic email fetching.

**Acceptance Criteria (Technical - Initial Phase):**
*   BCC-to-CRM endpoint successfully receives and parses emails.
*   Parsed emails are logged as activities and linked to the correct Person/Organization/Deal where possible.
*   Users can send emails from within the application using a configured sending service.
*   Sent emails are recorded as activities and linked appropriately.

---

## Technical Epic: Workflow Automation Engine Foundation

**ID:** TECH-EPIC-003
**Status:** To Do
**Priority:** Low (High complexity)
**Related Features:** FEATURE-012

**Summary:**
Design and implement the foundational backend components for a user-configurable workflow automation engine. This includes storing workflow definitions and an execution engine to process triggers, conditions, and actions.

**Key Technical Considerations:**
*   **Workflow Definition Schema:** Design database tables to store workflow rules (trigger type, target entity, conditions, action sequence, action parameters).
*   **Trigger Mechanism:** Determine how workflows are triggered (e.g., database triggers, event listeners on service operations, Inngest events).
*   **Condition Evaluation Engine:** Develop logic to evaluate complex conditions based on entity data.
*   **Action Execution Service:** Create a service that can execute various predefined actions (e.g., create activity, send email, update field). This will likely integrate with Inngest for asynchronous/reliable execution of actions.
*   **Security & Isolation:** Ensure workflows execute securely, especially when interacting with external services or modifying data.
*   **Logging & Auditing:** Implement comprehensive logging for workflow execution for debugging and auditing.

**Acceptance Criteria (Technical - Foundation):**
*   Database schema for storing workflow definitions is implemented.
*   A basic engine can process a simple, predefined workflow (e.g., on Deal update, if stage is X, log a message).
*   Initial set of internal triggers and actions are identified and a framework for adding more is established.

---

## Technical Task: Advanced Query & Filter Engine Backend

**ID:** TECH-TASK-006
**Status:** To Do
**Priority:** Medium
**Related Features:** FEATURE-003, FEATURE-011

**Summary:**
Develop a flexible backend engine capable of translating complex, user-defined filter criteria (AND/OR groups, various operators for different data types) into efficient database queries (SQL/Supabase).

**Key Technical Considerations:**
*   Design a serializable data structure for representing filter criteria.
*   Implement a query builder that can parse this structure and generate appropriate SQL WHERE clauses.
*   Ensure security against SQL injection if constructing queries dynamically.
*   Optimize for performance, especially with multiple conditions and joins.
*   Support for filtering on standard fields and potentially custom fields (FEATURE-004).
*   Database schema for storing user-saved filter views.

**Acceptance Criteria (Technical):**
*   The backend can accept a structured filter definition and apply it to database queries for major entities.
*   Supports common operators (equals, not equals, contains, starts with, greater than, less than, etc.) for relevant data types.
*   Supports AND/OR grouping of conditions.
*   Generated queries are secure and performant.

---

## Technical Task: In-App Notification System & Reminder Service

**ID:** TECH-TASK-007
**Status:** To Do
**Priority:** Medium
**Related Features:** FEATURE-007

**Summary:**
Implement the backend infrastructure for an in-app notification system and a service for scheduling and delivering activity reminders.

**Key Technical Considerations:**
*   **Notification Schema:** Database table(s) for storing notifications (recipient, message, read status, link to related entity).
*   **Notification Service:** Backend service for creating, fetching, and marking notifications as read.
*   **Real-time Delivery (Optional):** Consider Supabase Realtime or WebSockets for pushing notifications to connected clients.
*   **Reminder Scheduling:** Develop Inngest functions to periodically check for activities needing reminders.
*   **Reminder Delivery:** Integrate with the notification service (for in-app) and email service (for email reminders).

**Acceptance Criteria (Technical):**
*   Backend can store and manage user notifications.
*   API endpoints exist for fetching and updating notification status.
*   Inngest functions can schedule and trigger reminders based on activity due dates.

---

## Technical Task: Product Catalog & Deal Line Items Backend

**ID:** TECH-TASK-008
**Status:** To Do
**Priority:** Medium
**Related Features:** FEATURE-002

**Summary:**
Develop the backend components (database schema, services, GraphQL API) for managing a product catalog and linking products as line items to deals.

**Key Technical Considerations:**
*   **Database Schema:** `products` table (name, SKU, description, standard price) and `deal_products` table (linking deals to products, quantity, negotiated price, line total).
*   **ProductService:** CRUD operations for products.
*   **DealService Extension:** Logic for adding, updating, removing line items from a deal. Calculation of deal total from line items.
*   **GraphQL API:** Mutations and queries for products and managing deal line items.
*   Data validation and integrity (e.g., ensuring product exists when adding to a deal).

**Acceptance Criteria (Technical):**
*   Database schema for products and deal line items is implemented.
*   GraphQL API allows CRUD for products and managing deal line items.
*   Service layer logic correctly handles calculations and data integrity.

---

## Technical Task: Leads Entity Backend & Conversion Logic

**ID:** TECH-TASK-009
**Status:** To Do
**Priority:** Medium
**Related Features:** FEATURE-009

**Summary:**
Implement the backend for a new "Leads" entity, including database schema, services, GraphQL API, and logic for converting leads into People, Organizations, and/or Deals.

**Key Technical Considerations:**
*   **Database Schema:** `leads` table (fields like name, email, phone, company, source, status, owner).
*   **LeadService:** CRUD operations for leads. Logic for lead conversion (creating related Person/Org/Deal records, linking them, and updating lead status).
*   **GraphQL API:** Mutations and queries for leads and lead conversion.
*   Assignment logic (linking leads to users).

**Acceptance Criteria (Technical):**
*   Database schema for leads is implemented.
*   GraphQL API allows CRUD for leads and a mutation for lead conversion.
*   Service layer logic correctly handles data creation and linking during conversion.

---

## Technical Task: Public API for Web Form Submissions

**ID:** TECH-TASK-010
**Status:** To Do
**Priority:** Medium
**Related Features:** FEATURE-010

**Summary:**
Create a secure, public-facing API endpoint (e.g., a Netlify Function) to accept submissions from web forms and create corresponding CRM records (e.g., Leads).

**Key Technical Considerations:**
*   **API Endpoint Security:** Implement measures against spam and abuse (e.g., rate limiting, CAPTCHA integration option).
*   **Data Validation:** Validate incoming form data.
*   **Field Mapping:** Logic to map form fields to CRM entity fields (potentially configurable).
*   Integration with `LeadService` (FEATURE-009) or other services to create records.
*   Consider API key or token authentication for form sources if needed.

**Acceptance Criteria (Technical):**
*   A public API endpoint exists that can receive POST requests with form data.
*   Submissions are validated and result in the creation of appropriate CRM records.
*   The endpoint is reasonably secured against common web vulnerabilities.

---

## Technical Task: Backend for User Role Assignment by Admins

**ID:** TECH-TASK-011
**Status:** To Do
**Priority:** Medium
**Related Features:** FEATURE-013

**Summary:**
Develop the backend API endpoints and service logic necessary for administrative users to assign and unassign RBAC roles to other users in the system.

**Key Technical Considerations:**
*   **Admin-Only API Endpoints:** GraphQL mutations (e.g., `updateUserRoles(targetUserId: ID!, roleIds: [ID!]!)`) protected by RBAC to ensure only authorized admins can use them.
*   **Service Logic:** Functions to interact with Supabase Auth or a custom user-role mapping table to update a user's roles.
*   Careful consideration of how roles are stored and managed by Supabase Auth (e.g., in `raw_app_meta_data` or if a separate mapping table is used in conjunction with `app_metadata.roles`).
*   Ensuring changes to roles are correctly reflected in the user's session/claims upon next login or token refresh.

**Acceptance Criteria (Technical):**
*   Admin-protected API endpoints allow for modifying a user's assigned roles.
*   Service logic correctly updates the user's roles in the identity system.
*   Changes are reflected in the permissions available to the target user.

--- 