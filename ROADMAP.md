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
*   [ ] Setup Netlify Site (link to Git repo later)
*   [ ] Setup Inngest Account/Project

## Phase 1: Core Architecture Implementation

*   [ ] **Backend (`/lib`, Netlify Functions):**
    *   [ ] Implement Basic GraphQL Gateway (Netlify Function `/graphql` with Apollo Server)
        *   [ ] Basic schema definition
        *   [ ] Health check query
    *   [ ] Implement Basic Inngest Handler (Netlify Function `/api/inngest`)
        *   [ ] Basic setup, respond to Inngest verification
    *   [ ] Establish `/lib` structure for backend logic modules.
    *   [ ] Setup Supabase Client library and configuration.
    *   [ ] Implement basic Supabase connection test from a logic module.
*   [ ] **Frontend (React/Vite):**
    *   [ ] Initialize React project using Vite (`frontend/` directory).
    *   [ ] Setup Basic Routing.
    *   [ ] Setup GraphQL Client (e.g., Apollo Client).
    *   [ ] Implement basic connection test to GraphQL Gateway.
*   [ ] **Authentication:**
    *   [ ] Integrate Supabase Auth on the Frontend (Login/Signup UI).
    *   [ ] Implement JWT verification in the GraphQL Gateway.
    *   [ ] Pass user context from Gateway to Backend Logic modules.
*   [ ] **Configuration:**
    *   [ ] Configure `netlify.toml` for functions, redirects, build settings.
    *   [ ] Setup environment variables (local `.env`, Netlify UI).

## Phase 2: MVP Feature Development (Core CRM)

*   *(Define specific MVP features here - e.g., Contact Management, Basic Deal Tracking)*
*   [ ] **Database Schema:**
    *   [ ] Define initial Supabase schema (e.g., `users`, `contacts`, `deals`).
    *   [ ] Create initial Supabase Migrations.
    *   [ ] Define initial Row Level Security (RLS) policies (default deny, grant specific access).
*   [ ] **Backend Logic (`/lib`):**
    *   [ ] Implement logic for MVP features (CRUD operations for Contacts, Deals).
    *   [ ] Implement input validation (`zod`).
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

---

*This roadmap is a living document and will be updated as the project progresses.* 