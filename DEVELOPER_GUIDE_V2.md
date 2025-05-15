# Developer Guide: Project PipeCD (Version 2)

This guide provides a comprehensive overview of the Project PipeCD system, its architecture, development workflows, and best practices. It is intended for developers contributing to the project.

## 1. Introduction

Welcome to Project PipeCD! This document will help you understand the project structure, key technologies, and how to effectively contribute.

For critical setup instructions and initial verification, please refer to [README.md](README.md).
For high-level architectural decisions and their rationale, see [ADR.md](ADR.md).
For the project plan, feature tracking, and known issues, consult `PROJECT_ROADMAP_V2.md`.

## 2. Core Technologies & Architecture

Project PipeCD is a custom CRM system built with a modern full-stack TypeScript approach:

*   **Frontend**: React Single Page Application (SPA) built with Vite, using Chakra UI for components and Zustand for state management.
    *   **Date Formatting**: `date-fns` for robust and flexible date/time formatting and manipulation.
*   **Backend API**: GraphQL API served via Netlify Functions, implemented with GraphQL Yoga.
*   **Database**: PostgreSQL managed by Supabase, including authentication and Row-Level Security (RLS).
*   **Shared Logic**: TypeScript modules in a common `/lib` directory, usable by backend services.
    *   **Object Diffing**: `deep-diff` for calculating differences between JavaScript objects, useful for audit trails and history tracking.
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

### GraphQL Code Generation (Backend)

*   **Tooling**: The project uses `@graphql-codegen/cli` to automatically generate TypeScript types for the backend.
*   **Configuration**: The generation process is configured in `codegen.ts` at the project root.
*   **Output**: Generated types, including resolver types (`Resolvers`) and types for GraphQL schema entities, are output to `lib/generated/graphql.ts`.
*   **Usage**: These generated types are used throughout the backend, particularly in GraphQL resolvers (`netlify/functions/graphql/resolvers/`) and service layers (`lib/`), to ensure type safety and consistency with the GraphQL schema.
*   **Running**: The generation can be triggered manually using the `npm run codegen` script. This should be done after any changes to the GraphQL schema files (`*.graphql`).

### 5.4 Handling GraphQL Inputs with Fields Not Directly Mapped to Database Tables

A common scenario in GraphQL development involves input types that contain fields necessary for the GraphQL layer (e.g., for validation, context, or to satisfy client-side expectations) but do not directly correspond to a column in the primary database table for the entity being mutated. This section outlines best practices for handling such discrepancies, using the implementation of "Deal-Specific Probability" and its `pipeline_id` field in `DealInput` as a case study.

#### 5.4.1 The Challenge: `pipeline_id` in `DealInput`

During the implementation of deal-specific probabilities, the `DealInput` GraphQL type was defined to include fields like `name`, `stage_id`, `amount`, and crucially, `pipeline_id`. The `pipeline_id` is essential at the GraphQL/frontend layer because:
*   When creating or editing a deal, selecting a pipeline is often the first step before selecting a stage.
*   The frontend needs `pipeline_id` to correctly populate stage selection dropdowns based on the chosen pipeline.

However, the `deals` table in the database does not have a `pipeline_id` column. Instead, a deal is associated with a pipeline indirectly: `deals.stage_id` links to the `stages` table, and `stages.pipeline_id` links to the `pipelines` table.

This mismatch led to an error: `PGRST204: Could not find the 'pipeline_id' column of 'deals' in the schema cache`. This occurred when GraphQL resolvers for `createDeal` and `updateDeal` passed the full `DealInput` (containing `pipeline_id`) to service layer methods (`dealService.createDeal` and `dealService.updateDeal`). These service methods, in their initial implementation, then attempted to use all fields from the input in Supabase `insert` or `update` operations on the `deals` table.

#### 5.4.2 Solution and Best Practices

The core principle is to ensure that only data corresponding to actual database table columns is passed to the database client for `insert` or `update` operations. The responsibility for stripping or transforming fields depends on the nature of the mutation and the service layer design.

##### 5.4.2.1 Resolver Responsibility (Primarily for Partial Updates)

*   **Scenario**: When a mutation is designed for partial updates (e.g., `updateDeal` where only a subset of fields might be provided) and the corresponding service method also expects a partial input (e.g., `dealService.updateDeal` taking `Partial<DealInput>`).
*   **Action**: The GraphQL resolver is a suitable place to destructure the validated input and explicitly pass only the fields that are intended for direct update on the database table.
*   **Example (`updateDeal` resolver in `mutation.ts`):**
    ```typescript
    // In netlify/functions/graphql/resolvers/mutation.ts
    // ...
    const validatedInput = DealUpdateSchema.parse(args.input);
    // ...
    // Destructure to exclude pipeline_id before passing to the service
    const { pipeline_id, ...dealDataForUpdate } = validatedInput;
    const updatedDealRecord = await dealService.updateDeal(userId, args.id, dealDataForUpdate, accessToken);
    // ...
    ```
    Here, `dealDataForUpdate` only contains fields that directly map to the `deals` table or are otherwise handled by the `dealService.updateDeal` method for persistence.

##### 5.4.2.2 Service Layer Responsibility (Primarily for Create Operations or Full Input Updates)

*   **Scenario**: When a service layer method is designed to accept the full GraphQL input type (e.g., `dealService.createDeal` taking `DealInput`), especially for creation operations where a complete representation is often expected.
*   **Action**: The service method itself should be responsible for ensuring only valid columns are passed to the database. This involves destructuring or mapping the input *within* the service method to exclude fields not present in the target table *before* calling the database client (e.g., Supabase `insert()`).
*   **Example (`createDeal` method in `lib/dealService.ts`):**
    ```typescript
    // In lib/dealService.ts
    async createDeal(userId: string, input: DealInput, accessToken: string): Promise<Deal> {
      // ...
      // Destructure pipeline_id from input, as it doesn't belong in the 'deals' table directly.
      const { pipeline_id, ...dealDataForDbInsert } = input;
      
      const { data, error } = await supabase
        .from('deals')
        .insert({ ...dealDataForDbInsert, user_id: userId }) // Use the destructured object
        .select()
        .single();
      // ...
    }
    ```
    In this case, the `createDeal` resolver in `mutation.ts` can pass the full `validatedInput` to `dealService.createDeal`, and the service layer handles the adaptation for the database.

##### 5.4.2.3 Why the Distinction?

*   **Create Operations**: Service methods for creating new entities (e.g., `createDeal`) often have a contract closely tied to the full GraphQL input type. It's cleaner and more encapsulated for them to internally manage the mapping to the database schema. The resolver then doesn't need to know the intimate details of which fields are transient for DB persistence.
*   **Partial Update Operations**: Service methods for partial updates (e.g., `updateDeal`) are typically more flexible if they accept a subset of fields. The resolver, having validated the full `Partial<DealInput>`, can then prepare this precise subset for the update, minimizing the risk of accidentally trying to update non-existent or non-updatable fields.

##### 5.4.2.4 Zod Schemas and GraphQL Inputs

*   Zod validation schemas (e.g., `DealCreateSchema`, `DealUpdateSchema` in `netlify/functions/graphql/validators.ts`) should generally align with the corresponding GraphQL `Input` types. This ensures consistent validation at the entry point of the resolver.
*   The transformation or stripping of fields not meant for direct database persistence (like `pipeline_id` from `DealInput` for the `deals` table) should occur *after* Zod validation, either in the resolver or the service layer, following the patterns described above.

#### 5.4.3 Key Takeaways

*   **Be Mindful of Discrepancies**: Always be aware of differences between the structure of your GraphQL input types and your underlying database table schemas.
*   **Define Responsibility**: Clearly determine where the logic for adapting GraphQL inputs for database operations should reside (resolver vs. service layer). This decision can be guided by whether it's a "create" versus a "partial update" scenario and the design of your service layer methods.
*   **Defensive Service Layers**: Implement service layer methods that interact with the database defensively. They should only attempt to write data for columns that actually exist in the target table.
*   **Test CRUD Thoroughly**: When introducing new fields to input types or modifying how entities are structured, thoroughly test all related Create, Read, Update, and Delete (CRUD) operations to catch such issues early.

This pattern helps maintain a clean separation of concerns: THE GraphQL layer handles client-facing data contracts and validation, while the service and database layers ensure data is persisted correctly according to the defined schema.

### 5.5 Database (`supabase/migrations`)

*   Database schema changes are managed via SQL migration files.
*   Use `supabase migrations new <migration_name>` to create a new migration file.
*   Write SQL DDL (and DML for data seeding if necessary) in the generated file.
*   Apply locally with `supabase db reset` (for a clean slate) or by restarting Supabase services if it picks up new migrations.
*   For production, migrations are applied using `supabase db push --linked` (see Deployment).
*   Use Supabase Studio (local: `http://127.0.0.1:54323`) to inspect schema, data, and test RLS.

### 5.6 Async Workflows (`netlify/functions/inngest.ts`)

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
*   **Generated Types**: GraphQL Code Generator is used to generate TypeScript types from the GraphQL schema, ensuring type safety between frontend and backend. These types are typically stored in `frontend/src/generated/graphql/` and can be regenerated using the `npm run codegen` script after schema changes.

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

### Prettier

*   **Status**: The `prettier` dependency is included in the project.
*   **Goal**: Prettier is an opinionated code formatter that helps ensure a consistent code style across the project automatically.
*   **Integration (Pending)**: While the dependency is present, full integration (e.g., defining formatting scripts in `package.json`, setting up pre-commit hooks, and CI checks for formatting) is an area for future enhancement. Developers can manually run Prettier via their IDE or npx if desired.

### Naming Conventions

*   **Variables & Functions**: `camelCase`
*   **Classes & Interfaces/Types**: `PascalCase`
*   **Constants**: `UPPER_SNAKE_CASE`
*   **Files**: `kebab-case` (e.g., `deal-service.ts`) or `PascalCase` for React components (e.g., `DealCard.tsx`). Be consistent within directories.

### Commenting

*   Comment complex logic, non-obvious decisions, or parts of the code that might be confusing.
*   Use JSDoc-style comments for functions and classes where appropriate, especially for shared library code.
*   Avoid over-commenting obvious code. Well-named variables and functions often make comments unnecessary.

## 9. Code Generation

*   **Tooling**: The project uses `@graphql-codegen/cli` to automatically generate TypeScript types for the backend.
*   **Configuration**: The generation process is configured in `codegen.ts` at the project root.
*   **Output**: Generated types, including resolver types (`Resolvers`) and types for GraphQL schema entities, are output to `lib/generated/graphql.ts`.
*   **Usage**: These generated types are used throughout the backend, particularly in GraphQL resolvers (`netlify/functions/graphql/resolvers/`) and service layers (`lib/`), to ensure type safety and consistency with the GraphQL schema.
*   **Running**: The generation can be triggered manually using the `npm run codegen` script. This should be done after any changes to the GraphQL schema files (`*.graphql`).

## X. Key Development Learnings & Best Practices (NEW SECTION)

This section consolidates key learnings and best practices derived from feature implementations, such as the Deal History / Audit Trail. Applying these can help improve development efficiency, code quality, and reduce common pitfalls.

### X.1 Database & Migrations

*   **Migration Verification**: Always double-check the content of generated SQL migration files before applying them, especially when using tools to edit them. An empty or incorrect migration file can lead to significant lost time.
*   **RLS Policy Completeness**: When creating new tables requiring Row-Level Security:
    *   Remember to define policies for all relevant operations: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
    *   Test RLS policies thoroughly, especially for `INSERT` operations which are often triggered by backend logic after initial checks.
*   **Data Integrity**: Be mindful of data integrity issues. Incorrect data in one table (e.g., a user profile in `people` having incorrect name data) can manifest as bugs in seemingly unrelated features (e.g., incorrect user attribution in an audit log). Direct database inspection is crucial for diagnosing such issues.
*   **Table & Column Naming**: Clearly understand and use correct table and column names, especially when joining or filtering (e.g., `people.user_id` vs. `people.id` when linking to `deal_history.user_id` which references `auth.users.id`).

### X.2 Backend Services & Business Logic (`/lib`)

*   **Single Source of Truth**: For operations that involve multiple steps (e.g., data update, history recording, event emission), ensure a single service layer function is responsible. This avoids duplicate logic or events (e.g., Inngest events should be sent from the core service method, not also from the GraphQL resolver that calls the service).
*   **Shared Client Configuration**: For external services like Inngest, establish a shared client instance (e.g., `lib/inngestClient.ts`) and ensure all parts of the application (backend services, Inngest function handlers) use this shared instance. Pay close attention to relative import paths when referencing shared modules from different directory levels.

### X.3 GraphQL API Development

*   **Scalar Types**: For custom GraphQL scalar types like `JSON` or `DateTime`:
    *   Ensure they are defined in your GraphQL schema (`*.graphql` files).
    *   Map them correctly in `codegen.ts` to appropriate TypeScript types (e.g., `JSON: 'any'`, `DateTime: 'Date'`).
*   **Code Generation (`codegen`)**:
    *   Run `npm run codegen` after any schema changes.
    *   Troubleshoot "Unknown type" errors by checking schema definitions and `codegen.ts` mappings. Ensure all types referenced in the schema (e.g., `User` vs. `UserInfo`) are correctly defined and consistently used.
*   **Explicit Resolvers**: For GraphQL object types, especially those mapping to database tables with different naming conventions (snake_case vs. camelCase) or requiring data transformation:
    *   Provide explicit resolvers for each field rather than relying solely on default resolvers. This is crucial for non-nullable fields.
    *   Ensure resolvers correctly map data from the parent object (database row) to the GraphQL field type. For example, if a `DateTime` field is mapped to a `Date` object in TypeScript, the resolver must return `new Date(stringValueFromDb)`.
*   **Resolver `parent` Argument**: Understand that the `parent` argument in a field resolver is the result from its parent field's resolver. For list items, it's an individual item from the list.
*   **Type Safety & Linter**: When TypeScript and linters flag issues with resolver signatures (e.g., `ParentType` constraints), ensure the underlying logic of data transformation is sound. Sometimes, a type assertion (e.g., `as ResolverType<Context, Parent>`) on the resolver map can be a pragmatic solution if the types are verifiably correct at runtime but complex for the type system.

### X.4 Inngest (Async Workflows)

*   **Local Development & Dev Server**:
    *   The `netlify/functions/inngest.ts` handler should use `serve` from `inngest/lambda`.
    *   For reliable local Inngest Dev Server synchronization with Netlify Dev, explicitly configuring `serveHost`, `servePath`, and `signingKey` in the `serve` options within `inngest.ts` might be necessary.
    *   The Inngest Dev Server typically expects to connect via HTTP for local Netlify Dev.
*   **Event Data Contracts**: Ensure Inngest functions correctly access data from the `event` object (e.g., `event.data.deal.id` vs. `event.data.id`).
*   **Idempotency & Error Handling**: (Future consideration for more complex Inngest functions) Plan for idempotency and robust error handling within Inngest functions.

### X.5 Frontend Development

*   **Dependency Management**: When installing new frontend-specific libraries (e.g., `date-fns`), ensure they are installed in the correct `package.json` (e.g., `frontend/package.json`).
*   **Data Display & Formatting**: Utilize libraries like `date-fns` for user-friendly display of dates and times. Plan for displaying resolved names for foreign key IDs in user-facing views (e.g., showing Stage Name instead of `stage_id` in history).

### X.6 General Development & Planning

*   **Iterative Debugging**: Use `console.log` extensively in backend resolvers and services, and inspect frontend component props and state to trace data flow and diagnose issues.
*   **Incremental Changes**: Apply and test changes incrementally, especially when debugging complex interactions between the database, backend, and frontend.
*   **Plan Adherence & Adaptation**: While a good implementation plan is invaluable, be prepared to adapt and troubleshoot unforeseen issues. The initial plan for Deal History was a strong guide, but practical implementation always reveals nuances.
*   **Verify Assumptions**: Early verification of assumptions about existing schema, naming conventions, and library/SDK behavior can save significant time.

## 10. Role-Based Access Control (RBAC)

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

## 11. Environment Variables

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

## 12. Deployment

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

## 13. Contribution Workflow

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

## 14. Common Pitfalls & Troubleshooting

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

## 15. Further Reading & Resources

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