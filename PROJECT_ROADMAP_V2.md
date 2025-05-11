# Project Roadmap V2

**Date:** October 27, 2024 (Assumed)
**Version:** 2.0
**Status:** Proposed

## Overarching Goals
*   Achieve robust test coverage across all layers of the application.
*   Implement a secure, granular, and comprehensive Role-Based Access Control (RBAC) system.
*   Establish a fully automated CI/CD pipeline for consistent quality checks and deployments.
*   Significantly improve code quality, maintainability, and developer experience through targeted refactoring and type safety.
*   Deliver remaining and new CRM features with a higher degree of confidence and stability.

---

## Phase 1: Critical Stability & Foundations (Target: Next 1-2 Sprints)
*Focus: Immediately address critical gaps identified in the CIO audit, implement high-priority technical debt items impacting stability and developer velocity, and establish essential CI/CD processes.*

### 1.1. Testing Infrastructure & Critical E2E Coverage
*   **Task:** `[ ]` Establish a testing environment for Netlify functions/GraphQL resolvers (e.g., using MSW or similar).
    *   *Source: ROADMAP.md (Post-Refactor Plan #5), CIO Report (Gap)*
    *   *Priority: CRITICAL*
*   **Task:** `[ ]` Write E2E Test (Playwright): Deal CRUD.
    *   *Source: CIO Report (Gap in Phase 4 Testing)*
    *   *Priority: CRITICAL*
*   **Task:** `[ ]` Write E2E Test (Playwright): Organization CRUD.
    *   *Source: CIO Report (Gap in Phase 4 Testing)*
    *   *Priority: CRITICAL*

### 1.2. CI/CD Pipeline - Initial Setup
*   **Task:** `[ ]` Setup basic CI/CD with GitHub Actions:
    *   `[ ]` Workflow for linting and formatting checks on push/PR.
    *   `[ ]` Workflow for running Vitest unit/integration tests on push/PR.
    *   *Source: CIO Report (Critical Gap & Recommendation #3)*
    *   *Priority: CRITICAL*

### 1.3. Role-Based Access Control (RBAC) - Design & Initial DB Setup
*   **Task:** `[x]` Design the full RBAC schema (user roles, permissions, mapping tables).
    *   *Source: CIO Report (Critical Gap & Recommendation #2), ROADMAP.md (Post-Refactor Plan #6) - Correction: Schema design verified via migrations.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Create `user_roles` and `role_permissions` tables in Supabase (with migrations).
    *   *Source: ROADMAP.md (Post-Refactor Plan #6) - Correction: Verified complete via migration `20250505072153_rbac_schema_and_policies.sql`.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Write RLS policies based on user roles for `user_roles` and `role_permissions` tables (and core data tables using `check_permission` helper).
    *   *Source: ROADMAP.md (Post-Refactor Plan #6) - Correction: Verified complete via migration `20250505072153_rbac_schema_and_policies.sql`.*
    *   *Priority: HIGH (Completed)*
*   **Task:** `[x]` Create database helper function `public.get_my_permissions()` to fetch permissions for the authenticated user.
    *   *Source: Correction: Verified complete via migration `20250505105042_rbac_permission_helpers.sql`.*
    *   *Priority: HIGH (Completed)*

### 1.4. Critical Code Quality & Developer Experience Improvements
*   **Task:** `[x]` Generate Backend Types (GraphQL Codegen): Implement `@graphql-codegen/typescript` and `@graphql-codegen/typescript-resolvers` for backend type generation (`lib/generated/graphql.ts`). Refactor resolvers and services to use these generated types.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #15)*
    *   *Priority: HIGH (Completed)*
    *   **Detailed Plan:**
        1.  **Installation of Dependencies:** `[x]`
            *   Install `@graphql-codegen/cli`, `@graphql-codegen/typescript`, `@graphql-codegen/typescript-resolvers`, and `graphql`.
        2.  **Configuration (`codegen.ts` or `codegen.yml`):** `[x]`
            *   Create a configuration file (e.g., `codegen.ts`) in the project root.
            *   Point to the GraphQL schema path (likely `netlify/functions/graphql/schema/**/*.graphql`).
            *   Configure output to `lib/generated/graphql.ts`.
            *   Specify plugins: `typescript` and `typescript-resolvers`.
            *   Identify and set `contextType` for `typescript-resolvers` (e.g., `../../netlify/functions/graphql#GraphQLContext`).
            *   Consider `mappers` if existing model types need to be mapped.
        3.  **Add NPM Script:** `[x]`
            *   Add a script to `package.json` (e.g., `"codegen": "graphql-codegen --config codegen.ts"`).
        4.  **Initial Type Generation:** `[x]`
            *   Run the npm script to generate `lib/generated/graphql.ts`.
            *   Inspect the generated file for correctness.
        5.  **Refactor GraphQL Resolvers:** `[x]`
            *   Identify all resolver files (e.g., in `netlify/functions/graphql/resolvers/`).
            *   Import `Resolvers` and other generated types.
            *   Update resolver function signatures.
        6.  **Refactor Service Layer:** `[x]`
            *   Identify service files (e.g., in `lib/`).
            *   Update service function parameters and return types with generated types where appropriate.
        7.  **Build and Test:** `[x]`
            *   Ensure the backend builds successfully (`npx tsc --noEmit`).
            *   Run backend tests to check for regressions (`npm test`).
        8.  **Roadmap Update (Self-Reference):** `[x]`
            *   Mark this task as complete in this roadmap.
*   **Task:** `[ ]` Fix GraphQL Client Header Inconsistency: Remove all calls to `gqlClient.setHeaders({...})` from `frontend/src/stores/useAuthStore.ts`, relying solely on `requestMiddleware`.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #6)*
    *   *Priority: HIGH*
    *   **Detailed Plan:**
        1.  **Analyze `frontend/src/lib/graphqlClient.ts`:**
            *   `[x]` Read the file to understand the `requestMiddleware` implementation.
            *   `[x]` Verify it correctly retrieves the auth token, sets the `Authorization` header, and handles token absence.
        2.  **Analyze `frontend/src/stores/useAuthStore.ts` (or equivalent):**
            *   `[x]` Read the file to find all `gqlClient.setHeaders({...})` calls. (Identified in `useAppStore.ts`)
            *   `[x]` Understand their purpose (login/logout token management).
            *   `[x]` Confirm existence of the file or identify the current auth token handler. (`useAppStore.ts`)
        3.  **Refactor `useAppStore.ts` (or equivalent):**
            *   `[x]` Remove `gqlClient.setHeaders({...})` calls. (Commented out in `useAppStore.ts`)
            *   `[x]` Ensure store logic correctly updates state for `requestMiddleware` to use.
        4.  **Testing:**
            *   `[x]` Manually test login, logout, and authenticated GraphQL requests.
            *   `[x]` Run relevant E2E tests. (People CRUD E2E tests passed, covering login & auth requests)
        5.  **Roadmap Update (Self-Reference):**
            *   `[ ]` Mark this task as complete in this roadmap.

### 1.5. Roadmap & Task Management
*   **Task:** `[ ]` Conduct a thorough review of the original `ROADMAP.md` and any internal task tracking systems to align with `CIO_REPORT.md` findings and this `PROJECT_ROADMAP_V2.md`. Ensure all items accurately reflect their true status.
    *   *Source: CIO Report (Recommendation #4)*
    *   *Priority: IMMEDIATE PROCESS*

---

## Phase 2: Core Feature Completion & DX Enhancements (Target: Next 2-3 Sprints)
*Focus: Complete partially implemented features, further enhance developer experience, expand test coverage significantly, and fully implement RBAC in the GraphQL layer.*

### 2.1. Testing Overhaul - Comprehensive Coverage
*   **Task:** `[ ]` Write Integration Tests for all critical GraphQL Resolvers.
    *   *Source: CIO Report (Gap in Phase 4 Testing), ROADMAP.md (Post-Refactor Plan #5)*
    *   *Priority: HIGH*
*   **Task:** `[ ]` Write Unit/Integration Tests for Key Frontend UI Components (React Testing Library).
    *   *Source: CIO Report (Gap in Phase 4 Testing), ROADMAP.md (Post-Refactor Plan #5)*
    *   *Priority: HIGH*
*   **Task:** `[ ]` Write E2E Test (Playwright): Pipeline CRUD.
    *   *Source: CIO Report (Gap in Phase 4 Testing)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Test authorization (ensure unauthorized access attempts fail in GraphQL - may require mocking auth context).
    *   *Source: ROADMAP.md (Post-Refactor Plan #5)*
    *   *Priority: HIGH*

### 2.2. CI/CD Pipeline - Enhancements
*   **Task:** `[ ]` Enhance CI/CD GitHub Actions:
    *   `[ ]` Add Playwright E2E tests to the CI pipeline (e.g., on PRs to `main`/`develop`).
    *   `[ ]` Configure automated deployment to Netlify Staging/Preview environments on PRs.
    *   `[ ]` Configure automated deployment to Netlify Production on merge to `main`.
    *   *Source: CIO Report (Recommendation #3)*
    *   *Priority: HIGH*

### 2.3. Role-Based Access Control (RBAC) - Full Implementation
*Focus: Integrate the existing database RBAC schema with the GraphQL layer.*
*   **Task:** `[x]` Update GraphQL context factory (`netlify/functions/graphql.ts`) to call the `public.get_my_permissions()` Supabase function to fetch and provide actual user permissions.
    *   *Source: ROADMAP.md (Post-Refactor Plan #6) - Correction: Verified this is already implemented in `graphql.ts` context creation.*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[x]` Review and Update all relevant GraphQL resolvers (`mutation.ts`, `query.ts`) to consistently use the fetched `userPermissions` from the GraphQL context for authorization checks (or rely on RLS for queries, with refinement backlogged).
    *   *Source: ROADMAP.md (Post-Refactor Plan #6) - Adjusted based on new findings. Mutations verified. Queries rely on RLS; explicit checks moved to backlog (Phase 3.3).*
    *   *Priority: CRITICAL (Completed)*
*   **Task:** `[ ]` Conduct thorough E2E testing of RLS and RBAC policies, ensuring GraphQL operations respect permissions for different user roles.
    *   *Source: CIO Report (Gap in Phase 4 Hardening) - Remains critical.*
    *   *Priority: HIGH*

### 2.4. Developer Experience & Code Quality
*   **Task:** `[ ]` Implement Frontend Path Aliases: Configure and refactor imports in `frontend/src` to use `@/` alias.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #5)*
    *   *Priority: HIGH*
*   **Task:** `[ ]` Consolidate Duplicate GraphQL Query Fields: Make `netlify/functions/graphql/schema/schema.graphql` the single definition point for the root `Query` type.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #11)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Review database schema for potential indexing opportunities on frequently queried/filtered columns. Add indexes via migrations.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #7)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Clarify/Refactor `frontend/src/stores/useAppStore.ts`: Migrate any remaining general state to domain-specific stores or remove if empty.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #7)*
    *   *Priority: MEDIUM*
    *   **Detailed Refactoring Plan:**
        *   **I. Preparation & Setup:**
            *   `[ ]` Create Store Directory Structure: Ensure `frontend/src/stores/` for new store files.
            *   `[ ]` Define Common Utility Types: Move `GraphQLErrorWithMessage` and `isGraphQLErrorWithMessage` to a shared utility file (e.g., `frontend/src/lib/graphqlUtils.ts` or `frontend/src/types/errors.ts`).
            *   `[ ]` Decide on GraphQL Operations Management: Determine if GQL constants live within new stores or a central `frontend/src/graphql/operations.ts`. (Assume they move with stores for now).
        *   **II. Domain Store Creation & Migration (Iterative for each domain: Auth, People, Deals, Orgs, Pipelines, Stages, Activities, UI/Theme):**
            *   For each domain:
                *   `[ ]` Create New Store File (e.g., `frontend/src/stores/usePeopleStore.ts`).
                *   `[ ]` Define Store Interface & Initial State: Extract relevant parts from `AppState`.
                *   `[ ]` Migrate Actions & Related Logic: Move actions, GQL constants, and adapt to new store's `set`/`get`. Ensure type imports.
                *   `[ ]` Handle Inter-Store Dependencies carefully (e.g., `selectedPipelineId` for stages).
                *   `[ ]` Export the New Store.
            *   `[ ]` Create `useAuthStore.ts` (session, user, permissions, related actions & GQL).
            *   `[x]` Create `useDealsStore.ts` (deals state, CRUD actions & GQL).
            *   `[x]` Create `usePeopleStore.ts` (people state, CRUD actions & GQL).
            *   `[x]` Create `useOrganizationsStore.ts` (organizations state, CRUD actions & GQL).
            *   `[x]` Create `usePipelinesStore.ts` (pipelines state, `selectedPipelineId`, CRUD actions & GQL).
            *   `[x]` Create `useStagesStore.ts` (stages state, CRUD actions needing `pipelineId`, & GQL).
            *   `[x]` Create `useActivitiesStore.ts` (activities state, CRUD actions & GQL).
            *   `[x]` Create `useThemeStore.ts` (currentTheme, setCurrentTheme).
        *   **III. Updating Component Usage:**
            *   `[ ]` Systematically Replace `useAppStore`: Go through files importing `useAppStore`, update to use new specific store hooks.
            *   `[ ]` Address Combined Selectors: Components using multiple slices will now call multiple store hooks.
        *   **IV. Refactoring `useAppStore.ts`:**
            *   `[ ]` Remove Migrated Code: Delete corresponding state, actions, types, GQL constants from `useAppStore.ts` as migrations complete.
            *   `[ ]` Evaluate Remaining Content: Check what's left in `useAppStore.ts`.
            *   `[ ]` Final Action: Delete `useAppStore.ts` if empty, or rename if minimal essential global setup remains (aim to eliminate).
        *   **V. Testing & Validation:**
            *   `[ ]` Update/Split Unit Tests for `useAppStore.test.ts`.
            *   `[ ]` Create New Unit Tests for each new domain store (e.g., `usePeopleStore.test.ts`).
            *   `[ ]` Run All E2E Tests (`npm run test:e2e`) and ensure they pass.
            *   `[ ]` Perform Thorough Manual Testing of all application areas.
        *   **VI. Code Review & Cleanup:**
            *   `[ ]` Conduct Peer Review of all changes.
            *   `[ ]` Remove Dead Code: Ensure no unused imports, variables, or functions remain.
            *   `[ ]` Consistency Check: Verify new stores follow consistent structure and naming.
            *   `[ ]` Documentation: Update `DEVELOPER_GUIDE_V2.md` and any other relevant docs.
*   **Task:** `[ ]` Simplify Modal Error Handling: Refactor `handleSubmit` in modal components to rely primarily on store error state.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #9)*
    *   *Priority: MEDIUM*

### 2.5. Complete "Pipelines & Stages" Feature
    *Source: Original ROADMAP.md Phase X. Foundational DB/Service work partially done.*
*   **Task:** `[ ]` Database Schema: Verify `pipelines` and `stages` tables are complete and correctly related. Ensure RLS policies are comprehensive. (Verified RLS exists, schema assumed from service tests)
*   **Task:** `[ ]` Backend Logic: Complete `pipelineService.ts` and `stageService.ts` with full CRUD and any business logic. (Unit tests exist, implying good progress)
*   **Task:** `[ ]` GraphQL API: Define/complete `Pipeline` & `Stage` types, inputs, and all CRUD queries/mutations in schema. Implement all resolvers.
*   **Task:** `[ ]` Frontend UI: Develop `PipelinesPage.tsx` and `StagesPage.tsx` (or integrated UI) for full CRUD operations on pipelines and their stages.
*   **Task:** `[ ]` Frontend UI: Integrate pipeline/stage management into `useAppStore.ts` or dedicated stores (tests for store actions exist).
*   **Task:** `[ ]` Write comprehensive E2E tests for Pipeline and Stage CRUD. (Covered by 2.1 if pipeline E2E is prioritized there)

---

## Phase 3: New Feature Development & Advanced Hardening (Target: Following Sprints)
*Focus: Deliver new CRM functionalities (Activities, User Profiles), further refine security, performance, and UI/UX based on feedback and ongoing analysis.*

### 3.1. Feature: Activities & User Profile
    *Source: Original ROADMAP.md Phase Y*
*   **Task:** `[ ]` Database Schema: Define and migrate `activities` table (linked to people, deals, orgs) and `user_profiles` table. Implement RLS.
*   **Task:** `[ ]` Backend Logic: Develop `activityService.ts` and `userProfileService.ts` for CRUD operations.
*   **Task:** `[ ]` GraphQL API: Define types, inputs, queries/mutations for Activities and User Profiles. Implement resolvers.
*   **Task:** `[ ]` Frontend UI: Develop pages and components for managing Activities (e.g., logging calls, meetings, tasks) and User Profiles.
*   **Task:** `[ ]` Frontend State: Integrate Activity and User Profile management into Zustand store(s).
*   **Task:** `[ ]` Write E2E tests for Activity and User Profile CRUD.

### 3.2. Advanced Hardening & Optimizations
*   **Task:** `[ ]` Service Layer: Refine error handling in all services for consistent and specific error types.
    *   *Source: ROADMAP.md (Post-Refactor Plan #1)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Implement Specific Service Layer Error Handling: Enhance `lib/serviceUtils.ts#handleSupabaseError` for more granular error mapping.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #12)*
    *   *Priority: LOW (but good for robust error feedback)*
*   **Task:** `[ ]` GraphQL Layer: Review all resolvers for N+1 issues and implement `dataloader` where beneficial.
    *   *Source: ROADMAP.md (Post-Refactor Plan #2, Post-Code-Analysis Action Plan #13)*
    *   *Priority: MEDIUM (Performance)*
*   **Task:** `[ ]` GraphQL Layer: Implement cursor-based pagination for all list queries.
    *   *Source: ROADMAP.md (Post-Refactor Plan #2)*
    *   *Priority: MEDIUM*
*   **Task:** `[ ]` Frontend Enhancements:
    *   `[ ]` Add global loading indicators / toast notifications system. (Source: Post-Refactor Plan #3)
    *   `[ ]` Implement Optimistic Updates in Zustand store for better UX. (Source: Post-Refactor Plan #3)
    *   `[ ]` Improve UI/UX based on initial feedback. (Source: Post-Refactor Plan #3)
*   **Task:** `[ ]` Inngest: Implement more meaningful Inngest functions (e.g., welcome email, data sync).
    *   *Source: ROADMAP.md (Post-Refactor Plan #4)*
    *   *Priority: MEDIUM*

### 3.3. Code Quality & Refinements
*   **Task:** `[ ]` (Query Resolvers) Consider Adding Explicit Permission Checks.
    *   *Source: Developer Review (Current: Relies on RLS for query authorization).*
    *   *Priority: LOW/MEDIUM (Technical Debt/Refinement).*
    *   *Details:*
        *   **Current State:** Query resolvers in `query.ts` (e.g., `people`, `deals`) authenticate the user but do not perform explicit permission checks using `context.userPermissions?.includes('resource:action')`. They delegate authorization to the service layer, which in turn relies on Supabase RLS policies. These RLS policies *do* use the `check_permission()` helper function, providing effective data filtering based on user roles and permissions.
        *   **Pros of Current State:**
            *   Keeps query resolvers cleaner and less verbose.
            *   Leverages the database's powerful RLS capabilities directly.
        *   **Potential Enhancements with Explicit Checks:**
            *   **Clearer GraphQL Errors:** If a user lacks necessary read permissions, an explicit check in the resolver could throw a specific `FORBIDDEN` GraphQLError *before* hitting the database. Currently, an unauthorized query might result in an empty data set (correctly filtered by RLS) or a more generic database error if not perfectly handled by the service layer.
            *   **Consistency:** Aligns query resolver authorization logic more closely with mutation resolvers, which already use explicit permission checks.
            *   **API-Level Explicitness:** Makes the required permissions more immediately obvious when reading resolver code, rather than needing to cross-reference RLS policies.
        *   **Action:** Evaluate the trade-offs. If deemed beneficial, refactor query resolvers to include checks like `if (!context.userPermissions?.includes('resource:read_any') && !context.userPermissions?.includes('resource:read_own')) { throw FORBIDDEN_ERROR; }`. This would involve identifying the correct `read_own` and/or `read_any` permissions for each queryable resource. For now, the system is functional due to RLS.

---

## Phase 4: Ongoing Maintenance & Improvement (Continuous)
*Focus: Documentation, monitoring, addressing lower-priority technical debt, and continuous refactoring for long-term health.*

### 4.1. Documentation
*   **Task:** `[-]` Update `README.md` with comprehensive setup, development, and deployment instructions.
    *   *Source: ROADMAP.md (Post-Refactor Plan #7)*
*   **Task:** `[-]` Maintain ADRs (`ADR.md`) for key architectural decisions.
    *   *Source: ROADMAP.md (Post-Refactor Plan #7)*
*   **Task:** `[ ]` Document GraphQL API (e.g., using GraphiQL's built-in docs, or tools like SpectaQL/Swagger).
    *   *Source: ROADMAP.md (Post-Refactor Plan #7)*

### 4.2. Code Cleanup & Low-Priority Refactoring
*   **Task:** `[ ]` Remove Unused D&D Libraries (`@dnd-kit/*`, `react-beautiful-dnd`, `array-move`).
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #1)*
    *   *Priority: LOW*
*   **Task:** `[ ]` Remove Non-Standard TS Option (`noUncheckedSideEffectImports`) from `frontend/tsconfig.*.json`.
    *   *Source: ROADMAP.md (Post-Code-Analysis Action Plan #4)*
    *   *Priority: LOW*
*   **Task:** `[-]` Continue to refactor common UI elements into shared components.
    *   *Source: ROADMAP.md (Post-Refactor Plan #3)*

### 4.3. Monitoring & Performance
*   **Task:** `[ ]` Implement basic application monitoring and error tracking (e.g., Sentry, Logflare with Netlify).
*   **Task:** `[ ]` Periodically review application performance and identify bottlenecks.

---
**Note:** Sprint durations are indicative. Priorities and timelines should be reviewed and adjusted regularly by the development team based on progress and evolving business needs. 