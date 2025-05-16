# Custom CRM System (Project PipeCD)

This repository contains the source code for the custom CRM system designed to replace Pipedrive, built following the architectural decisions outlined in `ADR.md`.

## Overview

The system utilizes a serverless architecture based on:

*   **Frontend:** React (Vite) SPA hosted on Netlify
*   **Frontend State:** Zustand (`frontend/src/stores/useAppStore.ts`)
*   **Frontend API Client:** `graphql-request` (`frontend/src/lib/graphqlClient.ts`)
*   **Frontend GraphQL Types:** GraphQL Code Generator (`frontend/codegen.ts`, see `DEVELOPER_GUIDE_V2.md`)
*   **UI Library:** Chakra UI
*   **API:** GraphQL Gateway (**GraphQL Yoga**) running as a Netlify Function (`netlify/functions/graphql.ts`); Schema defined in `.graphql` files within `netlify/functions/graphql/schema/`.
*   **Backend Logic:** TypeScript modules in `/lib` (e.g., `personService.ts`, `dealService.ts`, `pipelineService.ts`), utilities in `lib/serviceUtils.ts`, shared types in `lib/types.ts`.
*   **Database:** Supabase (PostgreSQL) with RLS
*   **Authentication:** Supabase Auth (Email/Password, GitHub configured)
*   **User Profile Management:** Users can manage their display name and avatar URL, stored in a dedicated `user_profiles` table with RLS. Profile information is integrated into features like Deal History.
*   **Async Tasks:** Inngest (`netlify/functions/inngest.ts`)
*   **Testing:** Vitest (Unit/Integration), Playwright (E2E)
*   **Hosting/Deployment:** Netlify (`netlify.toml`)

**Current Status (As of GraphQL Refactor & Pipeline/Stage Implementation):**

*   Core infrastructure is set up (Supabase, Netlify, Inngest).
*   Authentication (Email/Password, GitHub) is working, managed via Zustand store.
*   Full CRUD implemented for **People**, **Organizations**, **Deals**, **Pipelines**, and **Stages** (Backend services, GraphQL API, Frontend Zustand store, Frontend UI Pages/Modals).
*   Backend service layer refactored with shared utilities (`lib/serviceUtils.ts`).
*   GraphQL API layer refactored: Resolvers moved into modular files (`netlify/functions/graphql/resolvers/`).
*   Full CRUD implemented for **Activities** (Backend service, GraphQL API, Frontend Zustand store, Frontend UI Page/Modals).
*   **User Profile Management** implemented:
    *   Users can view and edit their `display_name` and `avatar_url`.
    *   Profile data is stored in `user_profiles` table in Supabase.
    *   GraphQL `Query.me` and `Mutation.updateUserProfile` handle profile data.
    *   Deal history now displays the `display_name` of the user who performed the action, leveraging updated RLS policies for `user_profiles` to allow authenticated reads.
*   Inngest event sending implemented for Person & Deal creation (simple logging handlers).
*   Basic UI (Chakra UI) implemented for Auth and all core CRUD entities.
*   Unit/Integration tests implemented for backend services (`lib/`).
*   Basic E2E testing setup (Playwright) with login flow.
*   Production deployment is live on Netlify.
*   Build process fixed (removed `tsc -b` from frontend build script).

Refer to `ADR.md` for architectural decisions, `DEVELOPER_GUIDE_V2.md` for technical details, and `PROJECT_ROADMAP_V2.md` for the development plan and issue log.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (Bundled with Node.js)
*   Netlify CLI (`npm install -g netlify-cli`)
*   Supabase CLI (`npm install -g supabase`)
*   Docker (for running Supabase locally)

### Local Setup

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/tomaskovarik271/PIPECD.git
    cd PIPECD
    npm install # Installs root dependencies (backend, testing, etc.)
    cd frontend && npm install # Installs frontend dependencies (React, Zustand, etc.)
    cd .. # Return to root directory
    ```
2.  **Setup Local Environment:**
    *   Ensure Docker Desktop is running.
    *   Start local Supabase: `supabase start`. This may take a minute. Note the API URL and Anon Key output.
    *   Create a `.env` file in the project root (copy from `env.example.txt` if it exists).
    *   Add Supabase credentials to `.env`: `SUPABASE_URL` and `SUPABASE_ANON_KEY` (use values from `supabase status`).
    *   Add local Inngest keys (from your Inngest Dev environment dashboard) to `.env`: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`.
    *   **(NOTE)** Frontend variables (`VITE_*`) are automatically sourced from this root `.env` file by `netlify dev`.
3.  **Initialize Local Database:** Apply existing schema migrations:
    ```bash
    # Ensure Supabase is running locally first!
    supabase db reset
    # This applies all migrations in supabase/migrations/.
    ```
4.  **Start Development Server:**
    ```bash
    netlify dev
    ```
    *   Access the frontend app at the URL provided (usually `http://localhost:8888`).
    *   Access the GraphiQL IDE (if enabled in `graphql.ts`) at `http://localhost:8888/.netlify/functions/graphql`.

### Creating a Test User

If needed for testing login or specific features, you can create a user in your local Supabase instance:

*   Navigate to the local Supabase Studio (URL from `supabase status`, usually `http://127.0.0.1:54323`).
*   Go to the **Authentication** section.
*   Click **Add User** and create a user (e.g., using Email provider).

## Deployment

*   **Automatic:** Pushing to the `main` branch triggers an automatic build and deployment on Netlify.
*   **Manual Steps:**
    *   **Environment Variables:** Production keys (`SUPABASE_*`, `INNGEST_*`, `VITE_*`) must be configured in the Netlify UI (**Site settings > Build & deploy > Environment**).
    *   **Database Migrations:** Apply schema changes to the production Supabase database manually using the Supabase CLI (see `DEVELOPER_GUIDE_V2.md` for details).

Refer to `DEVELOPER_GUIDE_V2.md` for more detailed deployment instructions and architecture information.