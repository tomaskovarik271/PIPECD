# Developer Guide V3 - PIPECD
*Complete System Documentation & Architecture Reference*

## Table of Contents
1. [System Overview](#system-overview)
2. [Authentication Architecture](#authentication-architecture)
3. [Database Schema & Migrations](#database-schema--migrations)
4. [Testing Infrastructure](#testing-infrastructure)
5. [Core Business Logic](#core-business-logic)
6. [AI Agent System](#ai-agent-system)
7. [Google Workspace Integration](#google-workspace-integration)
8. [Business Rules Engine](#business-rules-engine)
9. [Task Management System](#task-management-system)
10. [**REMOVED SYSTEMS**](#removed-systems)
11. [Development Environment](#development-environment)
12. [Performance & Optimization](#performance--optimization)
13. [Security & Permissions](#security--permissions)

---

## System Overview

**PipeCD** is a calendar-focused CRM built on modern collaboration principles with business automation. Unlike traditional CRMs that built internal calendar systems, PipeCD integrates with Google Calendar + Google Tasks as the primary system with business data overlay and business rules engine.

### Core Architecture Principles
- **Calendar-Focused**: Google Calendar/Tasks as primary activity system
- **Collaboration Model**: Team members can edit any record
- **Security-First**: OAuth-based authentication with granular RBAC
- **AI Integration**: Built-in AI agent with workflow tools
- **Business Automation**: Rules engine with template substitution
- **Progressive Enhancement**: Works with/without JavaScript, mobile-first

### Key Features
- **Deals Pipeline**: Kanban-based deal management with WFM integration
- **Lead Management**: Bi-directional conversion system with reactivation planning
- **Contact Management**: Organizations, People with multi-organization relationships
- **Multi-Currency**: 42 currencies with ECB exchange rate integration
- **Document Management**: Google Drive integration with dual attachment system
- **Email Integration**: Gmail threads with contact discovery and filtering
- **Smart Notes**: Dual system (Simple Notes + Advanced Sticker Board)
- **AI Agent V2**: Claude Sonnet 4 with workflow tools
- **Business Rules Engine**: ✅ Production ready with template substitution and admin UI
- **Task Management**: ✅ Production ready with CRM integration and automation

---

## Authentication Architecture

PipeCD uses a **hybrid OAuth authentication system** designed for security-first development:

### Primary Authentication Flow
1. **Supabase Google OAuth**: Primary user authentication
2. **Extended Permissions**: Custom OAuth for Google API scopes (Drive, Gmail, Calendar)
3. **Token Storage**: Custom `google_oauth_tokens` table for extended API access
4. **User Profile Creation**: Automatic trigger creates `user_profiles` when `auth.users` inserted
5. **RBAC Assignment**: Manual role assignment required after signup

### Authentication Tables
```sql
-- Core auth (Supabase managed)
auth.users                    -- Primary authentication
public.user_profiles          -- Extended user data
public.google_oauth_tokens    -- Extended Google API access

-- RBAC system
public.roles                  -- admin, member, read_only
public.permissions           -- Granular permissions (77 total)
public.role_permissions      -- Role-permission mapping
public.user_roles           -- User-role assignment
```

### Development Authentication Workflow
1. After `supabase db reset --local`, go to login page
2. Sign up via OAuth (Google/GitHub) - creates user with NO permissions
3. Copy new user ID from Supabase auth table
4. Run SQL: `INSERT INTO public.user_roles (user_id, role_id) VALUES ('user_id', (SELECT id FROM public.roles WHERE name = 'admin'))`
5. Return to app with proper permissions

---

## Database Schema & Migrations

PipeCD has **102 migration files** implementing a comprehensive enterprise CRM schema:

### Core Entity Tables
```sql
-- Primary business entities
public.deals                 -- Sales pipeline with WFM integration
public.leads                -- Lead qualification with conversion tracking
public.people              -- Contact management
public.organizations       -- Company/account management

-- Workflow Management (WFM)
public.wfm_workflows       -- Business process definitions
public.wfm_workflow_steps  -- Process steps/stages
public.wfm_statuses       -- Status definitions
public.project_types      -- Project type definitions
public.wfm_projects       -- Project instances
```

### Enhanced Features
```sql
-- Account Management System (Migration 20250730000054)
public.organizations.account_manager_id  -- Account manager assignment
-- Permissions: assign_account_manager, manage_own_accounts, view_account_portfolio

-- Multi-Organization Contacts (Migration 20250730000079)
public.person_organization_roles  -- Many-to-many person-organization relationships
-- Replaces legacy single organization_id with flexible role-based system

-- Bi-Directional Conversion System (Migration 20250730000052)
public.conversion_history      -- Audit trail for lead-deal conversions
public.reactivation_plans     -- Backwards conversion planning
public.leads.original_deal_id  -- Track deal-to-lead conversions
public.deals.converted_to_lead_id  -- Track reverse conversions

-- Multi-Currency System (Migration 20250730000045)
public.currencies             -- 42 world currencies
public.exchange_rates         -- ECB exchange rates with auto-updates
public.user_currency_preferences  -- User preferences
public.deals.currency         -- Deal currency fields
public.leads.currency         -- Lead currency fields
```

### Business Rules Engine (Migration 20250730000071) - ✅ PRODUCTION READY
```sql
-- Business Rules System - FULLY FUNCTIONAL
public.business_rules              -- Rule definitions with conditions and actions
public.business_rule_notifications -- Generated notifications with template substitution
public.rule_executions            -- Complete audit trail of rule executions

-- Template Variables with Formatting:
-- Deal: {{deal_name}}, {{deal_amount}} (EUR 75,000.00), {{deal_currency}}, {{deal_stage}}, {{deal_owner}}
-- Lead: {{lead_name}}, {{lead_email}}, {{lead_value}} (formatted), {{lead_source}}, {{lead_status}}
-- Organization: {{organization_name}}, {{organization_website}}, {{organization_industry}}
-- Person: {{person_name}}, {{person_email}}, {{person_phone}} (formatted)
-- Universal: {{entity_id}}, {{entity_name}}, {{current_date}}, {{current_time}}

-- Production Features:
-- ✅ Active in deal service layer (dealService/dealCrud.ts)
-- ✅ Admin UI (BusinessRulesPage.tsx) with search/filtering
-- ✅ Template substitution function (substitute_template_variables)
-- ✅ Complete GraphQL API (businessRules.graphql)
-- ✅ Production testing validated
```

### Task Management System (Migration 20250730000069) - ✅ PRODUCTION READY
```sql
-- Task Management System - CRM Integrated with Business Logic
public.tasks                 -- Task management with CRM entity context
public.task_dependencies     -- Task dependency management with circular prevention
public.task_automation_rules -- Automated task creation rules
public.task_history         -- Complete task change tracking

-- 15 Business-Focused Task Types:
-- Deal Progression: DISCOVERY, DEMO_PREPARATION, PROPOSAL_CREATION, NEGOTIATION_PREP, CONTRACT_REVIEW, DEAL_CLOSURE
-- Lead Management: LEAD_QUALIFICATION, LEAD_NURTURING, FOLLOW_UP, LEAD_SCORING_REVIEW
-- Relationship: STAKEHOLDER_MAPPING, RELATIONSHIP_BUILDING, RENEWAL_PREPARATION
-- Administrative: DATA_ENRICHMENT, CRM_UPDATE, REPORTING

-- Advanced Business Logic:
-- completion_triggers_stage_change, blocks_stage_progression, required_for_deal_closure, affects_lead_scoring

-- Production Features:
-- ✅ Complete GraphQL API (task.graphql) with 25+ operations
-- ✅ CRM entity context required (always linked to deals/leads/people/organizations)
-- ✅ Workflow integration with WFM system
-- ✅ Task automation rules for event-driven task creation
```

### Google Integration Tables
```sql
-- Google Workspace Integration (Migration 20250730000030)
public.google_oauth_tokens    -- Extended OAuth tokens with scopes
public.documents             -- Polymorphic document attachments
public.emails               -- Gmail integration with entity linking
public.email_activities     -- Email tracking (opens, replies, etc.)

-- Google Calendar Foundation (Migration 20250730000059)
public.calendar_events        -- Google Calendar event sync
public.calendar_integrations  -- Integration settings
public.calendar_permissions   -- Calendar access permissions

-- Deal-Specific Document Management (Migration 20250730000032)
public.deal_documents        -- Deal document attachments
public.deal_drive_folders    -- Auto-created Google Drive folders

-- Note Document Attachments (Migration 20250730000041)
public.note_document_attachments  -- Google Drive docs attached to notes
```

### AI Agent V2 Tables
```sql
-- AI Agent V2 System (Migration 20250730000051)
public.agent_v2_conversations   -- V2 conversation management
public.agent_v2_messages       -- Enhanced message storage
public.agent_thoughts          -- V2 thinking analysis
-- Enhanced with: extended_thinking_budget, is_v2_specific columns
```

### Smart Features
```sql
-- Smart Stickers System (Migration 20250730000027)
public.stickers         -- Visual note system with categories
public.sticker_categories     -- Sticker categorization

-- Custom Fields System
public.custom_field_definitions  -- Dynamic field definitions
public.custom_field_values      -- Polymorphic field values
```

---

## REMOVED SYSTEMS

PipeCD has undergone major architectural cleanup by removing complex systems:

### 1. Activities & Notifications System (Migration 20250730000056)
**REMOVED**: Complete internal activity system in favor of Google Calendar integration
- Tables: `activities`, `activity_reminders`, `notifications`, `user_reminder_preferences`, `email_activities`
- Functions: `cleanup_expired_notifications()`, `get_overdue_activities()`, `schedule_activity_reminders()`
- Enums: `activity_type`, `activity_status`, `reminder_type`, `notification_type`
- **Reason**: Google Calendar provides superior native activity management

**REPLACED WITH**: Universal Notification System (Migration 20250730000072)
- **Current**: Business rule notifications (ACTIVE) + System notifications (infrastructure exists)
- **Tables**: `business_rule_notifications`, `system_notifications`, `unified_notifications` view
- **Functions**: `get_user_notification_summary()`, `mark_all_notifications_read()`
- **Status**: Business rules generate notifications, system notifications not actively used

### 2. Relations Intelligence System (Migration 20250730000048)
**REMOVED**: Complex relationship mapping system that added unnecessary complexity
- Tables: `organization_relationships`, `person_relationships`, `person_organizational_roles`
- Tables: `stakeholder_analysis`, `territories`, `account_territories`, `relationship_insights`
- Permissions: All relationship intelligence permissions (6 resource types)
- **Reason**: Core CRM functionality more valuable than relationship complexity

### 3. Activity-Related RBAC (Migration 20250730000057)
**REMOVED**: Activity permissions from RBAC system
- Permissions: `activity:read_own`, `activity:read_any`, `activity:create`, `activity:update_own`, `activity:update_any`, `activity:delete_own`, `activity:delete_any`
- **Reason**: Aligns with Google Calendar-first approach

---

## Testing Infrastructure

PipeCD implements a **business-focused testing philosophy** after comprehensive redesign:

### Testing Philosophy
- **Test business logic users depend on** (not implementation details)
- **Validate real user scenarios** (not contrived edge cases)
- **Ensure collaboration model works** (team editing permissions)
- **Don't test what should be tested elsewhere** (avoid mocking what needs real testing)

### Test Structure
```
tests/
├── unit/              # Core business logic tests
├── integration/       # Cross-service interaction tests
├── performance/       # Database operation benchmarks
├── factories/         # Business scenario creation
└── setup/            # Test environment configuration
```

### Core Test Infrastructure

#### Test Environment (`tests/setup/testEnvironment.ts`)
```typescript
// Real authentication with Supabase service role
export const createTestUser = async (role: 'admin' | 'member' = 'member') => {
  const supabase = createServiceRoleClient();
  // Creates real users with proper JWT tokens (not mocks)
  // Automatic cleanup after each test
};
```

#### Business Scenario Factory (`tests/factories/businessScenarios.ts`)
```typescript
// Creates realistic enterprise sales scenarios
export const createBusinessScenario = async () => {
  // BNP Paribas-style organizations, people, deals, leads
  // Handles WFM project type creation
  // Unique naming to prevent conflicts
  // Real business context for testing
};
```

### Test Categories & Coverage

#### Unit Tests (7 tests)
- **Deal Lifecycle**: Creation, WFM integration, collaboration model, validation
- **Collaboration Model**: Team editing permissions, RBAC compliance
- **Business Logic**: Service layer functionality, data integrity

#### Integration Tests (5 tests)
- **AI Agent V2**: CreateDealTool, SearchDealsTool with cognitive workflows
- **GraphQL-First Architecture**: Ensures frontend/AI consistency
- **Cross-Service Communication**: Service layer interactions

#### Performance Tests (6 tests)
- **Database Operations**: Deal CRUD benchmarks (<200ms targets)
- **Bulk Data Handling**: Large dataset processing
- **Memory Management**: Resource utilization monitoring

### Test Execution
```bash
# Granular test execution
npm run test:unit          # Business logic validation
npm run test:integration   # Cross-service testing
npm run test:performance   # Performance benchmarks
npm run test:business      # Business scenario validation
npm run test:ai           # AI agent testing
npm run test:all          # Complete test suite

# Coverage thresholds
# Overall: 70% minimum
# Business logic: 85% minimum
```

### E2E Testing Decision
**Manual E2E Testing Chosen** over automation due to:
- OAuth authentication complexity requiring manual role assignment
- Database reset workflows with user re-authentication
- Security-first architecture making automation more effort than value
- Focus on practical development over complex automation

---

## Core Business Logic

### Deal Management
- **Pipeline**: Kanban-based with drag-drop stage transitions
- **WFM Integration**: Automatic project creation with workflow mapping
- **Collaboration**: Full team editing with assignment for accountability
- **Multi-Currency**: 42 currencies with ECB exchange rates
- **Documents**: Google Drive integration with auto-folder creation
- **Participants**: Many-to-many people relationships for email filtering

### Lead Management
- **Qualification**: WFM-based lead qualification workflows
- **Bi-Directional Conversion**: Lead↔Deal with audit trails and reactivation planning
- **Assignment**: User assignment with ownership tracking
- **Custom Fields**: Dynamic field system for lead qualification

### Contact Management
- **Organizations**: Company management with account manager assignment
- **People**: Contact management with multi-organization relationships via person_organization_roles
- **Account Management**: Portfolio view for account managers
- **Duplicate Detection**: Smart detection during creation

### Multi-Currency System
- **42 World Currencies**: Complete currency support
- **ECB Integration**: Automated exchange rate updates (weekdays 6 AM)
- **User Preferences**: Personal currency settings
- **Deal/Lead Currency**: Individual entity currency tracking

---

## AI Agent System

PipeCD features an AI-optimized enterprise CRM with **AI Agent V2** using Claude Sonnet 4:

### AI Agent V2 Architecture
- **Claude Sonnet 4**: Advanced reasoning capabilities
- **Cognitive Workflow Tools**: Think-first methodology with structured reasoning
- **Tool Registry**: Extensible tool system for CRM operations
- **Production Hardening**: Enterprise-grade security and reliability

### Core AI Tools (9 Verified)
```typescript
// Entity Creation Tools
CreateDealTool           // Creates deals with organization linking
CreateOrganizationTool   // Creates organizations with duplicate detection
CreatePersonTool         // Creates people with email validation

// Data Retrieval Tools
SearchDealsTool          // GraphQL-first deal searching

// Entity Management Tools
UpdateDealTool          // Deal updates with change analysis
UpdatePersonTool        // Person updates with duplicate prevention
UpdateOrganizationTool  // Organization updates with validation

// Cognitive Enhancement Tools
ThinkTool              // Structured reasoning and analysis
```

### Revolutionary Features
- **GraphQL-First Architecture**: AI uses same queries as frontend for perfect consistency
- **Workflow Transparency**: Complete audit trails with 6-step workflow documentation
- **Business Intelligence**: Embedded business logic in tools, not just API wrappers

### Performance Metrics
- **Sub-second Response Times**: <1s for most operations
- **98% Tool Success Rate**: Enterprise-grade reliability
- **Production Validated**: Real deal updates (€65K → €75K in 96ms)

---

## Google Workspace Integration

PipeCD implements comprehensive Google Workspace integration as the foundation of its calendar-native architecture:

### OAuth Integration (Migration 20250730000030)
```sql
public.google_oauth_tokens -- Extended OAuth with multiple scopes
-- Scopes: gmail.readonly, gmail.send, gmail.modify, drive.readonly, calendar
```

### Gmail Integration
- **Email Threading**: Gmail API integration with thread management
- **Contact Discovery**: Automatic contact creation from email participants
- **Entity Linking**: Emails linked to deals, people, organizations
- **Activity Tracking**: Email opens, replies, forwards tracking
- **Multi-Contact Filtering**: Enhanced filtering beyond primary contact

### Google Drive Integration
- **Document Browser**: 3-tab interface (Browse, Search, Recent Files)
- **Shared Drive Support**: Enterprise shared drive access
- **Dual Attachment System**: Documents attached to both notes and deals
- **Auto-Folder Creation**: Automatic deal-specific folder structure
- **Real-Time Search**: Dynamic file searching with metadata

### Google Calendar Integration (Migration 20250730000059)
**Foundation Created** for Google Calendar as primary activity system:
```sql
public.calendar_events        -- Google Calendar event sync
public.calendar_integrations  -- Integration settings
public.calendar_permissions   -- Calendar access permissions
```

### Document Management Systems

#### Deal Documents (Migration 20250730000032)
```sql
public.deal_documents        -- Deal-specific document attachments
public.deal_drive_folders    -- Auto-created Drive folder structure
-- Categories: PROPOSALS, CONTRACTS, LEGAL, PRESENTATIONS, CORRESPONDENCE
```

#### Note Document Attachments (Migration 20250730000041)
```sql
public.note_document_attachments  -- Google Drive docs attached to notes
-- Dual attachment: documents attached to both notes AND deals atomically
```

### Email-to-Task Feature
- **Claude 3 Haiku Integration**: Cost-effective AI task generation
- **Two-Step Process**: Configure scope → Confirm generated content
- **Email Scope Selection**: Single message vs entire thread analysis
- **User Confirmation**: Review/edit AI content before task creation

---

## Business Rules Engine

### Core Architecture (Migration 20250730000071)
PipeCD's Business Rules Engine is a **production-ready business automation system** that monitors and responds to business processes across all CRM entities.

### Database Schema
```sql
-- Rule definitions with flexible conditions and actions
public.business_rules (
  id, name, description, entity_type, trigger_type,
  trigger_events[], trigger_fields[], conditions JSONB, actions JSONB,
  status, execution_count, last_execution, created_by, created_at, updated_at
)

-- Generated notifications with template substitution
public.business_rule_notifications (
  id, rule_id, entity_type, entity_id, user_id,
  title, message, notification_type, priority,
  read_at, dismissed_at, acted_upon_at, created_at
)

-- Complete execution audit trail
public.rule_executions (
  id, rule_id, entity_id, entity_type, execution_trigger,
  conditions_met, execution_result JSONB, notifications_created,
  tasks_created, activities_created, errors JSONB, execution_time_ms, executed_at
)
```

### Template Substitution System
**Advanced Variable System** with rich entity context:
```sql
-- Template substitution function with comprehensive entity support
CREATE OR REPLACE FUNCTION public.substitute_template_variables(
  template_text TEXT,
  entity_data JSONB,
  entity_type entity_type_enum
) RETURNS TEXT
```

**Supported Template Variables:**
- **Deal**: `{{deal_name}}`, `{{deal_amount}}`, `{{deal_currency}}`, `{{deal_stage}}`, `{{deal_owner}}`, `{{deal_close_date}}`
- **Lead**: `{{lead_name}}`, `{{lead_email}}`, `{{lead_value}}`, `{{lead_source}}`
- **Organization**: `{{organization_name}}`, `{{organization_website}}`
- **Person**: `{{person_name}}`, `{{person_email}}`, `{{person_phone}}`
- **Universal**: `{{entity_id}}`, `{{current_date}}`, `{{current_time}}`

### Production Examples
```typescript
const PRODUCTION_RULES = [
  {
    name: "High Value Deal Alert",
    entityType: "DEAL",
    triggerType: "EVENT_BASED",
    triggerEvents: ["DEAL_CREATED"],
    conditions: [
      { field: "amount", operator: "GREATER_THAN", value: 50000 }
    ],
    actions: [
      { 
        type: "NOTIFY_OWNER", 
        template: "High Value Deal Alert",
        message: "High value deal detected: {{deal_name}} - Amount: {{deal_amount}}"
      }
    ]
  }
];
```

### Integration Status
- **Deal Service**: ✅ **ACTIVE** - Rules trigger on deal create/update
- **Template Substitution**: ✅ **WORKING** - Variables replaced with actual values
- **Notification Center**: ✅ **INTEGRATED** - Notifications appear in UI
- **Admin Interface**: ✅ **COMPLETE** - Full rule management interface
- **Audit Trails**: ✅ **ACTIVE** - Complete execution tracking

### GraphQL API
```graphql
# Business Rules Management
extend type Query {
  businessRules(filters: BusinessRuleFilters): BusinessRulesConnection!
  businessRuleNotifications(userId: ID): BusinessRuleNotificationsConnection!
  ruleExecutions(ruleId: ID): RuleExecutionsConnection!
}

extend type Mutation {
  createBusinessRule(input: BusinessRuleInput!): BusinessRule!
  updateBusinessRule(id: ID!, input: UpdateBusinessRuleInput!): BusinessRule!
  executeBusinessRule(ruleId: ID!, entityType: EntityTypeEnum!, entityId: ID!): BusinessRuleExecutionResult!
}
```

---

## Task Management System

### Core Architecture (Migration 20250730000069)
PipeCD's Task Management System provides **CRM-integrated task management** with business process automation.

### Database Schema
```sql
-- Core task management with CRM context
public.tasks (
  id, title, description, status, priority,
  entity_type, entity_id, assigned_to_user_id, created_by_user_id,
  due_date, completed_at, deal_id, lead_id, person_id, organization_id,
  wfm_project_id, task_type, completion_triggers_stage_change,
  blocks_stage_progression, required_for_deal_closure,
  affects_lead_scoring, custom_field_values, tags
)

-- Task dependency management
public.task_dependencies (
  id, task_id, depends_on_task_id, dependency_type, created_at
)

-- Automated task creation rules
public.task_automation_rules (
  id, name, description, applies_to_entity_type, trigger_conditions JSONB,
  task_template JSONB, is_active, created_by_user_id, created_at, updated_at
)

-- Complete task change tracking
public.task_history (
  id, task_id, user_id, event_type, field_name, old_value, new_value, created_at
)
```

### Task Types & Business Logic
```typescript
enum TaskType {
  DISCOVERY = 'DISCOVERY',
  DEMO_PREPARATION = 'DEMO_PREPARATION', 
  PROPOSAL_CREATION = 'PROPOSAL_CREATION',
  NEGOTIATION_PREP = 'NEGOTIATION_PREP',
  CONTRACT_REVIEW = 'CONTRACT_REVIEW',
  DEAL_CLOSURE = 'DEAL_CLOSURE',
  LEAD_QUALIFICATION = 'LEAD_QUALIFICATION',
  LEAD_NURTURING = 'LEAD_NURTURING',
  FOLLOW_UP = 'FOLLOW_UP',
  LEAD_SCORING_REVIEW = 'LEAD_SCORING_REVIEW',
  STAKEHOLDER_MAPPING = 'STAKEHOLDER_MAPPING',
  RELATIONSHIP_BUILDING = 'RELATIONSHIP_BUILDING',
  RENEWAL_PREPARATION = 'RENEWAL_PREPARATION',
  DATA_ENRICHMENT = 'DATA_ENRICHMENT',
  CRM_UPDATE = 'CRM_UPDATE',
  REPORTING = 'REPORTING'
}

enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_ON_CUSTOMER = 'WAITING_ON_CUSTOMER',
  WAITING_ON_INTERNAL = 'WAITING_ON_INTERNAL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

### Business Process Integration
- **Stage Progression**: Tasks can block deal/lead stage advancement
- **Lead Scoring**: Task completion affects lead scoring algorithms
- **Deal Closure**: Required tasks for deal closure enforcement
- **WFM Integration**: Tasks linked to workflow projects
- **Automation**: Business rules can create tasks automatically

### CRM Context Requirements
- **Always Entity-Linked**: Tasks must be linked to deals, leads, people, or organizations
- **Business Intelligence**: Tasks understand their business context
- **Cross-Entity Relationships**: Tasks can span multiple CRM entities
- **Workflow Integration**: Tasks integrate with WFM system

### GraphQL API
```graphql
extend type Query {
  tasks(filters: TaskFilters): TasksConnection!
  task(id: ID!): Task
  tasksByEntity(entityType: EntityType!, entityId: ID!): [Task!]!
}

extend type Mutation {
  createTask(input: TaskInput!): Task!
  updateTask(id: ID!, input: TaskUpdateInput!): Task!
  completeTask(id: ID!): Task!
  deleteTask(id: ID!): Boolean!
}
```

---

## Development Environment

### Local Development Stack
```bash
# Core services
netlify dev              # Frontend development server (port 8888)
supabase start          # Local Supabase stack
supabase db reset --local  # Database reset (requires re-authentication)

# Database management
supabase migration up --local    # Apply migrations (preferred)
supabase db reset --local       # Full reset (ask permission first)
```

### Migration Management
- **Never push to remote Supabase** - always use local environment
- **Migration naming**: `YYYYMMDDHHMMSS_descriptive_name.sql`
- **Sequence checking**: `ls -la supabase/migrations/ | tail -5`
- **Increment by 2+ seconds** from latest migration

### Environment Configuration
- **netlify.toml**: Deployment configuration
- **supabase/config.toml**: Local Supabase settings
- **env.example.txt**: Environment variable templates

### Development Workflow
1. Code changes in TypeScript/React
2. GraphQL schema updates trigger code generation
3. Migration creation for database changes
4. Local testing with `netlify dev`
5. Commit with conventional format: `type(scope): description`

---

## Performance & Optimization

### Database Optimization Status
- **SELECT * Queries**: 44 identified across codebase for optimization
- **Field Selection**: Implemented for deal_history (58% payload reduction)
- **Bulk Operations**: Custom field processing optimized (37s → <3s)
- **Indexing**: Comprehensive indexes on all major query patterns

### Performance Monitoring
- **GraphQL Query Analysis**: Automated performance tracking
- **Database Query Optimization**: Systematic SELECT * replacement
- **Frontend Bundle Optimization**: Code splitting and lazy loading
- **Memory Management**: LRU caching and leak prevention

### Optimization Plan
1. **Phase 1**: Remaining 41 SELECT * queries → specific field selection
2. **Phase 2**: Parallel data loading with Promise.all patterns
3. **Phase 3**: GraphQL DataLoader N+1 prevention
4. **Phase 4**: Component virtualization and memoization

**Expected Impact**: 30-50% query performance improvement, 20-40% network payload reduction

---

## Security & Permissions

### RBAC System (77 Total Permissions)
```sql
-- Role hierarchy
admin     -- 77 permissions (full system access)
member    -- 42 permissions (full collaboration model)
read_only -- 7 permissions (view-only access)
```

### Permission Categories
- **Entity Permissions**: CRUD operations on deals, leads, people, organizations, tasks
- **System Permissions**: app_settings, custom_fields, wfm operations
- **Google Integration**: Drive, Gmail, Calendar permissions
- **Account Management**: Portfolio management, assignment permissions
- **Business Rules**: Rule management, notification access

### Full Collaboration Model
**Modern CRM Approach**: Team members can edit any record
- **Assignment**: For reporting/accountability only (not access control)
- **Permissions**: `update_any` permissions for member role
- **Security**: Maintained through RLS policies and audit trails
- **Business Logic**: Follows Pipedrive/Salesforce/HubSpot patterns

### Security Features
- **Row Level Security (RLS)**: All tables have comprehensive RLS policies
- **OAuth Integration**: Secure Google API access with extended scopes
- **Audit Trails**: Complete change tracking with immutable history
- **Permission Validation**: Backend validation for all operations
- **Input Sanitization**: SQL injection and XSS prevention

---

## Key Development Principles

### 1. Calendar-Native First
- Google Calendar/Tasks as PRIMARY system
- Native experience with CRM intelligence overlay
- Zero learning curve for calendar functionality

### 2. Security-First Development
- OAuth authentication from day one
- Granular RBAC with least privilege
- Comprehensive audit trails
- Input validation and sanitization

### 3. Business-Focused Testing
- Test what users depend on
- Real scenarios over contrived tests
- Performance validation
- Integration over isolation

### 4. Modern Collaboration Model
- Team editing with assignment for accountability
- Shared ownership of data
- Modern CRM patterns over legacy restrictions

### 5. AI-Optimized Architecture
- GraphQL-first for AI/frontend consistency
- Cognitive workflow tools
- Embedded business intelligence
- Transparent automation

### 6. Business Automation First
- Rules engine integrated into all services
- Template-driven notifications
- Event-based automation
- Complete audit trails

---

*This guide represents the complete state of PipeCD after comprehensive analysis of all migration files (102 total), service implementations, backend architecture, and frontend implementation. The system is a sophisticated enterprise CRM with modern React frontend, GraphQL API, business rules engine, task management system, and production-ready features.*
 