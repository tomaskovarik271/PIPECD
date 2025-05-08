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
    *   [x] Update/add Playwright E2E tests verifying UI restrictions based on `admin` vs `member` permissions. (Manual testing confirmed success).
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

---

*This roadmap is a living document and will be updated as the project progresses.* 