# Developer Guide: Custom CRM System (Project PipeCD)

Welcome! This guide provides an overview of the project structure, key technologies, configuration, and development workflow to help you get started contributing to this custom CRM system.

For high-level architectural decisions, see `ADR.md`. For setup instructions and verification steps, see `README.md`. For the project plan, see `ROADMAP.md`.

## 1. Project Structure Overview

The project follows a structure designed for clear separation of concerns between the frontend, backend API, shared logic, and infrastructure configuration:

```
PIPECD/
├── .github/            # GitHub Actions workflows (if added)
├── .netlify/           # Netlify build/cache output (gitignored)
├── .vscode/            # VS Code settings (optional, partially gitignored)
├── frontend/           # React SPA (Vite)
│   ├── public/         # Static assets
│   ├── src/            # Frontend source code
│   │   ├── lib/        # Frontend-specific helpers (Supabase client, GQL client)
│   │   └── ...         # Components, pages, styles, etc.
│   ├── .env            # Frontend env vars (VITE_*) (gitignored)
│   ├── index.html      # HTML entry point
│   ├── package.json    # Frontend dependencies/scripts
│   ├── tsconfig.json   # Frontend TS config
│   └── vite.config.ts  # Vite configuration
├── lib/                # Shared Backend TypeScript Modules
│   ├── supabaseClient.ts # Backend Supabase client init
│   └── ...             # Business logic, services (e.g., contactService.ts)
├── netlify/
│   └── functions/      # Netlify serverless functions
│       ├── graphql.ts  # GraphQL Yoga API endpoint
│       └── inngest.ts  # Inngest event handler endpoint
├── supabase/
│   ├── migrations/     # Database schema migrations (SQL)
│   └── config.toml     # Supabase local config
│   └── ...             # Other Supabase CLI generated files (gitignored)
├── .env                # Root env vars (backend/Netlify) (gitignored)
├── .gitignore          # Specifies intentionally untracked files
├── ADR.md              # Architecture Decision Record
├── DEVELOPER_GUIDE.md  # This file
├── netlify.toml        # Netlify deployment/dev config
├── package.json        # Root project dependencies/scripts
├── README.md           # Project overview, setup, verification
├── ROADMAP.md          # Development plan and log
└── tsconfig.json       # Root (backend/functions) TS config
```

## 2. Key Files & Configuration

*   **`netlify.toml`:** Configures Netlify builds, function directory (`netlify/functions`), function bundling (`node_bundler = "esbuild"`), and potentially redirects or dev server settings.
*   **`package.json` (Root):** Manages backend/shared dependencies (`graphql`, `graphql-yoga`, `inngest`, `@supabase/supabase-js`, `typescript`, `dotenv`) and potentially root-level scripts.
*   **`tsconfig.json` (Root):** Configures TypeScript for the backend functions and shared library (`/lib`). Uses `NodeNext` for module resolution.
*   **`.env` (Root):** Stores local environment variables for backend/Netlify functions (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`). *Gitignored.*
*   **`frontend/package.json`:** Manages frontend dependencies (`react`, `vite`, `react-router-dom`, `@supabase/supabase-js`, `@supabase/auth-ui-react`, `graphql-request`) and scripts (`npm run dev`, `npm run build`).
*   **`frontend/.env`:** Stores local environment variables accessible by Vite (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). *Gitignored.*
*   **`netlify/functions/graphql.ts`:** Defines the GraphQL schema (SDL), implements resolvers, sets up the GraphQL Yoga server, and includes a context factory for authentication (verifying Supabase JWT).
*   **`netlify/functions/inngest.ts`:** Initializes the Inngest client, defines Inngest functions/handlers, and exports the Netlify serve handler using the Signing Key.
*   **`lib/supabaseClient.ts`:** Initializes and exports the *backend* Supabase client instance using root `.env` variables. Includes explicit `dotenv.config()` load as a workaround for potential `netlify dev` issues.
*   **`frontend/src/main.tsx`:** Frontend entry point. Renders the root `App` component within `React.StrictMode` and `BrowserRouter`.
*   **`frontend/src/App.tsx`:** Root React component. Manages session state via Supabase listeners, conditionally renders the Auth UI or the main application (`AppContent`), defines routes.
*   **`frontend/src/lib/supabase.ts`:** Initializes and exports the *frontend* Supabase client instance using `VITE_` environment variables.
*   **`frontend/src/lib/graphqlClient.ts`:** Initializes and exports the `graphql-request` client, configured with middleware to automatically attach the Supabase auth token to requests.
*   **`supabase/migrations/`:** Contains timestamped SQL files defining database schema changes (tables, policies, triggers). Managed via `supabase migration` commands.

## 3. Local Development Workflow

(See also `README.md` section "Running Locally & Verification")

1.  **Start Supabase:** Ensure Docker is running. In the project root, run `supabase start`. This starts Postgres, GoTrue, Storage, etc., locally.
2.  **Start Backend/Netlify Dev:** In the project root, run `netlify dev`. This:
    *   Reads `netlify.toml`.
    *   Loads environment variables from the root `.env` file.
    *   Builds and serves the Netlify functions in `netlify/functions/` (typically on port 8888).
    *   *Note the known `inngest/netlify` resolution error during build; monitor runtime.*
3.  **Start Frontend Dev:** In a **separate terminal**, navigate to `cd frontend` and run `npm run dev`. This:
    *   Starts the Vite development server (typically on port 5173).
    *   Loads environment variables from `frontend/.env`.
    *   Provides Hot Module Replacement (HMR) for fast UI updates.
4.  **Access:**
    *   Frontend App: `http://localhost:5173` (or as shown by Vite).
    *   Backend GraphQL API (GraphiQL): `http://localhost:8888/.netlify/functions/graphql`.
    *   Local Email Catchall (Inbucket): `http://127.0.0.1:54324`.
    *   Local Supabase Studio: `http://127.0.0.1:54323`.
5.  **Database Migrations:**
    *   To create a new migration: `supabase migration new <migration_name>` (in project root).
    *   Edit the generated SQL file in `supabase/migrations/`.
    *   To apply migrations locally: `supabase migration up` (or `supabase db reset` for a clean slate - **destructive**).

## 4. Core Concepts & Implementation Notes

*   **GraphQL (Yoga + `graphql-request`):**
    *   Backend uses GraphQL Yoga for its performance in serverless environments.
    *   Schema is defined directly in `graphql.ts` (could be moved to separate `.graphql` files later).
    *   Resolvers call functions/services potentially located in `/lib`.
    *   Authentication is handled via JWT in the `Authorization: Bearer` header, verified in the Yoga `context` factory using `supabase.auth.getUser()`.
    *   Frontend uses `graphql-request` for simple, direct query/mutation execution. Middleware injects the auth token.
*   **Supabase:**
    *   **Auth:** Handled by Supabase Auth. Frontend uses `@supabase/auth-ui-react` for UI and `supabase.auth` methods for session management. Backend verifies JWTs.
    *   **Database:** PostgreSQL managed locally via Docker (via Supabase CLI) and remotely via Supabase cloud.
    *   **Migrations:** Schema changes are managed via SQL files in `supabase/migrations/` using the Supabase CLI.
    *   **RLS:** Row Level Security is enabled on tables (`contacts`, `deals`) and policies ensure users can only access their own data when using the `anon` key.
    *   **Clients:** Separate client instances are configured for backend (`lib/supabaseClient.ts`, uses root `.env`) and frontend (`frontend/src/lib/supabase.ts`, uses `frontend/.env` with `VITE_` prefix).
*   **Inngest:**
    *   Used for background jobs and event-driven workflows (currently placeholder setup).
    *   The `netlify/functions/inngest.ts` file defines Inngest functions and uses the `serve` handler.
    *   Requires `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` environment variables.
    *   *Known Issue:* Module resolution error for `inngest/netlify` during `netlify dev` build phase.
*   **Netlify:**
    *   **Functions:** Hosts the GraphQL API and Inngest handler as serverless functions.
    *   **Dev:** `netlify dev` provides local emulation of the Netlify environment.
    *   **Deployment:** Linked to the GitHub repository for CI/CD (manual environment variable setup required in Netlify UI).
*   **TypeScript:** Used for both backend (`/lib`, `/netlify/functions`) and frontend (`/frontend`), configured via respective `tsconfig.json` files.

--- 