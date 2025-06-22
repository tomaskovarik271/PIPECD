# PipeCD Technical Reference

**Version**: 2.0 | **Last Updated**: January 21, 2025

## 1. Database Schema Reference

### 1.1 Core Tables
- **organizations**: Company management with account_manager_id
- **people**: Contact management with organization relationships  
- **deals**: Sales opportunities with currency and WFM integration
- **leads**: Prospect management with qualification scoring
- **activities**: Task/event management with reminders

### 1.2 Advanced Systems
- **WFM Tables**: wfm_workflows, wfm_statuses, wfm_steps, wfm_projects
- **Custom Fields**: custom_field_definitions, custom_field_values
- **Multi-Currency**: currencies, exchange_rates, user_currency_preferences
- **Conversion System**: conversion_history
- **Activity Reminders**: activity_reminders, activity_reminder_preferences

## 2. Service Layer Architecture

### 2.1 Core Services (lib/)
- `dealService/`: Deal CRUD, history, custom fields
- `leadService/`: Lead qualification, scoring, conversion  
- `organizationService.ts`: Company management, account assignment
- `personService.ts`: Contact management
- `activityService.ts`: Task/event management

### 2.2 Advanced Services
- `aiAgentV2/`: Enhanced AI with Claude Sonnet 4
- `conversionService/`: Bi-directional lead-deal conversion
- `activityReminderService/`: Multi-channel notifications
- `services/currencyService.ts`: Currency management

### 2.3 Integration Services  
- `googleDriveService.ts`: Document management
- `emailService.ts`: Gmail integration
- `googleIntegrationService.ts`: OAuth 2.0 flow

## 3. GraphQL API Structure

### 3.1 Schema Files (26 total)
- Core entities: deal.graphql, lead.graphql, organization.graphql, person.graphql
- Advanced systems: conversion.graphql, currency.graphql, agentV2.graphql
- Integrations: googleDrive.graphql, emails.graphql

### 3.2 Resolver Organization
- Query resolvers: Data fetching operations
- Mutation resolvers: Data modification operations  
- Entity resolvers: Field-level resolvers
- Specialized resolvers: AI, conversion, account management

## 4. Frontend Architecture

### 4.1 Page Structure (18 pages)
- Core CRM: DealsPage, LeadsPage, OrganizationsPage, PeoplePage
- Detail pages: Entity-specific management interfaces
- AI system: AgentPage, AgentV2Page
- Account management: MyAccountsPage

### 4.2 Component Categories
- Entity management: deals/, leads/, organizations/
- Common components: Reusable UI components
- Layout components: Page structure and navigation
- Admin components: System administration

## 5. AI System Implementation

### 5.1 AI Agent V2 Tools
- Entity creation: CreateDealTool, CreateOrganizationTool, CreatePersonTool
- Entity updates: UpdateDealTool, UpdateOrganizationTool, UpdatePersonTool  
- Search: SearchDealsTool
- Cognitive: ThinkTool

### 5.2 Tool Development Pattern
```typescript
export class ExampleTool implements ToolExecutor {
  static definition: ToolDefinition = {
    name: 'tool_name',
    description: 'Tool description',
    input_schema: { /* schema */ }
  };
  
  async execute(params: any, context?: ToolExecutionContext): Promise<any> {
    // Implementation
  }
}
```

## 6. Security Implementation

### 6.1 Authentication & Authorization
- Supabase Auth with JWT tokens
- Role-based access control (admin, member, read_only)
- Row Level Security policies
- Granular permissions (77 admin, 42 member, 7 read_only)

### 6.2 Data Protection
- Encryption at rest and in transit
- Audit trails for all operations
- GDPR-compliant data handling
- GraphQL field-level permissions

## 7. Performance Optimization

### 7.1 Database Optimizations
- Selective field queries (replaced 44 SELECT * queries)
- Indexed queries for frequent operations
- Bulk operations for custom fields
- Query performance monitoring

### 7.2 Frontend Performance
- React.memo and useCallback optimizations
- Component virtualization for large lists
- Parallel data fetching with Promise.all
- Memory leak prevention

## 8. Deployment & Operations

### 8.1 Infrastructure
- Frontend: Netlify CDN hosting
- API: Netlify Serverless Functions
- Database: Supabase managed PostgreSQL
- Background jobs: Inngest workflow engine

### 8.2 Development Workflow
- Local development: `netlify dev` + `supabase start`
- Version control: Git with feature branches
- Database migrations: Versioned SQL files
- Type safety: End-to-end TypeScript

## 9. Key Features Implementation

### 9.1 Account Management System
- Portfolio dashboard with statistics
- Bulk manager assignment
- Activity monitoring with color indicators
- Performance analytics integration

### 9.2 Bi-Directional Conversion System
- Lead → Deal conversion with data preservation
- Deal → Lead conversion with history maintenance
- Bulk conversion operations
- Complete audit trail

### 9.3 Intelligent Duplicate Detection
- Real-time similarity scoring
- Multi-algorithm approach (Levenshtein, fuzzy matching)
- User confirmation workflows
- AI tool integration

### 9.4 Enhanced Email-to-Task
- Claude 3 Haiku AI integration
- Two-step confirmation process
- Professional template system
- Email scope selection (message vs thread)

## 10. Production Status Summary

### 10.1 Operational Modules (16/24)
✅ Deal Management, Lead Management, Organization Management  
✅ Contact Management, Activity Management, AI Agent V2  
✅ Account Management, Conversion System, Duplicate Detection  
✅ Email-to-Task, Multi-Currency, Activity Reminders  
✅ Smart Stickers, Custom Fields, Google Integration, WFM System

### 10.2 Technical Metrics
- Backend services: 25+ modules
- GraphQL operations: 500+ types and operations  
- Frontend components: 100+ components
- Database tables: 50+ with comprehensive migrations
- AI tools: 30+ specialized tools

---

**Document Status**: Audit Ready | **Version**: 1.0  
**Next Review**: February 21, 2025 