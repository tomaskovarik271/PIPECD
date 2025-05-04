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

*   [-] **Backend (`/lib`, Netlify Functions):**
    *   [x] Implement Basic GraphQL Gateway (Netlify Function `/graphql` with **GraphQL Yoga**)
        *   [x] Basic schema definition
        *   [x] Health check query
    *   [x] Implement Basic Inngest Handler (Netlify Function `/api/inngest`)
        *   [x] Basic setup, respond to Inngest verification
    *   [x] Establish `/lib` structure for backend logic modules.
    *   [x] Setup Supabase Client library and configuration.
    *   [x] Implement basic Supabase connection test from a logic module.
*   [-] **Frontend (React/Vite):**
    *   [x] Initialize React project using Vite (`frontend/` directory).
    *   [x] Setup Basic Routing.
    *   [x] Setup GraphQL Client (e.g., `graphql-request`).
    *   [x] Implement basic connection test to GraphQL Gateway.
*   [-] **Authentication:**
    *   [x] Integrate Supabase Auth on the Frontend (Login/Signup UI).
    *   [x] Implement JWT verification in the GraphQL Gateway.
    *   [x] Pass user context from Gateway to Backend Logic modules.
*   [-] **Configuration:**
    *   [x] Configure `netlify.toml` for functions, redirects, build settings.
    *   [x] Setup environment variables (local `.env`, Netlify UI).
    *   [x] Add `.env` to the project's root `.gitignore` file. (Note: Already present and correctly configured).
    *   [x] Review `tsconfig.json` - enable/enforce `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`. Address any resulting TypeScript errors.
    *   [ ] Clarify project structure: Decide if it's a monorepo (configure workspaces) or separate projects (ensure clear separation). For now, assume separate `frontend` and `netlify/functions` + `lib` backend structure.

## Phase 2: MVP Feature Development (Core CRUD - Completed)

*   *(Initial MVP focused on basic Contact and Deal CRUD)*
*   [-] **Database Schema:**
    *   [x] Define initial Supabase schema (basic `contacts`, `deals`).
    *   [x] Create initial Supabase Migrations.
    *   [x] Define initial Row Level Security (RLS) policies (owner-only access).
*   [-] **Backend Logic (`/lib`):**
    *   [x] Implement logic for basic CRUD operations for **Contacts**.
    *   [x] Implement logic for basic CRUD operations for **Deals**.
*   [-] **GraphQL API (Gateway):**
    *   [x] Define GraphQL schema/resolvers for basic **Contacts** CRUD.
    *   [x] Implement basic input validation (Zod) for **Contacts**.
    *   [x] Define GraphQL schema/resolvers for basic **Deals** CRUD.
    *   [x] Implement input validation (Zod) for **Deals**.
*   [-] **Frontend (UI):**
    *   [x] Build UI components (Chakra UI) for **Contacts CRUD**.
    *   [x] Integrate UI with GraphQL API for **Contacts**.
    *   [x] Build UI components/integration for **Deals CRUD**.
*   [-] **Async Workflows (Inngest):**
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
    *   [x] Write Unit tests for key Backend Logic modules (`personService`, `dealService`, `organizationService`).
    *   [-] Write Unit/Integration tests for key Frontend components: 
        *   [x] `DealsPage.tsx` (initial render, loading, error, data display)
        *   [ ] `PeoplePage.tsx` (needs creation/update)
        *   [ ] `OrganizationsPage.tsx` (needs creation)
        *   [ ] `CreateDealModal.tsx`
        *   [ ] `EditDealModal.tsx`
        *   [ ] `CreatePersonForm.tsx`
        *   [ ] `EditPersonForm.tsx`
        *   [ ] `CreateOrganizationModal.tsx`
        *   [ ] `EditOrganizationModal.tsx`
    *   [-] Write core E2E tests for user flows:
        *   [x] Basic Auth Flow (Login)
        *   [x] People CRUD Flow (Basic navigation/creation check via current tests)
        *   [x] Deals CRUD Flow (Basic navigation/creation check via current tests)
        *   [x] Organization CRUD Flow (Basic navigation/creation check via current tests)
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
*   [ ] **Pipeline Management:** Implement customizable pipelines and stages.
*   [ ] Achieve Full Feature Parity with Pipedrive (Iterative development based on priority - Products, Projects, Email Sync, Workflows, Reporting etc. as per ADR Sec 4.1).
*   [ ] Expand Test Coverage comprehensively.
*   [ ] Performance Optimization (address cold starts if necessary).
*   [ ] Implement Compliance Workflows (GDPR Data Erasure via Inngest).
*   [ ] Regularly review Inngest usage/cost and evaluate alternatives.
*   [ ] Enhance Security (APQ, Operation Whitelisting, full RBAC).
*   [ ] Potentially refactor to `packages/` monorepo (Nx/Turborepo) if complexity warrants.

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
    *   [ ] Consider using GraphQL Code Generator to create typed hooks/SDK.
    *   [-] Refactor components (`DealsPage` done; `PeoplePage`, `OrganizationsPage`, modals pending) to use Zustand store actions/state.
    *   [ ] Ensure consistent loading and error state handling across all data-fetching components.
7.  **Component Testing (Frontend):**
    *   [ ] Increase test coverage for key UI components (e.g., `Create*Modal`, `Edit*Modal`, complex table rendering), including interaction with Zustand store.
    *   [ ] Focus on testing component logic, rendering based on props/state, and basic user interactions.
    *   [ ] Refactor existing tests (`DealsPage.test.tsx`) to use more stable selectors (e.g., `data-testid`) if needed and adapt to Zustand.
8.  **Database Enhancements:**
    *   [ ] Review database schema for potential indexing opportunities on frequently queried/filtered columns (e.g., `name`, `email`, foreign keys). Add indexes via migrations.
    *   [ ] Institute a mandatory peer-review process for all new database migration scripts before merging.

**Phase 3: DX & Future-Proofing**

9.  **State Management (Frontend):**
    *   [x] Evaluate options (Zustand, Jotai, Redux Toolkit) based on anticipated application complexity.
    *   [x] Select and integrate a state management library (Zustand chosen).
    *   [-] Refactor components relying heavily on prop drilling or complex local state to use the chosen library (`DealsPage` refactored, others pending).
10. **Error Handling Standardization:**
    *   [ ] Define specific, typed error classes in `lib/` services.
    *   [x] Ensure services throw these specific errors (Current `handleSupabaseError` throws `GraphQLError`).
    *   [x] Ensure the GraphQL layer catches these errors and maps them to appropriate GraphQL errors for the client (Current `processZodError` handles this).
    *   [-] Implement a consistent strategy for displaying errors to the user in the frontend (Partially done with Zustand `dealsError` state).
11. **N+1 Problem Mitigation:**
    *   [ ] Identify potential N+1 query issues (e.g., fetching lists with nested relations like `Person.organization`).
    *   [ ] Implement the DataLoader pattern within the GraphQL resolvers to batch database requests.
12. **Documentation & Cleanup:**
    *   [x] Update `README.md` and `DEVELOPER_GUIDE.md` to reflect all changes, chosen libraries, and setup procedures.
    *   [ ] Add code comments explaining complex logic or non-obvious decisions.
    *   [ ] Run `npm audit` (or equivalent) and address critical/high vulnerabilities.
    *   [x] Create ADRs (`ADR.md` or `/docs/adr/`) for key decisions (validation library, **state management (Zustand)**, data fetching strategy).

**Other Implicit Tasks:**
*   [x] Refactor duplicated backend service helpers (`getAuthenticatedClient`, `handleSupabaseError`) into `lib/serviceUtils.ts`.

---

*This roadmap is a living document and will be updated as the project progresses.* 