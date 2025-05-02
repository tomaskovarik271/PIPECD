# Developer Guide: Custom CRM System (Project PipeCD)

Welcome! This guide provides an overview of the project structure, key technologies, configuration, and development workflow to help you get started contributing to this custom CRM system.

For high-level architectural decisions, see `ADR.md`. For setup instructions and verification steps, see `README.md`. For the project plan and issue log, see `ROADMAP.md`.

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

*   **`netlify.toml`:** Configures Netlify builds (`command = "cd frontend && npm install && npm run build"`), publish directory (`frontend/dist`), function directory (`netlify/functions`), function bundling (`node_bundler = "esbuild"`), development server (`netlify dev`), and SPA redirects.
*   **`package.json` (Root):** Manages backend/shared dependencies and root-level scripts.
*   **`tsconfig.json` (Root):** Configures TypeScript for the backend functions and shared library (`/lib`).
*   **`.env` (Root):** Stores *local* environment variables for backend/Netlify functions (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`). **Gitignored.**
*   **`frontend/package.json`:** Manages frontend dependencies and scripts (`npm run dev`, `npm run build`).
*   **`frontend/.env`:** Stores *local* environment variables accessible by Vite (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GRAPHQL_ENDPOINT` - though the latter is now derived in code). **Gitignored.**
*   **`netlify/functions/graphql.ts`:** Defines the GraphQL schema, implements resolvers (calling services in `/lib`), sets up the GraphQL Yoga server, and includes a context factory for JWT authentication.
*   **`netlify/functions/inngest.ts`:** Initializes the Inngest client, defines Inngest functions/handlers (currently basic logging), and exports the Netlify serve handler.
*   **`lib/supabaseClient.ts`:** Initializes and exports the *backend* Supabase client (uses root `.env`). Includes `dotenv.config()` workaround if needed for local dev.
*   **`frontend/src/main.tsx`:** Frontend entry point, renders `App`.
*   **`frontend/src/App.tsx`:** Root React component, manages Supabase auth state, renders Auth UI or `AppContent`.
*   **`frontend/src/lib/supabase.ts`:** Initializes and exports the *frontend* Supabase client (uses `VITE_` vars). Ensures `detectSessionInUrl` is enabled (default).
*   **`frontend/src/lib/graphqlClient.ts`:** Initializes and exports the `graphql-request` client. Constructs an absolute URL for the endpoint (`/.netlify/functions/graphql`) based on `window.location.origin` in production. Includes middleware to inject the Supabase auth token.
*   **`supabase/migrations/`:** Contains timestamped SQL files defining database schema changes. Managed via `supabase migration` commands.

## 3. Local Development Workflow

(Refer to `README.md` for simplified steps)

1.  **Prerequisites:** Ensure Node.js, npm, Netlify CLI, Supabase CLI, and Docker are installed.
2.  **Clone & Install:** `git clone ...`, `cd PIPECD`, `npm install`.
3.  **Local Supabase:** Start Docker. Run `supabase start`.
4.  **Environment:** Create root `.env` file. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY` from `supabase status`. Add `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` from Inngest Dev dashboard.
5.  **Local DB Schema:** Run `supabase db reset` to apply migrations locally.
6.  **Run Dev Server:** Run `netlify dev` in the project root.
7.  **Access Local Services:**
    *   Frontend App: URL from `netlify dev` output (e.g., `http://localhost:5173`).
    *   Backend GraphQL API (GraphiQL): `http://localhost:8888/.netlify/functions/graphql`.
    *   Local Email Catchall (Inbucket): `http://127.0.0.1:54324`.
    *   Local Supabase Studio: `http://127.0.0.1:54323`.
    *   Inngest Dev Server UI (run separately): `npx inngest-cli dev` (view events at `http://localhost:8288`).

## 4. Production Deployment Workflow

1.  **Push to `main`:** Netlify automatically triggers a build and deploy from the `main` branch.
2.  **Netlify Build Process:** Uses the `build.command` in `netlify.toml`: `cd frontend && npm install && npm run build`.
3.  **Environment Variables (CRITICAL):** The Netlify build and function runtime **require** specific variables set in the Netlify UI (**Site config -> Build & deploy -> Environment**):
    *   `VITE_SUPABASE_URL`: Production Supabase URL (for frontend build).
    *   `VITE_SUPABASE_ANON_KEY`: Production Supabase Anon Key (for frontend build).
    *   `SUPABASE_URL`: Production Supabase URL (for function runtime).
    *   `SUPABASE_ANON_KEY`: Production Supabase Anon Key (for function runtime).
    *   `SUPABASE_SERVICE_ROLE_KEY`: Production Supabase Service Role Key (for function runtime).
    *   `INNGEST_EVENT_KEY`: Production Inngest Event Key (for function runtime).
    *   `INNGEST_SIGNING_KEY`: Production Inngest Signing Key (for function runtime).
4.  **Supabase Production Config:** The production Supabase project requires configuration via its dashboard:
    *   **Auth Providers:** Enable GitHub (and others) and provide Client ID/Secrets.
    *   **URL Configuration:** Set the correct **Site URL** (`https://sprightly-macaron-c20bb0.netlify.app`) and potentially add others to Additional Redirect URLs.
5.  **Database Migrations (MANUAL STEP):** Schema changes must be applied manually to the production database from your local machine:
    *   Link CLI to Production: `supabase link --project-ref <YOUR-PROD-PROJECT-REF>`
    *   Apply Migrations: `supabase migration up --linked`
    *   **WARNING:** Apply production migrations carefully. Consider a staging environment for complex changes.

## 5. Core Concepts & Implementation Notes

*   **GraphQL (Yoga + `graphql-request`):**
    *   Backend uses GraphQL Yoga for its performance in serverless environments.
    *   Schema is defined directly in `graphql.ts` (could be moved to separate `.graphql` files later).
    *   Resolvers call functions/services potentially located in `/lib`.
    *   Authentication is handled via JWT in the `Authorization: Bearer` header, verified in the Yoga `context` factory using `supabase.auth.getUser()`.
    *   Frontend uses `graphql-request` for simple, direct query/mutation execution. Middleware injects the auth token.
*   **Supabase:**
    *   **Auth:** Ensure Production Supabase has correct Provider keys and Site URL config.
    *   **Migrations:** Emphasize manual application to production via linked CLI.
    *   **RLS:** Policies defined in migrations apply to both local and prod (once migrated).
    *   **Clients:** Backend uses root `.env` (local) or Netlify function env vars (prod). Frontend uses `VITE_` vars baked in at build time.
*   **Inngest:**
    *   Event sending (`graphql.ts`) works locally and in prod.
    *   Event handling (`inngest.ts`) relies on `INNGEST_SIGNING_KEY` (local `.env` or Netlify env var).
    *   Local function *execution* testing via `netlify dev` is unreliable; test full flow in prod or using dedicated test environments.
*   **Netlify:**
    *   Build command handles frontend dependency installation.
    *   Functions runtime depends on environment variables set in Netlify UI.
*   **TypeScript:** Used for both backend (`/lib`, `/netlify/functions`) and frontend (`/frontend`), configured via respective `tsconfig.json` files.

--- 