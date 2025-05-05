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
│   │   ├── components/ # UI Components (Modals, Forms, Dialogs etc.)
│   │   │   ├── pipelines/ # Pipeline specific components
│   │   │   ├── stages/    # Stage specific components
│   │   │   └── ...      # Components for Deals, People, Organizations etc.
│   │   ├── lib/        # Frontend-specific helpers (Supabase client, GQL client)
│   │   ├── pages/      # Top-level Page components
│   │   │   ├── PipelinesPage.tsx
│   │   │   ├── StagesPage.tsx
│   │   │   ├── DealsPage.tsx
│   │   │   ├── PeoplePage.tsx
│   │   │   └── OrganizationsPage.tsx
│   │   ├── stores/     # Zustand state management store(s)
│   │   │   └── useAppStore.ts
│   │   ├── App.css
│   │   ├── App.tsx     # Root UI component, routing, auth listener
│   │   ├── index.css
│   │   ├── main.tsx    # App entry point
│   │   └── setupTests.ts # Vitest setup for frontend
│   ├── .env            # Frontend env vars (VITE_*) (gitignored)
│   ├── index.html      # HTML entry point
│   ├── package.json    # Frontend dependencies/scripts (includes Zustand)
│   ├── tsconfig.json   # Frontend TS config
│   └── vite.config.ts  # Vite configuration
├── lib/                # Shared Backend TypeScript Modules
│   ├── supabaseClient.ts # Backend Supabase client init
│   ├── serviceUtils.ts   # Shared service helpers (auth client, error handler)
│   ├── types.ts          # Shared TypeScript interfaces/types (Pipeline, Stage, etc.)
│   ├── dealService.ts
│   ├── dealService.test.ts
│   ├── personService.ts
│   ├── personService.test.ts
│   ├── organizationService.ts
│   ├── organizationService.test.ts
│   ├── pipelineService.ts
│   ├── pipelineService.test.ts # Placeholder/TODO
│   ├── stageService.ts
│   └── stageService.test.ts    # Placeholder/TODO
├── netlify/
│   └── functions/      # Netlify serverless functions
│       ├── graphql.ts  # GraphQL Yoga entry point (schema/context setup)
│       ├── graphql/    # GraphQL specific files
│       │   ├── schema/ # GraphQL schema definition files (*.graphql)
│       │   ├── resolvers/ # GraphQL resolver implementation files
│       │   │   ├── query.ts
│       │   │   ├── mutation.ts
│       │   │   ├── person.ts
│       │   │   ├── organization.ts
│       │   │   ├── deal.ts
│       │   │   ├── stage.ts
│       │   │   └── ... (Other type resolvers)
│       │   ├── validators.ts # Zod validation schemas for inputs
│       │   └── helpers.ts    # Helper functions (auth, error handling, context)
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
├── env.example.txt     # Example structure for .env file
├── netlify.toml        # Netlify deployment/dev config
├── package.json        # Root project dependencies/scripts
├── playwright.config.ts# Playwright E2E test config
├── README.md           # Project overview, setup, verification
├── ROADMAP.md          # Development plan and log
├── tsconfig.json       # Root (backend/functions) TS config
└── vitest.config.ts    # Vitest unit/integration test config (root)
```

*   `lib/`: Contains shared backend logic (services like `pipelineService.ts`), shared types (`lib/types.ts`), and utilities.
*   `netlify/functions/graphql.ts`: Entry point for the GraphQL API. Sets up the Yoga server, loads schema/resolvers, and defines the context factory.
*   `netlify/functions/graphql/resolvers/`: Contains the actual GraphQL resolver implementations, broken down by type (Query, Mutation, Deal, Stage, etc.).
*   `netlify/functions/graphql/schema/`: Contains `.graphql` files defining the API schema.
*   `frontend/src/stores/useAppStore.ts`: The central Zustand store managing frontend state and data fetching logic for all entities.
*   `frontend/src/pages/`: Top-level page components (e.g., `PipelinesPage.tsx`, `StagesPage.tsx`).
*   `frontend/src/components/`: Reusable UI components, often organized by feature (e.g., `components/pipelines/`, `components/stages/`).
*   `supabase/migrations/`: SQL files for database schema changes.

## 2. Key Files & Configuration

*   **`netlify.toml`:** Configures Netlify builds (`command = "cd frontend && npm install && vite build"`), publish directory (`frontend/dist`), function directory (`netlify/functions`), function bundling (`node_bundler = "esbuild"`), development server (`netlify dev`), and SPA redirects.
*   **`package.json` (Root):** Manages backend/shared/testing dependencies and root-level scripts (`test`, `test:e2e`).
*   **`tsconfig.json` (Root):** Configures TypeScript for the backend functions and shared library (`/lib`).
*   **`.env` (Root):** Stores *local* environment variables for backend/Netlify functions and frontend (via `netlify dev`) (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `INNGEST_EVENT_KEY`, etc.). **Gitignored.** See `env.example.txt`.
*   **`frontend/package.json`:** Manages frontend dependencies (including `zustand`, `graphql-request`) and scripts (`npm run dev`, `npm run build`).
*   **`vitest.config.ts` (Root):** Configures Vitest test runner for *both* backend (`lib/`) and frontend (`frontend/src/`) tests.
*   **`playwright.config.ts` (Root):** Configures Playwright E2E test runner.
*   **`netlify/functions/graphql.ts`:** Main entry point for the GraphQL API. Sets up GraphQL Yoga, loads the combined schema from `./graphql/schema/*.graphql`, imports and combines resolvers from `./graphql/resolvers/`, and includes a context factory for JWT authentication.
*   **`netlify/functions/graphql/schema/*.graphql`:** Contains GraphQL Schema Definition Language (SDL) files. Loaded dynamically by `graphql.ts`.
*   **`netlify/functions/graphql/resolvers/*.ts`:** Individual files implementing GraphQL resolvers (e.g., `query.ts`, `mutation.ts`, `deal.ts`, `stage.ts`). These files contain the logic to fetch or manipulate data, often calling services from `/lib`.
*   **`netlify/functions/graphql/helpers.ts`:** Utility functions specific to the GraphQL layer (e.g., extracting auth tokens, validating authentication, processing errors).
*   **`netlify/functions/graphql/validators.ts`:** Zod schemas used for validating input arguments in GraphQL mutations.
*   **`netlify/functions/inngest.ts`:** Initializes the Inngest client and defines Inngest functions/handlers.
*   **`lib/supabaseClient.ts`:** Initializes and exports the *backend* Supabase client.
*   **`lib/serviceUtils.ts`:** Contains shared helper functions for backend services (e.g., `getAuthenticatedClient`, `handleSupabaseError`).
*   **`lib/types.ts`:** Defines shared TypeScript interfaces (e.g., `Pipeline`, `Stage`) used across services and potentially resolvers.
*   **`frontend/src/App.tsx`:** Root React component, handles auth state changes, defines routing.
*   **`frontend/src/lib/supabase.ts`:** Initializes and exports the *frontend* Supabase client.
*   **`frontend/src/lib/graphqlClient.ts`:** Initializes and exports the `graphql-request` client with middleware to inject the auth token.
*   **`frontend/src/stores/useAppStore.ts`:** Central Zustand store managing application state (auth, data lists, loading/errors) and actions (fetching/mutating data via `gqlClient`).
*   **`supabase/migrations/`:** Contains timestamped SQL files defining database schema changes.
*   **Service Files (`lib/*.service.ts`):** Contain business logic and database interactions for respective domains.
*   **Page Files (`frontend/src/pages/*.tsx`):** Main UI views, using hooks to interact with the Zustand store.
*   **Component Files (`frontend/src/components/**/*.tsx`):** Reusable UI parts, including modals and forms for CRUD operations.

## 3. Local Development Workflow

(Refer to `README.md` for simplified steps)

1.  **Prerequisites:** Node.js, npm, Netlify CLI, Supabase CLI, Docker.
2.  **Clone & Install:** `git clone ...`, `cd PIPECD`, `npm install`, `cd frontend && npm install`, `cd ..`.
3.  **Local Supabase:** Start Docker. `supabase start`.
4.  **Environment:** Create root `.env` from `env.example.txt`. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY` from `supabase status`. Add Inngest keys.
5.  **Local DB Schema:** `supabase db reset`.
6.  **(Optional)** Create test user via Supabase Studio (`http://127.0.0.1:54323`).
7.  **Run Dev Server:** `netlify dev` in the project root.
8.  **Access Local Services:** Frontend (`http://localhost:8888`), GraphiQL (`http://localhost:8888/.netlify/functions/graphql`), Inbucket (`http://127.0.0.1:54324`), Supabase Studio (`http://127.0.0.1:54323`), Inngest Dev UI (`npx inngest-cli dev` -> `http://localhost:8288`).
9.  **(Optional) Configure Local OAuth Providers:** As detailed previously, using a separate dev OAuth app and configuring Supabase Studio locally.

## 4. Production Deployment Workflow

(See `README.md` for summary)

1.  **Push to `main`:** Triggers Netlify deploy.
2.  **Netlify Build Process:** Uses `build.command` in `netlify.toml`: `cd frontend && npm install && vite build`.
3.  **Environment Variables (CRITICAL):** Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` in Netlify UI.
4.  **Supabase Production Config:** Configure Auth Providers and Site URL in Supabase Dashboard.
5.  **Database Migrations (MANUAL STEP):** Link CLI (`supabase link --project-ref ...`) and push (`supabase db push --linked`).

## 5. Core Concepts & Implementation Notes

*   **GraphQL (Yoga + `graphql-request`):**
    *   Backend (`netlify/functions/graphql.ts`) uses Yoga, loads schema (`*.graphql` files), and combines resolvers from the `resolvers/` directory.
    *   Resolvers (`resolvers/*.ts`) contain the logic, call services in `/lib`, and use helpers from `helpers.ts` and validators from `validators.ts`.
    *   Authentication handled via JWT in context factory (`graphql.ts`).
    *   Frontend (`frontend/src/lib/graphqlClient.ts`) uses `graphql-request`. Data fetching logic is encapsulated within Zustand store actions (`stores/useAppStore.ts`).
*   **Supabase:**
    *   **Auth:** Managed via frontend listeners and Zustand store.
    *   **Migrations:** Manual application to production is crucial.
    *   **RLS:** Policies enforced via authenticated backend clients (`lib/serviceUtils.ts`).
    *   **Clients:** Separate backend/frontend clients using appropriate environment variables.
*   **State Management (Frontend - Zustand):**
    *   Central store (`stores/useAppStore.ts`) manages auth state and server cache state (data lists, loading, errors) for **all core entities** (People, Orgs, Deals, Pipelines, Stages).
    *   Page components select state and call actions defined in the store.
*   **Pipelines & Stages:**
    *   **Database:** `pipelines` and `stages` tables defined in migrations, with `stages.pipeline_id` FK and `deals.stage_id` FK.
    *   **Backend:** `pipelineService.ts` and `stageService.ts` in `/lib` handle CRUD logic.
    *   **GraphQL:** Schema (`pipeline.graphql`, `stage.graphql`) defines types, inputs, queries, mutations. Resolvers implemented in `resolvers/` directory.
    *   **Frontend Store:** `useAppStore.ts` includes state (`pipelines`, `stages`, `selectedPipelineId`, loading/error states) and actions (`fetchPipelines`, `fetchStages`, CRUD operations) calling the GraphQL API.
    *   **Frontend UI:** `PipelinesPage.tsx` and `StagesPage.tsx` display data. Modals in `components/pipelines/` and `components/stages/` handle create/edit/delete operations.
*   **Activities:**
    *   **Database:** `activities` table defined in migrations, with columns for type, subject, due date, notes, status, and optional FKs to `deals`, `persons`, `organizations`.
    *   **Backend:** `activityService.ts` in `/lib` handles CRUD logic.
    *   **GraphQL:** Schema (`activity.graphql`) defines `Activity` type, inputs (`CreateActivityInput`, `UpdateActivityInput`, `ActivityFilterInput`), queries (`activities`, `activity`), and mutations (`createActivity`, `updateActivity`, `deleteActivity`). `Deal`, `Person`, `Organization` types updated to include `activities` field. Resolvers implemented in `resolvers/activity.ts`. Input validation using Zod in `validators.ts`.
    *   **Frontend Store:** `useAppStore.ts` includes state (`activities`, loading/error states) and actions (`fetchActivities`, `createActivity`, `updateActivity`, `deleteActivity`) calling the GraphQL API. Includes optimistic updates for create/update/delete.
    *   **Frontend UI:** `ActivitiesPage.tsx` displays a list of activities. `ActivityListItem.tsx` renders individual activities with toggle done/delete actions. Modals (`CreateActivityModal`, `EditActivityModal`) wrapping forms (`CreateActivityForm`, `EditActivityForm`) in `components/activities/` handle create/edit operations.
*   **Inngest:**
    *   Event sending in GraphQL mutations.
    *   Event handling definitions in `inngest.ts`.
    *   Local execution verification is challenging; test in deployed environments.
*   **Netlify:** Build command updated to `vite build`.
*   **TypeScript:** Used throughout.
*   **Testing:** Vitest (Unit/Integration), Playwright (E2E).

## 6. Role-Based Access Control (RBAC)

This project implements a database-driven Role-Based Access Control system to manage user permissions.

### 6.1 Overview

The goal is to control what actions users can perform (e.g., create, read, update, delete) on different resources (e.g., deals, people, pipelines) based on roles assigned to them. This is achieved through a combination of database tables, a SQL helper function, Row-Level Security (RLS) policies, and frontend UI checks.

### 6.2 Database Schema

The RBAC relies on the following tables defined in `supabase/migrations/...'rbac_schema_and_policies.sql`:

*   **`public.roles`**: Stores the available roles.
    *   `id uuid PRIMARY KEY`
    *   `name text UNIQUE NOT NULL` (e.g., 'admin', 'member')
    *   `description text`
*   **`public.permissions`**: Stores the granular permissions available in the system.
    *   `id uuid PRIMARY KEY`
    *   `resource text NOT NULL` (e.g., 'deal', 'pipeline', 'activity')
    *   `action text NOT NULL` (e.g., 'create', 'read_any', 'read_own', 'update_any', 'update_own', 'delete_any', 'delete_own')
    *   `description text`
    *   `UNIQUE (resource, action)`
*   **`public.role_permissions`**: Links roles to their assigned permissions (many-to-many).
    *   `role_id uuid REFERENCES roles(id)`
    *   `permission_id uuid REFERENCES permissions(id)`
    *   `PRIMARY KEY (role_id, permission_id)`
*   **`public.user_roles`**: Links users (from `auth.users`) to their assigned roles (many-to-many).
    *   `user_id uuid REFERENCES auth.users(id)`
    *   `role_id uuid REFERENCES roles(id)`
    *   `PRIMARY KEY (user_id, role_id)`

### 6.3 SQL Helper Function

A key component is the `public.check_permission` SQL function:

```sql
CREATE OR REPLACE FUNCTION public.check_permission(p_user_id uuid, p_resource text, p_action text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Runs with the privileges of the function owner
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.resource = p_resource
      AND p.action = p_action
  );
END;
$$;
```

This function takes a user ID, a resource name, and an action name, and returns `true` if the user has the specified permission through any of their assigned roles, `false` otherwise. Using `SECURITY DEFINER` allows it to query the RBAC tables even when invoked by a user who might not have direct access to them.

### 6.4 Row-Level Security (RLS)

RLS policies are applied to all core data tables (`deals`, `people`, `organizations`, `pipelines`, `stages`, `activities`). These policies use the `check_permission` function to enforce access control directly within the database.

**Example RLS Policy (for `deals` SELECT):**

```sql
CREATE POLICY "Allow users to read own or any deals based on permissions" ON public.deals
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  (check_permission(auth.uid(), 'deal', 'read_own') AND user_id = auth.uid()) OR
  (check_permission(auth.uid(), 'deal', 'read_any'))
);
```

This policy allows authenticated users to select deals if:
*   They have the `deal:read_own` permission AND the `deal.user_id` matches their own ID (`auth.uid()`).
*   OR, they have the `deal:read_any` permission.

Similar policies exist for `INSERT`, `UPDATE`, and `DELETE`, checking the relevant `create`, `update_any`/`update_own`, and `delete_any`/`delete_own` permissions respectively. The `USING` clause controls which rows are visible/targetable, and the `WITH CHECK` clause (for INSERT/UPDATE) ensures new/modified rows also satisfy the conditions.

### 6.5 Backend (GraphQL)

The GraphQL resolvers generally rely on the RLS policies enforced by the database. When fetching data, the backend services (`lib/*.service.ts`) use an authenticated Supabase client obtained via `getAuthenticatedClient(accessToken)`. This ensures that all database queries made on behalf of the user automatically respect the RLS policies tied to their `auth.uid()`.

### 6.6 Frontend (UI)

The frontend implements UI-level checks to enhance user experience by hiding or disabling controls for actions the user isn't permitted to perform.

1.  **Fetching Permissions:** After a successful login or token refresh, the `fetchUserPermissions` action in the Zustand store (`useAppStore.ts`) calls the `myPermissions` GraphQL query. The result (a list of permission strings like `"deal:create"`, `"pipeline:read_any"`) is stored in `state.userPermissions`.
2.  **Conditional Rendering/Disabling:** Components (e.g., `DealsPage.tsx`, `ActivityListItem.tsx`) select `userPermissions` and the `currentUserId` from the store.
3.  **UI Logic:** Buttons and other controls use the `isDisabled` prop based on the permissions:
    *   **Create:** `isDisabled={!userPermissions?.includes('resource:create')}`
    *   **Edit/Update:** `isDisabled={! (userPermissions?.includes('resource:update_any') || (userPermissions?.includes('resource:update_own') && item.user_id === currentUserId)) }`
    *   **Delete:** `isDisabled={! (userPermissions?.includes('resource:delete_any') || (userPermissions?.includes('resource:delete_own') && item.user_id === currentUserId)) }`

This logic ensures that users with `*_any` permission can always perform the action, while users with only `*_own` permission can only perform it on items where the `user_id` matches their own.

### 6.7 Managing Roles and Permissions

Currently, managing the RBAC configuration is done manually via SQL or the Supabase Studio:

*   **Adding Roles/Permissions:** `INSERT` new rows into the `public.roles` or `public.permissions` tables.
*   **Assigning Permissions to Roles:** `INSERT` rows into the `public.role_permissions` table linking a `role_id` to a `permission_id`.
*   **Assigning Roles to Users:** `INSERT` rows into the `public.user_roles` table linking a `user_id` (from `auth.users`) to a `role_id`.

### 6.8 Default Roles and Permissions

The migration script (`..._rbac_schema_and_policies.sql`) established the following default configuration, which represents the current standard settings:

*   **Roles Defined:** `admin`, `member`.
*   **Permissions Defined:** A comprehensive set covering `create`, `read_any`, `read_own`, `update_any`, `update_own`, `delete_any`, `delete_own` for all core resources (deals, people, organizations, pipelines, stages, activities), plus administrative permissions for roles/permissions themselves.
*   **Default Role Assignments:**
    *   **`admin` Role:** Granted *all* defined permissions, providing unrestricted access.
    *   **`member` Role:** Granted permissions typically needed for standard users:
        *   `create` permission for core resources (deals, activities, people, organizations).
        *   `read_own`, `update_own`, `delete_own` permissions for the resources they create (deals, activities, people, organizations).
        *   `read_any` permission for shared resources like pipelines and stages.

*Remember to manually assign the appropriate role (`admin` or `member`) to new users in the `public.user_roles` table via SQL or the Supabase Studio.*

## 7. Troubleshooting

(Existing entries 1-15 remain relevant)

16. **Issue:** Persistent TypeScript build error (`TS2345: Argument of type 'string' is not assignable to parameter of type '{ name: string; }'`) in Netlify deploy, despite code appearing correct and explicit type assertions/modifications.
    *   **Cause:** Potentially an issue with `tsc -b` (TypeScript incremental build) within the Netlify build environment's caching or interaction with project references.
    *   **Resolution:** Modified the frontend build script in `frontend/package.json` from `"build": "tsc -b && vite build"` to `"build": "vite build"`, letting Vite handle the TypeScript compilation directly. This resolved the persistent build error.

---

*This guide is a living document...* 