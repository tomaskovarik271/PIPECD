# Developer Guide: Project PipeCD (Version 2)

This guide provides a comprehensive overview of the Project PipeCD system, its architecture, development workflows, and best practices. It is intended for developers contributing to the project.

## 1. Introduction

Welcome to Project PipeCD! This document will help you understand the project structure, key technologies, and how to effectively contribute.

**🚀 Current Status: Production-Ready CRM with AI Intelligence**

## System Implementation Status (Code-Verified)

| Major Component | Tools/Features | Status | Evidence |
|----------------|----------------|--------|----------|
| **AI Agent System** | 27 specialized tools | ✅ Production | All 6 domains operational with real implementations |
| **Activity Reminders** | Enterprise notification infrastructure | ✅ Production | Complete system with email, in-app, and push capabilities |
| **Smart Stickers** | Visual collaboration | ✅ Production | 866-line React component with full drag-and-drop |
| **Leads Management** | Complete CRM pipeline | ✅ Production | Full CRUD, scoring, conversion workflows |
| **Deals Management** | WFM-integrated pipeline | ✅ Production | Complete with automation and custom fields |
| **Custom Fields** | AI-driven field creation | ✅ Production | Dynamic schema with AI conversation interface |
| **GraphQL API** | Complete backend | ✅ Production | Full schema coverage with type generation |
| **Database** | PostgreSQL + RLS | ✅ Production | 30+ migrations with proper security |
| **Frontend** | React SPA | ✅ Production | Comprehensive UI with real-time features |
| **Service Architecture** | Standardized patterns | ✅ Production | 85-95% compliance across all major services |

**Key Metrics:**
- **27 AI Tools** across 6 domains (Deals, Leads, Organizations, Contacts, Activities, Relationships)
- **Enterprise Notification System** with 5 queries, 7 mutations, and multi-channel delivery
- **8 Database Tables** for Smart Stickers alone
- **30+ Database Migrations** with comprehensive RLS policies
- **2000+ Lines** of AI Agent service code
- **866 Lines** for main Smart Stickers component

Project PipeCD is a revolutionary **Claude 4 Sonnet-powered CRM system** featuring:
- **27 Specialized AI Tools** for autonomous deal, lead, and contact management
- **Enterprise Activity Reminders** with email, in-app, and push notification capabilities
- **Complete Leads Management** with qualification workflows and conversion
- **Custom Fields Democratization** - all users can create fields via AI
- **Smart Stickers Visual Collaboration** - Revolutionary sticky note system integrated into all entity detail pages
- **Relationship Intelligence Platform** - Interactive network visualization with D3.js
- **Event-Driven Automation** via Inngest for deal assignment and lead workflows
- **Comprehensive WFM Integration** for sales pipeline and lead qualification
- **Modern Architecture** with GraphQL, Supabase, and serverless deployment

For critical setup instructions and initial verification, please refer to [README.md](README.md).
For high-level architectural decisions and their rationale, see [ADR.md](ADR.md).
For the project plan, feature tracking, and known issues, consult `BACKLOG.md`.

## 2. Core Technologies & Architecture

Project PipeCD is a modern full-stack TypeScript CRM system with revolutionary AI capabilities:

*   **Frontend**: React Single Page Application (SPA) built with Vite, using Chakra UI for components and Zustand for state management.
    *   **Date Formatting**: `date-fns` for robust and flexible date/time formatting and manipulation.
*   **Backend API**: GraphQL API served via Netlify Functions, implemented with GraphQL Yoga.
*   **AI Agent System**: **Claude 4 Sonnet** integration with 30+ specialized tools for autonomous CRM management.
*   **Database**: PostgreSQL managed by Supabase, including authentication and Row-Level Security (RLS).
*   **Shared Logic**: TypeScript modules in a common `/lib` directory, usable by backend services.
    *   **Object Diffing**: `deep-diff` for calculating differences between JavaScript objects, useful for audit trails and history tracking.
*   **Async Workflows**: Inngest for managing background tasks and event-driven logic.
    *   **Deal Assignment Automation**: Automatic task creation when deals are assigned
    *   **Lead Assignment Automation**: Automatic task creation when leads are assigned
*   **Testing**: Vitest for unit/integration tests and Playwright for end-to-end tests.

The architecture emphasizes separation of concerns, type safety, AI-powered automation, and a streamlined development experience. Key decisions are documented in [ADR.md](ADR.md).

### 2.1 Major System Components

**Implemented & Production-Ready:**
- ✅ **AI Agent System** - Claude 4 Sonnet with 30+ tools for autonomous CRM management
- ✅ **Activity Reminders System** - Enterprise notification infrastructure with email, in-app, and push capabilities
- ✅ **Deals Management** - Complete CRUD with WFM integration and automation
- ✅ **Leads Management** - Full qualification workflows with AI scoring and conversion
- ✅ **Contact Management** - People and Organizations with custom fields support
- ✅ **Activity Management** - Tasks, meetings, calls with assignment automation and reminder scheduling
- ✅ **Google Workspace Integration** - OAuth 2.0, Google Drive document management, deal-centric folders
- ✅ **Smart Stickers Visual Collaboration** - Drag-and-drop sticky note system with dual-mode interface
- ✅ **Work Flow Management (WFM)** - Replaces legacy pipeline system with flexible workflows
- ✅ **Custom Fields System** - Democratized custom field creation for all entity types
- ✅ **Relationship Intelligence Platform** - Interactive network visualization with D3.js
- ✅ **User Profile Management** - Profile editing with display names and avatars
- ✅ **Event-Driven Automation** - Inngest-powered background task processing

**Architecture Highlights:**
- **Service Layer Consistency**: All services follow proven object-based patterns
- **AI Integration**: Deep integration allowing natural language CRM operations
- **Enterprise Notifications**: Multi-channel reminder system with user preference management
- **Visual Collaboration**: Smart Stickers transform static entity pages into interactive workspaces
- **Custom Fields Revolution**: Any user can create custom fields via AI conversations
- **Automation Engine**: Event-driven workflows for assignment and qualification tasks
- **Type Safety**: Comprehensive TypeScript coverage with GraphQL code generation

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
│   │   │   ├── common/     # Generic components (e.g., ConfirmationDialog, NotificationCenter)
│   │   │   ├── activities/ # Activity-specific components
│   │   │   ├── admin/      # Admin section components
│   │   │   │   └── wfm/      # WFM Admin UI components (e.g. WorkflowStepForm)
│   │   │   ├── agent/      # 🆕 AI Agent chat interface and components
│   │   │   ├── layout/     # Layout components (Navbar, Sidebar)
│   │   │   ├── deals/      # Deal-specific components (Kanban, Modals, etc.)
│   │   │   ├── leads/      # 🆕 Lead management components (Table, Kanban, Forms)
│   │   │   └── profile/    # User profile management components (including NotificationPreferences)
│   │   ├── generated/    # Auto-generated files (e.g., GraphQL types)
│   │   │   └── graphql/
│   │   ├── hooks/        # 🆕 React hooks including useAgent.ts
│   │   ├── lib/          # Frontend-specific helpers (gql client, Supabase init)
│   │   ├── pages/        # Top-level Page components (e.g., DealsPage.tsx)
│   │   │   └── admin/    # Admin pages for WFM configuration
│   │   ├── stores/       # Zustand state management
│   │   │   ├── useAppStore.ts     # Main application store
│   │   │   ├── useDealsStore.ts   # Deal-specific state
│   │   │   └── useLeadsStore.ts   # 🆕 Lead-specific state
│   │   ├── theme/        # Chakra UI theme customization
│   │   │   └── themes/   # Multiple theme support
│   │   ├── utils/        # Frontend utility functions
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
│   ├── generated/        # Auto-generated GraphQL types for backend
│   │   └── graphql.ts
│   ├── aiAgent/          # 🆕 AI Agent System (2000+ lines)
│   │   ├── agentService.ts    # Main AI Agent orchestration (30+ tools)
│   │   ├── aiService.ts       # Claude 4 Sonnet integration
│   │   ├── types.ts           # AI Agent type definitions
│   │   ├── core/             # Core AI processing logic
│   │   ├── tools/            # Individual AI tool implementations
│   │   │   └── domains/      # Domain-specific tool groups
│   │   ├── adapters/         # External service adapters
│   │   └── utils/            # AI-specific utilities
│   ├── activityService.ts # ✅ Standardized object-based service for activity management
│   ├── activityReminderService/ # ✅ NEW: Enterprise notification infrastructure
│   │   └── index.ts          # Activity reminders, notifications, user preferences
│   ├── relationshipService.ts # ✅ Standardized relationship intelligence service
│   ├── smartStickersService.ts # ✅ Standardized visual collaboration service
│   ├── dealService/      # Core deal logic (CRUD, probability - WFM integrated, event publishing for assignments)
│   │   ├── dealCrud.ts
│   │   └── dealProbability.ts
│   ├── leadService/      # 🆕 Complete lead management service
│   │   ├── leadCrud.ts        # Core CRUD operations
│   │   ├── leadScoring.ts     # AI-powered lead scoring
│   │   └── leadConversion.ts  # Lead to entity conversion
│   ├── organizationService.ts
│   ├── personService.ts
│   ├── userProfileService.ts  # User profile management
│   ├── wfmStatusService.ts
│   ├── wfmWorkflowService.ts
│   ├── wfmProjectTypeService.ts
│   ├── wfmProjectService.ts
│   └── *.test.ts         # Corresponding Vitest unit tests
├── mcp/                  # 🆕 Model Context Protocol integration
│   ├── pipecd-mcp-server.ts  # MCP server for AI model integration
│   ├── get-auth-token.js     # Authentication helper
│   └── package.json          # MCP-specific dependencies
├── netlify/
│   └── functions/        # Netlify serverless functions
│       ├── graphql.ts    # GraphQL Yoga entry point
│       ├── graphql/      # GraphQL specific files
│       │   ├── schema/   # GraphQL schema definition files (*.graphql)
│       │   │   ├── deal.graphql     # Deal types and operations
│       │   │   ├── lead.graphql     # 🆕 Lead types and operations
│       │   │   ├── agent.graphql    # 🆕 AI Agent types and operations
│       │   │   ├── activityReminders.graphql # ✅ NEW: Activity reminders schema
│       │   │   └── wfm*.graphql     # WFM-related schemas
│       │   ├── resolvers/# GraphQL resolver implementations
│       │   │   ├── query.ts, mutation.ts, activity.ts, etc.
│       │   │   ├── lead.ts          # 🆕 Lead resolvers
│       │   │   ├── agent.ts         # 🆕 AI Agent resolvers
│       │   │   ├── queries/activityReminderQueries.ts # ✅ NEW: Reminder queries
│       │   │   └── mutations/activityReminderMutations.ts # ✅ NEW: Reminder mutations
│       │   └── validators.ts # Zod input validation schemas
│       └── inngest.ts    # Inngest event handler endpoint & function definitions (includes reminder processing)
├── supabase/             # Supabase local development files
│   ├── migrations/       # Database schema migrations (SQL)
│   │   ├── 20250730000000_create_user_profiles.sql
│   │   ├── 20250730000004_democratize_custom_fields_permissions.sql
│   │   ├── 20250730000020_create_leads_schema.sql      # 🆕 Leads table
│   │   ├── 20250730000021_create_leads_indexes.sql     # 🆕 Lead performance indexes
│   │   ├── 20250730000039_create_activity_reminders_system.sql # ✅ NEW: Activity reminders system
│   │   ├── 20250730000041_create_note_document_attachments.sql # ✅ NEW: Document attachment to notes
│   │   └── ...           # Other migration files
│   └── config.toml       # Supabase local configuration
├── _project-management-documentation/  # 🆕 Project documentation
│   ├── adr/             # Architecture Decision Records
│   └── SVG/            # Project diagrams and assets
├── .env.example          # Example for root .env file (gitignored: .env)
├── .eslintrc.js          # ESLint configuration
├── .gitignore            # Specifies intentionally untracked files
├── ADR.md                # Architecture Decision Record
├── AI_AGENT_ARCHITECTURE_PRINCIPLES.md  # 🆕 AI development principles
├── ACTIVITY_REMINDERS_IMPLEMENTATION_SUMMARY.md # ✅ NEW: Activity reminders documentation
├── DOCUMENT_ATTACHMENT_IMPLEMENTATION_SUMMARY.md # ✅ NEW: Document attachment documentation
├── DOCUMENT_ATTACHMENT_MANUAL_TESTING_GUIDE.md # ✅ NEW: Document attachment testing guide
├── DEVELOPER_GUIDE_V2.md # This guide
├── PIPECD_SYSTEM_ARCHITECTURE.md        # 🆕 Comprehensive system reference
├── codegen.ts            # GraphQL code generation configuration
├── netlify.toml          # Netlify deployment/dev configuration
├── package.json          # Root project dependencies & scripts
├── playwright.config.ts  # Playwright E2E test configuration
├── README.md             # Project overview, setup, verification
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

*   **Service Layers (`dealService.ts`, `personService.ts`, `activityService.ts`, `relationshipService.ts`, `smartStickersService.ts`, etc.)**:
    *   **Standardized Architecture**: All services follow consistent object-based patterns for maintainability and reliability.
    *   **Uniform Authentication**: All services use `getAuthenticatedClient(accessToken)` for JWT-based authentication.
    *   **Consistent Error Handling**: All services implement `handleSupabaseError` for standardized error processing.
    *   **Service Object Pattern**: Each service exports an object with methods rather than individual functions.
    *   Example: `activityService.createActivity(userId, input, accessToken)` instead of standalone functions.
    *   **Type Safety**: Full TypeScript coverage with generated GraphQL types for consistency.
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

## 11. Service Architecture Standards (NEW SECTION)

Project PipeCD implements a **standardized service architecture** that ensures consistency, maintainability, and reliability across all backend services. All major services follow these established patterns.

### 11.1 Service Object Pattern

**All services export a single object** with methods rather than individual functions:

```typescript
// ✅ CORRECT: Object-based service pattern
export const activityService = {
  async createActivity(userId: string, input: CreateActivityInput, accessToken: string): Promise<Activity> {
    // Implementation
  },
  async getActivities(userId: string, accessToken: string, filter?: ActivityFilter): Promise<Activity[]> {
    // Implementation  
  },
  async updateActivity(userId: string, id: string, input: UpdateActivityInput, accessToken: string): Promise<Activity> {
    // Implementation
  }
  // ... other methods
};

// ✅ CORRECT: Activity Reminders Service (NEW)
export const activityReminderService = {
  async getUserReminderPreferences(userId: string, accessToken: string): Promise<UserReminderPreferences> {
    // Implementation
  },
  async scheduleActivityReminder(activityId: string, userId: string, accessToken: string): Promise<ActivityReminder[]> {
    // Implementation
  },
  async createNotification(userId: string, title: string, message: string, type: NotificationType, accessToken: string): Promise<Notification> {
    // Implementation
  }
  // ... other methods
};

// ❌ INCORRECT: Individual function exports (legacy pattern)
export async function createActivity(...) { }
export async function getActivities(...) { }
```

### 11.2 Standardized Method Signatures

**All service methods follow consistent parameter patterns:**

1. **Required Parameters First**: `userId`, `accessToken` (required)
2. **Optional Parameters Last**: Optional filters, flags, etc.
3. **Consistent Naming**: CRUD operations follow `create`, `get`, `update`, `delete` patterns

```typescript
// Standard CRUD signatures across all services
async createEntity(userId: string, input: CreateInput, accessToken: string): Promise<Entity>
async getEntity(userId: string, id: string, accessToken: string): Promise<Entity | null>
async getEntities(userId: string, accessToken: string, filter?: Filter): Promise<Entity[]>
async updateEntity(userId: string, id: string, input: UpdateInput, accessToken: string): Promise<Entity>
async deleteEntity(userId: string, id: string, accessToken: string): Promise<boolean>

// Activity Reminders specific patterns
async getUserReminderPreferences(userId: string, accessToken: string): Promise<UserReminderPreferences>
async updateUserReminderPreferences(userId: string, preferences: Partial<UserReminderPreferences>, accessToken: string): Promise<UserReminderPreferences>
async scheduleActivityReminder(activityId: string, userId: string, accessToken: string): Promise<ActivityReminder[]>
async cancelActivityReminders(activityId: string, accessToken: string): Promise<boolean>
```

### 11.3 Authentication & Security Standards

**All services implement uniform authentication patterns:**

```typescript
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';

export const serviceExample = {
  async method(userId: string, accessToken: string): Promise<Result> {
    console.log('[serviceName.method] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', userId);
    
    handleSupabaseError(error, 'operation description');
    return data as Result;
  }
};
```

### 11.4 Error Handling Standards

**All services use consistent error handling:**

- **`handleSupabaseError`**: For database operation errors
- **`GraphQLError`**: For API-level errors with proper extensions
- **Logging**: Consistent logging format with service name and operation context

### 11.5 Current Service Compliance

| Service | Architecture Compliance | Pattern Used |
|---------|------------------------|--------------|
| **Activity Reminder Service** | 95% ✅ | Object-based, enterprise patterns, comprehensive coverage |
| **Activity Service** | 85% ✅ | Object-based, standardized auth, consistent CRUD |
| **Relationship Service** | 90% ✅ | Object-based, advanced features, comprehensive coverage |
| **Smart Stickers Service** | 95% ✅ | Object-based, optimized operations, full feature set |
| **Deal Service** | 85% ✅ | Directory structure, follows patterns |
| **Lead Service** | 90% ✅ | Directory structure, follows patterns |
| **Person Service** | 85% ✅ | Object-based, established patterns |
| **Organization Service** | 85% ✅ | Object-based, established patterns |

## 12. Key Development Learnings & Best Practices

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
        *   Verify that `netlify/functions/inngest.ts` conditionally sets `serveHost: 'http://localhost:8888'` (or your Netlify dev port) when in a local development environment. This forces the Inngest system to use HTTP for callbacks to your local functions.
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

## 18. AI Agent System (PRODUCTION-READY)

Project PipeCD features a **revolutionary Claude 4 Sonnet-powered AI Agent** that provides autonomous CRM management with 30+ integrated tools, custom fields management, and sequential workflow execution. This system is **production-ready and actively used**.

### 18.1 System Overview & Current Status

**✅ PRODUCTION STATUS: FULLY IMPLEMENTED**

## AI Agent Implementation Status

| Component | Status | Evidence |
|-----------|--------|----------|
| Core Agent Service | ✅ Production | 2000+ lines, full conversation management |
| Tool Registry | ✅ Production | 27 tools across 6 domains |
| Domain Modules | ✅ Production | All 6 domains operational |
| GraphQL Integration | ✅ Production | Full schema + resolvers |
| Frontend Chat | ✅ Production | Real-time conversation UI |
| Thought Tracking | ✅ Production | Live AI reasoning display |

The AI Agent system consists of several key components working together:

```
Frontend (React) - AI Chat Interface
    ↓
AgentService (lib/aiAgent/agentService.ts) - Core orchestration (2000+ lines)
    ↓
AIService (lib/aiAgent/aiService.ts) - Claude 4 Sonnet integration  
    ↓
Tool Discovery & Execution - 30+ operational tools
    ↓
GraphQL Gateway - Real-time data access
    ↓
Supabase Database - RLS enforcement & data persistence
```

**Key Achievements:**
- **30+ Active AI Tools** across deals, leads, contacts, organizations, activities, and workflows
- **Custom Fields Revolution** - Any user can create custom fields via AI conversation
- **Sequential Workflow Engine** - Claude 4 autonomously chains tools for complex operations
- **Full CRUD Operations** - AI can create, read, update, and delete all entity types
- **Real-time Thought Tracking** - Users see AI reasoning process in real-time
- **Production Authentication** - Secure JWT-based access with RLS enforcement

### 18.2 AI Agent Capabilities

#### 18.2.1 27 Integrated Tools (ALL OPERATIONAL)

**Deal Operations (6 tools):**
- `search_deals` - Advanced filtering by multiple criteria
- `get_deal_details` - Complete deal info with custom fields
- `create_deal` - Full deal creation with custom fields support
- `update_deal` - Deal modifications
- `delete_deal` - Deal removal
- `analyze_pipeline` - Pipeline performance analytics

**Lead Operations (6 tools) ⭐ NEW:**
- `search_leads` - Lead filtering by score, qualification status, source
- `get_lead_details` - Complete lead information with scoring factors
- `create_lead` - Lead creation with AI scoring
- `qualify_lead` - Mark leads as qualified with notes
- `convert_lead` - Convert leads to deals/contacts/organizations
- `update_lead_score` - Recalculate AI-powered lead scores

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

**Relationship Intelligence (5 tools):**
- `create_organization_relationship` - Create business relationships
- `create_person_relationship` - Map personal connections
- `create_stakeholder_analysis` - Analyze stakeholder networks
- `analyze_stakeholder_network` - Network visualization data
- `find_missing_stakeholders` - Identify relationship gaps

#### 18.2.2 Custom Fields Revolution ⭐ BREAKTHROUGH FEATURE

**Before AI Agent:**
- Only admins could create custom fields
- Manual field creation bottleneck
- Limited RFP processing capabilities

**After AI Agent:**
- **All users can create custom fields** via natural conversation
- **Automatic field creation** based on conversation content
- **Intelligent field type selection** (TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT)
- **RFP-driven workflow** for capturing unique requirements

**Example AI Workflow:**
```
User: "Create a deal for Microsoft partnership requiring SOC 2 compliance"

AI Execution:
1. search_organizations("Microsoft") → Gets organization_id
2. get_custom_field_definitions(entity_type: "DEAL") → Checks compliance fields
3. create_custom_field_definition() → Creates SOC 2 compliance field if missing
4. create_deal() → Creates deal with custom field values
5. Response: "Created deal with new compliance tracking field"
```

#### 18.2.3 Sequential Workflow Engine

**Claude 4 Autonomous Processing:**
- **One tool per response** for dependent workflows
- **Multiple tools per response** for independent operations
- **Zero hardcoded workflows** - Claude 4 decides sequence based on context
- **Complete error handling** and recovery
- **Real-time thought transparency** for user understanding

### 18.3 Technical Implementation

**Key Files:**
- `lib/aiAgent/agentService.ts` - Main service class (2000+ lines)
- `lib/aiAgent/aiService.ts` - Claude 4 Sonnet integration
- `lib/aiAgent/types.ts` - TypeScript definitions
- `frontend/src/components/agent/` - React UI components
- `frontend/src/hooks/useAgent.ts` - React hooks

**Architecture Highlights:**
- **Tool Discovery System** - Dynamic tool registration and schema generation
- **GraphQL Integration** - Direct access to all CRM data with RLS enforcement
- **Conversation Management** - Persistent conversation history and context
- **Thought Tracking** - Real-time AI reasoning display
- **Error Handling** - Comprehensive error recovery and user feedback

### 18.4 Frontend Integration (PRODUCTION-READY)

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

**Features:**
- Real-time conversation display
- Thought process visualization
- Message input with file upload support
- Loading states and error handling
- Conversation persistence

### 18.5 Security & Authentication

**Security Model:**
- **JWT-based authentication** via Supabase
- **Row Level Security** enforcement on all operations
- **User context propagation** throughout tool execution
- **Permission-based access** - AI respects user permissions
- **No elevated privileges** - operates within user's access rights

### 18.6 Performance & Optimization

**Current Performance:**
- **Average Response Time**: ~2-3 seconds for single tool operations
- **Complex Workflow Time**: ~5-10 seconds for multi-tool sequences
- **Tool Execution**: Optimized GraphQL queries with field selection
- **Caching Strategy**: Conversation context and tool result caching

## Known Technical Debt & Limitations

### Current Limitations
- **AI Response Times**: Can be slow during high Claude API usage periods
- **Error Recovery**: Some edge cases in multi-tool sequences need improvement
- **Mobile Optimization**: AI chat interface not fully optimized for mobile
- **Offline Support**: No offline functionality for AI agent

### Testing Status
- **Unit Tests**: ✅ Core AI service layer covered
- **Integration Tests**: ⚠️ Limited coverage of multi-tool workflows
- **E2E Tests**: ⚠️ Basic AI chat testing implemented
- **Performance Tests**: ❌ Load testing of AI agent pending

### Security Considerations
- **API Key Management**: Claude API keys properly secured in environment
- **Rate Limiting**: Basic rate limiting implemented, needs enhancement
- **User Context**: All AI operations respect user permissions via RLS
- **Data Privacy**: AI conversations stored with proper user isolation

## 19. Leads Management System (PRODUCTION-READY)

Project PipeCD implements a **comprehensive Leads Management system** that seamlessly integrates with the existing WFM infrastructure, AI Agent tools, and custom fields democratization. The system provides complete lead qualification and conversion workflows.

### 19.1 System Overview & Current Status

**✅ PRODUCTION STATUS: FULLY IMPLEMENTED**

The Leads Management system follows the exact same architectural patterns as the Deals system, ensuring consistency and leveraging proven infrastructure:

**Core Components:**
- **Database Schema**: `leads` table with comprehensive lead tracking
- **WFM Integration**: Lead qualification workflows via WFM system
- **Service Layer**: `lib/leadService/` with full CRUD and business logic
- **GraphQL API**: Complete schema and resolvers for lead operations
- **Frontend Components**: Table and Kanban views with drag-and-drop progression
- **AI Agent Integration**: 6 specialized lead management tools
- **Custom Fields**: Full support for dynamic lead data capture

### 19.2 Database Implementation

#### 19.2.1 Leads Table Schema

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
  ai_insights JSONB DEFAULT '{}',
  
  -- Audit Fields
  created_by_user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 19.2.2 WFM Integration for Leads

**Lead Qualification Workflow Steps:**
1. **New Lead** - Initial lead capture (initial step)
2. **Initial Contact** - First contact attempt
3. **Follow Up** - Ongoing communication
4. **Qualifying** - Active qualification process
5. **Qualified Lead** - Ready for conversion
6. **Converted** - Successfully converted to deal/contact (final step)
7. **Disqualified** - Not a viable lead (final step)
8. **Nurturing** - Long-term relationship building

### 19.3 Service Layer Implementation

#### 19.3.1 Lead Service Architecture

Following the exact pattern as `dealService`:

```typescript
// lib/leadService/leadCrud.ts
export class LeadService {
  // Core CRUD Operations
  async createLead(input: LeadInput, context: LeadServiceContext): Promise<Lead>
  async getLeadById(id: string, context: LeadServiceContext): Promise<Lead | null>
  async updateLead(id: string, input: LeadUpdateInput, context: LeadServiceContext): Promise<Lead>
  async deleteLead(id: string, context: LeadServiceContext): Promise<boolean>
  
  // Lead-Specific Operations
  async recalculateLeadScore(id: string, context: LeadServiceContext): Promise<Lead>
  async qualifyLead(id: string, qualificationData: LeadQualificationInput, context: LeadServiceContext): Promise<Lead>
  async convertLead(id: string, conversionInput: LeadConversionInput, context: LeadServiceContext): Promise<ConversionResult>
  
  // WFM Integration
  async updateLeadWFMProgress(leadId: string, targetStepId: string, context: LeadServiceContext): Promise<Lead>
  
  // AI Integration
  async getAILeadInsights(leadId: string, context: LeadServiceContext): Promise<AILeadInsights>
  async triggerAILeadScoring(leadId: string, context: LeadServiceContext): Promise<Lead>
}
```

#### 19.3.2 Lead Scoring Engine

Advanced AI-powered scoring system:

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
```

### 19.4 Frontend Implementation

#### 19.4.1 Component Architecture

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

#### 19.4.2 State Management

Enhanced Zustand store following deals patterns:

```typescript
// frontend/src/stores/useLeadsStore.ts
interface LeadsState {
  // Core Data
  leads: Lead[];
  currentLead: Lead | null;
  
  // Loading States
  leadsLoading: boolean;
  
  // View Management
  viewMode: 'table' | 'kanban';
  
  // Filtering & Search
  filters: LeadFilters;
  searchTerm: string;
  
  // AI Integration
  aiInsights: Record<string, AILeadInsights>;
  scoringInProgress: Record<string, boolean>;
  
  // Actions
  fetchLeads: (filters?: LeadFilters) => Promise<void>;
  createLead: (input: LeadInput) => Promise<Lead>;
  updateLead: (id: string, input: LeadUpdateInput) => Promise<Lead>;
  qualifyLead: (id: string, data: QualificationInput) => Promise<Lead>;
  convertLead: (id: string, conversion: ConversionInput) => Promise<ConversionResult>;
  updateWFMProgress: (id: string, stepId: string) => Promise<Lead>;
}
```

### 19.5 AI Agent Integration

#### 19.5.1 Lead-Specific AI Tools (6 TOOLS)

**1. search_leads** - Intelligent lead filtering and discovery
**2. get_lead_details** - Comprehensive lead analysis with full context  
**3. create_lead** - Natural language lead creation with scoring
**4. qualify_lead** - Mark leads as qualified with AI-generated notes
**5. convert_lead** - Convert leads to deals/contacts/organizations
**6. update_lead_score** - Recalculate AI-powered lead scores

#### 19.5.2 AI Lead Qualification Engine

```typescript
export class AILeadQualificationEngine {
  async analyzeLeadConversation(conversation: string, leadData: Lead): Promise<QualificationInsights> {
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

### 19.6 Lead Conversion Workflows

#### 19.6.1 Comprehensive Conversion System

```typescript
export interface LeadConversionInput {
  target_type: 'DEAL' | 'PERSON' | 'ORGANIZATION' | 'ALL';
  deal_data?: DealInput;
  person_data?: PersonInput;
  organization_data?: OrganizationInput;
  preserve_activities: boolean;
  create_conversion_activity: boolean;
}
```

**Conversion Process:**
1. **Entity Creation** - Create target entities (deal, person, organization)
2. **Data Transfer** - Map lead data to appropriate entity fields
3. **Custom Fields Transfer** - Preserve custom field values
4. **Activity Transfer** - Move or copy associated activities
5. **Status Update** - Mark lead as converted with references
6. **Audit Trail** - Create conversion activity for tracking

### 19.7 Performance & Security

#### 19.7.1 Database Optimization

```sql
-- Core performance indexes
CREATE INDEX CONCURRENTLY idx_leads_user_id ON leads(user_id);
CREATE INDEX CONCURRENTLY idx_leads_assigned_to_user_id ON leads(assigned_to_user_id);
CREATE INDEX CONCURRENTLY idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX CONCURRENTLY idx_leads_is_qualified ON leads(is_qualified);
CREATE INDEX CONCURRENTLY idx_leads_source ON leads(source);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_leads_user_qualified ON leads(user_id, is_qualified, lead_score DESC);
CREATE INDEX CONCURRENTLY idx_leads_source_score ON leads(source, lead_score DESC) WHERE is_qualified = true;

-- JSONB indexes for custom fields
CREATE INDEX CONCURRENTLY idx_leads_custom_fields_gin ON leads USING GIN (custom_field_values);
```

#### 19.7.2 Security Implementation

**Authentication & Authorization:**
- JWT-based authentication via Supabase
- Row-level security (RLS) enforcement
- Permission-based access control
- User context propagation throughout the system

**RLS Policies:**
```sql
-- Users can view leads they own or are assigned to
CREATE POLICY "Users can view leads they own or are assigned to" ON leads
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to_user_id OR
    public.check_permission(auth.uid(), 'lead', 'read_any')
  );
```

### 19.8 Development Patterns

#### 19.8.1 Following Established Patterns

The leads implementation strictly follows patterns established by the deals system:

## Leads Management Implementation Status

| Component | Status | Evidence |
|-----------|--------|----------|
| Database Schema | ✅ Production | Complete `leads` table with WFM integration |
| Service Layer | ✅ Production | Full CRUD + scoring + conversion logic |
| GraphQL API | ✅ Production | Complete schema with 6 AI tool integrations |
| Frontend Components | ✅ Production | Table & Kanban views with drag-and-drop |
| AI Integration | ✅ Production | 6 specialized tools for lead management |
| WFM Integration | ✅ Production | Qualification workflows via WFM system |
| Conversion Engine | ✅ Production | Lead → Deal/Contact/Organization conversion |

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

This ensures:
- **Reduced Development Time** - Proven patterns accelerate implementation
- **Code Consistency** - Unified codebase with predictable structure
- **Easier Maintenance** - Similar patterns across all entity types
- **Knowledge Transfer** - Developers familiar with deals can easily work with leads

## 20. Smart Stickers Visual Collaboration System (PRODUCTION-READY)

Project PipeCD implements a **revolutionary Smart Stickers system** that transforms traditional CRM entity pages into visual collaboration workspaces. The system provides drag-and-drop sticky note functionality with professional table views, advanced filtering, and seamless integration into deal, person, and organization detail pages.

### 20.1 System Overview & Current Status

**✅ PRODUCTION STATUS: FULLY IMPLEMENTED**

## Smart Stickers Implementation Status

| Component | Status | Evidence |
|-----------|--------|----------|
| Database Schema | ✅ Production | Complete tables with RLS policies |
| GraphQL API | ✅ Production | 5 queries, 7 mutations implemented |
| React Components | ✅ Production | 866-line StickerBoard with full functionality |
| Drag & Drop | ✅ Production | React-rnd integration with constraints |
| Position Persistence | ✅ Production | Debounced updates with optimistic UI |
| Filtering System | ✅ Production | Multi-criteria with collapsible sections |
| Entity Integration | ✅ Production | Embedded in all entity detail pages |

Smart Stickers represents a breakthrough in CRM user experience, moving beyond static notes to dynamic, visual collaboration:

**Core Components:**
- **Visual Canvas Interface**: React-based drag-and-drop sticky note system
- **Professional Table View**: Enterprise data table matching people/deals table standards  
- **Advanced Filtering System**: Multi-criteria filtering with collapsible sections
- **Category Management**: 8 predefined categories plus custom category support
- **Entity Integration**: Native embedding in all entity detail pages
- **Real-time Persistence**: Optimistic updates with debounced database synchronization

### 20.2 Database Implementation

#### 20.2.1 Smart Stickers Schema

```sql
-- Core stickers table
CREATE TABLE public.smart_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity Attachment (Polymorphic)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('DEAL', 'PERSON', 'ORGANIZATION')),
  entity_id UUID NOT NULL,
  
  -- Content & Metadata
  title TEXT NOT NULL,
  content TEXT,
  color TEXT NOT NULL DEFAULT '#FFE066',
  
  -- Visual Positioning
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 200,
  height INTEGER NOT NULL DEFAULT 150,
  
  -- Organization & Categorization
  category_id UUID REFERENCES sticker_categories(id) ON DELETE SET NULL,
  priority INTEGER NOT NULL DEFAULT 0, -- 0=NORMAL, 1=HIGH, 2=URGENT
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Collaboration Features
  tags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  
  -- Ownership & Security
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  last_edited_by_user_id UUID REFERENCES auth.users(id),
  last_edited_at TIMESTAMPTZ,
  
  -- Audit Fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories system
CREATE TABLE public.sticker_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  icon TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 20.2.2 Performance Optimization

```sql
-- Critical indexes for performance
CREATE INDEX CONCURRENTLY idx_smart_stickers_entity ON smart_stickers(entity_type, entity_id);
CREATE INDEX CONCURRENTLY idx_smart_stickers_user ON smart_stickers(created_by_user_id);
CREATE INDEX CONCURRENTLY idx_smart_stickers_category ON smart_stickers(category_id);
CREATE INDEX CONCURRENTLY idx_smart_stickers_priority ON smart_stickers(priority DESC);
CREATE INDEX CONCURRENTLY idx_smart_stickers_pinned ON smart_stickers(is_pinned) WHERE is_pinned = true;

-- Composite indexes for common queries  
CREATE INDEX CONCURRENTLY idx_smart_stickers_entity_user ON smart_stickers(entity_type, entity_id, created_by_user_id);
CREATE INDEX CONCURRENTLY idx_smart_stickers_position ON smart_stickers(entity_type, entity_id, position_x, position_y);
```

### 20.3 Frontend Architecture & Implementation

#### 20.3.1 Component Architecture

```typescript
// Smart Stickers component hierarchy
frontend/src/components/common/
├── StickerBoard.tsx              // Main orchestration component (600+ lines)
│   ├── ViewMode: 'board' | 'list' // Dual-interface switching
│   ├── StickerLayout: Map<string, Layout> // Position management
│   ├── useDebounce: Hook        // Optimistic updates
│   └── EmptySpace: Algorithm    // Intelligent positioning
├── SmartSticker.tsx              // Individual sticker rendering
│   ├── DragHandle: Component    // Drag-and-drop interface
│   ├── ResizeHandle: Component  // Resize functionality
│   ├── ContentEditor: Component // In-place editing
│   └── ActionMenu: Component    // Context actions
├── StickerCreateModal.tsx        // Professional creation interface
│   ├── CategorySelector: Component // Real category integration
│   ├── PrioritySelector: Component // Priority management
│   ├── TagsInput: Component     // Tag management
│   └── FormValidation: Zod      // Input validation
├── StickerFilters.tsx            // Advanced filtering system (530+ lines)
│   ├── CollapsibleSections: Component // Category/Status/Priority sections
│   ├── ActiveFilterBadges: Component  // Filter visualization
│   ├── FilterCounts: Component  // Active filter indicators
│   └── ClearAllFilters: Component // Filter management
└── SortableTable.tsx             // Enterprise table integration
    ├── ColumnDefinitions: Array // Professional table structure
    ├── SortingLogic: Multi      // Multi-column sorting
    ├── ActionToolbar: Component // Inline actions
    └── ResponsiveDesign: Chakra // Mobile-first design
```

#### 20.3.2 Entity Integration Pattern

```typescript
// Integration into entity detail pages
// Pattern: Add Smart Stickers as tab (deals) or section (people/organizations)

// Deal Detail Page (Tab Integration)
<TabList>
  <Tab>Overview</Tab>
  <Tab>Activities</Tab>
  <Tab>Smart Stickers</Tab> {/* NEW TAB */}
</TabList>
<TabPanels>
  <TabPanel>{/* Overview content */}</TabPanel>
  <TabPanel>{/* Activities content */}</TabPanel>
  <TabPanel>
    <StickerBoard 
      entityType="DEAL" 
      entityId={currentDeal.id}
      categories={categories}
    />
  </TabPanel>
</TabPanels>

// Person/Organization Detail Page (Section Integration)
<VStack spacing={6}>
  {/* Existing entity information */}
  
  {/* Smart Stickers Section */}
  <Box w="full" bg={colors.bg.elevated} borderRadius="xl" p={6}>
    <Heading size="md" mb={4}>📝 Smart Stickers</Heading>
    <StickerBoard 
      entityType="PERSON" 
      entityId={currentPerson.id}
      categories={categories}
    />
  </Box>
</VStack>
```

### 20.4 Backend Implementation

#### 20.4.1 GraphQL Schema & Operations

```graphql
# Smart Stickers GraphQL schema
type SmartSticker {
  id: ID!
  entityType: EntityType!
  entityId: ID!
  title: String!
  content: String
  category: StickerCategory
  positionX: Int!
  positionY: Int!
  width: Int!
  height: Int!
  color: String!
  priority: StickerPriority!
  isPinned: Boolean!
  isPrivate: Boolean!
  tags: [String!]!
  mentions: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  createdByUserId: ID!
  lastEditedByUserId: ID
  lastEditedAt: DateTime
}

type StickerCategory {
  id: ID!
  name: String!
  color: String!
  icon: String
  isSystem: Boolean!
  displayOrder: Int!
}

enum EntityType {
  DEAL
  PERSON  
  ORGANIZATION
}

enum StickerPriority {
  NORMAL
  HIGH
  URGENT
}

# Query operations
type Query {
  smartStickers(
    entityType: EntityType!
    entityId: ID!
    filters: StickerFiltersInput
  ): [SmartSticker!]!
  
  stickerCategories: [StickerCategory!]!
}

# Mutation operations
type Mutation {
  createSticker(input: CreateStickerInput!): SmartSticker!
  updateSticker(id: ID!, input: UpdateStickerInput!): SmartSticker!
  deleteSticker(id: ID!): Boolean!
  toggleStickerPin(id: ID!): SmartSticker!
  bulkUpdateStickerPositions(updates: [StickerPositionUpdate!]!): [SmartSticker!]!
}
```

#### 20.4.2 Service Layer Implementation

```typescript
// Service layer following established patterns
// lib/smartStickersService.ts

export interface SmartStickersService {
  // Core CRUD operations
  getStickers(entityType: EntityType, entityId: string, filters?: StickerFilters): Promise<SmartSticker[]>
  createSticker(input: CreateStickerInput, context: ServiceContext): Promise<SmartSticker>
  updateSticker(id: string, input: UpdateStickerInput, context: ServiceContext): Promise<SmartSticker>
  deleteSticker(id: string, context: ServiceContext): Promise<boolean>
  
  // Position management
  updateStickerPosition(id: string, position: Position, context: ServiceContext): Promise<SmartSticker>
  bulkUpdatePositions(updates: PositionUpdate[], context: ServiceContext): Promise<SmartSticker[]>
  
  // Organization features
  togglePin(id: string, context: ServiceContext): Promise<SmartSticker>
  categorizeSticker(id: string, categoryId: string, context: ServiceContext): Promise<SmartSticker>
  
  // Category management
  getCategories(): Promise<StickerCategory[]>
  createCategory(input: CreateCategoryInput, context: ServiceContext): Promise<StickerCategory>
}
```

### 20.5 Advanced Features & Technical Implementation

#### 20.5.1 Optimistic Updates with Debouncing

```typescript
// Optimistic update system for smooth UX
const useOptimisticStickers = () => {
  const [localPositions, setLocalPositions] = useState<Map<string, Position>>();
  
  // Immediate UI update
  const updatePositionOptimistically = (stickerId: string, position: Position) => {
    setLocalPositions(prev => new Map(prev).set(stickerId, position));
  };
  
  // Debounced server persistence
  const debouncedServerUpdate = useDebounce(
    async (stickerId: string, position: Position) => {
      await updateSticker({ id: stickerId, positionX: position.x, positionY: position.y });
    }, 
    500 // 500ms delay
  );
  
  const handleStickerMove = (stickerId: string, position: Position) => {
    updatePositionOptimistically(stickerId, position);  // Immediate
    debouncedServerUpdate(stickerId, position);         // Delayed persistence
  };
};
```

#### 20.5.2 Intelligent Empty Space Algorithm

```typescript
// Smart positioning algorithm for new stickers
const findEmptySpace = useCallback((
  existingStickers: SmartSticker[], 
  boardSize: { width: number; height: number }
): Position => {
  const occupiedAreas = existingStickers.map(sticker => ({
    x: sticker.positionX,
    y: sticker.positionY,
    width: sticker.width,
    height: sticker.height,
  }));

  const defaultWidth = 200;
  const defaultHeight = 150;
  const margin = 20;

  // Grid-based collision detection
  for (let y = margin; y < boardSize.height - defaultHeight; y += defaultHeight + margin) {
    for (let x = margin; x < boardSize.width - defaultWidth; x += defaultWidth + margin) {
      const overlaps = occupiedAreas.some(area => 
        x < area.x + area.width + margin &&
        x + defaultWidth + margin > area.x &&
        y < area.y + area.height + margin &&
        y + defaultHeight + margin > area.y
      );
      
      if (!overlaps) {
        return { x, y };
      }
    }
  }

  return { x: margin, y: margin }; // Fallback to origin
}, []);
```

#### 20.5.3 Professional Table View Integration

```typescript
// Enterprise table columns definition
const stickerTableColumns = useMemo((): ColumnDefinition<StickerData>[] => [
  {
    key: 'title',
    header: 'Title',
    renderCell: (sticker) => (
      <VStack align="start" spacing={1}>
        <Text fontWeight="medium" color={colors.text.primary} noOfLines={1}>
          {sticker.title}
        </Text>
        {sticker.content && (
          <Text fontSize="xs" color={colors.text.muted} noOfLines={2}>
            {sticker.content}
          </Text>
        )}
      </VStack>
    ),
    isSortable: true,
    sortAccessor: (sticker) => sticker.title.toLowerCase(),
  },
  {
    key: 'category',
    header: 'Category',
    renderCell: (sticker) => (
      <Badge variant="subtle" colorScheme={sticker.category?.color}>
        <HStack spacing={1}>
          {sticker.category?.icon && <Icon as={categoryIcons[sticker.category.icon]} />}
          <Text>{sticker.category?.name || '-'}</Text>
        </HStack>
      </Badge>
    ),
    isSortable: true,
  },
  // ... additional columns for priority, status, tags, creation date, actions
], [colors]);
```

### 20.6 Security & Performance

#### 20.6.1 Row Level Security (RLS)

```sql
-- Smart Stickers RLS policies
-- Users can only see stickers for entities they have access to
CREATE POLICY "smart_stickers_entity_access" ON smart_stickers
  FOR ALL USING (
    (entity_type = 'DEAL' AND entity_id IN (
      SELECT id FROM deals WHERE user_id = auth.uid()
    )) OR
    (entity_type = 'PERSON' AND entity_id IN (
      SELECT id FROM people WHERE user_id = auth.uid()
    )) OR
    (entity_type = 'ORGANIZATION' AND entity_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    ))
  );

-- Users can only create stickers for their own entities
CREATE POLICY "smart_stickers_create_own" ON smart_stickers
  FOR INSERT WITH CHECK (
    created_by_user_id = auth.uid() AND
    -- Validate entity ownership (same logic as SELECT policy)
  );
```

#### 20.6.2 Performance Optimization Strategies

```typescript
// Query optimization patterns
const useSmartStickers = (entityType: EntityType, entityId: string) => {
  // Efficient GraphQL query with field selection
  const STICKERS_QUERY = gql`
    query GetSmartStickers($entityType: EntityType!, $entityId: ID!) {
      smartStickers(entityType: $entityType, entityId: $entityId) {
        id
        title
        content
        positionX
        positionY
        width
        height
        color
        priority
        isPinned
        isPrivate
        tags
        category {
          id
          name
          color
          icon
        }
        createdAt
      }
    }
  `;
  
  // React Query for caching and background updates
  return useQuery({
    queryKey: ['stickers', entityType, entityId],
    queryFn: () => graphqlClient.request(STICKERS_QUERY, { entityType, entityId }),
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  });
};
```

### 20.7 Development Best Practices

#### 20.7.1 Component Design Patterns

```typescript
// Reusable hook pattern for sticker management
export const useSmartStickers = (entityType: EntityType, entityId: string) => {
  const [stickers, setStickers] = useState<SmartSticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD operations
  const createSticker = useCallback(async (input: CreateStickerInput) => {
    // Optimistic update + server persistence
  }, []);

  const updateSticker = useCallback(async (id: string, input: UpdateStickerInput) => {
    // Optimistic update + server persistence
  }, []);

  return {
    stickers,
    loading,
    error,
    createSticker,
    updateSticker,
    deleteSticker,
    togglePin,
    // ... other operations
  };
};
```

#### 20.7.2 Testing Strategy

```typescript
// Component testing patterns
describe('StickerBoard', () => {
  it('should render stickers in board view', () => {
    render(
      <StickerBoard 
        entityType="DEAL" 
        entityId="test-deal-id"
        categories={mockCategories}
      />
    );
    
    expect(screen.getByText('Smart Stickers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add sticker/i })).toBeInTheDocument();
  });

  it('should switch between board and table views', () => {
    const { user } = render(<StickerBoard {...props} />);
    
    const tableViewButton = screen.getByLabelText('List view');
    user.click(tableViewButton);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
```

### 20.8 Future Enhancements

#### 20.8.1 Planned Features
- **Real-time Collaboration**: Multi-user editing with conflict resolution
- **Sticker Templates**: Pre-defined templates for common use cases
- **Workflow Integration**: Sticker-driven task creation and assignment
- **AI Integration**: Smart categorization and content suggestions
- **Mobile Optimization**: Touch-friendly drag-and-drop interface

#### 20.8.2 Scalability Considerations
- **Database Partitioning**: Partition stickers by entity_type for large datasets
- **CDN Integration**: Store sticker images and attachments in CDN
- **Real-time Sync**: WebSocket integration for live collaboration
- **Caching Strategy**: Redis caching for frequently accessed sticker data

---

## 21. Document Attachment to Notes System (PRODUCTION-READY)

Project PipeCD implements a **comprehensive Document Attachment to Notes system** that seamlessly integrates Google Drive document management with note-taking functionality. The system provides full Google Drive browser integration with dual attachment capabilities, ensuring documents are attached to both notes and parent deals for unified document management.

### 21.1 System Overview & Current Status

**✅ PRODUCTION STATUS: FULLY IMPLEMENTED**

## Document Attachment Implementation Status

| Component | Status | Evidence |
|-----------|--------|----------|
| Database Schema | ✅ Production | Complete `note_document_attachments` table with RLS policies |
| GraphQL API | ✅ Production | 3 operations: attach, remove, query attachments |
| Google Drive Browser | ✅ Production | Full 3-tab interface with search and navigation |
| Dual Attachment System | ✅ Production | Atomic operations for note and deal attachment |
| Custom React Hook | ✅ Production | Apollo Client integration for real-time data |
| UI Integration | ✅ Production | Enhanced notes with attachment display |
| Security Model | ✅ Production | Enterprise-grade RLS with permission inheritance |

Document Attachment represents a breakthrough in CRM document management, providing native Google Drive integration within note-taking workflows:

**Core Components:**
- **Full Google Drive Browser**: Complete 3-tab interface (Browse, Search, Recent Files)
- **Dual Attachment System**: Atomic operations ensuring documents attach to both note and deal
- **Advanced Search**: Real-time search across Google Drive with result highlighting
- **Folder Navigation**: Complete folder browsing with breadcrumb navigation
- **Custom Hook Integration**: Apollo Client-based real-time attachment data fetching
- **Enterprise Security**: RLS policies with proper permission inheritance

### 21.2 Database Implementation

#### 21.2.1 Document Attachment Schema

```sql
-- Note document attachments with dual linking
CREATE TABLE note_document_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sticker_id UUID NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  google_file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  shared_drive_id TEXT,
  category TEXT CHECK (category IN ('PROPOSAL', 'CONTRACT', 'PRESENTATION', 'CLIENT_REQUEST', 'CLIENT_DOCUMENT', 'CORRESPONDENCE', 'OTHER')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  mime_type TEXT,
  file_size BIGINT,
  UNIQUE(sticker_id, google_file_id)
);

-- Performance indexes
CREATE INDEX CONCURRENTLY idx_note_attachments_sticker_id ON note_document_attachments(sticker_id);
CREATE INDEX CONCURRENTLY idx_note_attachments_deal_id ON note_document_attachments(deal_id);
CREATE INDEX CONCURRENTLY idx_note_attachments_category ON note_document_attachments(category);
```

#### 21.2.2 Security Implementation

```sql
-- Row Level Security for note attachments
CREATE POLICY "note_attachments_user_access" ON note_document_attachments
  FOR ALL USING (
    sticker_id IN (
      SELECT id FROM stickers 
      WHERE user_id = auth.uid() 
      OR entity_id IN (
        SELECT id FROM deals 
        WHERE user_id = auth.uid() 
        OR assigned_user_id = auth.uid()
      )
    )
  );

-- System can create attachments for users
CREATE POLICY "system_create_note_attachments" ON note_document_attachments
  FOR INSERT WITH CHECK (true);
```

### 21.3 Frontend Architecture & Implementation

#### 21.3.1 Component Architecture

```typescript
// Document Attachment component hierarchy
frontend/src/components/common/
├── DocumentAttachmentModal.tsx   // Main Google Drive browser (400+ lines)
│   ├── SharedDriveSelector: Component // Multi-drive support
│   ├── TabInterface: 3-tabs     // Browse, Search, Recent Files
│   ├── FolderNavigation: Component // Breadcrumb navigation
│   ├── FileSearch: Component    // Real-time search functionality
│   ├── FileCards: Component     // Interactive file selection
│   └── AttachmentLogic: Service // Dual attachment operations
├── EnhancedSimpleNotes.tsx       // Enhanced notes with attachments
│   ├── AttachmentDisplay: Component // Visual attachment indicators
## 22. Leads Management System (PRODUCTION-READY)