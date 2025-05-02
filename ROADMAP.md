# Project Roadmap: Custom CRM System

This document outlines the development roadmap for the custom CRM system, based on the decisions in `ADR.md`. The focus is on delivering the Minimum Viable Product (MVP) first.

**Legend:**
*   [ ] To Do
*   [x] Done
*   [-] In Progress

## Phase 0: Project Setup & Foundation (Current)

*   [x] Review and Finalize ADR (`ADR.md`)
*   [x] Initialize Git Repository
*   [x] Define Initial Project Structure (Directories, Config Files)
*   [x] Setup Dependency Management (`package.json`)
*   [x] Setup Local Development Environment (`.env` for credentials, `.gitignore`)
*   [x] Create initial `README.md` with setup instructions.
*   [x] Setup Supabase Project (via Supabase CLI/Dashboard)
*   [x] Setup Netlify Site (link to Git repo later)
*   [x] Setup Inngest Account/Project

## Phase 1: Core Architecture Implementation (Current)

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

## Phase 2: MVP Feature Development (Core CRM) (Current)

*   *(Define specific MVP features here - e.g., Contact Management, Basic Deal Tracking)*
*   [-] **Database Schema:**
    *   [x] Define initial Supabase schema (e.g., `users`, `contacts`, `deals`).
    *   [x] Create initial Supabase Migrations.
    *   [x] Define initial Row Level Security (RLS) policies (default deny, grant specific access).
*   [-] **Backend Logic (`/lib`):**
    *   [x] Implement logic for MVP features (CRUD operations for **Contacts**).
    *   [ ] Implement logic for MVP features (CRUD operations for **Deals**).
*   [-] **GraphQL API (Gateway):**
    *   [x] Define GraphQL schema (Types, Queries, Mutations) for **Contacts**.
    *   [x] Implement Resolvers connecting to Backend Logic for **Contacts**.
    *   [x] Implement authorization checks within resolvers (via JWT context).
    *   [x] Implement basic input validation (e.g., using Zod) for **Contacts**.
    *   [ ] Define GraphQL schema/resolvers for **Deals**.
*   [-] **Frontend (UI):**
    *   [x] Build UI components (using Chakra UI) for **Contacts CRUD**.
    *   [x] Integrate UI with GraphQL API (Queries/Mutations) for **Contacts**.
    *   [x] Implement basic state management for **Contacts** page.
    *   [ ] Build UI components/integration for **Deals**.
*   [ ] **Async Workflows (Inngest):**
    *   [-] Implement a simple async task for MVP (e.g., send a welcome email stub on user signup, or log deal creation).
    *   [x] Define and send events from Gateway/Logic (Implemented for `crm/contact.created`).
    *   [-] Implement corresponding logic in the Inngest Handler (Basic handler defined; full local testing deferred).

## Phase 3: Testing & Deployment

*   [ ] **Testing Strategy (Initial Implementation):**
    *   [ ] Setup Testing Framework (e.g., Vitest for unit/integration, Playwright/Cypress for E2E).
    *   [ ] Write Integration tests for critical GraphQL Resolvers & Inngest Handlers.
    *   [ ] Write Unit tests for key Backend Logic modules.
    *   [ ] Write core E2E tests for MVP user flows (e.g., login, create contact).
*   [ ] **CI/CD:**
    *   [ ] Configure Netlify Build pipeline.
    *   [ ] Add automated testing step to CI.
    *   [ ] Setup preview deployments on Netlify.
    *   [ ] Perform initial Production Deployment.
*   [ ] **Security Hardening:**
    *   [ ] Implement GraphQL depth/complexity limiting.
    *   [ ] Disable GraphQL introspection in production.
    *   [x] Review RLS policies (Done for Contacts).
*   [ ] **Monitoring:**
    *   [ ] Setup basic monitoring for Netlify Functions (latency, errors).

## Phase 4: Post-MVP & Future Enhancements

*   [ ] Achieve Full Feature Parity with Pipedrive (Iterative development based on priority).
*   [ ] Expand Test Coverage.
*   [ ] Performance Optimization (address cold starts if necessary, potentially switch Gateway to Yoga).
*   [ ] Implement Advanced Features (Reporting, Custom Fields, etc.).
*   [ ] Explore adding new Business Domains (Accounting, Logistics) as per DDD.
    *   [ ] Potentially refactor to `packages/` monorepo (Nx/Turborepo) if complexity warrants.
*   [ ] Implement Compliance Workflows (GDPR Data Erasure).
*   [ ] Regularly review Inngest usage/cost and evaluate alternatives.
*   [ ] Enhance Security (APQ, Operation Whitelisting).

## Development Log / Issues

This section tracks issues encountered during development and their status/resolution.

1.  **Issue:** `netlify dev` build fails to resolve Inngest module.
    *   **Status:** **Unresolved (Ignored for now).** Build succeeds in production.

2.  **Issue:** `netlify dev` failed to inject `.env` variables into function context.
    *   **Status:** **Resolved.**

3.  **Issue:** Vite dev server (`npm run dev` in `frontend/`) failed to parse `index.html`.
    *   **Status:** **Resolved.** Cleared Vite cache (`frontend/node_modules/.vite`).

4.  **Issue:** RLS policy prevented contact creation.
    *   **Status:** **Resolved.** Updated `contactService.ts` to use an authenticated Supabase client (via JWT) for write operations.

5.  **Issue:** Generic error messages for Zod validation failures on frontend.
    *   **Status:** **Resolved.** Configured Yoga `maskedErrors` and updated frontend `catch` blocks to display specific validation messages.

6.  **Issue:** Inngest function execution not reliably testable locally with `netlify dev`.
    *   **Status:** **Workaround.** Event *sending* is verified. Local *execution* testing deferred due to `netlify dev` proxy limitations. Full workflow to be tested in deployed environments.

7.  **Issue:** Netlify build failed due to missing frontend dependencies.
    *   **Status:** **Resolved.** Updated `netlify.toml` build command to `cd frontend && npm install && npm run build`.

8.  **Issue:** Netlify build failed due to unused variable (`Spacer`) causing TypeScript error.
    *   **Status:** **Resolved.** Removed unused import from `ContactsPage.tsx`.

9.  **Issue:** Deployed frontend showed errors: `Missing env variable: VITE_SUPABASE_URL`.
    *   **Status:** **Resolved.** Added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables to Netlify UI.

10. **Issue:** GitHub OAuth login failed with redirect to GitHub sign-in and incorrect `state` URL.
    *   **Status:** **Resolved.** Configured GitHub OAuth Provider Client ID/Secret and correct Site URL in production Supabase project dashboard.

11. **Issue:** GitHub OAuth login redirected back to app but failed to establish session (token not in storage).
    *   **Status:** **Resolved.** Removed `detectSessionInUrl: false` from frontend Supabase client options in `frontend/src/lib/supabase.ts`.

12. **Issue:** Deployed frontend showed 502 Bad Gateway errors when calling GraphQL API.
    *   **Status:** **Resolved.** Added required runtime environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`) to Netlify UI.

13. **Issue:** Deployed Contacts page failed with `relation "public.contacts" does not exist`.
    *   **Status:** **Resolved.** Applied database migrations to production Supabase project using `supabase link --project-ref <ref>` and `supabase migration up --linked`.

---

*This roadmap is a living document and will be updated as the project progresses.* 