# Developer Guide: Project PipeCD (Version 2)

This guide provides a comprehensive overview of the Project PipeCD system, its architecture, development workflows, and best practices. It is intended for developers contributing to the project.

## 1. Introduction

Welcome to Project PipeCD! This document will help you understand the project structure, key technologies, and how to effectively contribute.

For critical setup instructions and initial verification, please refer to [README.md](README.md).
For high-level architectural decisions and their rationale, see [ADR.md](ADR.md).
For the project plan, feature tracking, and known issues, consult [ROADMAP.md](ROADMAP.md) and the upcoming `PROJECT_ROADMAP_V2.md`.

## 2. Core Technologies & Architecture

Project PipeCD is a custom CRM system built with a modern full-stack TypeScript approach:

*   **Frontend**: React Single Page Application (SPA) built with Vite, using Chakra UI for components and Zustand for state management.
*   **Backend API**: GraphQL API served via Netlify Functions, implemented with GraphQL Yoga.
*   **Database**: PostgreSQL managed by Supabase, including authentication and Row-Level Security (RLS).
*   **Shared Logic**: TypeScript modules in a common `/lib` directory, usable by backend services.
*   **Async Workflows**: Inngest for managing background tasks and event-driven logic.
*   **Testing**: Vitest for unit/integration tests and Playwright for end-to-end tests.

The architecture emphasizes separation of concerns, type safety, and a streamlined development experience. Key decisions are documented in [ADR.md](ADR.md).

## 3. Project Structure

The project monorepo is organized as follows:

```
PIPECD/
├── .github/            # GitHub Actions workflows (CI/CD) - (Future)
├── .netlify/           # Netlify build/cache output (gitignored)
├── .vscode/            # VS Code settings (optional, partially gitignored)
├── e2e/                # Playwright E2E tests
│   ├── auth.spec.ts
│   └── ...             # Other E2E test files
├── frontend/           # React SPA (Vite)
│   ├── public/         # Static assets (e.g., favicon)
│   ├── src/
│   │   ├── assets/     # Images, fonts, etc.
│   │   ├── components/ # Reusable UI Components
│   │   │   ├── common/     # Generic components (e.g., ConfirmationDialog)
│   │   │   ├── activities/ # Activity-specific components
│   │   │   ├── layout/     # Layout components (Navbar, Sidebar)
│   │   │   ├── pipelines/  # Pipeline-specific components
│   │   │   └── stages/     # Stage-specific components
│   │   ├── generated/    # Auto-generated files (e.g., GraphQL types)
│   │   │   └── graphql/
│   │   ├── lib/          # Frontend-specific helpers (gql client, Supabase init)
│   │   ├── pages/        # Top-level Page components (e.g., DealsPage.tsx)
│   │   ├── stores/       # Zustand state management
│   │   │   └── useAppStore.ts
│   │   ├── theme/        # Chakra UI theme customization
│   │   │   └── index.ts
│   │   ├── App.tsx       # Root UI component, routing, auth listener
│   │   ├── main.tsx      # App entry point
│   │   └── setupTests.ts # Vitest setup for frontend tests
│   ├── .env.example    # Example for frontend env vars (gitignored: .env)
│   ├── index.html      # HTML entry point for Vite
│   ├── package.json    # Frontend dependencies & scripts
│   ├── tsconfig.json   # Frontend TypeScript configuration
│   └── vite.config.ts  # Vite build configuration
├── lib/                  # Shared Backend/Common TypeScript Modules
│   ├── supabaseClient.ts # Backend Supabase client initialization
│   ├── serviceUtils.ts   # Shared service helpers (auth, error handling)
│   ├── types.ts          # Shared TypeScript interfaces/types (if not from GraphQL)
│   ├── activityService.ts
│   ├── dealService.ts
│   ├── organizationService.ts
│   ├── personService.ts
│   ├── pipelineService.ts
│   ├── stageService.ts
│   └── *.test.ts         # Corresponding Vitest unit tests
├── netlify/
│   └── functions/        # Netlify serverless functions
│       ├── graphql.ts    # GraphQL Yoga entry point
│       ├── graphql/      # GraphQL specific files
│       │   ├── schema/   # GraphQL schema definition files (*.graphql)
│       │   ├── resolvers/# GraphQL resolver implementations
│       │   │   ├── query.ts, mutation.ts, activity.ts, etc.
│       │   └── validators.ts # Zod input validation schemas
│       └── inngest.ts    # Inngest event handler endpoint & function definitions
├── playwright-report/    # Playwright HTML report output (gitignored)
├── supabase/             # Supabase local development files
│   ├── migrations/       # Database schema migrations (SQL)
│   └── config.toml       # Supabase local configuration
├── test-results/         # Playwright test results output (gitignored)
├── .env.example          # Example for root .env file (gitignored: .env)
├── .eslintrc.js          # ESLint configuration
├── .gitignore            # Specifies intentionally untracked files
├── ADR.md                # Architecture Decision Record
├── DEVELOPER_GUIDE.md    # This guide (older version)
├── DEVELOPER_GUIDE_V2.md # This guide
├── netlify.toml          # Netlify deployment/dev configuration
├── package.json          # Root project dependencies & scripts
├── playwright.config.ts  # Playwright E2E test configuration
├── README.md             # Project overview, setup, verification
├── ROADMAP.md            # Development plan and log (older version)
├── tsconfig.json         # Root (backend/functions) TypeScript configuration
└── vitest.config.ts      # Vitest unit/integration test configuration (root)
```

## 4. Getting Started & Local Development

Refer to [README.md](README.md) for a streamlined setup. Detailed steps:

1.  **Prerequisites**:
    *   Node.js (LTS version, e.g., 18.x or 20.x) & npm
    *   Netlify CLI: `npm install -g netlify-cli`
    *   Supabase CLI: `npm install -g supabase`
    *   Docker Desktop (for local Supabase instance)

2.  **Setup**:
    *   Clone the repository: `git clone <repository-url> PIPECD`
    *   Navigate to project root: `cd PIPECD`
    *   Install root dependencies: `npm install`
    *   Install frontend dependencies: `cd frontend && npm install && cd ..`

3.  **Local Supabase**:
    *   Ensure Docker Desktop is running.
    *   Start Supabase services: `supabase start` (from project root)
        *   This will output API URL, anon key, service_role key, DB URL, and Studio URL.

4.  **Environment Variables**:
    *   Create a `.env` file in the project root by copying `.env.example`.
    *   Populate it with values from `supabase status` (and Inngest keys if using Inngest features locally):
        *   `SUPABASE_URL`: (e.g., `http://127.0.0.1:54321`)
        *   `SUPABASE_ANON_KEY`: (public anon key)
        *   `SUPABASE_SERVICE_ROLE_KEY`: (service role key for backend)
        *   `INNGEST_EVENT_KEY`: (if applicable for local testing)
        *   `INNGEST_SIGNING_KEY`: (if applicable for local testing)
    *   The `netlify dev` command will make these available to both frontend and backend functions. `VITE_` prefixed variables in the root `.env` are automatically exposed to the frontend by Vite via Netlify Dev.

5.  **Database Migrations**:
    *   Apply migrations to your local Supabase instance: `supabase db reset`
        *   This command drops the existing local database (if any) and re-applies all migrations from `supabase/migrations`.

6.  **Run Development Environment**:
    *   Start the development server: `netlify dev` (from project root)
        *   This concurrently runs the Vite frontend dev server and Netlify functions locally.

7.  **Access Local Services**:
    *   Frontend Application: `http://localhost:8888` (or as specified by `netlify dev`)
    *   GraphQL API (GraphiQL): `http://localhost:8888/.netlify/functions/graphql`
    *   Supabase Studio: `http://127.0.0.1:54323` (or as specified by `supabase start`)
    *   Inbucket (local email testing): `http://127.0.0.1:54324`
    *   Inngest Dev Server (if running `npx inngest-cli dev -u http://localhost:8888/.netlify/functions/inngest` in a separate terminal): `http://localhost:8288`

## 5. Backend Development

### Shared Logic (`/lib`)

*   **Service Layers (`dealService.ts`, `personService.ts`, etc.)**:
    *   Encapsulate business logic and database interactions for specific entities.
    *   Typically instantiated with a Supabase client (often an authenticated client).
    *   Should be thoroughly unit-tested.
    *   Example: `personService.ts` handles creating, reading, updating, and deleting people records.
*   **`supabaseClient.ts`**: Initializes and exports the backend Supabase client using service role key for privileged operations.
*   **`serviceUtils.ts`**: Contains utility functions for backend services, such as:
    *   `getAuthenticatedClient(supabaseToken: string)`: Creates a Supabase client instance authenticated with a user's JWT.
    *   `handleSupabaseError(error: any, contextMessage: string)`: Standardized error handling for Supabase operations.

### GraphQL API (`netlify/functions/graphql`)

*   **Entry Point (`graphql.ts`)**:
    *   Uses `graphql-yoga` to create the GraphQL server.
    *   Loads GraphQL schema definitions from `*.graphql` files in the `schema/` directory.
    *   Aggregates and injects resolver functions from the `resolvers/` directory.
    *   Defines a `contextFactory` which:
        *   Extracts JWT from the request.
        *   Verifies the JWT using Supabase.
        *   Makes the authenticated user and an authenticated Supabase client available in the GraphQL context.
        *   Fetches user permissions via `get_my_permissions()` RPC call and adds them to context.
*   **Schema Definition (`schema/*.graphql`)**:
    *   Written in GraphQL Schema Definition Language (SDL).
    *   Defines types, queries, mutations, inputs, enums, etc.
    *   Example: `person.graphql` defines `Person` type, `PersonInput`, and CRUD operations.
*   **Resolvers (`resolvers/*.ts`)**:
    *   Implement the logic for each field in the schema.
    *   `Query.ts` for top-level queries, `Mutation.ts` for mutations.
    *   Type-specific resolvers (e.g., `Person.ts` for fields on the `Person` type, like `Person.organization`).
    *   Typically call methods from the service layers in `/lib`.
    *   Access context (user, db client, permissions) passed from `graphql.ts`.
    *   Handle errors gracefully, often re-throwing `GraphQLError` for client consumption.
*   **Input Validation (`validators.ts`)**:
    *   Uses Zod to define schemas for input arguments of mutations (and complex queries).
    *   Ensures data integrity before it reaches service layers.
    *   Example: `PersonCreateInputSchema` validates the structure and types for creating a person.
*   **Helpers (consider moving to `serviceUtils` or domain-specific helpers if more broadly applicable)**:
    *   Utility functions specific to the GraphQL layer that don't fit elsewhere.

### Database (`supabase/migrations`)

*   Database schema changes are managed via SQL migration files.
*   Use `supabase migrations new <migration_name>` to create a new migration file.
*   Write SQL DDL (and DML for data seeding if necessary) in the generated file.
*   Apply locally with `supabase db reset` (for a clean slate) or by restarting Supabase services if it picks up new migrations.
*   For production, migrations are applied using `supabase db push --linked` (see Deployment).
*   Use Supabase Studio (local: `http://127.0.0.1:54323`) to inspect schema, data, and test RLS.

### Async Workflows (`netlify/functions/inngest.ts`)

*   **Inngest Client**: Initialized in `inngest.ts`.
*   **Function Definitions**: Inngest functions are defined here (e.g., `crm/person.created`). These functions are triggered by events.
*   **Event Sending**: Events (e.g., `{ name: 'crm/person.created', data: { personId: '...' } }`) are sent from GraphQL mutations or service layers using `inngest.send()`.
*   **Local Testing**:
    *   Run the Inngest Dev Server: `npx inngest-cli dev -u http://localhost:8888/.netlify/functions/inngest` (ensure the URL matches your local Netlify Dev setup for the Inngest function).
    *   Trigger events from your application; they will appear in the Inngest Dev UI (`http://localhost:8288`).

## 6. Frontend Development

### Core Libraries

*   **React**: For building user interfaces.
*   **Vite**: Fast frontend build tool and dev server.
*   **TypeScript**: For static typing and improved code quality.
*   **Chakra UI**: Component library for a consistent and accessible UI.
*   **`graphql-request`**: Lightweight GraphQL client.
*   **Zustand**: Simple, fast state management.

### State Management (`frontend/src/stores/useAppStore.ts`)

*   **Zustand**: A single central store (`useAppStore`) manages most of the application state.
*   **Store Structure**:
    *   Logically divided into "slices" for different concerns (e.g., `authSlice`, `peopleSlice`, `dealsSlice`, `uiSlice`).
    *   Each slice manages its own state (data, loading status, errors) and actions.
    *   Example: `peopleSlice` would contain `people: Person[]`, `peopleLoading: boolean`, `peopleError: string | null`, and actions like `fetchPeople`, `createPerson`, etc.
*   **Async Actions**:
    *   Actions that interact with the API (e.g., `fetchPeople`) are typically async functions.
    *   They use the `graphqlClient` to make API calls.
    *   They update loading and error states within the store.
    *   Optimistic updates are implemented for some mutations to provide a snappier UX.
*   **Error Handling**:
    *   API call `catch` blocks in store actions update the relevant error state (e.g., `state.peopleError = ...`).
    *   A global error/toast mechanism listens for these errors to display user feedback.
    *   The `GraphQLErrorWithMessage` type and `isGraphQLErrorWithMessage` type guard are used for more specific error handling from GraphQL responses.
*   **Loading State**: Each data slice maintains its own loading flags (e.g., `dealsLoading`) to provide feedback in the UI.

### Routing (`frontend/src/App.tsx`)

*   `react-router-dom` is used for client-side routing.
*   Routes are defined in `App.tsx`.
*   `ProtectedRoute` component handles authentication checks, redirecting to login if the user is not authenticated.
*   The `authListener` in `App.tsx` subscribes to Supabase auth state changes and updates the Zustand store accordingly.

### GraphQL Client (`frontend/src/lib/graphqlClient.ts`)

*   Initializes `graphql-request` client.
*   Configured with the GraphQL endpoint (`/functions/graphql`).
*   Includes middleware to dynamically inject the Supabase JWT (from `useAppStore`) into the `Authorization` header for authenticated requests.
*   **Generated Types**: GraphQL Code Generator (setup pending/manual for now) should be used to generate TypeScript types from the GraphQL schema, ensuring type safety between frontend and backend. These types are typically stored in `frontend/src/generated/graphql/`.

### Components (`frontend/src/components`)

*   **Organization**:
    *   `common/`: Generic, reusable components (e.g., `ConfirmationDialog.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`).
    *   Feature-specific directories (e.g., `pipelines/`, `stages/`, `deals/`) for components related to a particular domain.
*   **Chakra UI**: Components are built using Chakra UI primitives and styled components. Adhere to Chakra's styling props and theme capabilities.
*   **Creating New Components**:
    *   Ensure components are focused and reusable.
    *   Use TypeScript for props definition.
    *   Consider accessibility (Chakra helps significantly here).
*   **Storybook (Future)**: Consider adding Storybook for isolated component development and testing.

### Pages (`frontend/src/pages`)

*   Top-level components representing different views/screens of the application (e.g., `DealsPage.tsx`, `SettingsPage.tsx`).
*   Connect to `useAppStore` using hooks to select state and dispatch actions.
*   Compose UI using components from `frontend/src/components`.
*   Handle user interactions and orchestrate calls to store actions.

### Styling

*   **Chakra UI Theming**: Customizations to the default Chakra theme (colors, fonts, component variants) are defined in `frontend/src/theme/index.ts`.
*   **Global Styles**: Global CSS resets or base styles can be applied via Chakra's global style object or in `main.tsx`/`index.css`.
*   Prefer Chakra's style props and `sx` prop for component-specific styling over custom CSS files where possible.

## 7. Testing

### Overall Strategy

The project aims for a balanced testing approach:

*   **Unit Tests**: Test individual functions, modules, or components in isolation. Focus on business logic in services and store actions. (Vitest)
*   **Integration Tests**: Test the interaction between several units, e.g., a resolver calling a service, or a component interacting with the store. (Vitest)
*   **End-to-End (E2E) Tests**: Test complete user flows through the UI, simulating real user interactions. (Playwright)

### Unit & Integration Tests (Vitest)

*   **Configuration**: `vitest.config.ts` in the root.
*   **Location**:
    *   Backend services: `lib/*.test.ts` (e.g., `personService.test.ts`).
    *   GraphQL Resolvers: Consider creating `resolvers/*.test.ts` to test resolver logic, potentially mocking service dependencies.
    *   Frontend Store: `frontend/src/stores/useAppStore.test.ts` tests store actions, selectors, and state updates.
    *   UI Components: `frontend/src/components/**/*.test.tsx`. Test rendering, basic interactions, and props.
*   **Running Tests**: `npm test` (runs all Vitest tests) or `npm run test:watch`.
*   **Mocking**: Use Vitest's mocking capabilities (`vi.mock`, `vi.spyOn`) for isolating units.

### End-to-End Tests (Playwright)

*   **Configuration**: `playwright.config.ts` in the root.
*   **Location**: `/e2e` directory (e.g., `auth.spec.ts`, `deals.spec.ts`).
*   **Writing Tests**:
    *   Use Playwright's API to interact with browser elements.
    *   Focus on key user scenarios (login, CRUD operations for entities).
    *   Use page object models (POMs) for better organization if tests become complex.
*   **Running Tests**: `npm run test:e2e`.
*   **Viewing Reports**: `npm run test:e2e:report` (opens the HTML report after a test run).

### Test Coverage

*   Aim for high test coverage for critical business logic (services, store actions).
*   Use `npm run coverage` (configure in `package.json` for Vitest) to check coverage reports.

## 8. Code Quality & Style

### TypeScript

*   The project uses TypeScript extensively.
*   Adhere to strict mode settings in `tsconfig.json` files.
*   Utilize types to improve code readability, maintainability, and reduce runtime errors.

### ESLint

*   **Configuration**: `.eslintrc.js` in the root. It includes rules for TypeScript (`@typescript-eslint/eslint-plugin`), React (`eslint-plugin-react`), accessibility (`eslint-plugin-jsx-a11y`), and general best practices.
*   **Running the Linter**: `npm run lint`.
*   **Importance**: Address all ESLint errors and warnings before committing code. This ensures consistency and catches potential issues early. The CI/CD pipeline (future) should enforce this.

### Prettier (TODO: Consider adding)

*   Prettier is an opinionated code formatter that can be integrated to ensure consistent code style across the project automatically.
*   If added, configure it and ensure it runs on pre-commit hooks and in CI.

### Naming Conventions

*   **Variables & Functions**: `camelCase`
*   **Classes & Interfaces/Types**: `PascalCase`
*   **Constants**: `UPPER_SNAKE_CASE`
*   **Files**: `kebab-case` (e.g., `deal-service.ts`) or `PascalCase` for React components (e.g., `DealCard.tsx`). Be consistent within directories.

### Commenting

*   Comment complex logic, non-obvious decisions, or parts of the code that might be confusing.
*   Use JSDoc-style comments for functions and classes where appropriate, especially for shared library code.
*   Avoid over-commenting obvious code. Well-named variables and functions often make comments unnecessary.

## 9. Role-Based Access Control (RBAC)

The project implements a database-driven RBAC system.

*   **Goal**: To control what actions users can perform (e.g., `create`, `read_any`, `update_own`) on different resources (e.g., `deal`, `pipeline`).
*   **Database Schema** (in `supabase/migrations/..._rbac_schema_and_policies.sql`):
    *   `public.roles`: Defines roles (e.g., 'admin', 'member').
    *   `public.permissions`: Defines granular permissions (e.g., `{resource: 'deal', action: 'create'}`).
    *   `public.role_permissions`: Links roles to permissions (many-to-many).
    *   `public.user_roles`: Links users (`auth.users`) to roles (many-to-many).
*   **SQL Helper Functions** (in `supabase/migrations/..._rbac_permission_helpers.sql`):
    *   `public.check_permission(p_user_id uuid, p_resource text, p_action text) RETURNS boolean`: Checks if a user has a specific permission. Used in RLS policies.
    *   `public.get_my_permissions() RETURNS jsonb`: Returns all permissions for the currently authenticated user. Called by the GraphQL context factory.
*   **RLS Policies**:
    *   Applied to core data tables (`deals`, `people`, etc.).
    *   Use the `check_permission` function with `auth.uid()` to enforce access control at the database level.
    *   Example for `deals` table (SELECT): `USING (public.check_permission(auth.uid(), 'deal', 'read_own') AND owner_id = auth.uid()) OR public.check_permission(auth.uid(), 'deal', 'read_any'))`
*   **Backend Enforcement**:
    *   While RLS provides database-level security, service layers or resolvers might include additional checks if needed, though RLS should be the primary guard.
*   **Frontend UI**:
    *   The `userPermissions: string[]` array (e.g., `['deal:create', 'pipeline:read_any']`) is fetched on login and stored in `useAppStore`.
    *   UI elements (buttons, links, fields) are conditionally rendered or disabled based on these permissions.
        *   Example: `<Button isDisabled={!userPermissions.includes('deal:create')}>Create Deal</Button>`

## 10. Environment Variables

*   **`env.example.txt` (Root)**: Template for the root `.env` file.
*   **Root `.env` (Gitignored)**:
    *   `SUPABASE_URL`: Local Supabase URL (e.g., `http://127.0.0.1:54321`).
    *   `SUPABASE_ANON_KEY`: Local Supabase public anon key.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Local Supabase service role key (for backend functions).
    *   `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`: For local Inngest development.
    *   `VITE_SUPABASE_URL=${SUPABASE_URL}`: Exposed to frontend by Netlify Dev.
    *   `VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`: Exposed to frontend by Netlify Dev.
*   **Netlify Build/Production Variables (Set in Netlify UI)**:
    *   `SUPABASE_URL`: Production Supabase URL.
    *   `SUPABASE_ANON_KEY`: Production Supabase public anon key.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Production Supabase service role key.
    *   `INNGEST_EVENT_KEY`: Production Inngest Event Key.
    *   `INNGEST_SIGNING_KEY`: Production Inngest Signing Key.
    *   `VITE_SUPABASE_URL`: Production Supabase URL (for frontend build).
    *   `VITE_SUPABASE_ANON_KEY`: Production Supabase public anon key (for frontend build).
    *   `NODE_VERSION`: (e.g., "18" or "20")

## 11. Deployment

### Netlify

*   **Source**: Connected to the `main` branch of the GitHub repository (or a `production` branch if used).
*   **Build Settings** (in `netlify.toml` and Netlify UI):
    *   Base directory: Not set (repository root).
    *   Build command: `npm run build` (which might internally run `cd frontend && vite build` etc., ensure `package.json` scripts are set up for this). A typical setup in `netlify.toml` is `command = "npm run build"` at the root, and the root `package.json`'s build script would be `cd frontend && npm install && vite build`.
    *   Publish directory: `frontend/dist`.
    *   Functions directory: `netlify/functions`.
*   **Environment Variables**: Set in the Netlify UI as per section 10.
*   Deployment is typically automatic on pushes to the configured production branch.

### Supabase

*   **Production Project**: A separate Supabase project for production.
*   **Migrations**:
    *   Link the Supabase CLI to your production project: `supabase link --project-ref <your-project-ref>`
    *   Apply migrations: `supabase db push --linked`
    *   **CRITICAL**: Test migrations in a staging environment before applying to production if possible.
*   **Configuration**:
    *   Configure Auth providers (Google, GitHub, etc.) in the Supabase Dashboard.
    *   Set Site URL, additional redirect URLs in Supabase Auth settings.

## 12. Contribution Workflow

1.  **Branching Strategy**:
    *   Use feature branches. Create your branch from the latest `main` (or `develop` if used as an integration branch).
    *   Name branches descriptively (e.g., `feat/add-deal-filtering`, `fix/login-page-bug`).
2.  **Committing Changes**:
    *   Make small, logical commits.
    *   Write clear and concise commit messages (e.g., "feat(Deals): Add server-side filtering by status").
    *   **Before committing**:
        *   Run `npm run lint` and fix all issues.
        *   Run `npm test` and ensure all tests pass.
        *   (Optional but recommended) Run `npm run test:e2e` for relevant flows.
3.  **Pull Requests (PRs)**:
    *   Push your feature branch to GitHub.
    *   Create a Pull Request against the `main` (or `develop`) branch.
    *   Fill out the PR template if one exists, describing changes, motivation, and testing performed.
    *   Ensure CI checks (GitHub Actions - future) pass.
    *   Address any feedback from code reviewers.
4.  **Keeping Your Branch Up-to-Date**:
    *   Regularly rebase your feature branch onto the latest `main` (or `develop`) to incorporate upstream changes:
        ```bash
        git checkout main # or develop
        git pull
        git checkout your-feature-branch
        git rebase main # or develop
        ```
    *   Resolve any merge conflicts carefully.

## 13. Common Pitfalls & Troubleshooting

*   **Supabase Local Issues**:
    *   Docker not running or port conflicts: Ensure Docker is running. Check `supabase/config.toml` for ports; stop other services if conflicting.
    *   `supabase db reset` fails: Check Docker logs for Supabase containers.
*   **Netlify Dev Server**:
    *   Functions not updating: Sometimes requires a restart of `netlify dev`.
    *   Port conflicts: Change the port using `netlify dev -p <new_port>`.
*   **Environment Variable Misconfigurations**:
    *   Double-check `.env` names and values, especially for local vs. deployed environments.
    *   Ensure `VITE_` prefix for frontend variables that need to be bundled by Vite.
*   **GraphQL Schema/Resolver Mismatches**:
    *   Ensure resolvers correctly implement the schema.
    *   If using GraphQL Code Generator, re-run it after schema changes.
*   **RLS Policy Debugging**:
    *   Use Supabase Studio's SQL editor to test `SELECT` statements as different roles/users.
    *   Temporarily simplify policies to isolate issues. `EXPLAIN (ANALYZE, VERBOSE)` can be helpful.
*   **CORS Issues**: Usually handled by Netlify Dev and GraphQL Yoga defaults for local. For prod, ensure Netlify function responses have correct CORS headers if accessed from unexpected origins.

## 14. Further Reading & Resources

*   [React](https://react.dev/)
*   [Vite](https://vitejs.dev/)
*   [TypeScript](https://www.typescriptlang.org/docs/)
*   [Chakra UI](https://chakra-ui.com/)
*   [Zustand](https://github.com/pmndrs/zustand)
*   [GraphQL](https://graphql.org/)
*   [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
*   [graphql-request](https://github.com/prisma-labs/graphql-request)
*   [Supabase](https://supabase.com/docs)
*   [Netlify Functions](https://docs.netlify.com/functions/overview/)
*   [Inngest](https://www.inngest.com/docs)
*   [Vitest](https://vitest.dev/)
*   [Playwright](https://playwright.dev/docs/intro)
*   [ESLint](https://eslint.org/docs/latest/)
*   [Zod](https://zod.dev/)

---
This guide should provide a solid foundation for developing Project PipeCD. Happy coding! 