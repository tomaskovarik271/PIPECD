# Developer Guide: Project PipeCD (Version 2)

This guide provides a comprehensive overview of the Project PipeCD system, its architecture, development workflows, and best practices. It is intended for developers contributing to the project.

## 1. Introduction

Welcome to Project PipeCD! This document will help you understand the project structure, key technologies, and how to effectively contribute.

For critical setup instructions and initial verification, please refer to [README.md](README.md).
For high-level architectural decisions and their rationale, see [ADR.md](ADR.md).
For the project plan, feature tracking, and known issues, consult `BACKLOG.md`.

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
│   │   │   ├── admin/      # Admin section components
│   │   │   │   └── wfm/      # WFM Admin UI components (e.g. WorkflowStepForm)
│   │   │   ├── layout/     # Layout components (Navbar, Sidebar)
│   │   │   └── deals/      # Deal-specific components (Kanban, Modals, etc.)
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
│   ├── activityService.ts # Service for managing activities, including assignments and system flags
│   ├── dealService/      # Core deal logic (CRUD, probability - WFM integrated, event publishing for assignments)
│   │   ├── dealCrud.ts
│   │   └── dealProbability.ts
│   ├── organizationService.ts
│   ├── personService.ts
│   ├── wfmStatusService.ts
│   ├── wfmWorkflowService.ts
│   ├── wfmProjectTypeService.ts
│   ├── wfmProjectService.ts
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
        *   Ensure `netlify/functions/inngest.ts` conditionally sets `serveHost: 'http://localhost:8888'` (or your Netlify dev port) for local development (when `process.env.CONTEXT === 'dev'` or `process.env.NODE_ENV === 'development'`) to ensure the Inngest dev server can correctly call your local functions over HTTP.

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

A common scenario in GraphQL development involves input types that contain fields necessary for the GraphQL layer (e.g., for validation, context, or to trigger related actions) but do not directly correspond to a column in the primary database table for the entity being mutated. This section outlines best practices for handling such discrepancies, using a hypothetical example of creating an initial follow-up activity during Deal creation.

#### 5.4.1 The Challenge: `initial_follow_up_type` in `DealCreateInput`

Imagine the business wants to allow users to specify an `initial_follow_up_type` (e.g., "Call", "Email") when creating a new Deal. This information isn't stored directly on the `deals` table but is used by the `dealService.createDeal` method to automatically schedule a corresponding `Activity`.

The `DealCreateInput` GraphQL type might look like this:
```graphql
input DealCreateInput {
  name: String!
  amount: Float
  # ... other deal fields ...
  wfm_project_type_id: ID! # To link to the correct WFM setup
  initial_follow_up_type: String # e.g., "Call", "Email", "Meeting"
  # ... other fields ...
}
```
The `deals` table, however, has no `initial_follow_up_type` column. If the GraphQL resolver for `createDeal` passes the full `DealCreateInput` (containing `initial_follow_up_type`) to `dealService.createDeal`, and the service method then naively attempts to use all input fields in a Supabase `insert` operation on the `deals` table, an error like `PGRST204: Could not find the 'initial_follow_up_type' column of 'deals'` would occur.

#### 5.4.2 Solution and Best Practices

The core principle is to ensure that only data corresponding to actual database table columns is passed to the database client for `insert` or `update` operations. The responsibility for stripping or transforming fields lies with the service layer, especially for "create" operations or when the service method is designed to handle such auxiliary fields.

##### 5.4.2.1 Service Layer Responsibility (Recommended for this Scenario)

*   **Scenario**: The `dealService.createDeal` method is designed to accept the `DealCreateInput` (which includes `initial_follow_up_type`). It's the service's job to handle both the deal creation and the subsequent activity creation.
*   **Action**: The service method itself destructures the input. It uses fields like `name` and `amount` for the `deals` table insertion and uses `initial_follow_up_type` (along with other necessary data like `user_id` and the new `deal_id`) to call `activityService.createActivity`.
*   **Example (`createDeal` method in `lib/dealService/dealCrud.ts`):**
    ```typescript
    // In lib/dealService/dealCrud.ts (illustrative)
    async createDealInternal(
      userId: string,
      input: DealCreateInput, // Contains initial_follow_up_type
      accessToken: string,
      context: ServiceContext // Assuming context provides activityService
    ): Promise<Deal> {
      const { initial_follow_up_type, wfm_project_type_id, ...dealDataForDbInsert } = input;

      // 1. Create the WFM Project for the Deal
      const wfmProject = await this.createWfmProjectForDeal(userId, dealDataForDbInsert.name, wfm_project_type_id, context);
      if (!wfmProject || !wfmProject.current_step_id) {
        throw new Error('Failed to initialize WFM project for deal.');
      }

      // 2. Insert into 'deals' table
      const { data: dealRecord, error: dealError } = await context.supabase
        .from('deals')
        .insert({ 
          ...dealDataForDbInsert, 
          user_id: userId, 
          wfm_project_id: wfmProject.id 
        })
        .select('*, person(*), organization(*), assignedToUser:user_profiles(*), customFieldValues:custom_field_values(*, definition:custom_field_definitions(*)), currentWfmStep:wfm_workflow_steps(*, status:wfm_statuses(*)), currentWfmStatus:wfm_statuses(*), activities(*)') // Fetching related data
        .single();

      if (dealError || !dealRecord) {
        throw new GraphQLError(`Error creating deal: ${dealError?.message || 'Unknown error'}`);
      }

      // 3. Create initial follow-up activity if specified
      if (initial_follow_up_type && dealRecord.id) {
        try {
          await context.activityService.createActivity(userId, {
            type: initial_follow_up_type,
            subject: `Initial follow-up for deal: ${dealRecord.name}`,
            deal_id: dealRecord.id,
            // due_date: // set appropriately, e.g., 3 days from now
            // assigned_to_user_id: userId, // or specific logic
          }, accessToken);
        } catch (activityError) {
          // Log or handle error, but don't necessarily fail deal creation
          console.warn(`Failed to create initial follow-up activity: ${activityError}`);
        }
      }
      // ... calculate probability, history, etc. ...
      return dealRecord as Deal; // Assuming dealRecord matches Deal type after select
    }
    ```
    In this case, the `createDeal` resolver in `mutation.ts` passes the full `validatedInput` to the service, and the service layer correctly orchestrates database insertion for `deals` and any related actions like creating an `Activity`.

##### 5.4.2.2 Resolver Responsibility (More for Partial Updates)

*   **Scenario**: If a mutation is for partial updates (e.g., `updateDeal`) and the service method also expects a partial input (e.g., `dealService.updateDeal` taking `Partial<DealUpdateInput>`).
*   **Action**: The GraphQL resolver can destructure the validated input and explicitly pass only the fields intended for direct update on the database table. This is less common for fields that trigger side-effects like activity creation, which are better handled encapsulated within the service.

##### 5.4.2.3 Zod Schemas and GraphQL Inputs

*   Zod validation schemas (e.g., `DealCreateInputSchema` in `netlify/functions/graphql/validators.ts`) should align with the corresponding GraphQL `Input` types, including fields like `initial_follow_up_type`.
*   The stripping or processing of auxiliary fields occurs *after* Zod validation, within the service layer as demonstrated.

#### 5.4.3 Key Takeaways

*   **Be Mindful of Discrepancies**: Always be aware of differences between your GraphQL input types and your database table schemas.
*   **Define Responsibility**: Clearly determine where logic for adapting inputs and handling related side-effects should reside. For "create" operations with auxiliary actions, the service layer is often the best place for encapsulation.
*   **Defensive Service Layers**: Service methods should be robust, only attempting to write data for columns that exist and handling any auxiliary logic explicitly.
*   **Test Thoroughly**: Test all CRUD operations, especially those involving inputs that trigger side-effects or don't map directly to table columns.

This pattern helps maintain clean separation: GraphQL handles client contracts and validation, while the service layer orchestrates business logic and data persistence.

### 5.5 Database (`supabase/migrations`)

*   Database schema changes are managed via SQL migration files.
*   Use `supabase migrations new <migration_name>` to create a new migration file.
*   Write SQL DDL (and DML for data seeding if necessary) in the generated file.
*   Apply locally with `supabase db reset` (for a clean slate) or by restarting Supabase services if it picks up new migrations.
*   For production, migrations are applied using `supabase db push --linked` (see Deployment).
*   Use Supabase Studio (local: `http://127.0.0.1:54323`) to inspect schema, data, and test RLS.

### 5.6 Async Workflows (`netlify/functions/inngest.ts`)

*   **Inngest Client**: Initialized in `lib/inngestClient.ts` (ensure it's shared correctly).
*   **Function Definitions**: Inngest functions are defined here (e.g., `createDealAssignmentTask`). These functions are triggered by events.
    *   `createDealAssignmentTask`: Listens for `crm/deal.assigned` events and creates an Activity (task) for the assigned user, setting `user_id` to `SYSTEM_USER_ID`, `assigned_to_user_id` to the deal assignee, and `is_system_activity` to `true`.
*   **Event Sending**: Events (e.g., `{ name: 'crm/deal.assigned', data: { dealId: '...', assignedToUserId: '...' } }`) are sent from GraphQL mutations or service layers (e.g., `dealService`) using `inngest.send()`.
*   **Local Testing**:
    *   Run the Inngest Dev Server: `npx inngest-cli dev -u http://localhost:8888/.netlify/functions/inngest` (ensure the URL matches your local Netlify Dev setup for the Inngest function).
    *   Trigger events from your application; they will appear in the Inngest Dev UI (`http://localhost:8288`).
    *   **Crucial for Local Dev**: Your `netlify/functions/inngest.ts` must conditionally set `serveHost: 'http://localhost:8888'` (or your Netlify dev port) for local development (when `process.env.CONTEXT === 'dev'` or `process.env.NODE_ENV === 'development'`) to ensure the Inngest dev server can correctly call your local functions over HTTP.

### 5.7 User Profile Management

The system allows users to manage basic profile information, which is also leveraged in other features like Deal History to display user names.

*   **Database (`user_profiles` Table)**:
    *   Located in `supabase/migrations/20250728000000_create_user_profiles.sql`.
    *   **Schema**:
        *   `user_id` (UUID, PK, FK to `auth.users.id ON DELETE CASCADE`): Links to the Supabase auth user.
        *   `display_name` (TEXT, nullable): User's preferred display name.
        *   `avatar_url` (TEXT, nullable): URL to the user's avatar image.
        *   `created_at` (TIMESTAMPTZ, default now())
        *   `updated_at` (TIMESTAMPTZ, default now(), auto-updated by trigger).
    *   **Row Level Security (RLS)**:
        *   Initially, users could only select/update their own profiles.
        *   Updated by `supabase/migrations/20250729000000_update_user_profiles_rls.sql` to allow any authenticated user to read any profile (`SELECT` policy: `auth.role() = 'authenticated'`). This is crucial for features like Deal History to resolve user names.
        *   INSERT and UPDATE policies remain restricted to the profile owner (`auth.uid() = user_id`).

*   **Service Layer (`lib/userProfileService.ts`)**:
    *   Provides `getUserProfile(userId: string, accessToken: string)` to fetch a user's profile data.
    *   Provides `updateUserProfile(userId: string, input: UpdateUserProfileInput, accessToken: string)` to create or update a user's profile.
    *   Both functions use an authenticated Supabase client, respecting RLS.

*   **GraphQL API**:
    *   **Schema Changes**:
        *   The `User` type (in `netlify/functions/graphql/schema/user.graphql`) was augmented to include `display_name` and `avatar_url`. The concept of a separate `UserProfile` type was merged into the main `User` type.
        *   `Query.me: User` now returns the extended `User` object, fetching profile data via `userProfileService.getUserProfile`.
        *   `Mutation.updateUserProfile(input: UpdateUserProfileInput!): User` allows authenticated users to update their `display_name` and `avatar_url`.
    *   **Resolver Logic**:
        *   `Query.me` (in `netlify/functions/graphql/resolvers/query.ts`): Calls `userProfileService.getUserProfile` using the authenticated user's ID and access token.
        *   `Mutation.updateUserProfile` (in `netlify/functions/graphql/resolvers/mutation.ts`): Calls `userProfileService.updateUserProfile`.
        *   `DealHistoryEntry.user` (in `netlify/functions/graphql/resolvers/history.ts`):
            *   If the history entry's `user_id` is the current authenticated user, it calls `userProfileService.getUserProfile` to fetch their profile, ensuring the `display_name` from `user_profiles` is used.
            *   If the history entry's `user_id` is a *different* user, it also calls `userProfileService.getUserProfile` (using the *viewing* user's access token) to fetch the actor's profile. This is possible due to the updated RLS policy allowing authenticated reads on `user_profiles`.
            *   A placeholder email (e.g., `user@system.local`) is used for users other than `currentUser` to satisfy the `User.email: String!` schema requirement, as actual emails of other users are not exposed through this path.

*   **Local Development & Dev Server**:
    *   The `netlify/functions/inngest.ts` handler should use `serve` from `inngest/lambda` (or `inngest/netlify` if API changes).
    *   For reliable local Inngest Dev Server synchronization with Netlify Dev:
        *   The Inngest Dev Server, when run with `npx inngest-cli dev -u http://localhost:8888/.netlify/functions/inngest`, expects to communicate with your local Netlify functions endpoint (e.g., `http://localhost:8888/.netlify/functions/inngest`) over HTTP.
        *   Your `netlify/functions/inngest.ts` handler **must** conditionally set `serveOptions.serveHost` to your local Netlify Dev URL (e.g., `'http://localhost:8888'`) when in a local development environment. The recommended way is to check `if (process.env.CONTEXT === 'dev')` (Netlify Dev sets this) or fallback to `if (process.env.NODE_ENV === 'development')`.
        *   This configuration ensures that when the Inngest Dev Server attempts to execute a function step by calling back to your local Netlify function, it uses HTTP, preventing "http: server gave HTTP response to HTTPS client" errors.
        *   The `signingKey` is typically handled by the `INNGEST_SIGNING_KEY` environment variable and does not need to be set in `serveOptions` for local development if the environment variable is present (though it's critical for production).
*   **Event Data Contracts**: Ensure Inngest functions correctly access data from the `event` object (e.g., `event.data.dealId`, `event.data.assignedToUserId`).

## 6. Work Flow Management (WFM) System (NEW SECTION)

The project implements a flexible Work Flow Management (WFM) system designed to replace the previous Sales Pipeline system and provide a more generic way to manage multi-step processes for various entities.

### 6.1 Core WFM Concepts & Entities

The WFM system is built around the following core database tables and corresponding GraphQL types:

*   **`WFMStatus` (`wfm_statuses` table)**:
    *   Represents generic, reusable statuses (e.g., "Open", "In Progress", "Pending Approval", "Closed Won", "Closed Lost").
    *   Each status has a name, description, color, and an archived flag.
    *   This entity is foundational and used by `WFMWorkflowStep`.

*   **`WFMWorkflow` (`wfm_workflows` table)**:
    *   Defines a template for a specific process, comprising a sequence of steps.
    *   Examples: "Standard Sales Process", "Enterprise Sales Process", "Support Ticket Resolution Workflow".
    *   Workflows have a name, description, and can be associated with a default `WFMProjectType`.

*   **`WFMWorkflowStep` (`wfm_workflow_steps` table)**:
    *   Represents a distinct step within a `WFMWorkflow`.
    *   Links a specific `WFMStatus` to a workflow, defining its role in that particular process.
    *   Key attributes include:
        *   `workflow_id`: The workflow this step belongs to.
        *   `status_id`: The underlying `WFMStatus` for this step.
        *   `step_order`: Defines the sequence of the step within the workflow.
        *   `is_initial_step`: Boolean flag indicating if this is a starting step for the workflow.
        *   `is_final_step`: Boolean flag indicating if this is a terminal step.
        *   `metadata` (JSONB): Stores step-specific information. For Sales Deals, this includes:
            *   `name`: The display name of the step (e.g., "Qualification", "Proposal Sent"). This is distinct from the `WFMStatus` name.
            *   `deal_probability`: The probability of a Deal closing when it reaches this step.
            *   `outcome_type`: Indicates if the step represents an 'OPEN', 'WON', or 'LOST' outcome for the deal.

*   **`WFMWorkflowTransition` (`wfm_workflow_transitions` table)**:
    *   Defines the allowed transitions between `WFMWorkflowStep`s within a specific `WFMWorkflow`.
    *   Ensures that processes follow a predefined path (e.g., a deal can only move from "Prospecting" to "Qualification" or "Closed Lost").

*   **`WFMProjectType` (`wfm_project_types` table)**:
    *   Defines a category of work that will be managed using the WFM system (e.g., "Sales Deal", "Support Ticket", "Client Onboarding").
    *   Each project type can have a `default_workflow_id`, specifying which `WFMWorkflow` to use when a new project of this type is initiated.
    *   The "Sales Deal" project type is pre-configured to use a sales-specific workflow.

*   **`WFMProject` (`wfm_projects` table)**:
    *   An instance of a WFM-managed process for a specific application entity (e.g., a particular Deal is associated with one `WFMProject`).
    *   Tracks:
        *   `project_type_id`: The type of this project (e.g., "Sales Deal").
        *   `workflow_id`: The specific `WFMWorkflow` this project is following.
        *   `current_step_id`: The current `WFMWorkflowStep` the project is in.
        *   `source_entity_id` (optional): Could be used to link back to the primary entity (e.g., `deal_id`), although in the current Deal implementation, the `deals` table has a `wfm_project_id` foreign key pointing to this table.

Refer to `ADR-006` for further details on the WFM system design.

### 6.2 Integration with Sales Deals

The initial application of the WFM system is the refactoring of the Sales Pipeline:

*   **Deprecated Entities**: The old `Pipeline` and `Stage` entities (and their associated tables, services, GraphQL elements) have been deprecated and removed.
*   **Deal Association**: The `deals` table now has a `wfm_project_id` column, linking each deal to its corresponding `WFMProject` instance.
*   **Deal Creation**: When a new Deal is created:
    *   A `WFMProjectType` is selected (defaults to "Sales Deal").
    *   A new `WFMProject` is automatically created, using the default `WFMWorkflow` and its initial `WFMWorkflowStep` associated with the chosen `WFMProjectType`.
    *   The `deal.wfm_project_id` is set to this new WFMProject.
*   **Deal Progression**: Changes to a Deal's sales status are now managed by updating its `WFMProject`:
    *   The `updateDealWFMProgress` GraphQL mutation is used to move a deal to a `targetWfmWorkflowStepId`.
    *   This mutation validates the requested transition against defined `WFMWorkflowTransition`s.
    *   It updates the `current_step_id` on the `WFMProject` record.
*   **Probability & Weighted Amount**: The `deal_specific_probability` can still be set on a deal, but the effective probability used for `weighted_amount` calculation is now primarily driven by the `deal_probability` defined in the `metadata` of the Deal's current `WFMWorkflowStep`.
*   **Deal History**: Changes to a Deal's WFM status are recorded in the `deal_history` table with an event type of `DEAL_WFM_STATUS_CHANGED`. The history log includes the names and IDs of the old and new WFM statuses (derived from the `WFMStatus` linked to the `WFMWorkflowStep`).

### 6.3 Backend Implementation (WFM)

*   **Service Layers (`lib/wfm*.service.ts`)**: Dedicated services manage CRUD operations and business logic for each WFM entity (e.g., `wfmWorkflowService.ts`, `wfmProjectService.ts`, `wfmStatusService.ts`, `wfmProjectTypeService.ts`).
*   **GraphQL Schema (`netlify/functions/graphql/schema/wfm*.graphql`)**: Schema files define the GraphQL types, queries, and mutations for WFM entities.
*   **Resolvers (`netlify/functions/graphql/resolvers/*`)**: Resolvers implement the GraphQL API for WFM, often calling the respective service layers.

### 6.4 Frontend Implementation (WFM for Deals)

*   **Kanban Board (`DealsKanbanView.tsx`)**: Dynamically generates columns based on the `WFMWorkflowStep`s of the active "Sales" workflow. Drag-and-drop actions call the `updateDealWFMProgress` mutation.
*   **Deal Creation/Editing Modals**:
    *   Pipeline/Stage selection UI is removed.
    *   `CreateDealModal.tsx` includes a `WFMProjectType` selection (hidden or defaulted for "Sales Deal" type initially).
*   **Deal Detail Page (`DealDetailPage.tsx`)**: Displays the WFM status name (from the `WFMStatus` linked to the current `WFMWorkflowStep`).
*   **State Management**: Potentially new Zustand stores (`useWFMConfigStore.ts`, `useWFMWorkflowStore.ts`) or updates to existing stores (`useDealsStore.ts`) manage WFM-related data and state for the frontend.
*   **User Manual**: A user manual (`WFM_Sales_Kanban_User_Manual.md`) has been created to guide users on the new WFM-based Kanban board for Sales Deals.

## 7. Frontend Development

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
    *   Feature-specific directories (e.g., `deals/`, `activities/`, `admin/wfm/`) for components related to a particular domain.
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

### 7.6 User Profile Management (Frontend)

The frontend provides a dedicated page for users to view and manage their profiles, and integrates profile information (like display names) into other relevant parts of the UI, such as Deal History.

*   **GraphQL Operations (`frontend/src/lib/graphql/userProfileOperations.ts` and inline in page component)**:
    *   `GET_ME_QUERY`: Defined in `ProfilePage.tsx` to fetch the current user's `id`, `email`, `display_name`, and `avatar_url`.
    *   `UPDATE_USER_PROFILE_MUTATION`: Defined in `ProfileEditForm.tsx` to update `display_name` and `avatar_url`.
    *   These operations use `graphql-request` via the `gqlClient`.

*   **Profile Page (`frontend/src/pages/ProfilePage.tsx`)**:
    *   Manages the overall view/edit state for the user's profile.
    *   Fetches the current user's data using `GET_ME_QUERY` on component mount (and potentially on re-focus, pending further refinement for stale data).
    *   Displays either `ProfileView` or `ProfileEditForm` based on the edit state.
    *   Handles success and error notifications for profile updates.

*   **Profile View Component (`frontend/src/components/profile/ProfileView.tsx`)**:
    *   Displays the user's `display_name`, `email`, and `avatar_url` (or placeholders if data is null/empty).
    *   Shows a loading state if data is being fetched.

*   **Profile Edit Form Component (`frontend/src/components/profile/ProfileEditForm.tsx`)**:
    *   Uses `react-hook-form` for form state management and validation.
    *   Allows users to edit their `display_name` and `avatar_url`.
    *   Includes basic validation (e.g., avatar URL format, though currently permissive for empty strings which are treated as clearing the URL).
    *   Submits changes using the `UPDATE_USER_PROFILE_MUTATION` via `graphql-request`.

*   **Navigation (`frontend/src/components/layout/Sidebar.tsx`)**:
    *   A "My Profile" link (using `SettingsIcon`) was added to `NAV_ITEMS`, routing to `/profile`.

*   **Integration in Deal History (`frontend/src/components/deals/DealHistoryItem.tsx`)**:
    *   The component now uses `entry.user?.display_name` to show the name of the user who performed an action on a deal.
    *   This leverages the backend resolver updates and new RLS policies that allow fetching display names for any authenticated user associated with a history entry.

## 8. Testing

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

## 9. Code Quality & Style

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

## 10. Code Generation

*   **Tooling**: The project uses `@graphql-codegen/cli` to automatically generate TypeScript types for the backend.
*   **Configuration**: The generation process is configured in `codegen.ts` at the project root.
*   **Output**: Generated types, including resolver types (`Resolvers`) and types for GraphQL schema entities, are output to `lib/generated/graphql.ts`.
*   **Usage**: These generated types are used throughout the backend, particularly in GraphQL resolvers (`netlify/functions/graphql/resolvers/`) and service layers (`lib/`), to ensure type safety and consistency with the GraphQL schema.
*   **Running**: The generation can be triggered manually using the `npm run codegen` script. This should be done after any changes to the GraphQL schema files (`*.graphql`).

## 11. Key Development Learnings & Best Practices (NEW SECTION)

This section consolidates key learnings and best practices derived from feature implementations, such as the Deal History / Audit Trail and the initial "Welcome & Review" task automation.

### X.1 Database & Migrations

*   **Migration Verification**: Always double-check the content of generated SQL migration files before applying them, especially when using tools to edit them. An empty or incorrect migration file can lead to significant lost time.
*   **RLS Policy Completeness**: When creating new tables or adding functionality like activity assignments:
    *   Remember to define policies for all relevant operations: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
    *   Ensure policies cover different access patterns (e.g., creator access, assignee access for system tasks).
    *   Test RLS policies thoroughly, especially for `INSERT` and `UPDATE` operations which are often triggered by backend logic (e.g., Inngest functions, service methods) after initial checks.
*   **Data Integrity**: Be mindful of data integrity issues. Incorrect data in one table (e.g., a user profile in `people` having incorrect name data) can manifest as bugs in seemingly unrelated features (e.g., incorrect user attribution in an audit log or activity assignment).

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
    *   The `netlify/functions/inngest.ts` handler should use `serve` from `inngest/lambda` (or `inngest/netlify` if API changes).
    *   For reliable local Inngest Dev Server synchronization with Netlify Dev:
        *   The Inngest Dev Server, when run with `npx inngest-cli dev -u http://localhost:8888/.netlify/functions/inngest`, expects to communicate with your local Netlify functions endpoint (e.g., `http://localhost:8888/.netlify/functions/inngest`) over HTTP.
        *   Your `netlify/functions/inngest.ts` handler **must** conditionally set `serveOptions.serveHost` to your local Netlify Dev URL (e.g., `'http://localhost:8888'`) when in a local development environment. The recommended way is to check `if (process.env.CONTEXT === 'dev')` (Netlify Dev sets this) or fallback to `if (process.env.NODE_ENV === 'development')`.
        *   This configuration ensures that when the Inngest Dev Server attempts to execute a function step by calling back to your local Netlify function, it uses HTTP, preventing "http: server gave HTTP response to HTTPS client" errors.
        *   The `signingKey` is typically handled by the `INNGEST_SIGNING_KEY` environment variable and does not need to be set in `serveOptions` for local development if the environment variable is present (though it's critical for production).
*   **Event Data Contracts**: Ensure Inngest functions correctly access data from the `event` object (e.g., `event.data.dealId`, `event.data.assignedToUserId`).
*   **Environment Variables in Functions**: Ensure Inngest functions (and other Netlify functions) have access to necessary environment variables (e.g., `SUPABASE_SERVICE_ROLE_KEY`, `SYSTEM_USER_ID`).
*   **Idempotency & Error Handling**: (Future consideration for more complex Inngest functions) Plan for idempotency and robust error handling within Inngest functions.

### X.5 Frontend Development

*   **Dependency Management**: When installing new frontend-specific libraries (e.g., `date-fns`), ensure they are installed in the correct `package.json` (e.g., `frontend/package.json`).
*   **Data Display & Formatting**: Utilize libraries like `date-fns` for user-friendly display of dates and times. Plan for displaying resolved names for foreign key IDs in user-facing views (e.g., showing WFM Status Name instead of `wfm_status_id` in history).

### X.6 General Development & Planning

*   **Iterative Debugging**: Use `console.log` extensively in backend resolvers and services, and inspect frontend component props and state to trace data flow and diagnose issues.
*   **Incremental Changes**: Apply and test changes incrementally, especially when debugging complex interactions between the database, backend, and frontend.
*   **Plan Adherence & Adaptation**: While a good implementation plan is invaluable, be prepared to adapt and troubleshoot unforeseen issues. The initial plan for Deal History was a strong guide, but practical implementation always reveals nuances.
*   **Verify Assumptions**: Early verification of assumptions about existing schema, naming conventions, and library/SDK behavior can save significant time.
*   **RLS Policies**:
    *   Applied to core data tables (`deals`, `people`, etc.).
    *   Use the `check_permission` function with `auth.uid()` to enforce access control at the database level.
    *   Example for `deals` table (SELECT): `USING (public.check_permission(auth.uid(), 'deal', 'read_own') AND owner_id = auth.uid()) OR public.check_permission(auth.uid(), 'deal', 'read_any'))`
*   **Backend Enforcement**:
    *   While RLS provides database-level security, service layers or resolvers might include additional checks if needed, though RLS should be the primary guard.
*   **Frontend UI**:
    *   The `userPermissions: string[]` array (e.g., `['deal:create', 'wfm_workflow:read_any']`) is fetched on login and stored in `useAppStore`.
    *   UI elements (buttons, links, fields) are conditionally rendered or disabled based on these permissions.
        *   Example: `<Button isDisabled={!userPermissions.includes('deal:create')}>Create Deal</Button>`

## 13. Environment Variables

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

## 14. Deployment

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

## 15. Contribution Workflow

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

## 16. Common Pitfalls & Troubleshooting

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
*   **Inngest Local Development**:
    *   If Inngest functions are not triggering locally or you see "http: server gave HTTP response to HTTPS client" errors in the `inngest-cli dev` logs:
        *   Ensure `netlify dev` is running and serving your functions (e.g., on `http://localhost:8888`).
        *   Ensure `inngest-cli dev` is started with the correct URL: `npx inngest-cli dev -u http://localhost:8888/.netlify/functions/inngest`.
        *   Verify that `netlify/functions/inngest.ts` conditionally sets `serveOptions.serveHost` to your local Netlify Dev URL (e.g., `'http://localhost:8888'`) when in a local development environment. This forces the Inngest system to use HTTP for callbacks to your local functions.
*   **CORS Issues**: Usually handled by Netlify Dev and GraphQL Yoga defaults for local. For prod, ensure Netlify function responses have correct CORS headers if accessed from unexpected origins.

## 17. MCP (Model Context Protocol) Integration (NEW SECTION)

Project PipeCD features a revolutionary Model Context Protocol (MCP) server that transforms the sales database into an AI reasoning engine, enabling AI models like Claude to perform intelligent multi-step analysis over deal management data.

### 17.1 Overview

The MCP integration allows AI models to:
- **Perform complex sales analysis** through natural language queries
- **Execute multi-step reasoning** across deal, contact, and activity data
- **Generate intelligent recommendations** based on pipeline analysis
- **Provide real-time insights** into sales performance and opportunities

### 17.2 Architecture

**Core Components:**
- **MCP Server** (`mcp/pipecd-mcp-server.ts`): TypeScript server implementing the MCP protocol
- **GraphQL Integration**: Direct connection to PipeCD's GraphQL API with proper authentication
- **AI Tools**: 6 specialized tools for different aspects of sales analysis
- **Authentication Layer**: Supabase JWT token-based authentication with RLS enforcement

**Data Flow:**
1. AI model (Claude) sends natural language request
2. MCP server interprets request and selects appropriate tools
3. Tools execute GraphQL queries against PipeCD database
4. Results are processed and formatted for AI consumption
5. AI model performs reasoning and provides insights to user

### 17.3 Available AI Tools

#### 17.3.1 search_deals
Intelligent deal filtering and discovery
```typescript
Parameters:
- search_term?: string     // Filter by deal name
- assigned_to?: string     // Filter by assigned user ID
- min_amount?: number      // Minimum deal value
- max_amount?: number      // Maximum deal value  
- limit?: number          // Results limit (default: 20)
```

#### 17.3.2 get_deal_details
Comprehensive deal analysis with full context
```typescript
Parameters:
- deal_id: string         // Specific deal to analyze
```

Returns: Complete deal information including contacts, activities, custom fields, and WFM status.

#### 17.3.3 search_contacts
Contact and organizational relationship mapping
```typescript
Parameters:
- search_term: string     // Name or email to search
- organization_id?: string // Filter by organization
- limit?: number         // Results limit (default: 10)
```

#### 17.3.4 analyze_pipeline
Pipeline trends and performance analysis
```typescript
Parameters:
- time_period_days?: number // Analysis timeframe (default: 30)
```

Returns: Aggregated metrics, user performance breakdown, expected closes, and activity trends.

#### 17.3.5 create_deal
Natural language deal creation
```typescript
Parameters:
- name: string              // Deal name
- amount?: number           // Deal value
- person_id?: string        // Associated contact
- organization_id?: string  // Associated organization
- expected_close_date?: string // Target close date (YYYY-MM-DD)
- assigned_to_user_id?: string // Assigned user
```


Returns: AI-generated activity recommendations with confidence scores and reasoning.

### 17.4 Authentication & Security

**Authentication Flow:**
1. **User JWT Token Required**: Unlike anonymous GraphQL access, MCP requires real user authentication
2. **Row Level Security**: All queries respect Supabase RLS policies
3. **User-Level Permissions**: MCP server operates with user-level access, not admin privileges
4. **Token Management**: JWT tokens expire and need periodic renewal

**Security Features:**
- No elevated permissions - operates within user's access rights
- All database operations filtered by user ownership
- Secure token storage in Claude Desktop configuration
- Local development only (localhost:8888)

### 17.5 Setup & Configuration

**Prerequisites:**
- PipeCD application running (`netlify dev`)
- Supabase local environment active (`supabase start`)
- Node.js 18+ installed

**Setup Steps:**
1. **Build MCP Server**:
   ```bash
   cd mcp
   npm install
   npm run build
   ```

2. **Obtain Authentication Token**:
   ```bash
   node get-auth-token.js
   ```
   This script attempts authentication with common passwords and outputs the required JWT token.

3. **Configure Claude Desktop**:
   ```json
   {
     "mcpServers": {
       "pipecd": {
         "command": "node",
         "args": ["/absolute/path/to/PIPECD/mcp/dist/pipecd-mcp-server.js"],
         "env": {
           "GRAPHQL_ENDPOINT": "http://localhost:8888/.netlify/functions/graphql",
           "SUPABASE_JWT_SECRET": "your-user-jwt-token"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop** and test with: *"Show me my current pipeline"*

### 17.6 Development & Extension

**Adding New Tools:**
1. Define tool in `pipecd-mcp-server.ts` using Zod schemas for parameters
2. Implement GraphQL queries with proper error handling
3. Format results for AI consumption
4. Rebuild and test: `npm run build`

**Example Tool Structure:**
```typescript
server.tool(
  "tool_name",
  {
    param: z.string().describe("Parameter description"),
  },
  async ({ param }) => {
    const query = `
      query ToolQuery($param: String!) {
        data(filter: $param) {
          id
          name
          value
        }
      }
    `;
    
    const result = await executeGraphQL(query, { param });
    
    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }
    
    return {
      content: [{
        type: "text",
        text: `Results: ${JSON.stringify(result.data?.data, null, 2)}`
      }]
    };
  }
);
```


---
This guide should provide a solid foundation for developing Project PipeCD. Happy coding! 

## 18. AI Agent System (MAJOR NEW SECTION)

Project PipeCD features a revolutionary **Claude 4 Sonnet-powered AI Agent** that provides autonomous CRM management with 30+ integrated tools, custom fields management, and sequential workflow execution. This section provides comprehensive technical coverage for developers.

### 18.1 System Architecture

The AI Agent system consists of several key components working together:

```
Frontend (React) 
    ↓
AgentService (lib/aiAgent/agentService.ts) - Core orchestration
    ↓
AIService (lib/aiAgent/aiService.ts) - Claude 4 integration  
    ↓
Tool Discovery & Execution - 30+ tools
    ↓
GraphQL Gateway - Data access
    ↓
Supabase Database - RLS enforcement
```

**Key Files:**
- `lib/aiAgent/agentService.ts` - Main service class (2000+ lines)
- `lib/aiAgent/aiService.ts` - Claude 4 Sonnet integration
- `lib/aiAgent/types.ts` - TypeScript definitions
- `frontend/src/components/agent/` - React UI components
- `frontend/src/hooks/useAgent.ts` - React hooks

### 18.2 Core Components

#### 18.2.1 AgentService Class

**Primary Methods:**
```typescript
class AgentService {
  // Main entry point for AI interaction
  async processMessage(input: SendMessageInput, userId: string): Promise<AgentResponse>
  
  // Tool discovery and execution
  async discoverTools(): Promise<MCPTool[]>
  async executeToolDirectly(toolName: string, parameters: any): Promise<string>
  
  // Conversation management
  async createConversation(data: ConversationCreateData): Promise<AgentConversation>
  async getConversation(id: string, userId: string): Promise<AgentConversation | null>
}
```

**Tool Execution Architecture:**
- **Discovery Phase**: `discoverTools()` returns 30+ available tools with JSON schemas
- **Execution Phase**: `executeToolDirectly()` implements tool logic via GraphQL
- **Sequential Processing**: Claude 4 autonomously chains tools for complex workflows

#### 18.2.2 AIService Class

**Claude 4 Integration:**
```typescript
class AIService {
  constructor(config: {
    apiKey: string;        // Anthropic API key
    model: string;         // claude-sonnet-4-20250514
    maxTokens: number;     // 4096
    temperature: number;   // 0.7
  });
  
  async generateResponse(
    userMessage: string,
    conversationHistory: AgentMessage[],
    config: AgentConfig,
    availableTools: MCPTool[],
    context: Record<string, any>
  ): Promise<AIResponse>
}
```

**Key Features:**
- **System Prompt**: 2000+ line prompt defining AI personality, capabilities, and workflows
- **Tool Integration**: Automatic tool selection based on user intent
- **Thought Tracking**: Real-time reasoning transparency
- **Sequential Execution**: Multi-step autonomous workflows

### 18.3 30+ Integrated Tools

#### 18.3.1 Tool Categories

**Deal Operations (6 tools):**
- `search_deals` - Advanced filtering by multiple criteria
- `get_deal_details` - Complete deal info with custom fields
- `create_deal` - Full deal creation with custom fields support
- `update_deal` - Deal modifications
- `delete_deal` - Deal removal
- `analyze_pipeline` - Pipeline performance analytics

**Custom Fields Operations (4 tools) ⭐ REVOLUTIONARY:**
- `get_custom_field_definitions` - List available custom fields by entity type
- `create_custom_field_definition` - Create new field types on-demand
- `get_entity_custom_fields` - Read custom field values from entities
- `set_entity_custom_fields` - Write custom field values to entities

**Organizations (4 tools):**
- `search_organizations` - Find organizations by name/criteria
- `get_organization_details` - Full organization data with custom fields
- `create_organization` - Organization creation
- `update_organization` - Organization modifications

**Contacts/People (4 tools):**
- `search_contacts` - Find people by name, email, organization
- `get_contact_details` - Complete contact information with custom fields
- `create_contact` - Contact creation
- `update_contact` - Contact modifications

**Activities (5 tools):**
- `search_activities` - Filter tasks/meetings/calls
- `get_activity_details` - Activity information
- `create_activity` - Task/meeting/call creation
- `update_activity` - Activity modifications
- `complete_activity` - Mark activities complete with notes

**Workflow & Analytics (4+ tools):**
- `get_wfm_project_types` - List workflow project types
- `update_deal_workflow_progress` - Move deals through pipeline stages
- `get_price_quotes` - Retrieve pricing information
- `create_price_quote` - Generate new quotes

**User Operations (2 tools):**
- `search_users` - Find users for assignment
- `get_user_profile` - Current user information

#### 18.3.2 Tool Implementation Pattern

All tools follow this pattern in `agentService.ts`:

**1. Tool Definition in `discoverTools()`:**
```typescript
{
  name: 'tool_name',
  description: 'Human-readable description of what this tool does',
  parameters: {
    type: 'object',
    properties: {
      required_param: { type: 'string', description: 'Required parameter' },
      optional_param: { type: 'number', description: 'Optional parameter' },
    },
    required: ['required_param'],
  },
}
```

**2. Tool Implementation in `executeToolDirectly()`:**
```typescript
// In agentService.ts executeToolDirectly()
case 'tool_name': {
  const { required_param, optional_param } = parameters;
  
  // Validate parameters
  if (!required_param) {
    return 'Error: required_param is missing';
  }
  
  // Execute GraphQL query
  const query = `
    query ToolQuery($param: String!, $optional: Float) {
      data(filter: $param, limit: $optional) {
        id
        name
        value
      }
    }
  `;
  
  const result = await this.executeGraphQL(query, { 
    param: required_param, 
    optional: optional_param 
  });
  
  if (result.errors) {
    return `Error executing my_new_tool: ${result.errors.map(e => e.message).join(', ')}`;
  }
  
  // Format response for AI consumption
  const data = result.data?.myData || [];
  return `Found ${data.length} results: ${JSON.stringify(data, null, 2)}`;
}
```

**Step 3: Update AI System Prompt (if needed)**
```typescript
// Add guidance for when/how to use the new tool
const systemPrompt = `
... existing prompt ...

For data analysis tasks, you can use my_new_tool to:
- Analyze specific data patterns
- Generate insights about X
- When user asks about Y, use this tool with...
`;
```

### 18.4 Custom Fields Revolution

#### 18.4.1 The Breakthrough

**Before AI Agent:**
- Only admins could create custom fields
- Bottleneck for RFP processing
- Manual field creation process
- Limited field type support

**After AI Agent:**
- **All users can create custom fields** (democratized permissions)
- **Automatic field creation** based on conversation content
- **Intelligent field type selection** (TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT)
- **RFP-driven workflow** for capturing unique requirements

#### 18.4.2 Database Changes

**Migration Applied:**
```sql
-- 20250730000004_democratize_custom_fields_permissions.sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'member' 
  AND p.resource = 'custom_fields' 
  AND p.action = 'manage_definitions'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
```

**Result**: Member role now has `custom_fields:manage_definitions` permission.

#### 18.4.3 AI Custom Field Workflow

**Automatic Field Creation Process:**
```
1. User mentions unique requirement (e.g., "SOC 2 compliance required")
2. AI extracts unique information not in standard fields  
3. AI calls get_custom_field_definitions(entity_type: "DEAL")
4. AI checks if suitable field exists
5. If missing, AI calls create_custom_field_definition()
6. AI sets custom field values during entity creation
7. AI explains what fields were created and why
```

**Example AI System Prompt Logic:**
```
When creating entities (deals, contacts, organizations), if the user mentions 
information that doesn't fit standard fields:

1. Check existing custom fields first using get_custom_field_definitions
2. Create missing fields using create_custom_field_definition with appropriate:
   - field_type (TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT)
   - dropdown_options for standardized values
   - descriptive field_label for UI display
3. Set custom field values when creating/updating entities
4. Explain to user what custom fields were created and why
```

### 18.5 Sequential Workflow Engine

#### 18.5.1 How It Works

The AI Agent uses **Claude 4's reasoning capabilities** to execute complex multi-step workflows autonomously:

**Example: Complex Deal Creation**
```
User: "Create a deal for Microsoft partnership worth $500K annually, 
       contact Sarah Johnson, need GDPR compliance"

AI Execution Flow:
1. search_organizations("Microsoft") 
   → Gets organization_id
2. search_contacts("Sarah Johnson") 
   → Gets person_id  
3. get_custom_field_definitions(entity_type: "DEAL")
   → Checks existing compliance fields
4. create_custom_field_definition() for GDPR if missing
   → Creates compliance dropdown
5. create_deal() with all IDs and custom field values
   → Creates complete deal
6. Response with summary of what was created
```

**Key Principles:**
- **One tool per AI response** for dependent workflows (e.g., need organization_id before creating deal)
- **Multiple tools per response** for independent operations (e.g., search deals AND search contacts)
- **Claude 4 decides** the sequence based on context and dependencies
- **Complete transparency** through thought tracking

#### 18.5.2 No Hardcoded Workflows

Unlike traditional systems, the AI Agent has **zero hardcoded workflows**:

```typescript
// ❌ Traditional approach (hardcoded)
async createDealWithContact(dealName: string, contactName: string) {
  const contact = await this.searchContact(contactName);
  const deal = await this.createDeal({ name: dealName, contactId: contact.id });
  return deal;
}

// ✅ AI Agent approach (intelligent)
// Claude 4 autonomously decides:
// 1. What tools are needed
// 2. In what order
// 3. With what parameters
// 4. How to handle errors
// 5. When the task is complete
```

### 18.6 Frontend Integration

#### 18.6.1 React Components

**Main Chat Interface:**
```typescript
// frontend/src/components/agent/AIAgentChat.tsx
export default function AIAgentChat() {
  const { sendMessage, conversation, isLoading } = useAgent();
  
  return (
    <Box>
      <ConversationHistory messages={conversation?.messages || []} />
      <ThoughtVisualization thoughts={currentThoughts} />
      <MessageInput onSend={sendMessage} disabled={isLoading} />
    </Box>
  );
}
```

**Real-time Thought Display:**
```typescript
// Shows AI reasoning process in real-time
function ThoughtVisualization({ thoughts }: { thoughts: AgentThought[] }) {
  return (
    <VStack spacing={2}>
      {thoughts.map(thought => (
        <Box key={thought.id} bg="blue.50" p={3} borderRadius="md">
          <Text fontSize="sm" color="blue.600">
            {thought.type}: {thought.content}
          </Text>
        </Box>
      ))}
    </VStack>
  );
}
```

#### 18.6.2 State Management

**Agent Hook:**
```typescript
// frontend/src/hooks/useAgent.ts
export function useAgent() {
  const [conversation, setConversation] = useState<AgentConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async (content: string) => {
    setIsLoading(true);
    try {
      const response = await agentService.processMessage({ content }, userId);
      setConversation(response.conversation);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { sendMessage, conversation, isLoading };
}
```

### 18.7 GraphQL Integration

#### 18.7.1 Agent-Specific Resolvers

**Agent Message Handling:**
```typescript
// netlify/functions/graphql/resolvers/mutation.ts
async sendAgentMessage(
  parent: any,
  { input }: { input: SendAgentMessageInput },
  context: GraphQLContext
): Promise<AgentResponse> {
  const agentService = new AgentService(context.supabase);
  return await agentService.processMessage(input, context.userId);
}
```

**Custom Fields Integration:**
```typescript
// All entity resolvers now include custom field data
async deal(parent: any, { id }: { id: string }, context: GraphQLContext) {
  const deal = await dealService.getDeal(id, context.userId);
  
  // Custom fields automatically included in GraphQL response
  return {
    ...deal,
    customFieldValues: deal.customFieldValues || []
  };
}
```

#### 18.7.2 Custom Field Schema Extensions

**GraphQL Schema Updates:**
```graphql
# Enhanced entity types with custom fields
type Deal {
  id: ID!
  name: String!
  value: Float
  # ... standard fields ...
  customFieldValues: [CustomFieldValue!]!
}

type CustomFieldValue {
  definition: CustomFieldDefinition!
  stringValue: String
  numberValue: Float
  booleanValue: Boolean
  dateValue: DateTime
  selectedOptionValues: [String!]
}

# Agent-specific mutations
extend type Mutation {
  sendAgentMessage(input: SendAgentMessageInput!): AgentResponse!
  createCustomFieldDefinition(input: CustomFieldDefinitionInput!): CustomFieldDefinition!
}
```

### 18.8 Development Workflow

#### 18.8.1 Adding New Tools

**Step 1: Define Tool Schema**
```typescript
// In agentService.ts discoverTools()
{
  name: 'my_new_tool',
  description: 'Description of what this tool does',
  parameters: {
    type: 'object',
    properties: {
      required_param: { type: 'string', description: 'Required parameter' },
      optional_param: { type: 'number', description: 'Optional parameter' },
    },
    required: ['required_param'],
  },
}
```

**Step 2: Implement Tool Logic**
```typescript
// In agentService.ts executeToolDirectly()
case 'my_new_tool': {
  const { required_param, optional_param } = parameters;
  
  // Validate parameters
  if (!required_param) {
    return 'Error: required_param is missing';
  }
  
  // Execute GraphQL query
  const query = `
    query MyNewToolQuery($param: String!, $optional: Float) {
      myData(filter: $param, limit: $optional) {
        id
        name
        value
      }
    }
  `;
  
  const result = await this.executeGraphQL(query, { 
    param: required_param, 
    optional: optional_param 
  });
  
  if (result.errors) {
    return `Error executing my_new_tool: ${result.errors.map(e => e.message).join(', ')}`;
  }
  
  // Format response for AI consumption
  const data = result.data?.myData || [];
  return `Found ${data.length} results: ${JSON.stringify(data, null, 2)}`;
}
```

**Step 3: Update AI System Prompt (if needed)**
```typescript
// Add guidance for when/how to use the new tool
const systemPrompt = `
... existing prompt ...

For data analysis tasks, you can use my_new_tool to:
- Analyze specific data patterns
- Generate insights about X
- When user asks about Y, use this tool with...
`;
```

#### 18.8.2 Testing New Tools

**Manual Testing:**
```typescript
// Test tool directly
const agentService = new AgentService(supabase);
const result = await agentService.executeToolDirectly('my_new_tool', {
  required_param: 'test_value',
  optional_param: 42
});
console.log(result);
```

**AI Integration Testing:**
```typescript
// Test via AI agent
const response = await agentService.processMessage({
  content: 'Use my_new_tool to analyze test_value'
}, userId);
console.log(response.message.content);
```

### 18.9 Performance & Optimization

#### 18.9.1 GraphQL Query Optimization

**Smart Field Selection:**
```typescript
// Tools only request needed fields
const query = `
  query OptimizedDealSearch($term: String!) {
    deals(filter: $term) {
      id
      name
      value
      # Only include custom fields if explicitly needed
      ${includeCustomFields ? `
        customFieldValues {
          definition { fieldLabel }
          stringValue
        }
      ` : ''}
    }
  }
`;
```

**Batched Operations:**
```typescript
// Multiple related queries in single GraphQL call
const query = `
  query BatchedDealData($dealId: ID!) {
    deal(id: $dealId) {
      id
      name
      organization { id name }
      customFieldValues { ... }
    }
    activities(dealId: $dealId) {
      id
      subject
      type
    }
  }
`;
```

#### 18.9.2 Caching Strategy

**Tool Results Caching:**
```typescript
// Cache expensive operations within conversation context
private toolCache = new Map<string, { result: any; timestamp: number }>();

async executeToolDirectly(toolName: string, parameters: any): Promise<string> {
  const cacheKey = `${toolName}:${JSON.stringify(parameters)}`;
  const cached = this.toolCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
    return cached.result;
  }
  
  const result = await this.performToolExecution(toolName, parameters);
  this.toolCache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
}
```

### 18.10 Error Handling & Debugging

#### 18.10.1 Comprehensive Error Handling

**Tool Execution Errors:**
```typescript
case 'problematic_tool': {
  try {
    const result = await this.executeGraphQL(query, variables);
    
    if (result.errors) {
      // GraphQL errors
      const errorMessages = result.errors.map(e => e.message).join(', ');
      return `GraphQL Error in problematic_tool: ${errorMessages}`;
    }
    
    if (!result.data) {
      // No data returned
      return 'No data returned from problematic_tool';
    }
    
    return this.formatToolResult(result.data);
    
  } catch (error) {
    // Network or other errors
    console.error('Tool execution error:', error);
    return `Execution error in problematic_tool: ${error.message}`;
  }
}
```

**AI Response Error Handling:**
```typescript
async processMessage(input: SendMessageInput, userId: string): Promise<AgentResponse> {
  try {
    // ... main processing logic ...
    
  } catch (error) {
    // Log error for debugging
    console.error('Agent processing error:', error);
    
    // Return user-friendly error response
    return {
      conversation: await this.getOrCreateConversation(input.conversationId, userId),
      message: {
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        thoughts: []
      },
      thoughts: [],
      plan: undefined
    };
  }
}
```

#### 18.10.2 Debugging Tools

**Thought Tracking for Debug:**
```typescript
async addDebugThought(conversationId: string, content: string, metadata?: any) {
  await this.addThoughts(conversationId, [{
    type: 'reasoning',
    content: `DEBUG: ${content}`,
    metadata: { debug: true, ...metadata }
  }]);
}
```

**Tool Execution Logging:**
```typescript
async executeToolDirectly(toolName: string, parameters: any): Promise<string> {
  console.log(`Executing tool: ${toolName}`, parameters);
  
  const startTime = Date.now();
  const result = await this.performToolExecution(toolName, parameters);
  const executionTime = Date.now() - startTime;
  
  console.log(`Tool ${toolName} completed in ${executionTime}ms`);
  
  return result;
}
```

### 18.11 Security Considerations

#### 18.11.1 Authentication & Authorization

**User Context Enforcement:**
```typescript
private async executeGraphQL(query: string, variables: any): Promise<any> {
  // Always use authenticated client with user context
  const client = graphqlRequest.GraphQLClient(this.graphqlEndpoint, {
    headers: {
      Authorization: `Bearer ${this.accessToken}`,
    },
  });
  
  return await client.request(query, variables);
}
```

**RLS Policy Compliance:**
```typescript
// All tool operations respect Row Level Security
// No elevated permissions - operates within user's access rights
// Custom fields operations checked against user permissions
```

#### 18.11.2 Input Validation

**Parameter Sanitization:**
```typescript
private validateToolParameters(toolName: string, parameters: any): boolean {
  const toolDef = this.getToolDefinition(toolName);
  
  // Validate against JSON schema
  const validator = new JSONSchemaValidator(toolDef.parameters);
  const isValid = validator.validate(parameters);
  
  if (!isValid) {
    throw new Error(`Invalid parameters for ${toolName}: ${validator.errors}`);
  }
  
  return true;
}
```

### 18.12 Future Extensions

#### 18.12.1 Additional Entity Types

**Extending Custom Fields:**
```typescript
// Currently supports: DEAL, PERSON, ORGANIZATION
// Future: ACTIVITY, QUOTE, PROJECT, etc.

enum CustomFieldEntityType {
  DEAL = 'DEAL',
  PERSON = 'PERSON', 
  ORGANIZATION = 'ORGANIZATION',
  ACTIVITY = 'ACTIVITY',        // Future
  QUOTE = 'QUOTE',             // Future
  PROJECT = 'PROJECT'          // Future
}
```

#### 18.12.2 Advanced AI Capabilities

**Potential Enhancements:**
- **Document Processing**: PDF/Email analysis for RFP extraction
- **Predictive Analytics**: ML-powered deal scoring and recommendations
- **Workflow Automation**: Complex multi-stage business process automation
- **Integration APIs**: Connect with external systems (email, calendar, etc.)
- **Voice Interface**: Speech-to-text for verbal deal updates

#### 18.12.3 Tool Ecosystem

**Plugin Architecture:**
```typescript
// Future: Pluggable tool system
interface AITool {
  name: string;
  definition: MCPTool;
  execute(parameters: any, context: ToolContext): Promise<string>;
}

class ToolRegistry {
  registerTool(tool: AITool): void;
  getTool(name: string): AITool | undefined;
  listTools(): MCPTool[];
}
```

### 18.13 Monitoring & Analytics

#### 18.13.1 Usage Metrics

**Tool Usage Tracking:**
```typescript
// Track which tools are used most frequently
// Monitor tool execution times
// Identify performance bottlenecks
// Measure user satisfaction with AI responses
```

**Conversation Analytics:**
```typescript
// Average conversation length
// Most common user intents
// Success rate of multi-step workflows
// Custom field creation patterns
```

#### 18.13.2 Performance Monitoring

**Key Metrics:**
- Tool execution time
- Claude 4 API response time
- GraphQL query performance
- Custom field query optimization
- Sequential workflow completion rates

---

This comprehensive AI Agent section covers all aspects of the revolutionary system that transforms PipeCD into an intelligent, autonomous CRM platform. The system represents a major technological advancement in CRM automation and user experience.

For additional resources:
- **[Complete Documentation](PIPECD_AI_AGENT_DOCUMENTATION.md)** - User-focused overview
- **[Quick Start Guide](AI_AGENT_QUICK_START.md)** - 10-minute setup 
- **[API Reference](AI_AGENT_API_REFERENCE.md)** - Technical interfaces
- **[Documentation Index](AI_AGENT_DOCUMENTATION_INDEX.md)** - Navigation guide

---
This guide should provide a solid foundation for developing Project PipeCD. Happy coding! 

## 19. Leads Management System (NEW SECTION)

Project PipeCD implements a comprehensive Leads Management system that seamlessly integrates with the existing WFM (Work Flow Management) infrastructure, AI Agent tools, and custom fields democratization. The system provides a complete lead qualification and conversion workflow.

### 19.1 Overview & Architecture

The Leads Management system follows the exact same architectural patterns as the Deals system, ensuring consistency and leveraging proven infrastructure:

**Core Components:**
- **Database Schema**: `leads` table with comprehensive lead tracking
- **WFM Integration**: Lead qualification workflows via WFM system
- **Service Layer**: `lib/leadService/` with full CRUD and business logic
- **GraphQL API**: Complete schema and resolvers for lead operations
- **Frontend Components**: Table and Kanban views with drag-and-drop progression
- **AI Agent Integration**: 6 specialized lead management tools
- **Custom Fields**: Full support for dynamic lead data capture

### 19.2 Database Schema & Design

#### 19.2.1 Core Leads Table

The `leads` table is designed following the same patterns as `deals`:

```sql
CREATE TABLE public.leads (
  -- Primary Keys & Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Core Lead Information  
  name TEXT NOT NULL,
  source TEXT, -- Website, LinkedIn, Referral, Trade Show, etc.
  description TEXT,
  
  -- Contact Information (Pre-conversion data)
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  company_name TEXT,
  
  -- Lead Metrics & Intelligence
  estimated_value DECIMAL(15,2),
  estimated_close_date DATE,
  lead_score INTEGER DEFAULT 0,
  lead_score_factors JSONB, -- Detailed scoring breakdown
  
  -- Qualification Status
  is_qualified BOOLEAN DEFAULT FALSE,
  qualification_notes TEXT,
  qualified_at TIMESTAMPTZ,
  qualified_by_user_id UUID REFERENCES auth.users(id),
  
  -- Assignment & Ownership
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Conversion Tracking
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID REFERENCES deals(id),
  converted_to_person_id UUID REFERENCES people(id),
  converted_to_organization_id UUID REFERENCES organizations(id),
  converted_by_user_id UUID REFERENCES auth.users(id),
  
  -- WFM Integration (Following Deal Pattern)
  wfm_project_id UUID REFERENCES wfm_projects(id),
  
  -- Custom Fields (Following Deal Pattern)
  custom_field_values JSONB DEFAULT '{}',
  
  -- Automation & Intelligence  
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  automation_score_factors JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}', -- AI-generated insights and recommendations
  
  -- Audit Fields
  created_by_user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 19.2.2 WFM Integration for Leads

Leads utilize the WFM system for qualification workflows:

**Lead Qualification Workflow Steps:**
1. **New Lead** - Initial lead capture (initial step)
2. **Initial Contact** - First contact attempt
3. **Follow Up** - Ongoing communication
4. **Qualifying** - Active qualification process
5. **Qualified Lead** - Ready for conversion
6. **Converted** - Successfully converted to deal/contact (final step)
7. **Disqualified** - Not a viable lead (final step)
8. **Nurturing** - Long-term relationship building

**WFM Configuration:**
```sql
-- Lead Project Type
INSERT INTO public.project_types (name, description, default_workflow_id, icon_name)
VALUES ('Lead Qualification and Conversion Process', 
        'Manages lead qualification through to conversion', 
        '{lead_workflow_id}', 
        'user-check');
```

#### 19.2.3 Row Level Security (RLS)

Leads follow the same RLS patterns as deals:

```sql
-- Users can view leads they own or are assigned to
CREATE POLICY "Users can view leads they own or are assigned to" ON leads
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to_user_id OR
    public.check_permission(auth.uid(), 'lead', 'read_any')
  );

-- Users can create leads
CREATE POLICY "Users can create leads" ON leads
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    public.check_permission(auth.uid(), 'lead', 'create')
  );

-- Additional policies for UPDATE and DELETE operations
```

### 19.3 Service Layer Implementation

#### 19.3.1 Lead Service Architecture

Following the exact pattern as `dealService`, the lead service is located at `lib/leadService/`:

```typescript
// lib/leadService/leadCrud.ts
export interface LeadServiceContext {
  supabase: SupabaseClient;
  userId: string;
  accessToken: string;
  aiService?: AIService;
  activityService?: typeof activityService;
}

export class LeadService {
  // Core CRUD Operations (Following dealService pattern)
  async createLead(input: LeadInput, context: LeadServiceContext): Promise<Lead>
  async getLeadById(id: string, context: LeadServiceContext): Promise<Lead | null>
  async updateLead(id: string, input: LeadUpdateInput, context: LeadServiceContext): Promise<Lead>
  async deleteLead(id: string, context: LeadServiceContext): Promise<boolean>
  
  // Lead-Specific Operations
  async recalculateLeadScore(id: string, context: LeadServiceContext): Promise<Lead>
  async qualifyLead(id: string, qualificationData: LeadQualificationInput, context: LeadServiceContext): Promise<Lead>
  async convertLead(id: string, conversionInput: LeadConversionInput, context: LeadServiceContext): Promise<ConversionResult>
  
  // WFM Integration (Following deal pattern)
  async updateLeadWFMProgress(leadId: string, targetStepId: string, context: LeadServiceContext): Promise<Lead>
  async getLeadWorkflowStatus(leadId: string, context: LeadServiceContext): Promise<LeadWorkflowStatus>
  
  // AI Integration
  async getAILeadInsights(leadId: string, context: LeadServiceContext): Promise<AILeadInsights>
  async triggerAILeadScoring(leadId: string, context: LeadServiceContext): Promise<Lead>
}
```

#### 19.3.2 Lead Scoring Engine

Advanced scoring system leveraging AI insights:

```typescript
// lib/leadService/leadScoring.ts
export interface LeadScoringFactors {
  demographic: {
    industry_match: number;
    company_size: number;
    geographic_location: number;
  };
  behavioral: {
    email_engagement: number;
    website_activity: number;
    content_downloads: number;
    social_media_engagement: number;
  };
  interaction: {
    response_time: number;
    meeting_attendance: number;
    call_quality: number;
  };
  ai_derived: {
    sentiment_analysis: number;
    intent_signals: number;
    fit_score: number;
  };
}

export class LeadScoringEngine {
  async calculateLeadScore(leadId: string, factors: LeadScoringFactors): Promise<LeadScore> {
    // Weighted scoring algorithm with AI enhancement
    const score = this.calculateCompositeScore(factors, weights);
    const aiAdjustment = await this.getAIScoreAdjustment(leadId, factors);
    
    return {
      total_score: Math.min(100, Math.max(0, score + aiAdjustment)),
      breakdown: factors,
      ai_confidence: aiAdjustment.confidence,
      recommended_actions: await this.getRecommendedActions(score, factors)
    };
  }
}
```

### 19.4 GraphQL API Implementation

#### 19.4.1 Schema Definition

```graphql
# netlify/functions/graphql/schema/lead.graphql
type Lead {
  id: ID!
  name: String!
  source: String
  description: String
  contact_name: String
  contact_email: String
  contact_phone: String
  company_name: String
  estimated_value: Float
  estimated_close_date: Date
  lead_score: Int
  lead_score_factors: JSON
  is_qualified: Boolean!
  qualification_notes: String
  qualified_at: DateTime
  qualified_by_user_id: ID
  assigned_to_user_id: ID
  assigned_at: DateTime
  converted_at: DateTime
  converted_to_deal_id: ID
  converted_to_person_id: ID
  converted_to_organization_id: ID
  converted_by_user_id: ID
  wfm_project_id: ID
  custom_field_values: JSON
  last_activity_at: DateTime
  automation_score_factors: JSON
  ai_insights: JSON
  created_at: DateTime!
  updated_at: DateTime!
  
  # Resolved relationships
  assignedToUser: User
  convertedToDeal: Deal
  convertedToPerson: Person
  convertedToOrganization: Organization
  wfmProject: WFMProject
  currentWfmStep: WFMWorkflowStep
  currentWfmStatus: WFMStatus
  customFieldValues: [CustomFieldValue!]!
  activities: [Activity!]!
}

type Query {
  leads(filters: LeadFilters): [Lead!]!
  lead(id: ID!): Lead
  leadsStats: LeadsStats!
}

type Mutation {
  createLead(input: LeadInput!): Lead!
  updateLead(id: ID!, input: LeadUpdateInput!): Lead!
  deleteLead(id: ID!): Boolean!
  qualifyLead(id: ID!, input: LeadQualificationInput!): Lead!
  convertLead(id: ID!, input: LeadConversionInput!): ConversionResult!
  updateLeadWFMProgress(leadId: ID!, targetWfmWorkflowStepId: ID!): Lead!
  recalculateLeadScore(leadId: ID!): Lead!
}
```

#### 19.4.2 Resolvers Implementation

Resolvers follow the exact patterns established by deals:

```typescript
// netlify/functions/graphql/resolvers/lead.ts
export const leadResolvers: Resolvers = {
  Query: {
    leads: async (parent, { filters }, context) => {
      return await leadService.getLeads(context.userId, filters, context.accessToken);
    },
    lead: async (parent, { id }, context) => {
      return await leadService.getLeadById(context.userId, id, context.accessToken);
    },
  },
  
  Mutation: {
    createLead: async (parent, { input }, context) => {
      const validatedInput = LeadCreateInputSchema.parse(input);
      return await leadService.createLead(context.userId, validatedInput, context.accessToken);
    },
    
    updateLeadWFMProgress: async (parent, { leadId, targetWfmWorkflowStepId }, context) => {
      return await leadService.updateLeadWFMProgress(leadId, targetWfmWorkflowStepId, context);
    },
  },
  
  Lead: {
    // Field resolvers for relationships
    assignedToUser: async (lead, args, context) => {
      if (!lead.assigned_to_user_id) return null;
      return await userService.getUserById(lead.assigned_to_user_id, context);
    },
    
    currentWfmStatus: async (lead, args, context) => {
      if (!lead.wfm_project_id) return null;
      const project = await wfmProjectService.getProjectById(lead.wfm_project_id, context);
      return project?.currentWfmStatus || null;
    },
  },
};
```

### 19.5 Frontend Implementation

#### 19.5.1 Component Architecture

The frontend follows the exact patterns as deals:

```typescript
frontend/src/components/leads/
├── LeadsPage.tsx                    # Main page with view switching
├── LeadsTableView.tsx               # Table view with filters/sorting
├── LeadsKanbanView.tsx              # Kanban view with WFM steps
├── LeadsKanbanStepColumn.tsx        # Individual workflow step columns
├── LeadCardKanban.tsx               # Draggable lead cards
├── CreateLeadModal.tsx              # Lead creation modal
├── EditLeadModal.tsx                # Lead editing modal
├── LeadDetailPage.tsx               # Full lead detail view
├── LeadConversionModal.tsx          # Lead → Entity conversion
├── LeadQualificationPanel.tsx       # AI-powered qualification
├── LeadScoringDisplay.tsx           # Score visualization
├── LeadActivitiesPanel.tsx          # Related activities
├── LeadCustomFieldsPanel.tsx        # Custom fields management
└── LeadAIInsightsPanel.tsx          # AI recommendations
```

#### 19.5.2 State Management

Enhanced Zustand store following deals patterns:

```typescript
// frontend/src/stores/useLeadsStore.ts
interface LeadsState {
  // Core Data
  leads: Lead[];
  currentLead: Lead | null;
  
  // Loading States
  leadsLoading: boolean;
  currentLeadLoading: boolean;
  
  // View Management
  viewMode: 'table' | 'kanban';
  selectedWorkflowId: string | null;
  
  // Filtering & Search
  filters: LeadFilters;
  searchTerm: string;
  sortConfig: SortConfig;
  
  // AI Integration
  aiInsights: Record<string, AILeadInsights>;
  scoringInProgress: Record<string, boolean>;
  
  // Actions
  fetchLeads: (filters?: LeadFilters) => Promise<void>;
  createLead: (input: LeadInput) => Promise<Lead>;
  updateLead: (id: string, input: LeadUpdateInput) => Promise<Lead>;
  deleteLead: (id: string) => Promise<boolean>;
  
  // Lead-Specific Actions
  qualifyLead: (id: string, data: QualificationInput) => Promise<Lead>;
  convertLead: (id: string, conversion: ConversionInput) => Promise<ConversionResult>;
  recalculateScore: (id: string) => Promise<Lead>;
  updateWFMProgress: (id: string, stepId: string) => Promise<Lead>;
  
  // AI Actions
  getAIInsights: (id: string) => Promise<AILeadInsights>;
  requestAIQualification: (id: string) => Promise<QualificationResult>;
}
```

#### 19.5.3 Kanban View Implementation

Following exact deals kanban patterns with lead-specific enhancements:

```typescript
// frontend/src/components/leads/LeadsKanbanView.tsx
export const LeadsKanbanView: React.FC<LeadsKanbanViewProps> = ({ leads }) => {
  const { currentWorkflow, workflowSteps } = useLeadWorkflow();
  const { updateLeadWFMProgress } = useLeadsStore();
  
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const leadId = result.draggableId;
    const targetStepId = result.destination.droppableId;
    
    try {
      // Optimistic update with lead-specific logic
      await updateLeadWFMProgress(leadId, targetStepId);
      
      // Trigger AI insights update
      await requestAIInsights(leadId);
      
    } catch (error) {
      // Revert optimistic update and handle error
    }
  };
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Kanban implementation following exact deals pattern */}
    </DragDropContext>
  );
};
```

#### 19.5.4 Recent UI Improvements

**Badge Text Visibility Fix:**
Recent improvements address dark theme visibility issues in lead status badges:

```typescript
// Fixed implementation in useLeadsTableColumns.tsx
<Badge
  size="sm"
  bg={lead.isQualified ? colors.status.success : colors.bg.input}
  color={lead.isQualified ? colors.text.onAccent : colors.text.primary}
  borderWidth="1px"
  borderColor={lead.isQualified ? colors.status.success : colors.border.default}
>
  {lead.isQualified ? 'Qualified' : 'Not Qualified'}
</Badge>
```

**Key Improvements:**
- **Theme-Aware Styling**: Uses `useThemeColors()` hook for consistent theming
- **Explicit Color Controls**: Replaces unreliable `colorScheme` with explicit styling
- **Dark Mode Support**: Ensures proper contrast in both light and dark themes
- **Consistent UX**: Matches styling patterns used across the application

### 19.6 AI Agent Integration

#### 19.6.1 Lead-Specific AI Tools

The AI Agent includes 6 specialized tools for lead management:

**1. search_leads**
```typescript
async searchLeads(params: {
  search_term?: string;
  source?: string;
  is_qualified?: boolean;
  assigned_to_user_id?: string;
  min_score?: number;
  max_score?: number;
  limit?: number;
}, context: ToolExecutionContext): Promise<ToolResult>
```

**2. get_lead_details**
```typescript
async getLeadDetails(params: { 
  leadId: string 
}, context: ToolExecutionContext): Promise<ToolResult>
```

**3. create_lead**
```typescript
async createLead(params: {
  name: string;
  source?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company_name?: string;
  estimated_value?: number;
  assigned_to_user_id?: string;
  custom_fields?: object;
}, context: ToolExecutionContext): Promise<ToolResult>
```

**4. qualify_lead**
```typescript
async qualifyLead(params: {
  leadId: string;
  qualification_notes?: string;
}, context: ToolExecutionContext): Promise<ToolResult>
```

**5. convert_lead**
```typescript
async convertLead(params: {
  leadId: string;
  target_type: 'DEAL' | 'PERSON' | 'ORGANIZATION' | 'ALL';
  deal_data?: object;
  preserve_activities?: boolean;
}, context: ToolExecutionContext): Promise<ToolResult>
```

**6. update_lead_score**
```typescript
async updateLeadScore(params: {
  leadId: string;
  scoring_factors?: object;
}, context: ToolExecutionContext): Promise<ToolResult>
```

#### 19.6.2 AI Lead Qualification Engine

Intelligent lead qualification using conversation analysis:

```typescript
export class AILeadQualificationEngine {
  async analyzeLeadConversation(conversation: string, leadData: Lead): Promise<QualificationInsights> {
    const insights = await this.aiService.analyzeText(conversation, {
      extract_intent: true,
      extract_pain_points: true,
      extract_budget_signals: true,
      extract_timeline_signals: true,
      extract_authority_signals: true,
      sentiment_analysis: true
    });
    
    return {
      qualification_score: this.calculateQualificationScore(insights),
      pain_points: insights.pain_points,
      budget_indicators: insights.budget_signals,
      timeline_indicators: insights.timeline_signals,
      authority_level: insights.authority_signals,
      recommended_next_actions: this.generateNextActions(insights, leadData),
      suggested_custom_fields: this.suggestCustomFields(insights)
    };
  }
}
```

### 19.7 Custom Fields Integration

#### 19.7.1 Lead Custom Fields Support

Leads fully support the democratized custom fields system:

**Entity Type Configuration:**
```sql
-- Custom field definitions for leads
INSERT INTO custom_field_definitions (entity_type, field_name, field_label, field_type, is_required, display_order)
VALUES 
  ('LEAD', 'industry', 'Industry', 'DROPDOWN', FALSE, 1),
  ('LEAD', 'company_size', 'Company Size', 'DROPDOWN', FALSE, 2),
  ('LEAD', 'budget_range', 'Budget Range', 'DROPDOWN', FALSE, 3),
  ('LEAD', 'decision_timeline', 'Decision Timeline', 'DROPDOWN', FALSE, 4),
  ('LEAD', 'pain_points', 'Pain Points', 'MULTI_SELECT', FALSE, 5),
  ('LEAD', 'lead_temperature', 'Lead Temperature', 'DROPDOWN', FALSE, 6);
```

**AI-Driven Field Creation:**
The AI Agent can automatically create custom fields for leads based on conversation content:

```typescript
// Example: AI detects compliance requirements
// "This lead requires SOC 2 compliance verification"

// AI automatically:
// 1. Checks existing custom fields for LEAD entity
// 2. Creates new field if missing:
await createCustomFieldDefinition({
  entity_type: 'LEAD',
  field_name: 'compliance_requirements',
  field_label: 'Compliance Requirements',
  field_type: 'MULTI_SELECT',
  dropdown_options: ['SOC 2', 'GDPR', 'HIPAA', 'ISO 27001']
});
// 3. Sets the field value on the lead
// 4. Explains the action to the user
```

### 19.8 Lead Conversion Workflows

#### 19.8.1 Comprehensive Conversion System

```typescript
// lib/leadService/leadConversion.ts
export interface LeadConversionInput {
  target_type: 'DEAL' | 'PERSON' | 'ORGANIZATION' | 'ALL';
  deal_data?: DealInput;
  person_data?: PersonInput;
  organization_data?: OrganizationInput;
  preserve_activities: boolean;
  create_conversion_activity: boolean;
}

export class LeadConversionService {
  async convertLead(leadId: string, input: LeadConversionInput, context: LeadServiceContext): Promise<ConversionResult> {
    return await this.executeInTransaction(async (trx) => {
      const lead = await this.getLeadById(leadId, context);
      
      const conversionResults: ConversionResult = {
        lead_id: leadId,
        converted_entities: {}
      };
      
      // Convert to target entities based on input
      if (input.target_type === 'PERSON' || input.target_type === 'ALL') {
        const person = await this.createPersonFromLead(lead, input.person_data, context);
        conversionResults.converted_entities.person = person;
      }
      
      if (input.target_type === 'ORGANIZATION' || input.target_type === 'ALL') {
        const organization = await this.createOrganizationFromLead(lead, input.organization_data, context);
        conversionResults.converted_entities.organization = organization;
      }
      
      if (input.target_type === 'DEAL' || input.target_type === 'ALL') {
        const deal = await this.createDealFromLead(lead, input.deal_data, context);
        conversionResults.converted_entities.deal = deal;
      }
      
      // Update lead status and transfer activities
      await this.markLeadAsConverted(leadId, conversionResults, context);
      
      if (input.preserve_activities) {
        await this.transferActivities(leadId, conversionResults, context);
      }
      
      if (input.create_conversion_activity) {
        await this.createConversionActivity(leadId, conversionResults, context);
      }
      
      return conversionResults;
    });
  }
}
```

### 19.9 Performance Optimization

#### 19.9.1 Database Optimization

Comprehensive indexing strategy for leads:

```sql
-- Core performance indexes
CREATE INDEX CONCURRENTLY idx_leads_user_id ON leads(user_id);
CREATE INDEX CONCURRENTLY idx_leads_assigned_to_user_id ON leads(assigned_to_user_id);
CREATE INDEX CONCURRENTLY idx_leads_source ON leads(source);
CREATE INDEX CONCURRENTLY idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX CONCURRENTLY idx_leads_is_qualified ON leads(is_qualified);
CREATE INDEX CONCURRENTLY idx_leads_wfm_project_id ON leads(wfm_project_id);
CREATE INDEX CONCURRENTLY idx_leads_contact_email ON leads(contact_email);
CREATE INDEX CONCURRENTLY idx_leads_company_name ON leads(company_name);
CREATE INDEX CONCURRENTLY idx_leads_qualified_at ON leads(qualified_at DESC);
CREATE INDEX CONCURRENTLY idx_leads_converted_at ON leads(converted_at DESC);
CREATE INDEX CONCURRENTLY idx_leads_last_activity_at ON leads(last_activity_at DESC);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_leads_user_qualified ON leads(user_id, is_qualified, lead_score DESC);
CREATE INDEX CONCURRENTLY idx_leads_source_score ON leads(source, lead_score DESC) WHERE is_qualified = true;
CREATE INDEX CONCURRENTLY idx_leads_assigned_active ON leads(assigned_to_user_id, last_activity_at DESC) WHERE converted_at IS NULL;

-- JSONB indexes for custom fields
CREATE INDEX CONCURRENTLY idx_leads_custom_fields_gin ON leads USING GIN (custom_field_values);
```

### 19.10 Development Best Practices

#### 19.10.1 Following Established Patterns

The leads implementation strictly follows patterns established by the deals system:

**Service Layer Patterns:**
- Same CRUD operation signatures
- Identical error handling approaches  
- Consistent transaction management
- Shared validation patterns using Zod

**GraphQL API Patterns:**
- Same resolver structure and naming
- Identical input validation approaches
- Consistent error handling and responses
- Shared authentication and authorization patterns

**Frontend Patterns:**
- Same component architecture
- Identical state management approaches
- Shared UI component patterns
- Consistent styling and theming

**Testing Patterns:**
- Same unit test structures
- Identical integration test approaches
- Shared E2E test patterns
- Consistent mocking strategies

### 19.11 Migration and Deployment

#### 19.11.1 Database Migration Strategy

```sql
-- Migration file: 20250730000020_create_leads_schema.sql
-- Creates complete leads table with all relationships and constraints

-- Migration file: 20250730000021_create_leads_indexes.sql  
-- Creates all performance indexes for leads

-- Migration file: 20250730000022_create_leads_rls_policies.sql
-- Creates all RLS policies for leads

-- Migration file: 20250730000023_setup_lead_wfm_integration.sql
-- Sets up WFM project type and workflow for leads
```

#### 19.11.2 Feature Flag Strategy

```typescript
// Feature flags for leads management rollout
export const LEADS_FEATURE_FLAGS = {
  LEADS_MANAGEMENT: 'leads_management_enabled',
  LEADS_KANBAN_VIEW: 'leads_kanban_view',
  LEADS_AI_SCORING: 'leads_ai_scoring',
  LEADS_AUTO_QUALIFICATION: 'leads_auto_qualification',
  LEADS_CONVERSION_WORKFLOWS: 'leads_conversion_workflows',
  LEADS_ADVANCED_ANALYTICS: 'leads_advanced_analytics'
};
```

### 19.12 Monitoring and Analytics

#### 19.12.1 Key Performance Indicators (KPIs)

Lead management metrics:

```typescript
export interface LeadMetrics {
  // Volume Metrics
  total_leads: number;
  new_leads_today: number;
  leads_by_source: Record<string, number>;
  
  // Quality Metrics
  average_lead_score: number;
  qualification_rate: number;
  conversion_rate: number;
  
  // Performance Metrics
  average_response_time: number;
  average_qualification_time: number;
  average_conversion_time: number;
  
  // AI Metrics
  ai_scoring_accuracy: number;
  ai_qualification_accuracy: number;
  ai_recommendations_acceptance: number;
}
```

### 19.13 Security Considerations

The leads system implements the same security model as deals:

**Authentication & Authorization:**
- JWT-based authentication via Supabase
- Row-level security (RLS) enforcement
- Permission-based access control
- User context propagation throughout the system

**Data Protection:**
- GDPR compliance through Inngest workflows
- Data anonymization capabilities
- Audit trail maintenance
- Secure data handling practices

### 19.14 Future Enhancements

**Planned Features:**
- **Email Integration**: Automatic lead creation from email parsing
- **Social Media Integration**: Lead capture from social platforms  
- **Advanced Scoring**: Machine learning-based lead scoring
- **Predictive Analytics**: Conversion probability predictions
- **Marketing Automation**: Automated nurturing campaigns
- **Lead Intelligence**: External data enrichment

**Technical Improvements:**
- **Performance Optimization**: Query optimization and caching
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Analytics**: Custom reporting and dashboards
- **Integration APIs**: Third-party system integrations

The Leads Management system represents a comprehensive, enterprise-grade solution that seamlessly integrates with PipeCD's existing infrastructure while providing advanced AI-driven capabilities for modern sales teams.