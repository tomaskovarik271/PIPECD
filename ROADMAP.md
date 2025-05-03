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
    *   [x] Refactored `PeoplePage.tsx` for consistency (useQuery, Table).

## Phase 4: Testing, Deployment & Hardening (Ongoing)

*   *(Testing and hardening efforts for existing and new features)*
*   [-] **Testing Strategy Implementation:**
    *   [x] Setup Testing Framework (Vitest & Playwright setup).
    *   [x] Write Integration tests for critical GraphQL Resolvers.
    *   [x] Write Unit tests for key Backend Logic modules (`personService`, `dealService`, `organizationService`, `leadService`).
    *   [-] Write Unit/Integration tests for key Frontend components: 
        *   [x] `DealsPage.tsx`
        *   [ ] `PeoplePage.tsx` (Needs update after refactor)
        *   [ ] `OrganizationsPage.tsx` (Needs creation)
        *   [ ] `LeadsPage.tsx` (Needs creation)
        *   [ ] `CreateDealModal.tsx` / `EditDealModal.tsx`
        *   [ ] `CreatePersonForm.tsx` / `EditPersonForm.tsx`
        *   [ ] `CreateOrganizationModal.tsx` / `EditOrganizationModal.tsx`
        *   [ ] `CreateLeadModal.tsx` / `EditLeadModal.tsx` 
        *   [ ] `GenericDeleteConfirmationDialog.tsx`
    *   [-] Write core E2E tests for user flows:
        *   [x] Basic Auth Flow (Login)
        *   [x] People CRUD Flow
        *   [x] Deals CRUD Flow
        *   [x] Organization CRUD Flow
        *   [ ] Lead CRUD Flow (Needs creation)
        *   [ ] Basic Auth Flow (Signup - Needs test)
*   [-] **CI/CD:**
    *   [x] Configure Netlify Build pipeline (Basic setup done).
    *   [ ] Add automated testing step to CI (Frontend & Backend tests).
    *   [x] Setup preview deployments on Netlify.
    *   [x] Perform initial Production Deployment (App is live).
*   [-] **Security Hardening:**
    *   [ ] Implement GraphQL depth/complexity limiting.
    *   [ ] Disable GraphQL introspection in production.
    *   [x] Review RLS policies (Done for MVP/Phase 3/Phase 5 changes).
*   [ ] **Monitoring:**
    *   [ ] Setup basic monitoring for Netlify Functions (latency, errors).
*   [x] **Database Migrations (Production):**
    *   [x] Establish process for applying migrations manually/safely to production (via `supabase db push --linked`).

## Phase 5: Lead Management (Completed)

*   [x] Define and implement a `Lead` entity (database, service, GraphQL).
*   [x] Create frontend UI for viewing, creating, editing, and deleting Leads.
*   [ ] Implement Lead conversion functionality (e.g., to Deal/Person/Organization).

## Phase 6: Lead Conversion & Pipedrive Feature Parity

*   *(Features to implement after Lead Management)*
*   [ ] Implement Lead conversion functionality (from Phase 5).
*   [ ] **Activity Management:** Expand beyond basic logging (Calls, Meetings, linking, completion tracking).
*   [ ] **Pipeline Management:** Implement customizable pipelines and stages.
*   [ ] **Email Sync:** Expand email integration capabilities.
*   [ ] **Reporting:** Implement comprehensive reporting capabilities.
*   [ ] **Workflows:** Expand workflow capabilities.
*   [ ] **GDPR Compliance:** Implement GDPR compliance workflows.
*   [ ] **Performance Optimization:** Address performance issues and optimize system performance.
*   [ ] **Security:** Enhance security measures.
*   [ ] **User Experience:** Improve user experience and interface.
*   [ ] **Integration:** Expand system integration capabilities.
*   [ ] **Regular Reviews:** Regularly review system performance and user feedback.
*   [ ] **Future Features:** Identify and plan for future features and enhancements.

## Phase 7: Code Refactoring & Consistency Audit (Planned)

*   *(Addressing findings from the consistency audit to improve maintainability, reduce duplication, and enforce standards across the codebase.)*

*   [-] **Phase A: Backend Authentication & Service Layer Consolidation**
    *   [x] **Standardize Service Signatures:** Refactor `personService`, `organizationService`, `dealService` to accept `supabaseClient`, remove `userId`/`accessToken`.
    *   [x] **Update Service Implementations:** Rely solely on passed `supabaseClient` for RLS, remove internal auth checks.
    *   [x] **Refactor GraphQL Resolvers (Queries/Mutations):** Update resolvers to pass `context.supabaseClient` instead of `userId`/`accessToken`.
    *   [x] **Refactor Nested GraphQL Resolvers:** Ensure nested resolvers (`Person.organization`, `Deal.person`, etc.) also use `context.supabaseClient` consistently.
    *   [x] **Update Backend Unit Tests:** Align `*Service.test.ts` files with new signatures (pass client, adjust auth mocks).
    *   [x] **Update Resolver Integration Tests:** Align `graphql.test.ts` with new service call patterns.

*   [-] **Phase B: Backend Error Handling & Schema Consistency**
    *   [x] **Standardize Resolver Error Handling:** Implement consistent error processing (e.g., enhance `processZodError` or new helper) for all resolvers.
    *   [x] **Standardize "Not Found" Handling:** Decide and implement consistent return (`null` or specific error) for `get*ById` resolvers.
    *   [x] **Refine Zod Update Schemas:** Add `.refine()` to `Person`/`Org`/`Deal` update schemas if needed to prevent invalid states.
    *   [x] **Review Inngest Event Strategy:** Define and implement consistent event sending logic (Create/Update/Delete?) across entities.

*   [-] **Phase C: Frontend Consolidation & Type Safety**
    *   [ ] **Consolidate Frontend Data Fetching:** Remove all `graphql-request` usage, refactor to Apollo Client hooks, uninstall dependency.
    *   [ ] **Implement GraphQL Code Generation:** Setup `graphql-code-generator`, generate types/hooks, replace manual frontend types.
    *   [ ] **Standardize Frontend Component Naming:** Choose standard (e.g., `*Modal` vs. `*Form`) and rename components/files.

*   [-] **Phase D: Testing & Cleanup**
    *   [ ] **Review Supabase Test Mocks:** Evaluate complexity, investigate simplification options.
    *   [ ] **Expand Test Coverage:** Add remaining Frontend component tests (People, Orgs, Leads pages/modals). Add E2E Lead CRUD flow, Signup flow. (Tracked under Phase 4 ToDo items).
    *   [ ] **Dependency Audit:** Prune unused dependencies after refactoring.

*   [-] **Phase E: Documentation Update**
    *   [ ] **Update Documentation:** Review and update `README.md` and `DEVELOPER_GUIDE.md` to reflect all refactoring changes (auth, services, data fetching, testing, etc.).

---

*This roadmap is a living document and will be updated as the project progresses.* 