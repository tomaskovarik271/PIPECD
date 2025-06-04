# Custom CRM System (Project PipeCD)

This repository contains the source code for the custom CRM system designed to replace Pipedrive, built following the architectural decisions outlined in `ADR.md`.

## 📚 Documentation Overview

PipeCD now features comprehensive documentation for the **AI Agent System** - a revolutionary Claude 4 Sonnet-powered assistant with 30+ integrated tools and custom fields management:

### 🤖 AI Agent Documentation
- **[📖 Complete Documentation](PIPECD_AI_AGENT_DOCUMENTATION.md)** - Full system overview, capabilities, custom fields revolution, setup guide, and usage examples
- **[🚀 Quick Start Guide](AI_AGENT_QUICK_START.md)** - Get up and running with the AI agent in 10 minutes
- **[📡 API Reference](AI_AGENT_API_REFERENCE.md)** - Comprehensive technical reference for all AI agent interfaces
- **[🏗️ Architecture Principles](AI_AGENT_ARCHITECTURE_PRINCIPLES.md)** - **CRITICAL FOR DEVELOPERS**: Core architectural principles for building AI tools

### 🔧 System Architecture
- **[🏗️ System Architecture](PIPECD_SYSTEM_ARCHITECTURE.md)** - **COMPREHENSIVE**: Complete architectural reference for the entire PipeCD platform
- **[📋 Developer Guide V2](DEVELOPER_GUIDE_V2.md)** - Complete technical guide and architecture overview
- **[🏗️ AI Architecture](PIPECD_AI_ARCHITECTURE.md)** - AI system architecture deep dive
- **[⚙️ AI Integration Setup](AI_INTEGRATION_SETUP.md)** - AI integration configuration guide

### 📝 Legacy Documentation
- **[📋 AI Implementation Plan](AI_AGENT_IMPLEMENTATION_PLAN.md)** - Original implementation roadmap (historical reference)

## Overview

The system utilizes a serverless architecture based on:

*   **Frontend:** React (Vite) SPA hosted on Netlify
*   **Frontend State:** Zustand (`frontend/src/stores/useAppStore.ts`)
*   **Frontend API Client:** `graphql-request` (`frontend/src/lib/graphqlClient.ts`)
*   **Frontend GraphQL Types:** GraphQL Code Generator (`frontend/codegen.ts`, see `DEVELOPER_GUIDE_V2.md`)
*   **UI Library:** Chakra UI
*   **API:** GraphQL Gateway (**GraphQL Yoga**) running as a Netlify Function (`netlify/functions/graphql.ts`); Schema defined in `.graphql` files within `netlify/functions/graphql/schema/`.
*   **Backend Logic:** TypeScript modules in `/lib` (e.g., `personService.ts`, `dealService.ts`), WFM services (e.g., `wfmWorkflowService.ts`, `wfmProjectService.ts`), utilities in `lib/serviceUtils.ts`.
*   **Work Flow Management (WFM):** A flexible system for managing multi-step processes, currently used for Sales Deals (see `DEVELOPER_GUIDE_V2.md` Section 6 and `ADR-006`). Replaces the legacy Pipeline/Stage system.
*   **Database:** Supabase (PostgreSQL) with RLS
*   **Authentication:** Supabase Auth (Email/Password, GitHub configured)
*   **User Profile Management:** Users can manage their display name and avatar URL, stored in a dedicated `user_profiles` table with RLS. Profile information is integrated into features like Deal History.
*   **Async Tasks:** Inngest (`netlify/functions/inngest.ts`)
*   **Testing:** Vitest (Unit/Integration), Playwright (E2E)
*   **Hosting/Deployment:** Netlify (`netlify.toml`)

**Current Status (As of WFM Implementation for Sales Deals & First Automation):**

*   Core infrastructure is set up (Supabase, Netlify, Inngest).
*   Authentication (Email/Password, GitHub) is working, managed via Zustand store.
*   Full CRUD implemented for **People**, **Organizations**, **Leads**.
*   **Leads Management System fully implemented:**
    *   Complete lead qualification workflows via WFM system
    *   Lead scoring engine with AI-powered intelligence
    *   Lead conversion workflows (Lead → Deal/Person/Organization)
    *   AI Agent integration with 6 specialized lead management tools
    *   Custom fields democratization for dynamic lead data capture
    *   Kanban and table views with drag-and-drop progression
    *   Advanced lead analytics and reporting capabilities
*   **Activities** now support assignments (`assigned_to_user_id`) and system flags (`is_system_activity`), effectively functioning as assignable tasks. CRUD and RLS policies updated accordingly. Backend services, GraphQL API, and Frontend support these enhancements.
*   **Work Flow Management (WFM) System implemented:**
    *   Core WFM entities (`WFMStatus`, `WFMWorkflow`, `WFMWorkflowStep`, `WFMProjectType`, `WFMProject`, `WFMWorkflowTransition`) and services are in place.
    *   **Sales Deals and Leads are now managed by the WFM system:**
        *   Legacy **Pipeline** and **Stage** systems have been deprecated and removed.
        *   Deals and Leads are associated with `WFMProject`s.
        *   Kanban board (`DealsKanbanView`, `LeadsKanbanView`) is driven by WFM workflow steps.
        *   Deal and Lead creation and progression use WFM logic (`updateDealWFMProgress`, `updateLeadWFMProgress` mutations).
        *   Deal and Lead history logs WFM status changes.
        *   `WFM_Sales_Kanban_User_Manual.md` created.
*   **User Profile Management** implemented:
    *   Users can view and edit their `display_name` and `avatar_url`.
    *   Profile data is stored in `user_profiles` table in Supabase.
    *   GraphQL `Query.me` and `Mutation.updateUserProfile` handle profile data.
    *   Deal and Lead history now displays the `display_name` of the user who performed the action.
*   **Inngest event-driven automation (ADR-008 Phase 1 Started):**
    *   `crm/deal.assigned` and `crm/lead.assigned` events published from respective services.
    *   `createDealAssignmentTask` and `createLeadAssignmentTask` Inngest functions implemented to create "Welcome & Review" system tasks (Activity) for assignees.
    *   `SYSTEM_USER_ID` established and used for attributing automated actions.
*   **AI Agent System (Revolutionary Implementation):**
    *   Claude 4 Sonnet-powered AI Agent with 30+ integrated tools
    *   Lead management tools: search, create, qualify, convert, score
    *   Custom fields democratization - all users can create custom fields
    *   Sequential workflow execution for complex multi-step operations
    *   Real-time thought tracking and intelligent recommendations
*   Basic UI (Chakra UI) implemented for Auth and all core CRUD entities, including WFM-driven Deal and Lead Kanban views and display of assigned system tasks.
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

# PipeCD - Advanced CRM System

PipeCD is a modern, full-stack Customer Relationship Management (CRM) system built with cutting-edge technologies. It features a React frontend, GraphQL API, PostgreSQL database with Supabase, and revolutionary AI integration through Model Context Protocol (MCP).

## ✨ Key Features

### 🎯 Core CRM Functionality
- **Deal Management**: Complete sales pipeline with customizable stages
- **Leads Management**: Comprehensive lead qualification and conversion workflows with AI-powered scoring
- **Contact & Organization Management**: Comprehensive relationship tracking
- **Activity Tracking**: Tasks, calls, meetings, and follow-ups
- **Custom Fields**: Flexible data capture for any business need
- **User Profiles**: Team management and permissions

### 🤖 AI-Powered Intelligence (NEW)
- **Natural Language Queries**: Ask questions about your pipeline and leads in plain English
- **Multi-Step Reasoning**: AI performs complex analysis across multiple data points
- **Lead Qualification Intelligence**: AI-powered lead scoring and conversion predictions
- **Intelligent Recommendations**: Get AI-suggested next steps for every deal and lead
- **Real-Time Insights**: Instant pipeline health monitoring and risk assessment
- **Automated Analysis**: 10x faster deal and lead analysis through Claude integration
- **Custom Fields Democratization**: AI creates custom fields on-demand from conversation content

### 🔧 Advanced Workflow Management
- **Work Flow Management (WFM)**: Generic process management beyond sales
- **Lead Qualification Workflows**: 8-step lead progression from capture to conversion
- **Custom Workflows**: Define multi-step processes for any business operation  
- **Status Tracking**: Real-time progress monitoring with automatic transitions
- **Probability Calculation**: Dynamic deal scoring based on workflow position

### 🔐 Enterprise Security
- **Row Level Security (RLS)**: Database-level access control
- **User Permissions**: Granular permission system
- **Supabase Authentication**: Secure user management
- **Data Isolation**: Multi-tenant architecture

## 🧠 AI Integration Overview

PipeCD features a revolutionary **Model Context Protocol (MCP)** server that transforms your sales database into an AI reasoning engine. Using Claude Desktop, you can:

- **Ask Complex Questions**: *"Which deals need immediate attention and why?"*
- **Get Intelligent Analysis**: *"Show me pipeline trends and identify risks"*
- **Create Deals Naturally**: *"Create a $50K enterprise deal for Microsoft"*
- **Receive AI Recommendations**: *"What should I do next with this stalled deal?"*

### Quick AI Demo
```
You: "Analyze my current pipeline and lead funnel"

AI Response: "Your current pipeline shows 6 active deals with a total value of $114,500. 
The deals are distributed primarily between User B (4 deals worth $71,000) and one 
unassigned deal worth $26,000. Your lead funnel shows 12 active leads with an average 
score of 45. 3 leads are qualified and ready for conversion, while 5 leads in the 
'Initial Contact' stage need immediate follow-up. The qualification rate is 67% which 
is above industry average..."
```

**Learn more**: See `mcp/README.md` for full AI setup instructions.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop (for Supabase)
- Netlify CLI: `npm install -g netlify-cli`
- Supabase CLI: `npm install -g supabase`

### 1. Repository Setup
```bash
git clone <repository-url> PIPECD
cd PIPECD
npm install
cd frontend && npm install && cd ..
```

### 2. Start Local Services
```bash
# Start Supabase (ensure Docker is running)
supabase start

# Copy environment template and configure
cp .env.example .env
# Edit .env with values from `supabase status`

# Apply database migrations
supabase db reset

# Start development server
netlify dev
```

### 3. Access Application
- **Frontend**: http://localhost:8888
- **GraphQL API**: http://localhost:8888/.netlify/functions/graphql
- **Supabase Studio**: http://127.0.0.1:54323

### 4. Setup AI Integration (Optional)
```bash
# Build MCP server
cd mcp && npm install && npm run build

# Get authentication token
node get-auth-token.js

# Configure Claude Desktop (see mcp/README.md)
```

## 📊 Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for development and building
- Chakra UI for components
- Zustand for state management
- React Router for navigation

**Backend:**
- GraphQL API with GraphQL Yoga
- Netlify Functions (serverless)
- TypeScript throughout
- Zod for validation

**Database:**
- PostgreSQL with Supabase
- Row Level Security (RLS)
- Real-time subscriptions
- Automated migrations

**AI Integration:**
- Model Context Protocol (MCP)
- Claude Desktop integration  
- 6 specialized AI tools
- Multi-step reasoning engine

**Development:**
- Vitest for unit/integration testing
- Playwright for E2E testing
- ESLint for code quality
- TypeScript for type safety

## 📁 Project Structure

```
PIPECD/
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/        # Route components
│   │   ├── stores/       # Zustand state management
│   │   └── lib/          # Utilities and GraphQL client
├── netlify/functions/     # GraphQL API
│   ├── graphql/          # Schema and resolvers
│   └── inngest.ts        # Background jobs
├── lib/                  # Shared backend services
├── mcp/                  # AI integration (Model Context Protocol)
│   ├── pipecd-mcp-server.ts  # MCP server implementation
│   ├── get-auth-token.js     # Authentication helper
│   └── claude-config.json    # Claude Desktop configuration
├── supabase/migrations/   # Database schema
└── e2e/                  # Playwright tests
```

## 🔍 Core Features Deep Dive

### Deal Management
- Kanban-style deal board with drag-and-drop
- Customizable pipeline stages via Work Flow Management
- Deal probability calculation and weighted pipeline value
- Rich deal details with custom fields
- Activity timeline and history tracking

### Lead Management
- Complete lead qualification workflows with 8-step progression
- AI-powered lead scoring with demographic, behavioral, and interaction factors
- Lead conversion workflows (Lead → Deal/Person/Organization)
- Lead source attribution and performance tracking
- Automated lead nurturing and follow-up sequences

### Work Flow Management (WFM)
- Generic workflow engine for any business process
- Configurable workflow steps and transitions
- Status-based progression with validation
- Metadata support for workflow-specific data
- Currently powers sales pipeline and lead qualification, extensible to support, onboarding, etc.

### Activity Management
- Task creation and assignment
- Call and meeting logging
- Follow-up tracking
- System-generated activities via Inngest
- Activity recommendations powered by AI

### AI-Powered Insights
- **search_deals**: Intelligent deal filtering
- **search_leads**: Advanced lead discovery and qualification analysis
- **get_deal_details**: Comprehensive deal analysis
- **get_lead_details**: Complete lead profile with scoring insights
- **search_contacts**: Contact relationship mapping
- **analyze_pipeline**: Performance trends and metrics
- **create_deal**: Natural language deal creation
- **create_lead**: AI-driven lead capture with automatic custom field creation
- **qualify_lead**: Intelligent lead qualification with scoring
- **convert_lead**: Seamless lead-to-deal conversion workflows

## 🧪 Testing

```bash
# Unit and integration tests
npm test

# E2E tests  
npm run test:e2e

# Watch mode for development
npm run test:watch

# View E2E test reports
npm run test:e2e:report
```

## 📖 Documentation

- **Developer Guide**: `DEVELOPER_GUIDE_V2.md` - Comprehensive development documentation
- **AI Integration**: `mcp/README.md` - Model Context Protocol setup and usage
- **Architecture Decisions**: `ADR.md` - Technical decision records
- **User Manual**: `WFM_Sales_Kanban_User_Manual.md` - End-user guidance

## 🚀 Deployment

### Netlify
1. Connect repository to Netlify
2. Set environment variables in Netlify UI
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`

### Supabase
1. Create production Supabase project
2. Link with `supabase link --project-ref <ref>`
3. Deploy migrations: `supabase db push --linked`

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow TypeScript and ESLint conventions
3. Add tests for new functionality
4. Update documentation as needed
5. Submit pull request for review

## 🎯 What Makes PipeCD Special

1. **AI-First Design**: Not just a CRM, but an AI reasoning engine for sales
2. **Type Safety**: Full TypeScript coverage from database to UI
3. **Modern Architecture**: Serverless, real-time, and scalable
4. **Flexible Workflows**: Generic WFM system adapts to any business process
5. **Developer Experience**: Hot reload, type generation, comprehensive testing
6. **Enterprise Ready**: RLS, permissions, audit trails, and security

---

**Transform your sales process with AI that thinks, analyzes, and recommends like your best sales manager - available 24/7 with perfect memory.**