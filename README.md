# Custom CRM System (Project PipeCD)

This repository contains the source code for the custom CRM system designed to replace Pipedrive, built following the architectural decisions outlined in `ADR.md`.

## Overview

The system utilizes a serverless architecture based on:

*   **Frontend:** React (Vite) SPA hosted on Netlify
*   **Frontend State:** Zustand (`frontend/src/stores/useAppStore.ts`)
*   **UI Library:** Chakra UI
*   **API:** GraphQL Gateway (**GraphQL Yoga**) running as a Netlify Function (`netlify/functions/graphql.ts`); Schema defined in `.graphql` files within `netlify/functions/graphql/schema/`.
*   **Backend Logic:** TypeScript modules in `/lib` (e.g., `personService.ts`, `dealService.ts`, `organizationService.ts`, `pipelineService.ts`), utilities in `lib/serviceUtils.ts`
*   **Database:** Supabase (PostgreSQL) with RLS
*   **Authentication:** Supabase Auth (Email/Password, GitHub configured)
*   **Async Tasks:** Inngest (`netlify/functions/inngest.ts`)
*   **Testing:** Vitest (Unit/Integration), Playwright (E2E)
*   **Hosting/Deployment:** Netlify (`netlify.toml`)

**Current Status:**
*   Core infrastructure is set up (Supabase, Netlify, Inngest).
*   Authentication (Email/Password, GitHub) is working, managed via Zustand store.
*   Person CRUD implemented.
*   Deal CRUD implemented (Data fetching managed via Zustand store).
*   Organization CRUD implemented.
*   Backend service layer refactored with shared utilities (`lib/serviceUtils.ts`).
*   [-] Pipeline/Stage database schema defined and migrated locally (`pipelines`, `stages` tables, `deals.stage_id`).
*   [-] Basic Pipeline/Stage CRUD service implemented (`pipelineService.ts`).
*   Inngest event sending implemented for Person & Deal creation (simple logging handlers).
*   Basic UI (Chakra UI) implemented for Auth, People, Organizations, and Deals.
*   Unit/Integration tests implemented for backend services (`lib/`), frontend components (`frontend/src/`), and GraphQL resolvers (`netlify/functions/`).
*   Basic E2E testing setup (Playwright) with login and basic CRUD flows implemented.
*   Production deployment is live.

Refer to `ADR.md` for architectural decisions, `DEVELOPER_GUIDE.md` for technical details, and `ROADMAP.md` for the development plan and issue log.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (v9.5.0 or compatible)
*   Netlify CLI (`npm install -g netlify-cli`)
*   Supabase CLI (`npm install -g supabase`)
*   Docker (for running Supabase locally)

### Local Setup

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/tomaskovarik271/PIPECD.git
    cd PIPECD
    npm install # Installs root dependencies
    cd frontend && npm install # Installs frontend dependencies (React, Zustand, etc.)
    ```
2.  **Setup Local Environment:**
    *   Start Docker Desktop.
    *   Start local Supabase: `supabase start`. This may take a minute.
    *   Copy local keys to `.env` (in project root): Create a `.env` file and add `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the `supabase status` output.
    *   Add local Inngest keys (from your Inngest Dev environment dashboard) to root `.env`: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`.
    *   **(Optional)** Add `SUPABASE_SERVICE_ROLE_KEY` to root `.env` if needed.
    *   **(NOTE)** Frontend variables (`VITE_*`) are not needed in a separate `.env` file for local dev when using `netlify dev`, as Netlify CLI makes them available via the root `.env` during development.
3.  **Initialize Local Database:** Apply existing schema migrations:
    ```bash
    # Ensure Supabase is running locally first!
    supabase db reset
    # This applies all migrations in supabase/migrations/, including the one for pipelines/stages.
    ```
4.  **Start Development Server:**
    ```