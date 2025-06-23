# PipeCD System Documentation

**Status**: Production Ready | **Version**: 2.0 | **Last Updated**: January 21, 2025

## 1. System Overview

PipeCD is a Customer Relationship Management (CRM) system built with serverless architecture. The system provides sales pipeline management, lead qualification, account management, and AI-powered automation.

### 1.1 Core Statistics
- **Backend Services**: 25+ business logic modules
- **GraphQL Schema**: 26 schema files, 500+ types and operations
- **Frontend Pages**: 18 main pages, 100+ components
- **Database Tables**: 50+ tables with migrations
- **AI Tools**: 30+ tools for CRM management
- **Production Features**: 16 major system modules operational

### 1.2 Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Chakra UI
- **Backend**: Node.js + TypeScript + GraphQL Yoga + Netlify Functions
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI**: Anthropic Claude Sonnet 4 + Claude 3 Haiku
- **Automation**: Inngest for background workflows
- **External APIs**: Google Workspace (Gmail, Drive), ECB Exchange Rates

## 2. Architecture Overview

### 2.1 System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│   GraphQL API    │────│   Services      │
│   (React SPA)   │    │   (Netlify Fn)   │    │   (lib/)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                         ┌──────────────────┐    ┌─────────────────┐
                         │   Supabase       │    │   External      │
                         │   (Database)     │    │   Services      │
                         └──────────────────┘    └─────────────────┘
```

### 2.2 Request Flow
1. **Frontend** sends GraphQL queries/mutations
2. **GraphQL API** validates authentication & authorization
3. **Services** execute business logic with database operations
4. **Supabase** enforces Row Level Security and returns data
5. **External Services** provide additional functionality (AI, Google APIs)

## 3. Database Schema

### 3.1 Core Entities
| Entity | Table | Key Fields | Purpose |
|--------|-------|------------|---------|
| **Organizations** | `organizations` | `id`, `name`, `account_manager_id` | Company/client management |
| **People** | `people` | `id`, `first_name`, `last_name`, `email`, `organization_id` | Contact management |
| **Deals** | `deals` | `id`, `name`, `amount`, `currency`, `organization_id` | Sales opportunities |
| **Leads** | `leads` | `id`, `contact_name`, `contact_email`, `estimated_value` | Prospect management |
| **Activities** | `activities` | `id`, `subject`, `type`, `due_date`, `assigned_to_user_id` | Task/event tracking |

### 3.2 Advanced Systems
| System | Tables | Purpose |
|--------|--------|---------|
| **WFM (Workflow Management)** | `wfm_workflows`, `wfm_statuses`, `wfm_steps`, `wfm_project_types`, `wfm_projects` | Business process automation |
| **Custom Fields** | `custom_field_definitions`, `custom_field_values` | Dynamic schema extension |
| **Account Management** | Organizations with `account_manager_id` | Portfolio management |
| **Conversion System** | `conversion_history` | Lead ↔ Deal transformations |
| **Activity Reminders** | `activity_reminders`, `activity_reminder_preferences` | Notification system |
| **Multi-Currency** | `currencies`, `exchange_rates`, `user_currency_preferences` | International support |
| **AI System** | `agent_conversations`, `agent_thoughts`, `agent_v2_conversations` | AI chat history |

### 3.3 Security & Permissions
- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (admin, member, read_only)
- **Row Level Security**: Database-level access control
- **Permissions**: Granular permissions system (77 admin, 42 member, 7 read_only)

## 4. Backend Services (lib/)

### 4.1 Core Business Services
| Service | File | Purpose | Status |
|---------|------|---------|--------|
| **Deal Management** | `dealService/` | Deal CRUD, history, custom fields | ✅ Production |
| **Lead Management** | `leadService/` | Lead qualification, scoring, conversion | ✅ Production |
| **Organization Management** | `organizationService.ts` | Company management, account assignment | ✅ Production |
| **Contact Management** | `personService.ts` | People/contact management | ✅ Production |
| **Activity Management** | `activityService.ts` | Task/event management | ✅ Production |

### 4.2 Advanced Services
| Service | File/Directory | Purpose | Status |
|---------|----------------|---------|--------|
| **AI Agent V1** | `aiAgent/` | Legacy AI system with 30+ tools | ✅ Production |
| **AI Agent V2** | `aiAgentV2/` | Enhanced AI with Claude Sonnet 4 | ✅ Production |
| **Conversion System** | `conversionService/` | Bi-directional lead-deal conversion | ✅ Production |
| **Activity Reminders** | `activityReminderService/` | Multi-channel notifications | ✅ Production |
| **Custom Fields** | `customFieldDefinitionService.ts` | Dynamic field management | ✅ Production |
| **Smart Stickers** | `smartStickersService.ts` | Visual collaboration | ✅ Production |
| **Multi-Currency** | `services/currencyService.ts` | Currency management | ✅ Production |

### 4.3 Integration Services
| Service | File | Purpose | Status |
|---------|------|---------|--------|
| **Google Drive** | `googleDriveService.ts` | Document management | ✅ Production |
| **Gmail Integration** | `emailService.ts` | Email management | ✅ Production |
| **Google OAuth** | `googleIntegrationService.ts` | OAuth 2.0 flow | ✅ Production |
| **ECB Exchange** | `services/ecbService.ts` | Currency rate updates | ✅ Production |

### 4.4 Workflow Services
| Service | File | Purpose | Status |
|---------|------|---------|--------|
| **WFM Workflows** | `wfmWorkflowService.ts` | Workflow definitions | ✅ Production |
| **WFM Statuses** | `wfmStatusService.ts` | Status management | ✅ Production |
| **WFM Projects** | `wfmProjectService.ts` | Project tracking | ✅ Production |
| **WFM Project Types** | `wfmProjectTypeService.ts` | Project type definitions | ✅ Production |

## 5. GraphQL API (netlify/functions/graphql/)

### 5.1 Schema Organization
| Schema File | Purpose | Key Types |
|-------------|---------|-----------|
| `deal.graphql` | Deal operations | Deal, DealInput, DealUpdateInput |
| `lead.graphql` | Lead operations | Lead, LeadInput, LeadUpdateInput |
| `organization.graphql` | Organization ops | Organization, OrganizationInput |
| `person.graphql` | Contact operations | Person, PersonInput, PersonUpdateInput |
| `activity.graphql` | Activity operations | Activity, ActivityInput |
| `conversion.graphql` | Conversion system | ConversionHistory, ConversionInput |
| `currency.graphql` | Multi-currency | Currency, ExchangeRate, CurrencyAmount |
| `agentV2.graphql` | AI Agent V2 | AgentV2Conversation, AgentV2Message |

### 5.2 Resolver Structure
| Resolver Category | Files | Purpose |
|------------------|-------|---------|
| **Query Resolvers** | `queries/` | Data fetching operations |
| **Mutation Resolvers** | `mutations/` | Data modification operations |
| **Entity Resolvers** | `deal.ts`, `lead.ts`, etc. | Field-level resolvers |
| **Specialized Resolvers** | `agentV2Resolvers.ts`, `conversionResolvers.ts` | functionality |

### 5.3 Key Operations
- **CRUD Operations**: Create, Read, Update, Delete for all entities
- **Search & Filtering**: Search with custom field support
- **Conversion Operations**: Bi-directional lead-deal conversion
- **AI Operations**: Chat conversations, tool execution, context management
- **Account Management**: Portfolio tracking, manager assignment
- **Activity Reminders**: Notification preferences, reminder scheduling

## 6. Frontend Application (frontend/src/)

### 6.1 Page Structure
| Page Category | Files | Purpose |
|---------------|-------|---------|
| **Core CRM** | `DealsPage.tsx`, `LeadsPage.tsx`, `OrganizationsPage.tsx`, `PeoplePage.tsx` | Main CRM functionality |
| **Detail Pages** | `DealDetailPage.tsx`, `LeadDetailPage.tsx`, `OrganizationDetailPage.tsx`, `PersonDetailPage.tsx` | Entity management |
| **AI System** | `AgentPage.tsx`, `AgentV2Page.tsx` | AI assistant interfaces |
| **Account Mgmt** | `MyAccountsPage.tsx` | Portfolio management |
| **Admin** | `admin/` directory | System administration |

### 6.2 Component Architecture
| Component Category | Directory | Purpose |
|-------------------|-----------|---------|
| **Entity Management** | `deals/`, `leads/`, `organizations/` | Entity-specific components |
| **Common Components** | `common/` | Reusable UI components |
| **Layout Components** | `layout/` | Page structure and navigation |
| **Admin Components** | `admin/` | Administrative interfaces |
| **AI Components** | `agent/` | AI assistant interfaces |

### 6.3 State Management
| Store | File | Purpose |
|-------|------|---------|
| **Deals Store** | `useDealsStore.ts` | Deal state management |
| **Leads Store** | `useLeadsStore.ts` | Lead state management |
| **Organizations Store** | `useOrganizationsStore.ts` | Organization state |
| **People Store** | `usePeopleStore.ts` | Contact state |
| **Activities Store** | `useActivitiesStore.ts` | Activity state |
| **Agent Store** | `useAgentStore.ts` | AI assistant state |

### 6.4 Theme System
| Theme | File | Purpose |
|-------|------|---------|
| **Light Modern** | `creativeDockLightModernTheme.ts` | Professional light theme |
| **Dark Modern** | `creativeDockModernTheme.ts` | Professional dark theme |
| **Industrial** | `industrialMetalTheme.ts` | Industrial-style theme |

## 7. AI System

### 7.1 AI Agent V2 (Primary)
| Component | File | Purpose |
|-----------|------|---------|
| **Core Service** | `aiAgentV2/core/AgentServiceV2.ts` | Main orchestration |
| **Tool Registry** | `aiAgentV2/tools/ToolRegistry.ts` | Tool management |
| **Cognitive Engine** | `aiAgentV2/core/SimpleCognitiveEngine.ts` | Data processing |

### 7.2 AI Tools
| Tool Category | Tools | Purpose |
|---------------|-------|---------|
| **Entity Creation** | CreateDealTool, CreateOrganizationTool, CreatePersonTool | Entity creation with validation |
| **Entity Updates** | UpdateDealTool, UpdateOrganizationTool, UpdatePersonTool | Entity modification |
| **Search & Discovery** | SearchDealsTool | Search |
| **Cognitive Tools** | ThinkTool | Reasoning and analysis |

### 7.3 AI Features
- **Natural Language Processing**: Claude Sonnet 4 integration
- **Tool Execution**: CRM operations
- **Duplicate Detection**: Entity matching
- **Conversation Memory**: Persistent chat history
- **Error Recovery**: Graceful failure handling

## 8. Key Features

### 8.1 Account Management System
- **Portfolio Dashboard**: Account overview with statistics
- **Manager Assignment**: Bulk assignment capabilities
- **Activity Tracking**: Account activity monitoring
- **Performance Analytics**: Pipeline value and deal tracking

### 8.2 Bi-Directional Conversion System
- **Lead to Deal**: Forward conversion with data preservation
- **Deal to Lead**: Backward conversion with history
- **Bulk Operations**: Multiple entity conversion
- **Audit Trail**: Complete conversion history

### 8.3 Duplicate Detection
- **Real-Time Detection**: Live similarity scoring
- **Multi-Algorithm**: Levenshtein distance, fuzzy matching
- **User Confirmation**: Clear warnings and suggestions
- **AI Integration**: Duplicate detection in AI tools

### 8.4 Email-to-Task
- **AI Generation**: Claude 3 Haiku task creation
- **User Confirmation**: Two-step process with editing
- **Template System**: Professional templates
- **Email Scope**: Single message or thread analysis

### 8.5 Multi-Currency System
- **42 Currencies**: Global currency support
- **Exchange Rates**: ECB API integration
- **User Preferences**: Personal currency settings
- **Display**: Mixed and converted modes

### 8.6 Activity Reminder System
- **Multi-Channel**: Email, in-app, push notifications
- **User Preferences**: Customizable notification settings
- **Scheduling**: Reminder timing
- **Activity Integration**: Task management

## 9. Security & Compliance

### 9.1 Authentication & Authorization
- **Supabase Auth**: JWT-based authentication
- **Role-Based Access**: Admin, Member, Read-Only roles
- **Granular Permissions**: 77 admin, 42 member, 7 read-only permissions
- **Row Level Security**: Database-level access control

### 9.2 Data Protection
- **Encryption**: Data encryption at rest and in transit
- **Audit Trails**: Complete operation logging
- **Privacy Controls**: GDPR-compliant data handling
- **Secure APIs**: GraphQL field-level permissions

### 9.3 Production Hardening
- **Error Handling**: Error recovery
- **Performance Monitoring**: Real-time performance tracking
- **Rate Limiting**: API protection mechanisms
- **Input Validation**: Data validation

## 10. Deployment & Operations

### 10.1 Infrastructure
- **Frontend Hosting**: Netlify CDN
- **API Functions**: Netlify Serverless Functions
- **Database**: Supabase managed PostgreSQL
- **Background Jobs**: Inngest workflow engine

### 10.2 Development Workflow
- **Local Development**: `netlify dev` + `supabase start`
- **Version Control**: Git with feature branches
- **Database Migrations**: Versioned SQL migrations
- **Type Safety**: End-to-end TypeScript

### 10.3 Monitoring & Maintenance
- **Error Tracking**: Error logging
- **Performance Metrics**: Response time monitoring
- **Database Health**: Query performance tracking
- **User Analytics**: Feature usage statistics

## 11. Production Status

### 11.1 Operational Modules (16/24)
✅ **Deal Management** - Complete CRUD with WFM integration  
✅ **Lead Management** - Full qualification workflows  
✅ **Organization Management** - Account management with portfolio tracking  
✅ **Contact Management** - People management with relationships  
✅ **Activity Management** - Task/event management with reminders  
✅ **AI Agent V2** - Claude Sonnet 4 with 30+ tools  
✅ **Account Management** - Portfolio dashboard and assignment  
✅ **Conversion System** - Bi-directional lead-deal conversion  
✅ **Duplicate Detection** - Real-time similarity matching  
✅ **Email-to-Task** - AI-powered task generation  
✅ **Multi-Currency** - 42 currencies with exchange rates  
✅ **Activity Reminders** - Multi-channel notification system  
✅ **Smart Stickers** - Visual collaboration platform  
✅ **Custom Fields** - Dynamic schema extension  
✅ **Google Integration** - Gmail and Drive integration  
✅ **WFM System** - Workflow management engine  

### 11.2 Future Modules (8/24)
⬜ **Project Management** - Post-sale delivery tracking  
⬜ **Product Catalog** - Product and pricing management  
⬜ **Reporting & Analytics** - Business intelligence  
⬜ **Email Communication** - Email automation  
⬜ **Document Management** - Document workflows  
⬜ **Integration Gateway** - Third-party API management  
⬜ **Territory Management** - Geographic sales territories  
⬜ **Forecasting** - Sales prediction and planning  

## 12. Performance & Scalability

### 12.1 Performance Metrics
- **Database Queries**: 30-50% improvement with optimized queries
- **Page Load Times**: 70% improvement with parallel loading
- **Memory Usage**: Leak prevention with optimized components
- **API Response**: Sub-second response times maintained

### 12.2 Scalability Features
- **Serverless Architecture**: Automatic scaling with demand
- **Database Optimization**: Indexed queries and efficient schemas
- **CDN Distribution**: Global content delivery
- **Caching Strategy**: Data caching

---

**Document Version**: 1.0  
**Audit Ready**: Yes  
**Last Review**: January 21, 2025  
**Next Review**: February 21, 2025 