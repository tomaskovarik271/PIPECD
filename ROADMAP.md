# Project Roadmap: Custom CRM System

This document outlines the development roadmap for the custom CRM system, based on the decisions in `ADR.md`. The focus is on delivering the Minimum Viable Product (MVP) first, followed by enhancements towards Pipedrive feature parity.

**Legend:**
*   [ ] To Do
*   [x] Done
*   [-] In Progress / Partially Done

## Phase 0: Project Setup & Foundation (Completed)

*   [x] Review and Finalize ADR (`ADR.md`)
*   [x] Initialize Git Repository
*   [x] Define Initial Project Structure (Directories, Config Files)
*   [x] Setup Dependency Management (`package.json`)
*   [x] Setup Local Development Environment (`.env` for credentials, `.gitignore`)
*   [x] Create initial `README.md` with setup instructions.
*   [x] Setup Supabase Project (via Supabase CLI/Dashboard)
*   [x] Setup Netlify Site (link to Git repo later)
*   [x] Setup Inngest Account/Project

## Phase 1: Core Architecture Implementation (Completed)

*   [x] **Backend (`/lib`, Netlify Functions):**
    *   [x] Implement Basic GraphQL Gateway (Netlify Function `/graphql` with **GraphQL Yoga**)
        *   [x] Basic schema definition
        *   [x] Health check query
    *   [x] Implement Basic Inngest Handler (Netlify Function `/api/inngest`)
        *   [x] Basic setup, respond to Inngest verification
    *   [x] Establish `/lib` structure for backend logic modules.
    *   [x] Setup Supabase Client library and configuration.
    *   [x] Implement basic Supabase connection test from a logic module.
*   [x] **Frontend (React/Vite):**
    *   [x] Initialize React project using Vite (`frontend/` directory).
    *   [x] Setup Basic Routing.
    *   [x] Setup GraphQL Client (e.g., `graphql-request`).
    *   [x] Implement basic connection test to GraphQL Gateway.
*   [x] **Authentication:**
    *   [x] Integrate Supabase Auth on the Frontend (Login/Signup UI).
    *   [x] Implement JWT verification in the GraphQL Gateway.
    *   [x] Pass user context from Gateway to Backend Logic modules.
*   [-] **Configuration:**
    *   [x] Configure `netlify.toml` for functions, redirects, build settings.
    *   [x] Setup environment variables (local `.env`, Netlify UI).
    *   [x] Add `.env` to the project's root `.gitignore` file. (Note: Already present and correctly configured).
    *   [x] Review `tsconfig.json` - enable/enforce `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`. Address any resulting TypeScript errors.
    *   [x] Update frontend build command (`package.json`) to fix build issues.
    *   [ ] Clarify project structure: Decide if it's a monorepo (configure workspaces) or separate projects (ensure clear separation). For now, assume separate `frontend` and `netlify/functions` + `lib` backend structure.

## Phase 2: MVP Feature Development (Core CRUD - Completed)

*   *(Initial MVP focused on basic Contact and Deal CRUD)*
*   [x] **Database Schema:**
    *   [x] Define initial Supabase schema (basic `contacts`, `deals`).
    *   [x] Create initial Supabase Migrations.
    *   [x] Define initial Row Level Security (RLS) policies (owner-only access).
*   [x] **Backend Logic (`/lib`):**
    *   [x] Implement logic for basic CRUD operations for **Contacts**.
    *   [x] Implement logic for basic CRUD operations for **Deals**.
*   [x] **GraphQL API (Gateway):**
    *   [x] Define GraphQL schema/resolvers for basic **Contacts** CRUD.
    *   [x] Implement basic input validation (Zod) for **Contacts**.
    *   [x] Define GraphQL schema/resolvers for basic **Deals** CRUD.
    *   [x] Implement input validation (Zod) for **Deals**.
*   [x] **Frontend (UI):**
    *   [x] Build UI components (Chakra UI) for **Contacts CRUD**.
    *   [x] Integrate UI with GraphQL API for **Contacts**.
    *   [x] Build UI components/integration for **Deals CRUD**.
*   [x] **Async Workflows (Inngest):**
    *   [x] Define and send events from Gateway/Logic (`crm/contact.created`, `crm/deal.created`).
    *   [x] Implement basic logging logic in the Inngest Handler (`logContactCreation`, `logDealCreation`).

## Phase 3: Contact Model Enhancement (Completed)

*   *(Enhanced core contact management towards Pipedrive parity: People vs. Organizations. Refactoring, tests, and deployment completed.)*
*   [x] **Database Schema:**
    *   [x] Define `organizations` table schema.
    *   [x] Modify `contacts` table (renamed to `people`, add `organization_id` FK).
    *   [x] Define/Update RLS policies for `organizations` and `people` table.
    *   [x] Create Supabase Migration file for schema changes.
*   [x] **Backend Logic (`/lib`):**
    *   [x] Implement `organizationService.ts` (CRUD for Organizations).
    *   [x] Update `contactService.ts` (renamed to `personService.ts`) to handle relationships.
*   [x] **GraphQL API (Gateway):**
    *   [x] Add `Organization` type, input, queries, mutations.
    *   [x] Update `Contact` type (renamed to `Person`) to include `organization` field/resolver.
    *   [x] Update relevant person queries/mutations.
*   [x] **Frontend (UI):**
    *   [x] Update Person forms and views to manage organization link.
    *   [x] Create UI components/pages for managing Organizations.
    *   [x] Update frontend GraphQL calls.

## Phase 4: Testing, Deployment & Hardening (Ongoing)

*   *(Testing and hardening efforts for existing and new features)*
*   [-] **Testing Strategy Implementation:**
    *   [x] Setup Testing Framework (Vitest & Playwright setup).
    *   [x] Write Integration tests for critical GraphQL Resolvers (Basic coverage complete).
    *   [x] Write Unit tests for key Backend Logic modules (`personService`, `dealService`, `organizationService`, `pipelineService`, `stageService`).
    *   [-] Write Unit/Integration tests for key Frontend code: 
        *   [x] `useAppStore.ts` (Fetch/Delete/Pipeline CRUD Actions)
        *   [ ] `useAppStore.ts` (Stage/Deal CRUD Actions)
        *   [ ] `useAppStore.ts` (Person/Org CRUD Actions)
        *   [ ] `DealsPage.tsx` (Needs update/creation)
        *   [ ] `PeoplePage.tsx` (Needs creation/update)
        *   [ ] `OrganizationsPage.tsx` (Needs creation)
        *   [ ] `PipelinesPage.tsx` (Needs creation)
        *   [ ] `StagesPage.tsx` (Needs creation)
        *   [ ] `CreateDealModal.tsx` / `EditDealModal.tsx`
        *   [ ] `CreatePersonForm.tsx` / `EditPersonForm.tsx`
        *   [ ] `CreateOrganizationModal.tsx` / `EditOrganizationModal.tsx`
        *   [ ] `CreatePipelineModal.tsx` / `EditPipelineModal.tsx`
        *   [ ] `CreateStageModal.tsx` / `EditStageModal.tsx`
    *   [-] Write core E2E tests for user flows:
        *   [x] Basic Auth Flow (Login)
        *   [x] People CRUD Flow (Basic navigation/creation check via current tests)
        *   [x] Deals CRUD Flow (Basic navigation/creation check via current tests)
        *   [x] Organization CRUD Flow (Basic navigation/creation check via current tests)
        *   [x] Pipeline/Stage CRUD Flow (Needs creation)
        *   [ ] Basic Auth Flow (Signup - Needs test)
*   [-] **CI/CD:**
    *   [x] Configure Netlify Build pipeline (Basic setup done).
    *   [ ] Add automated testing step to CI (Frontend & Backend tests).
    *   [x] Setup preview deployments on Netlify.
    *   [x] Perform initial Production Deployment (App is live).
*   [-] **Security Hardening:**
    *   [ ] Implement GraphQL depth/complexity limiting.
    *   [ ] Disable GraphQL introspection in production.
    *   [x] Review RLS policies (Done for MVP/Phase 3 changes).
*   [ ] **Monitoring:**
    *   [ ] Setup basic monitoring for Netlify Functions (latency, errors).
*   [x] **Database Migrations (Production):**
    *   [x] Establish process for applying migrations manually/safely to production (via `supabase db push --linked`).

## Phase 5: Pipedrive Feature Parity & Future Enhancements

*   *(Features to implement after Contact Model Enhancement)*
*   [ ] **Lead Management:** Implement dedicated Lead entity, service, API, UI, and conversion logic.
*   [ ] **Activity Management:** Expand beyond basic logging (Calls, Meetings, linking, completion tracking).
*   [x] **Pipeline Management:** Implement customizable pipelines and stages.
    *   [x] Define `pipelines` and `stages` database schema.
    *   [x] Create Supabase migration for schema changes.
    *   [x] Implement `pipelineService.ts` (CRUD for Pipelines).
    *   [x] Implement `stageService.ts` (CRUD for Stages).
    *   [x] Define GraphQL schema/resolvers for Pipelines/Stages.
    *   [x] Build UI components/integration for Pipelines/Stages.
    *   [x] Update `deals` table/service/API/UI to link to `stages`.
*   [ ] Achieve Full Feature Parity with Pipedrive (Iterative development based on priority - Products, Projects, Email Sync, Workflows, Reporting etc. as per ADR Sec 4.1).
*   [ ] Expand Test Coverage comprehensively.
*   [ ] Performance Optimization (address cold starts if necessary).
*   [ ] Implement Compliance Workflows (GDPR Data Erasure via Inngest).
*   [ ] Regularly review Inngest usage/cost and evaluate alternatives.
*   [ ] Enhance Security (APQ, Operation Whitelisting, full RBAC).
*   [ ] Potentially refactor to `packages/` monorepo (Nx/Turborepo) if complexity warrants.

## Phase 6: Role-Based Access Control (RBAC) Implementation (Database-Driven)

*   [-] **Define Roles & Permissions:**
    *   [x] Define initial roles (e.g., `admin`, `member`).
    *   [x] Define granular permissions (e.g., `create_deal`, `read_any_deal`, `update_own_deal`, `delete_own_deal`, `read_pipeline`, `create_pipeline`, etc.) for each relevant resource (`deal`, `person`, `organization`, `pipeline`, `stage`, `activity`).
    *   [x] Document the mapping between roles and permissions.
*   [x] **Database Schema (New Migration):**
    *   [x] Create `roles` table (`id`, `name UNIQUE`, `description`).
    *   [x] Create `permissions` table (`id`, `resource`, `action`, `description`, `UNIQUE(resource, action)`).
    *   [x] Create `role_permissions` linking table (`role_id`, `permission_id`, `PRIMARY KEY(role_id, permission_id)`).
    *   [x] Create `user_roles` linking table (`user_id`, `role_id`, `PRIMARY KEY(user_id, role_id)`).
    *   [x] Populate `roles` and `permissions` tables with initial definitions.
    *   [x] Populate `role_permissions` table based on the defined role-permission mapping.
    *   [x] Define SQL function `check_permission(p_user_id uuid, p_action text, p_resource text) returns boolean` (Consider `SECURITY DEFINER`). This function checks if the user has the permission via their assigned roles.
*   [x] **RLS Policy Updates (In Same Migration):**
    *   [x] `DROP` existing RLS policies for `people`, `organizations`, `deals`, `pipelines`, `stages`, `activities`.
    *   [x] `CREATE` new RLS policies for each table using `check_permission(auth.uid(), 'action', 'resource')` function.
        *   Example `deals` SELECT: `USING (check_permission(auth.uid(), 'read_own', 'deal') AND auth.uid() = user_id) OR (check_permission(auth.uid(), 'read_any', 'deal'))`
        *   Example `deals` UPDATE: `USING (...) WITH CHECK (...)` using relevant `update_own`/`update_any` permissions.
    *   [x] Ensure `SECURITY INVOKER` is used where appropriate (e.g., SELECT policies accessing `user_id`).
*   [-] **Backend Changes (GraphQL):**
    *   [ ] *Optional:* Update GraphQL context to include the user's effective permissions list (queried via a helper function) for faster checks in resolvers.
    *   [x] Update GraphQL resolvers (e.g., `deletePipeline`, `pipelines`, `stages`, `people`, `person`, `deals`, `organizations`) to perform checks using service layer functions which implicitly use the authenticated client (and thus RLS), complementing RLS.
*   [-] **Frontend Changes:**
    *   [x] *Option 1 (Permissions List):* Add `userPermissions: string[] | null` to Zustand store. Fetch permissions via a dedicated GraphQL query after login. Update auth actions.
    *   [ ] *Option 2 (Role Only):* Keep fetching only the role(s) in the store if UI logic primarily depends on broad roles (`admin` vs `member`).
    *   [-] Update UI components/pages to conditionally render/disable elements based on fetched permissions (`userPermissions.includes('create_pipeline')`). (Pipelines, Stages, Deals, People, Orgs, Activities pages/items done).
*   [x] **Initial Data Seeding:**
    *   [x] Manually assign initial roles (e.g., your user as `admin`) to users via `user_roles` table (SQL or Supabase Studio).
*   [-] **Testing:**
    *   [ ] Update/add Vitest tests focusing on the `check_permission` SQL function logic (if possible) and GraphQL resolver authorization checks.
    *   [x] Update/add Playwright E2E tests verifying UI restrictions based on `admin` vs `member` permissions.
*   [-] **Documentation:**
    *   [ ] Update `DEVELOPER_GUIDE.md`/`README.md` detailing the new RBAC tables, helper function, RLS strategy, and manual role assignment.

## Post-Refactor Hardening & Cleanup Plan (Generated from Code Review May 3rd, 2025)

**Phase 1: Foundational Hardening & Security**

1.  **Security Audit & Remediation (Highest Priority):**
    *   [x] Thoroughly review Row-Level Security (RLS) policies in `supabase/migrations/` for `people`, `organizations`, and `deals` tables. (Findings: Policies exist, cover CRUD, use correct `auth.uid()` logic for ownership).
    *   [x] Ensure policies cover `SELECT`, `INSERT`, `UPDATE`, `DELETE` for all tables.
    *   [x] Verify policies correctly restrict access based on `auth.uid()`.
    *   [x] Check for authorization logic misplaced in services/resolvers. (Findings: Service layer correctly inserts `user_id`).
    *   [ ] Implement missing/incorrect policies via migrations. (Note: None currently required, but review if requirements change, e.g., for team access).
    *   ~~[ ] Add comments to RLS policies explaining their intent.~~ (Skipped as per user request).
2.  **Input Validation (Backend):**
    *   [x] Choose and integrate a runtime validation library (e.g., `zod`) into `netlify/functions/graphql.ts`.
    *   [x] Define validation schemas for all mutation inputs (`createPerson`, `updatePerson`, `createOrganization`, etc.).
    *   [x] Apply validation within the resolvers *before* calling service functions (`lib/`).
    *   [x] Ensure validation errors return user-friendly messages via GraphQL errors.
3.  **Configuration & Environment:**
    *   [x] Add `.env` to the project's root `.gitignore` file. (Note: Already present and correctly configured).
    *   [x] Review `tsconfig.json` - enable/enforce `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`. Address any resulting TypeScript errors.
    *   [ ] Clarify project structure: Decide if it's a monorepo (configure workspaces) or separate projects (ensure clear separation). For now, assume separate `frontend` and `netlify/functions` + `lib` backend structure.
    *   [ ] Review `netlify.toml` for any optimizations (e.g., command caching if applicable).
4.  **Secrets Management:**
    *   [x] Confirm NO secrets are hardcoded anywhere.
    *   [x] Ensure all necessary environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are documented in `env.example.txt` and configured correctly in Netlify build/function settings (not committed).

**Phase 2: Testing & Refinement**

5.  **GraphQL Resolver Testing:**
    *   [ ] Set up a testing environment for Netlify functions/GraphQL resolvers (e.g., using `msw` or similar to mock services/DB).
    *   [ ] Write tests for all queries and mutations in `graphql.ts`.
    *   [ ] Test successful data fetching/mutation.
    *   [ ] Test input validation logic (ensure invalid input is rejected).
    *   [ ] Test authorization (ensure unauthorized access attempts fail - may require mocking auth context).
6.  **Frontend Data Fetching Refactor:**
    *   [x] Centralize GraphQL query/mutation definitions (e.g., in Zustand store `useAppStore.ts`).
    *   [x] Consider using GraphQL Code Generator to create typed hooks/SDK. (Implemented for core types and store actions).
    *   [-] Refactor components (`DealsPage`, `PeoplePage`, `OrganizationsPage`, `PipelinesPage`, `StagesPage` done; Modals like `EditOrganizationModal`, `CreateOrganizationModal`, `DeleteConfirmationDialog` also refactored. Review if other modals require similar updates) to use Zustand store actions/state.
    *   [ ] Ensure consistent loading and error state handling across all data-fetching components.
7.  **Component Testing (Frontend):**
    *   [ ] Increase test coverage for key UI components (e.g., `Create*Modal`, `Edit*Modal`, complex table rendering), including interaction with Zustand store.
    *   [ ] Focus on testing component logic, rendering based on props/state, and basic user interactions.
    *   [ ] Re-implement tests for page components (`DealsPage.tsx`, `PeoplePage.tsx`, etc.) using Zustand store mocks.
8.  **Database Enhancements:**
    *   [ ] Review database schema for potential indexing opportunities on frequently queried/filtered columns (e.g., `name`, `email`, foreign keys). Add indexes via migrations.
    *   [ ] Institute a mandatory peer-review process for all new database migration scripts before merging.

**Phase 3: DX & Future-Proofing**

9.  **State Management (Frontend):**
    *   [x] Evaluate options (Zustand, Jotai, Redux Toolkit) based on anticipated application complexity.
    *   [x] Select and integrate a state management library (Zustand chosen).
    *   [-] Refactor components relying heavily on prop drilling or complex local state to use the chosen library (`DealsPage`, `PeoplePage`, `OrganizationsPage`, `PipelinesPage`, `StagesPage` refactored; Modals pending).
    *   [ ] **Refactor `useAppStore.ts` into Domain-Specific Stores (Addressing Code Audit Recommendation #1):**
        *   [x] Plan the refactor (Define new store structure: Auth, Deals, People, Orgs, Pipelines, Stages, Activities, Theme).
        *   [x] Create empty store files (`src/stores/useAuthStore.ts`, etc.).
        *   [x] Migrate Auth logic to `useAuthStore.ts`.
        *   [x] Migrate Theme logic to `useThemeStore.ts`.
        *   [x] Migrate Deals logic to `useDealStore.ts`.
        *   [x] Migrate People logic to `usePersonStore.ts`.
        *   [x] Migrate Organizations logic to `useOrganizationStore.ts`.
        *   [x] Migrate Pipelines logic to `usePipelineStore.ts`.
        *   [x] Migrate Stages logic to `usePipelineStore.ts` (Note: Integrated into Pipeline store).
        *   [x] Migrate Activities logic to `useActivityStore.ts`.
        *   [x] Update all consuming components to use the new stores.
        *   [ ] Refactor/cleanup `useAppStore.test.ts` and create tests for new stores.
        *   [x] Perform final cleanup of `useAppStore.ts` (File Deleted).
        *   [ ] Update documentation (`DEVELOPER_GUIDE.md`) for new store structure.

10. **Error Handling Standardization:**
    *   [ ] Define specific, typed error classes in `lib/` services.
    *   [x] Ensure services throw these specific errors (Current `handleSupabaseError` throws `GraphQLError`).
    *   [x] Ensure the GraphQL layer catches these errors and maps them to appropriate GraphQL errors for the client (Current `processZodError` handles this).
    *   [-] Implement a consistent strategy for displaying errors to the user in the frontend (Partially done with Zustand error states).
11. **N+1 Problem Mitigation:**
    *   [ ] Identify potential N+1 query issues (e.g., fetching lists with nested relations like `Person.organization`).
    *   [ ] Implement the DataLoader pattern within the GraphQL resolvers to batch database requests.
12. **Documentation & Cleanup:**
    *   [x] Update `README.md` and `DEVELOPER_GUIDE.md` to reflect all changes, chosen libraries, and setup procedures.
    *   [ ] Add code comments explaining complex logic or non-obvious decisions.
    *   [ ] Run `npm audit` (or equivalent) and address critical/high vulnerabilities.
    *   [x] Create/Update ADRs (`ADR.md` or `/docs/adr/`) for key decisions (validation library, **state management (Zustand)**, data fetching strategy).
13. **GraphQL Structure Refactoring:**
    *   [x] Refactor GraphQL schema definitions from `graphql.ts` into separate `.graphql` files in `netlify/functions/graphql/schema/`.
    *   [x] Refactor GraphQL resolvers from `graphql.ts` into separate files (`netlify/functions/graphql/resolvers/`).
    *   [x] Refactor Zod schemas out of `graphql.ts` (`netlify/functions/graphql/validators.ts`).
    *   [x] Refactor GraphQL helpers out of `graphql.ts` (`netlify/functions/graphql/helpers.ts`).

**Other Implicit Tasks:**
*   [x] Refactor duplicated backend service helpers (`getAuthenticatedClient`, `handleSupabaseError`) into `lib/serviceUtils.ts`.
*   [x] Setup Vitest to load `.env` for backend service tests.

## Post-Code-Analysis Action Plan (Generated May 6th, 2024)

This plan addresses specific points raised during the code analysis performed on May 6th, 2024, focusing on improving developer velocity, clarity, and robustness.

**Priority: High (Direct Impact on Dev Velocity / Correctness)**

*   [ ] **(5) Implement Frontend Path Aliases:**
    *   [ ] Configure `baseUrl` and `paths` in `frontend/tsconfig.app.json`.
    *   [ ] Configure `resolve.alias` in `frontend/vite.config.ts`.
    *   [ ] Refactor existing deep relative imports (`../../..`) in `frontend/src` to use the `@/` alias.
    *   *Benefit: Improves import readability, reduces errors when moving files, easier navigation.*
*   [ ] **(6) Fix GraphQL Client Header Inconsistency:**
    *   [ ] Remove all calls to `gqlClient.setHeaders({...})` from `frontend/src/stores/useAuthStore.ts` (within `onAuthStateChange` and `handleSignOut`).
    *   [ ] Verify that the `requestMiddleware` in `frontend/src/lib/graphqlClient.ts` correctly handles token injection (already confirmed in analysis).
    *   *Benefit: Removes incorrect/ineffective code, clarifies the single source of truth for token injection.*
*   [ ] **(15) Generate Backend Types:**
    *   [ ] Add `@graphql-codegen/typescript` and `@graphql-codegen/typescript-resolvers` dependencies.
    *   [ ] Create `codegen.yml` config for backend types (`lib/generated/graphql.ts`) using `typescript` and `typescript-resolvers` plugins, referencing `GraphQLContext`.
    *   [ ] Add `codegen:backend` script to `package.json`.
    *   [ ] Run codegen to generate initial `lib/generated/graphql.ts`.
    *   [ ] Refactor resolver files (`netlify/functions/graphql/resolvers/*.ts`) to use generated `Resolvers`, specific resolver types, and input/output types, casting service results where needed.
    *   [ ] Refactor service files (`lib/*.service.ts`) to use generated types for function signatures and return types, removing local type definitions.
    *   [ ] Remove redundant types from `lib/types.ts`.
    *   [ ] Fix type errors identified by `tsc --noEmit` (manual fixes needed for remaining unused imports/type names in `personService.ts`, `graphql.ts`, `activity.ts`).
    *   *Benefit: Provides strong typing for resolvers and services based on the GraphQL schema, reducing runtime errors and improving developer experience.*
*   [ ] **(7) Setup Database Migrations:**
    *   [ ] Review database schema for potential indexing opportunities on frequently queried/filtered columns (e.g., `name`, `email`, foreign keys). Add indexes via migrations.
    *   [ ] Institute a mandatory peer-review process for all new database migration scripts before merging.

**Priority: Medium (Improves Clarity / Reduces Boilerplate)**

*   [ ] **(7) Clarify/Refactor `useAppStore`:**
    *   Identify any remaining state or actions in `frontend/src/stores/useAppStore.ts` that have *not* been migrated to domain-specific stores (Auth, Theme, Pipelines, etc.).
    *   If state remains, determine if it warrants its own specific store (e.g., `useUISettingsStore`) or can be co-located logically elsewhere.
    *   If the store becomes empty, remove the file and any remaining imports.
    *   *Benefit: Simplifies frontend state management landscape, reduces potential confusion.*
*   [ ] **(9) Simplify Modal Error Handling:**
    *   Refactor `handleSubmit` functions in modal components (e.g., `CreatePipelineModal`, `EditPipelineModal`) to remove redundant `try...catch` blocks.
    *   Rely primarily on checking the return value of the store action and the store's error state (e.g., `pipelinesError`) which is already displayed by an `Alert` component within the modal.
    *   Ensure store actions consistently handle errors and update the store's error state appropriately.
    *   *Benefit: Reduces boilerplate code in modals, makes error handling flow clearer.*
*   [ ] **(11) Consolidate Duplicate GraphQL Query Fields:**
    *   Choose `netlify/functions/graphql/schema/schema.graphql` as the single definition point for the root `Query` type.
    *   Copy any missing `Query` fields from `base.graphql` (e.g., `supabaseConnectionTest`, `me`, `personList`) into `schema.graphql`.
    *   Delete the entire `type Query { ... }` definition from `base.graphql`.
    *   *Benefit: Improves schema readability and maintainability, reduces risk of inconsistencies.*

**Priority: Low (Cleanup / Future Optimization)**

*   [ ] **(1) Remove Unused D&D Libraries:**
    *   Confirm again that `@dnd-kit/*` and `react-beautiful-dnd` are not used (searches indicate they aren't).
    *   Remove these packages (and `array-move`) from `package.json` dependencies.
    *   Run `npm install` (or equivalent).
    *   *Benefit: Cleans up dependencies, slightly reduces install size/time.*
*   [ ] **(4) Remove Non-Standard TS Option:**
    *   Remove the `noUncheckedSideEffectImports: true` line from `frontend/tsconfig.app.json` and `frontend/tsconfig.node.json`.
    *   *Benefit: Removes potentially confusing/non-functional compiler option.*
*   [ ] **(12) Implement Specific Service Layer Error Handling:**
    *   Identify common Supabase error codes (e.g., `23505` unique constraint, `23503` foreign key) relevant to the application.
    *   Modify `lib/serviceUtils.ts#handleSupabaseError` to catch these specific codes and throw more specific `GraphQLError`s (e.g., with `BAD_USER_INPUT` or `CONFLICT` codes) instead of the generic `INTERNAL_SERVER_ERROR`.
    *   *Benefit: Provides more granular error information to the client if needed for specific UI feedback, but requires more effort.*
*   [ ] **(13) Investigate DataLoader for N+1:**
    *   Profile GraphQL queries that fetch lists with nested related data (e.g., fetching Deals and their associated Person and Stage) under load.
    *   If performance issues related to N+1 queries are identified, plan the implementation of `dataloader` within the service layer (requires significant refactoring).
    *   *Benefit: Potential significant performance improvement for complex queries, but involves substantial effort.*

## Phase 7: Advanced Integrations & Capabilities (Future Considerations)

This phase outlines potential future enhancements based on discussions around AI/LLM integration, third-party API exposure, and new domain introduction. These items are subject to further prioritization and detailed planning.

*   **AI/LLM Integration (via Model Context Protocol - MCP):**
        *   **Phase 1: MCP Server Setup & Core Read-Only Resource (Deals)**
            *   [ ] **Project Setup:**
                *   [ ] Add `@modelcontextprotocol/sdk` and `zod` to root `package.json`.
                *   [ ] Create Netlify function for MCP Server (e.g., `netlify/functions/mcp-server.ts`).
            *   [ ] **Basic MCP Server Implementation:**
                *   [ ] Initialize `McpServer` instance from `@modelcontextprotocol/sdk/server/mcp`.
                *   [ ] Sketch Netlify function handler to bridge HTTP requests to an MCP transport (e.g., `StreamableHTTPServerTransport`).
            *   [ ] **Initial Authentication & Authorization Context:**
                *   [ ] Implement Supabase JWT extraction and validation within the MCP server function.
                *   [ ] Define an `authContext` containing `userId` and fetched user permissions (reusing/adapting from GraphQL auth).
            *   [ ] **Deal Resource (Read-Only via MCP):**
                *   [ ] Define a Zod schema for the "Deal" resource as exposed via MCP (`McpDealSchema`).
                *   [ ] Implement `mcpServer.setResourceHandler` for `pipecd://deals` URI, supporting:
                    *   `list` method: Calls `dealService.listDeals`, passing `userId` and filters.
                    *   `read` method: Calls `dealService.getDealById`, passing `dealId` and `userId`.
                *   [ ] Ensure resource handlers use `authContext` for permission enforcement via service layer.
            *   [ ] **Initial Testing (Manual):**
                *   [ ] Use tools (e.g., Postman, curl) to send mock MCP `ListResources` and `ReadResource` requests to the local MCP server endpoint for deals.

        *   **Phase 2: Create Deal MCP Tool & Dynamic Registration PoC**
            *   [ ] **`createDeal` MCP Tool:**
                *   [ ] Define Zod schemas for `createDeal` input and output.
                *   [ ] Implement `mcpServer.setToolHandler` for `createDeal`, calling `dealService.createDeal` and passing `userId` from `authContext`.
            *   [ ] **Dynamic Tool Registration Proof-of-Concept:**
                *   [ ] Conditionally register the `createDeal` tool based on the authenticated user's `deal:create` permission within the MCP server function's request handling logic.
            *   [ ] **Testing (Manual):**
                *   [ ] Test `createDeal` tool, ensuring it only functions if the JWT user has the necessary permissions.

        *   **Phase 3: Robust Authentication, Authorization & Expanded MCP Coverage**
            *   [ ] **Refine Authentication & Permission Handling:**
                *   [ ] Ensure all PipeCD service calls made from MCP handlers correctly pass `userId` for RLS and business logic checks.
                *   [ ] Implement comprehensive dynamic registration (or conditional enabling) of all MCP tools and resource handlers based on fully fetched user permissions for each request/session.
            *   [ ] **Expand MCP Resource Coverage:**
                *   [ ] Implement MCP resource handlers (`list`, `read`) for People, Organizations, Pipelines, Stages, and Activities.
                *   [ ] Define corresponding Zod schemas for each MCP resource type.
            *   [ ] **Expand MCP Tool Coverage:**
                *   [ ] Implement MCP tool handlers for relevant CRUD operations (create, update, delete) on all core entities (People, Orgs, Pipelines, Stages, Activities).
                *   [ ] Define Zod input/output schemas for each new tool.
            *   [ ] **Automated Testing (Unit/Integration):**
                *   [ ] Write unit tests for individual MCP tool handlers and resource handlers (mocking PipeCD services and `authContext`).
                *   [ ] Write integration tests for the MCP server function's authentication and dynamic tool/resource registration logic.

        *   **Phase 4: Inngest Integration for Asynchronous MCP Tools & Advanced Features**
            *   [ ] **Identify Long-Running/Asynchronous MCP Tools:** Determine MCP tool operations that should not block the MCP response (e.g., "generate sales report," "bulk update records").
            *   [ ] **Inngest Integration for Async Tools:**
                *   [ ] Modify identified MCP tool handlers to validate inputs and dispatch an Inngest event (e.g., `mcp/generate.sales.report`) with necessary parameters and `userId`.
                *   [ ] Return an immediate acknowledgment from the MCP tool (e.g., "Processing started").
                *   [ ] Implement corresponding Inngest functions to perform the long-running tasks, using the `userId` for permission context.
            *   [ ] **MCP Error Handling:** Implement robust mapping from PipeCD service errors to appropriate MCP error responses.
            *   [ ] **MCP Prompt Capability (Optional):**
                *   [ ] If PipeCD intends to expose prompt templates, implement `ListPrompts` and `GetPrompt` handlers.

        *   **Phase 5: Documentation & Refinement**
            *   [ ] **Update `DEVELOPER_GUIDE.md`:** Add a new, detailed section covering:
                *   MCP Server architecture for PipeCD.
                *   Defined MCP URI schemes for resources.
                *   Available MCP tools and their Zod schemas.
                *   Authentication and authorization flow for MCP requests.
            *   [ ] **Update `ADR-005`:** Ensure ADR-005 ("Advanced System Extensibility and Integration Strategies") aligns with the final MCP implementation details and decisions.
            *   [ ] **MCP Client-Side Testing (Automated):**
                *   [ ] If feasible, use `@modelcontextprotocol/sdk/client` to write automated integration tests against the deployed PipeCD MCP server.
            *   [ ] **Review & Refine:** Conduct a final review of the MCP integration for security, performance, and usability.

*   **Third-Party API Exposure:**
    *   [ ] **Define Third-Party API Strategy:** Formalize the strategy for exposing PipeCD functionality (likely leveraging the existing GraphQL API).
    *   [ ] **Implement Enhanced Authentication for APIs:** Develop support for API Key / Service Account authentication if deemed necessary, alongside existing OAuth capabilities.
    *   [ ] **Develop API Documentation:** Create comprehensive documentation for third-party developers.
    *   [ ] **Pilot Integration:** Work with a pilot third-party developer/system to test and refine the API.

*   **New Business Domain Expansion (Example: General Ledger):**
    *   [ ] **Detailed Domain Analysis & Design:** Thoroughly analyze requirements for any new major domain (e.g., General Ledger).
    *   [ ] **Implement Core Domain Functionality:** Following established patterns:
        *   [ ] New Database schema (Supabase migrations).
        *   [ ] New Backend services (`lib/`).
        *   [ ] New GraphQL schema, types, queries, mutations, resolvers.
        *   [ ] New Frontend stores, pages, components.
    *   [ ] **Integrate with Inngest:** Use Inngest for cross-domain asynchronous processes and side effects.
    *   [ ] **AI/LLM Access:** Extend the AI Integration Layer to support new domain data/actions if required.

*   **Enhanced Asynchronous Processing & UX:**
    *   [ ] **Review and Optimize Inngest Usage:** As Inngest use grows, periodically review for efficiency, cost, and error handling.
    *   [ ] **Improve Frontend Feedback for Async Operations:** Enhance UI to provide clear loading states, progress indicators, and notifications for background tasks initiated by users or LLMs.

*   **Continuous Monitoring & Evolution:**
    *   [ ] Monitor advancements in AI/LLM tooling and integration patterns.
    *   [ ] Regularly review and update architectural decisions (ADRs) as the system evolves and new requirements emerge.

---

*This roadmap is a living document and will be updated as the project progresses.* 