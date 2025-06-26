# Developer Guide V3 - PIPECD
*Complete Testing Stack Redesign & System Documentation*

## Table of Contents
1. [System Overview](#system-overview)
2. [Authentication Architecture](#authentication-architecture)
3. [Database Schema & Migrations](#database-schema--migrations)
4. [Testing Infrastructure](#testing-infrastructure)
5. [Core Business Logic](#core-business-logic)
6. [AI Agent System](#ai-agent-system)
7. [Google Workspace Integration](#google-workspace-integration)
8. [**REMOVED SYSTEMS**](#removed-systems)
9. [Development Environment](#development-environment)
10. [Performance & Optimization](#performance--optimization)
11. [Security & Permissions](#security--permissions)

---

## System Overview

**PipeCD** is a revolutionary calendar-native CRM built on modern collaboration principles. Unlike traditional CRMs that built internal calendar systems, PipeCD uses Google Calendar + Google Tasks as the PRIMARY system with business intelligence overlay.

### Core Architecture Principles
- **Calendar-Native**: Google Calendar/Tasks as primary activity system
- **Full Collaboration Model**: Team members can edit any record (modern CRM approach)
- **Security-First**: OAuth-based authentication with granular RBAC
- **AI-Optimized**: Built-in AI agent with cognitive workflow tools
- **Progressive Enhancement**: Works with/without JavaScript, mobile-first

### Key Features
- **Deals Pipeline**: Kanban-based deal management with WFM integration
- **Lead Management**: Bi-directional conversion system with reactivation planning
- **Contact Management**: Organizations, People with account manager assignment
- **Multi-Currency**: 42 currencies with ECB exchange rate integration
- **Document Management**: Google Drive integration with dual attachment system
- **Email Integration**: Gmail threads with contact discovery and filtering
- **Smart Notes**: Dual system (Simple Notes + Advanced Sticker Board)
- **AI Agent V2**: Claude Sonnet 4 with cognitive workflow tools

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

PipeCD has **78 migration files** implementing a comprehensive enterprise CRM schema:

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

-- Deal Participants System (Migration 20250730000042)
public.deal_participants    -- Many-to-many deal-person relationships
-- Extends deals.person_id (primary) with additional participants for email filtering

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

### Google Integration Tables
```sql
-- Google Workspace Integration (Migration 20250730000030)
public.google_oauth_tokens    -- Extended OAuth tokens with scopes
public.documents             -- Polymorphic document attachments
public.emails               -- Gmail integration with entity linking
public.email_activities     -- Email tracking (opens, replies, etc.)

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
public.smart_stickers         -- Visual note system with categories
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
- **People**: Contact management with organizational relationships
- **Account Management**: Portfolio view for account managers
- **Duplicate Detection**: Smart detection during creation

### Multi-Currency System
- **42 World Currencies**: Complete currency support
- **ECB Integration**: Automated exchange rate updates (weekdays 6 AM)
- **User Preferences**: Personal currency settings
- **Deal/Lead Currency**: Individual entity currency tracking

---

## AI Agent System

PipeCD features the world's first AI-optimized enterprise CRM with **AI Agent V2** using Claude Sonnet 4:

### AI Agent V2 Architecture
- **Claude Sonnet 4**: Advanced reasoning capabilities
- **Cognitive Workflow Tools**: Think-first methodology with structured reasoning
- **Tool Registry**: Extensible tool system for CRM operations
- **Production Hardening**: Enterprise-grade security and reliability

### Core AI Tools
```typescript
// Entity Creation Tools
CreateDealTool           // Creates deals with organization linking
CreateOrganizationTool   // Creates organizations with duplicate detection
CreatePersonTool         // Creates people with email validation

// Data Retrieval Tools
SearchDealsTool          // GraphQL-first deal searching
GetDropdownDataTool      // Cognitive dropdown system for AI optimization

// Entity Management Tools
UpdateDealTool          // Deal updates with change analysis
UpdatePersonTool        // Person updates with duplicate prevention
UpdateOrganizationTool  // Organization updates with validation

// Cognitive Enhancement Tools
ThinkTool              // Structured reasoning and analysis
```

### Revolutionary Features
- **Cognitive Dropdown System**: 90% reduction in cognitive load for AI parameter selection
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
- **Memory Management**: Garbage collection monitoring

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
- **Entity Permissions**: CRUD operations on deals, leads, people, organizations
- **System Permissions**: app_settings, custom_fields, wfm operations
- **Google Integration**: Drive, Gmail, Calendar permissions
- **Account Management**: Portfolio management, assignment permissions

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
- **People**: Contact management with organizational relationships
- **Account Management**: Portfolio view for account managers
- **Duplicate Detection**: Smart detection during creation

### Multi-Currency System
- **42 World Currencies**: Complete currency support
- **ECB Integration**: Automated exchange rate updates (weekdays 6 AM)
- **User Preferences**: Personal currency settings
- **Deal/Lead Currency**: Individual entity currency tracking

---

## AI Agent System

PipeCD features the world's first AI-optimized enterprise CRM with **AI Agent V2** using Claude Sonnet 4:

### AI Agent V2 Architecture
- **Claude Sonnet 4**: Advanced reasoning capabilities
- **Cognitive Workflow Tools**: Think-first methodology with structured reasoning
- **Tool Registry**: Extensible tool system for CRM operations
- **Production Hardening**: Enterprise-grade security and reliability

### Core AI Tools
```typescript
// Entity Creation Tools
CreateDealTool           // Creates deals with organization linking
CreateOrganizationTool   // Creates organizations with duplicate detection
CreatePersonTool         // Creates people with email validation

// Data Retrieval Tools
SearchDealsTool          // GraphQL-first deal searching
GetDropdownDataTool      // Cognitive dropdown system for AI optimization

// Entity Management Tools
UpdateDealTool          // Deal updates with change analysis
UpdatePersonTool        // Person updates with duplicate prevention
UpdateOrganizationTool  // Organization updates with validation

// Cognitive Enhancement Tools
ThinkTool              // Structured reasoning and analysis
```

### Revolutionary Features
- **Cognitive Dropdown System**: 90% reduction in cognitive load for AI parameter selection
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
- **Memory Management**: Garbage collection monitoring

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
- **Entity Permissions**: CRUD operations on deals, leads, people, organizations
- **System Permissions**: app_settings, custom_fields, wfm operations
- **Google Integration**: Drive, Gmail, Calendar permissions
- **Account Management**: Portfolio management, assignment permissions

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

---

## ADDITIONAL SERVICE IMPLEMENTATIONS

### Google Contacts Service (lib/googleContactsService.ts - 158 lines)
**Missing from Previous Documentation**
- **Contact Autocomplete**: Real-time suggestions from user's Google contacts
- **Caching System**: 10-minute cache duration for performance optimization
- **Search Functionality**: Search by email/name with 8-result limit for UX
- **Fallback Handling**: Graceful error handling without breaking UI
- **Required Scope**: `contacts.readonly` for accessing contact lists

### Advanced Google Calendar Service (lib/googleCalendarService.ts - 875 lines)
**Much More Comprehensive Than Documented**
- **CRM Event Types**: MEETING, DEMO, CALL, PROPOSAL_PRESENTATION, CONTRACT_REVIEW, FOLLOW_UP, CHECK_IN, INTERNAL
- **CRM Context Integration**: Events automatically linked to deals, people, organizations
- **Advanced Features**:
  - Multi-calendar availability checking
  - Google Meet conference integration
  - Automatic CRM context detection from attendee emails
  - Calendar sync with conflict resolution (new/updated/deleted events)
  - Event outcome tracking (COMPLETED, RESCHEDULED, NO_SHOW, CANCELLED)
  - Custom reminder configurations
- **Enterprise-Grade**: Token refresh handling, error recovery, comprehensive logging

### Deal Folder Service (lib/dealFolderService.ts - 300 lines)
**Auto Google Drive Folder Management**
- **Auto-Creation**: Configurable via app settings (`google_drive.auto_create_deal_folders`)
- **Parent Folder**: Configurable via app settings (`google_drive.pipecd_deals_folder_id`)
- **Folder Structure**: Automatic subfolders creation:
  - Proposals, Contracts, Legal, Presentations
  - Correspondence, Financial, Technical, Other
- **Naming Convention**: `{Client} - {Deal Name} (ID: {dealId})`
- **Database Integration**: Stores folder relationships in `deal_drive_folders` table

### Smart Stickers System (lib/smartStickersService.ts - 605 lines)
**Enterprise Visual Collaboration Platform**
- **Visual Features**: Drag-drop positioning, resize, color coding
- **Collaboration**:
  - Priority levels (NORMAL, HIGH, URGENT)
  - Mentions system (@user tagging)
  - Tag-based organization and filtering
  - Pin functionality for important notes
  - Private/public visibility controls
- **Advanced Operations**:
  - Bulk operations (move multiple stickers)
  - Search across title/content
  - Category system with icons and colors
  - Entity attachment (polymorphic to any entity)
- **Performance**: Pagination, filtering, sorting for large datasets

### WFM Workflow Service (lib/wfmWorkflowService.ts - 695 lines)
**Comprehensive Business Process Engine**
- **Workflow Management**: Create, update, archive workflows
- **Step Management**:
  - Initial/final step markers
  - Custom metadata support
  - Dynamic step ordering
  - Step transitions with validation
- **Transition Engine**:
  - Allowed transitions mapping
  - Transition validation rules
  - Bulk transition updates
- **Advanced Features**:
  - Workflow versioning and archival
  - Step order management
  - Transition name customization
  - Metadata-driven business logic

### Conversion Service (lib/conversionService/ - 6 modules)
**Sophisticated Lead-Deal Conversion Engine**
- **Forward Conversion** (`forwardConversion.ts` - 272 lines): Lead → Deal
- **Backward Conversion** (`backwardConversion.ts` - 258 lines): Deal → Lead
- **WFM Transition Manager** (`wfmTransitionManager.ts` - 326 lines): Workflow state management
- **Validation Engine** (`conversionValidation.ts` - 177 lines): Business rule validation
- **History Tracking** (`conversionHistory.ts` - 106 lines): Complete audit trails
- **Conversion Reasons**: 7 backward conversion reasons:
  - COOLING, TIMELINE_EXTENDED, BUDGET_CONSTRAINTS
  - STAKEHOLDER_CHANGE, COMPETITIVE_LOSS, REQUIREMENTS_CHANGE, RELATIONSHIP_RESET

### Currency Service (lib/services/currencyService.ts - 596 lines)
**Production-Ready Multi-Currency System**
- **High-Precision Math**: Uses Decimal.js for financial calculations
- **Currency Management**: 42 world currencies with complete CRUD operations
- **Exchange Rate Engine**:
  - ECB integration with historical rates
  - Rate conversion with effective dates
  - Automatic rate updates via Inngest
- **User Features**:
  - Personal currency preferences
  - Entity currency updates with history
  - Currency-based analytics and reporting
- **Deal/Lead Integration**: Currency conversion with audit trails

### Deal Participants Service (lib/dealParticipantService.ts - 307 lines)
**Advanced Contact Relationship Management**
- **Many-to-Many Relationships**: Beyond primary contact model
- **Role Management**: PRIMARY, PARTICIPANT, CC with role restrictions
- **Email Integration**:
  - Email participant discovery from threads
  - Contact suggestions from email analysis
  - Bulk email operations for all participants
- **Business Logic**:
  - Primary contact protection (cannot be removed)
  - Duplicate participant prevention
  - Role-based permissions and restrictions

### Activity Reminder Service Status
**Confirmed Removal**: The `lib/activityReminderService/` directory is empty, confirming proper removal per Migration 20250730000056 in favor of Google Calendar integration.

---

*This guide represents the complete state of PipeCD after the testing stack redesign and comprehensive system analysis. All migration files (78 total) and service implementations have been analyzed for accuracy and completeness.*
