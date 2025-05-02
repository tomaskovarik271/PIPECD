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
    *   [x] Implement logic for MVP features (CRUD operations for **Deals**).
*   [-] **GraphQL API (Gateway):**
    *   [x] Define GraphQL schema (Types, Queries, Mutations) for **Contacts**.
    *   [x] Implement Resolvers connecting to Backend Logic for **Contacts**.
    *   [x] Implement authorization checks within resolvers (via JWT context).
    *   [x] Implement basic input validation (e.g., using Zod) for **Contacts**.
    *   [x] Define GraphQL schema/resolvers for **Deals**.
    *   [x] Implement input validation (Zod) for **Deals**.
*   [-] **Frontend (UI):**
    *   [x] Build UI components (using Chakra UI) for **Contacts CRUD**.
    *   [x] Integrate UI with GraphQL API (Queries/Mutations) for **Contacts**.
    *   [x] Implement basic state management for **Contacts** page.
    *   [x] Build UI components/integration for **Deals CRUD** (Table, Create/Edit Modals).
*   [ ] **Async Workflows (Inngest):**
    *   [x] Define and send events from Gateway/Logic (`crm/contact.created`, `crm/deal.created`).
    *   [-] Implement corresponding logic in the Inngest Handler (`logContactCreation`, `logDealCreation`). 
        *   Note: Full E2E testing of handler *execution* requires deployment; local testing limited to verifying event *sending* via `npx inngest-cli dev`.

## Phase 3: Testing & Deployment

*   [-] **Testing Strategy (Initial Implementation):**
    *   [-] Setup Testing Framework (Vitest for unit/integration):
        *   [x] Install Vitest & dependencies (Frontend - `frontend/`)
        *   [x] Configure Vitest (Frontend - `vite.config.ts`, `setupTests.ts`)
        *   [x] Add initial React component test (`DealsPage.test.tsx`)
        *   [x] Install Vitest (Backend - Root)
        *   [x] Configure Vitest (Backend - `vitest.config.ts`)
        *   [x] Add initial service test (`dealService.test.ts` with mocks)
    *   [ ] Setup Testing Framework (Playwright/Cypress for E2E).
    *   [ ] Write Integration tests for critical GraphQL Resolvers & Inngest Handlers.
    *   [-] Write Unit tests for key Backend Logic modules (`contactService`, `dealService` - *started*).
    *   [ ] Write core E2E tests for MVP user flows (login, create/edit/delete contact, create/edit/delete deal).
*   [ ] **CI/CD:**
    *   [x] Configure Netlify Build pipeline (Basic setup done).
    *   [ ] Add automated testing step to CI (Frontend & Backend tests).
    *   [ ] Setup preview deployments on Netlify.
    *   [x] Perform initial Production Deployment (Already live).
*   [ ] **Security Hardening:**
    *   [ ] Implement GraphQL depth/complexity limiting.
    *   [ ] Disable GraphQL introspection in production.
    *   [x] Review RLS policies (Done for Contacts & Deals).
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

---

*This roadmap is a living document and will be updated as the project progresses.* 