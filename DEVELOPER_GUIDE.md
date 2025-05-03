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
├── e2e/                # Playwright E2E tests
├── frontend/           # React SPA (Vite)
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── assets/
│   │   ├── components/ # UI Components (Modals, Forms)
│   │   │   ├── ui/     # Generic UI elements (if needed)
│   │   │   ├── CreateDealModal.tsx
│   │   │   ├── EditDealModal.tsx
│   │   │   ├── CreatePersonForm.tsx
│   │   │   ├── EditPersonForm.tsx
│   │   │   ├── CreateOrganizationModal.tsx
│   │   │   ├── EditOrganizationModal.tsx
│   │   │   └── DeleteConfirmationDialog.tsx
│   │   ├── lib/        # Frontend-specific helpers (Supabase client, GQL client)
│   │   ├── pages/      # Top-level Page components
│   │   │   ├── DealsPage.tsx
│   │   │   ├── PeoplePage.tsx
│   │   │   └── OrganizationsPage.tsx
│   │   ├── App.css
│   │   ├── App.tsx     # Root UI component, routing
│   │   ├── index.css
│   │   ├── main.tsx    # App entry point
│   │   └── setupTests.ts # Vitest setup for frontend
│   ├── .env            # Frontend env vars (VITE_*) (gitignored)
│   ├── index.html      # HTML entry point
│   ├── package.json    # Frontend dependencies/scripts
│   ├── tsconfig.json   # Frontend TS config
│   └── vite.config.ts  # Vite configuration
├── lib/                # Shared Backend TypeScript Modules
│   ├── supabaseClient.ts # Backend Supabase client init
│   ├── dealService.ts
│   ├── dealService.test.ts
│   ├── personService.ts
│   ├── personService.test.ts
│   ├── organizationService.ts
│   └── organizationService.test.ts
├── netlify/
│   └── functions/      # Netlify serverless functions
│       ├── graphql.ts  # GraphQL Yoga API endpoint
│       └── inngest.ts  # Inngest event handler endpoint
├── playwright-report/  # Playwright HTML report output (gitignored)
├── supabase/
│   ├── migrations/     # Database schema migrations (SQL)
│   └── config.toml     # Supabase local config
│   └── ...             # Other Supabase CLI generated files (gitignored)
├── test-results/       # Playwright test results output (gitignored)
├── .env                # Root env vars (backend/Netlify) (gitignored)
├── .gitignore          # Specifies intentionally untracked files
├── ADR.md              # Architecture Decision Record
├── DEVELOPER_GUIDE.md  # This file
├── netlify.toml        # Netlify deployment/dev config
├── package.json        # Root project dependencies/scripts
├── playwright.config.ts# Playwright E2E test config
├── README.md           # Project overview, setup, verification
├── ROADMAP.md          # Development plan and log
├── tsconfig.json       # Root (backend/functions) TS config
└── vitest.config.ts    # Vitest unit/integration test config (root)
```

*   `lib/`: Shared Backend TypeScript Modules (e.g., `personService.ts`, `dealService.ts`, `organizationService.ts`).
*   `netlify/functions/`: Netlify serverless functions (`graphql.ts`, `inngest.ts`).
*   `frontend/src/pages/`: Top-level page components (e.g., `PeoplePage.tsx`, `DealsPage.tsx`, `OrganizationsPage.tsx`).
*   `frontend/src/components/`: Reusable UI components (e.g., `CreateDealModal.tsx`, `EditDealModal.tsx`, `CreatePersonForm.tsx`, etc.).
*   `e2e/`: Playwright E2E tests (`auth.spec.ts`, others to be added).

## 2. Key Files & Configuration

*   **`netlify.toml`:** Configures Netlify builds (`command = "cd frontend && npm install && npm run build"`), publish directory (`frontend/dist`), function directory (`netlify/functions`), function bundling (`node_bundler = "esbuild"`), development server (`netlify dev`), and SPA redirects.
*   **`package.json` (Root):** Manages backend/shared/testing dependencies and root-level scripts (`test`, `test:e2e`).
*   **`tsconfig.json` (Root):** Configures TypeScript for the backend functions and shared library (`/lib`).
*   **`.env` (Root):** Stores *local* environment variables for backend/Netlify functions (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`). **Gitignored.**
*   **`frontend/package.json`:** Manages frontend dependencies and scripts (`npm run dev`, `npm run build`).
*   **`frontend/.env`:** Stores *local* environment variables accessible by Vite (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). **Gitignored.**
*   **`vitest.config.ts` (Root):** Configures Vitest test runner for *both* backend (`lib/`) and frontend (`frontend/src/`) tests. Sets up `jsdom` environment and points to `frontend/src/setupTests.ts` for frontend tests.
*   **`frontend/src/setupTests.ts`:** Vitest setup file for frontend tests, imports `@testing-library/jest-dom` matchers.
*   **`playwright.config.ts` (Root):** Configures Playwright E2E test runner, including browser settings and starting the `netlify dev` server automatically (`webServer` option).
*   **`netlify/functions/graphql.ts`:** Defines the GraphQL schema (People, Organizations, Deals, etc.), implements resolvers (calling services in `/lib`), sets up the GraphQL Yoga server, and includes a context factory for JWT authentication.
*   **`netlify/functions/inngest.ts`:** Initializes the Inngest client, defines Inngest functions/handlers (currently basic logging), and exports the Netlify serve handler.
*   **`lib/supabaseClient.ts`:** Initializes and exports the *backend* Supabase client (uses root `.env`). Includes `dotenv.config()` workaround if needed for local dev.
*   **`frontend/src/main.tsx`:** Frontend entry point, renders `App` within ChakraProvider and BrowserRouter.
*   **`frontend/src/App.tsx`:** Root React component, manages Supabase auth state, renders Auth UI or `AppContent`, defines top-level routes.
*   **`frontend/src/lib/supabase.ts`:** Initializes and exports the *frontend* Supabase client (uses `VITE_` vars). Ensures `detectSessionInUrl` is enabled (default).
*   **`frontend/src/lib/graphqlClient.ts`:** Initializes and exports the `graphql-request` client. Constructs an absolute URL for the endpoint (`/.netlify/functions/graphql`) based on `window.location.origin`. Includes middleware to inject the Supabase auth token.
*   **`supabase/migrations/`:** Contains timestamped SQL files defining database schema changes. Managed via `supabase migration` commands.
*   **`lib/personService.ts`, `lib/dealService.ts`, `lib/organizationService.ts`:** Service classes containing business logic and database interactions (via authenticated Supabase client) for respective domains.
*   **`frontend/src/pages/PeoplePage.tsx`, `frontend/src/pages/DealsPage.tsx`, `frontend/src/pages/OrganizationsPage.tsx`:** Main UI components for managing entities, including data fetching, state management, and integration with modal/form components.
*   **`frontend/src/components/CreateDealModal.tsx`, `frontend/src/components/EditDealModal.tsx`, `CreatePersonForm.tsx`, `EditPersonForm.tsx`, `CreateOrganizationModal.tsx`, `EditOrganizationModal.tsx`:** Modal/form components for creating and editing entities.

## 3. Local Development Workflow

(Refer to `README.md` for simplified steps)

1.  **Prerequisites:** Ensure Node.js, npm, Netlify CLI, Supabase CLI, and Docker are installed.
2.  **Clone & Install:** `git clone ...`, `cd PIPECD`, `npm install`.
3.  **Local Supabase:** Start Docker. Run `supabase start`.
4.  **Environment:** Create root `.env` file. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY` from `supabase status`. Add `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` from Inngest Dev dashboard.
5.  **Local DB Schema:** Run `supabase db reset` to apply migrations locally.
6.  **(Optional but Recommended for E2E Tests):** Create the E2E test user (`test-e2e@example.com` / `password123`) manually via Supabase Studio UI (Authentication section or SQL Editor) if not handled by seeding scripts later.
7.  **Run Dev Server:** Run `netlify dev` in the project root.
8.  **Access Local Services:**
    *   Frontend App: URL from `netlify dev` output (e.g., `http://localhost:8888`). Note: Vite HMR might use a different port like 5173, check console.
    *   Backend GraphQL API (GraphiQL): `http://localhost:8888/.netlify/functions/graphql`.
    *   Local Email Catchall (Inbucket): `http://127.0.0.1:54324`.
    *   Local Supabase Studio: `http://127.0.0.1:54323`.
    *   Inngest Dev Server UI: Run `npx inngest-cli dev` in a separate terminal. Access UI at `http://localhost:8288` to view locally sent events.
9.  **(Optional) Configure Local OAuth Providers:** To test social logins (like GitHub) locally:
    *   **Create a separate OAuth App:** Go to the provider's developer settings (e.g., GitHub Settings -> Developer settings -> OAuth Apps) and create a *new* OAuth application specifically for local development (e.g., "PipeCD Dev"). **Do not reuse production credentials.**
    *   **Set Callback URL:** Configure the OAuth app's "Authorization callback URL" to point to your local Supabase instance's callback endpoint. Find this URL in your local Supabase Studio (**Authentication -> Providers -> GitHub/Google/etc.**) or construct it using the `Auth Callback URL` shown in `supabase status` (usually `http://127.0.0.1:54321/auth/v1/callback`).
    *   **Configure Supabase Locally:** Open local Supabase Studio (`http://127.0.0.1:54323`). Navigate to **Authentication -> Providers**. Enable the desired provider (e.g., GitHub) and enter the **Client ID** and **Client Secret** obtained from the *development* OAuth app you created in the previous step. Save the provider settings.

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
    *   **URL Configuration:** Set the correct **Site URL** (`https://<your-netlify-site-name>.netlify.app`) and potentially add others to Additional Redirect URLs.
5.  **Database Migrations (MANUAL STEP):** Schema changes must be applied manually to the production database from your local machine:
    *   Link CLI to Production: `supabase link --project-ref <YOUR-PROD-PROJECT-REF>`
    *   Apply Migrations: `supabase db push --linked` (or `supabase migration up --linked` - `db push` is generally recommended now).
    *   **WARNING:** Apply production migrations carefully. Ensure you have a backup. Consider a staging environment for complex changes.

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
    *   Event sending (`graphql.ts` for `crm/contact.created`, `crm/deal.created`) works locally and in prod.
    *   Event handling function definitions (`inngest.ts`) rely on `INNGEST_SIGNING_KEY` for security in deployed environments.
    *   **Local Handler Execution:** Due to limitations with `netlify dev` proxying, reliably triggering and debugging the *execution* of Inngest functions locally is problematic. 
    *   **Recommended Local Workflow:** Use `netlify dev` for general development. Run `npx inngest-cli dev` separately to monitor *sent* events via its UI (`http://localhost:8288`). **Verify event handler execution logic in deployed environments** (e.g., Netlify deploy previews or production) by checking Netlify Function logs or adding temporary detailed logging within the Inngest function itself.
*   **Netlify:**
    *   Build command handles frontend dependency installation.
    *   Functions runtime depends on environment variables set in Netlify UI.
*   **TypeScript:** Used for both backend (`/lib`, `/netlify/functions`) and frontend (`/frontend`), configured via respective `tsconfig.json` files.
*   **Testing:** Uses Vitest (unit/integration for frontend/backend) and Playwright (E2E). Configuration is split between root `vitest.config.ts`, `frontend/src/setupTests.ts`, and `playwright.config.ts`. Frontend tests run in a `jsdom` environment.

## 6. Troubleshooting

This section logs common issues encountered during development or deployment and their resolutions.

**Local Development (`netlify dev`, Vite, Supabase Local):**

1.  **Issue:** `netlify dev` build fails to resolve Inngest module (`Could not resolve "inngest/netlify"`).
    *   **Resolution:** This seems benign and related to Inngest package exports. The build succeeds in production, and functions still load locally. Can be ignored for now.

2.  **Issue:** `netlify dev` failed to inject `.env` variables into function context.
    *   **Resolution:** Ensure `.env` file exists in the root and `netlify dev` is run from the root. If issues persist, consider adding explicit `dotenv.config()` at the start of function files (e.g., `lib/supabaseClient.ts`), although this shouldn't normally be needed.

3.  **Issue:** Vite dev server (`npm run dev` in `frontend/`) failed to parse `index.html`.
    *   **Resolution:** Clear the Vite cache: `rm -rf frontend/node_modules/.vite`.

4.  **Issue:** RLS policy prevents data creation/modification (e.g., contact creation).
    *   **Resolution:** Backend operations modifying data protected by RLS policies involving `auth.uid()` need to use an authenticated Supabase client. Pass the user's JWT from the frontend/GraphQL context to the backend service and create a temporary authenticated client instance for the operation (see `lib/contactService.ts` example using `getAuthenticatedClient`).

5.  **Issue:** Inngest function (e.g., `logDealCreation`) doesn't seem to run locally, but events appear in `npx inngest-cli dev` UI.
    *   **Cause:** Known limitation of testing Inngest function *execution* within `netlify dev` due to proxy/discovery issues.
    *   **Resolution (Verification):** Use the Inngest Dev Server UI (`http://localhost:8288`) to confirm events are *sent* correctly. Test the actual function *execution* logic by deploying to Netlify (Preview or Production) and checking the Netlify Function logs for the `inngest` function.

6.  **Issue:** Cannot insert row via Supabase Studio Table Editor due to `NOT NULL constraint` violation on `user_id`, even when providing the ID.
    *   **Cause:** Unclear, potential UI bug in local Supabase Studio for specific table structures.
    *   **Resolution:** Use the **SQL Editor** in Supabase Studio to manually insert test data using an `INSERT INTO ...` command, ensuring the `user_id` is explicitly included.

7.  **Issue:** Data field (e.g., `amount`) appears empty in UI table after fetching.
    *   **Cause:** Mismatch between column name in the database schema (e.g., `value`) and the field name used in the GraphQL schema, service logic, and frontend query (e.g., `amount`).
    *   **Resolution:** Create and apply a new Supabase migration (`supabase migration new ...`) to rename the database column (`ALTER TABLE ... RENAME COLUMN ... TO ...`). Run `supabase db reset` locally to apply, then re-insert test data if needed. Remember to apply the migration to production later.

8.  **Issue:** Delete operation in UI shows error "Delete operation returned false" but the item *is* deleted.
    *   **Cause:** Backend service layer (`deleteDeal` in `dealService.ts`) was checking `count === 1` returned from Supabase `delete()`, which might not always be `1` even on success. Frontend mutation handler threw an error based on the `false` return.
    *   **Resolution:** Modify the service layer return statement to check for the absence of an error instead of the count: `return !error;`. The `handleSupabaseError` function already throws if a significant database error occurs.

**Deployment (Netlify):**

9.  **Issue:** Netlify build fails due to missing frontend dependencies (TypeScript errors like `Cannot find module...`).
    *   **Resolution:** Ensure the `build.command` in `netlify.toml` includes `cd frontend && npm install && npm run build` to install frontend dependencies before building.

10. **Issue:** Netlify build fails due to TypeScript errors (e.g., `TS6133: '...' is declared but its value is never read`).
    *   **Cause:** Stricter TS config in `tsconfig.json` flags unused imports or variables as errors, often left over after refactoring.
    *   **Resolution:** Remove the specific unused import or variable reported in the build log. Ensure local `tsc` checks pass before pushing (`cd frontend && npx tsc --noEmit`).

11. **Issue:** Deployed frontend shows errors: `Missing env variable: VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.
    *   **Resolution:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables (with **production** values) to the Netlify UI (**Site config -> Build & deploy -> Environment**). Trigger a redeploy.

12. **Issue:** GitHub (or other OAuth) login fails with redirect to provider sign-in and/or incorrect `state` URL mismatch.
    *   **Resolution:** Ensure the **production** Supabase project has the correct OAuth Provider **Client ID/Secret** configured (**Authentication -> Providers**) AND the correct **Site URL** set (**Authentication -> URL Configuration**).

13. **Issue:** OAuth login redirects back to app but doesn't log the user in (token not processed).
    *   **Resolution:** Ensure the frontend Supabase client (`frontend/src/lib/supabase.ts`) is configured with `detectSessionInUrl: true` (which is the default, so ensure it's not explicitly set to `false`).

14. **Issue:** Deployed frontend shows 502 Bad Gateway errors when calling GraphQL API.
    *   **Resolution:** Add required **runtime** environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` using **production** values) to the Netlify UI (**Site config -> Build & deploy -> Environment**). Check Netlify Function logs for specific startup errors.

15. **Issue:** Deployed API/pages fail with `relation "public.<table>" does not exist` or similar schema errors.
    *   **Resolution:** Apply local database migrations to the **production** Supabase database using the Supabase CLI: `supabase link --project-ref <prod-ref>` followed by `supabase db push --linked`. Confirm the migration succeeded.

16. **Issue:** Frontend tests (Vitest) fail with `Invalid Chai property: toBeInTheDocument`.
    *   **Cause:** Vitest's `expect` was not correctly extended with `@testing-library/jest-dom` matchers.
    *   **Resolution:** Ensure `vitest.config.ts` has `environment: 'jsdom'` and `setupFiles: ['./frontend/src/setupTests.ts']`. Ensure `frontend/src/setupTests.ts` explicitly imports and extends `expect` with matchers: `import * as matchers from '@testing-library/jest-dom/matchers'; import { expect } from 'vitest'; expect.extend(matchers);`.

17. **Issue:** Frontend tests fail trying to find elements that appear correctly in the browser (e.g., finding text based on mock data).
    *   **Cause:** Mock data used in the test file (`*.test.tsx`) may be outdated after code refactoring (e.g., expecting `contact.first_name` when the code now uses `person.first_name`).
    *   **Resolution:** Update the mock data within the failing test file to match the current component props and GraphQL query structure.

## 7. Testing

This project uses a combination of [Vitest](https://vitest.dev/) for unit/integration testing and [Playwright](https://playwright.dev/) for end-to-end (E2E) testing.

### Frontend Unit/Integration Testing (`frontend/` using Vitest)

*   **Location:** Tests for React components reside within the `frontend/src` directory, typically colocated with the component (e.g., `frontend/src/pages/DealsPage.test.tsx`).
*   **Framework:** Vitest + React Testing Library (`@testing-library/react`).
*   **Configuration:** Root `vitest.config.ts` includes `frontend/src/**/*.test.tsx` patterns. It sets `environment: 'jsdom'` and uses `frontend/src/setupTests.ts` for global setup (importing `@testing-library/jest-dom` matchers).
*   **Running Tests:** Run from the **project root** directory (Vitest config includes frontend tests):
    *   `npm test`: Run all unit/integration tests (backend + frontend).
    *   `npm run test:ui`: Run tests in the interactive Vitest UI.
*   **Mocks:** Network requests (e.g., `gqlClient`) and potentially complex hooks/components (like `useToast`) are mocked using `vi.mock()` within test files.
*   **Current Status:** Basic tests exist for `DealsPage`. More component tests are needed (People, Orgs, Forms, Modals).

### Backend Unit/Integration Testing (Root `/` using Vitest)

*   **Location:** Tests for shared library modules (`lib/`) reside in `lib/` (e.g., `lib/dealService.test.ts`, `lib/personService.test.ts`). Tests for Netlify functions (`netlify/functions/`) are currently missing but should be added there.
*   **Framework:** Vitest (running in Node.js environment).
*   **Configuration:** `vitest.config.ts` in the project root configures the test runner (includes `lib/**/*.test.ts` patterns).
*   **Running Tests:** Run from the **project root** directory:
    *   `npm test`: Run all unit/integration tests (backend + frontend).
    *   `npm run test:ui`: Run tests in the interactive Vitest UI.
*   **Mocks:** External dependencies like the `@supabase/supabase-js` client are mocked using `vi.mock()` (see examples in `lib/*.test.ts`).
*   **Current Status:** Tests exist for `dealService`, `personService`, `organizationService`. Tests for `netlify/functions/graphql.ts` resolvers need to be recreated.

### End-to-End Testing (Root `/` using Playwright)

*   **Location:** E2E tests reside in the root `e2e/` directory (e.g., `e2e/auth.spec.ts`).
*   **Framework:** Playwright (`@playwright/test`).
*   **Configuration:** `playwright.config.ts` in the project root configures the test runner, browsers, and automatically starts the local development server (`netlify dev`) via the `webServer` option.
*   **Running Tests:** Run from the **project root** directory:
    *   `npm run test:e2e`: Run all E2E tests headless in the console.
    *   `npm run test:e2e:ui`: Run tests in the interactive Playwright UI mode.
    *   `npm run test:e2e:report`: Open the HTML report generated after a test run.
*   **Current Scope:** Basic authentication test (successful login) is implemented.
*   **Prerequisites:** E2E tests require the local dev server (`netlify dev`) to be running (handled automatically by `playwright.config.ts`). They also require specific data, like the test user `test-e2e@example.com` / `password123`, to be manually created in the local Supabase instance after `supabase db reset`.

## Deployment

-   **Netlify:** Automatically deploys the `main` branch (Frontend + Functions).
-   **Supabase:** Migrations need to be applied manually to the production database using `supabase migration up --linked` after linking the CLI (`supabase link --project-ref <your-prod-project-ref>`).

## Key Concepts / Decisions

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
    *   Event sending (`graphql.ts` for `crm/contact.created`, `crm/deal.created`) works locally and in prod.
    *   Event handling function definitions (`inngest.ts`) rely on `INNGEST_SIGNING_KEY` for security in deployed environments.
    *   **Local Handler Execution:** Due to limitations with `netlify dev` proxying, reliably triggering and debugging the *execution* of Inngest functions locally is problematic. 
    *   **Recommended Local Workflow:** Use `netlify dev` for general development. Run `npx inngest-cli dev` separately to monitor *sent* events via its UI (`http://localhost:8288`). **Verify event handler execution logic in deployed environments** (e.g., Netlify deploy previews or production) by checking Netlify Function logs or adding temporary detailed logging within the Inngest function itself.
*   **Netlify:**
    *   Build command handles frontend dependency installation.
    *   Functions runtime depends on environment variables set in Netlify UI.
*   **TypeScript:** Used for both backend (`/lib`, `/netlify/functions`) and frontend (`/frontend`), configured via respective `tsconfig.json` files.
*   **Testing:** Uses Vitest (unit/integration for frontend/backend) and Playwright (E2E). Configuration is split between root `vitest.config.ts`, `frontend/src/setupTests.ts`, and `playwright.config.ts`. Frontend tests run in a `jsdom` environment.

---

*This guide is a living document...* 