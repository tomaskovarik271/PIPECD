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
    *   [ ] Implement logic for MVP features (CRUD operations for Contacts, Deals).
*   [ ] **GraphQL API (Gateway):**
    *   [ ] Define GraphQL schema (Types, Queries, Mutations) for MVP features.
    *   [ ] Implement Resolvers connecting to Backend Logic.
    *   [ ] Implement authorization checks within resolvers.
*   [ ] **Frontend (UI):**
    *   [ ] Build UI components (using Chakra UI) for MVP features.
    *   [ ] Integrate UI with GraphQL API (Queries/Mutations).
    *   [ ] Implement basic state management.
*   [ ] **Async Workflows (Inngest):**
    *   [ ] Implement a simple async task for MVP (e.g., send a welcome email stub on user signup, or log deal creation).
    *   [ ] Define and send events from Gateway/Logic.
    *   [ ] Implement corresponding logic in the Inngest Handler.

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
    *   [ ] Review RLS policies.
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
    *   **Error:** `✘ [ERROR] Could not resolve "inngest/netlify"` because the path is not listed in the package's `exports` map.
    *   **Attempts:** Correct `tsconfig.json` (`moduleResolution: NodeNext`), explicit `node_bundler = "esbuild"` in `netlify.toml`.
    *   **Status:** **Unresolved (Ignored for now).** Despite the build-time error, `netlify dev` seems to load the `inngest` function successfully at runtime. Will monitor if this causes issues later or blocks deployment.

2.  **Issue:** `netlify dev` failed to inject `.env` variables into function context.
    *   **Symptom:** Supabase client initialization failed with `Error: SUPABASE_URL environment variable is not set.` despite `.env` file being correct.
    *   **Attempts:** Verified `.env` content and location, deleted `.netlify` cache directory, restarted `netlify dev` cleanly.
    *   **Status:** **Resolved.** Restarting `netlify dev` cleanly after verifying `.env` caused it to correctly log `◈ Injected .env file env var: SUPABASE_URL` etc., and the Supabase client initialized successfully. Explicitly loading with `dotenv` was added as a temporary workaround but is likely now redundant.

---

*This roadmap is a living document and will be updated as the project progresses.* 