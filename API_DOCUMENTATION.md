# PipeCD API Documentation

**Version:** 2.0  
**Last Updated:** January 2025  
**Base URL:** `/.netlify/functions/graphql`  
**Protocol:** GraphQL over HTTP  

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Core GraphQL API](#core-graphql-api)
3. [AI Agent API](#ai-agent-api)
4. [Smart Stickers API](#smart-stickers-api)
5. [Custom Fields API](#custom-fields-api)
6. [WFM (Workflow Management) API](#wfm-workflow-management-api)
7. [Relationship Intelligence API](#relationship-intelligence-api)
8. [Google Integration API](#google-integration-api)
9. [Email Management API](#email-management-api)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Code Examples](#code-examples)

---

## Authentication & Authorization

### Authentication Method
**Type:** Bearer Token (JWT)  
**Provider:** Supabase Auth  
**Header:** `Authorization: Bearer <jwt-token>`

### Required Headers
```http
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

### Row Level Security (RLS)
All database operations respect PostgreSQL Row Level Security policies:
- Users can only access data they own or are assigned to
- Admin users have extended permissions
- System operations use service role authentication

### Permission System
```typescript
interface UserPermissions {
  'deal:create' | 'deal:read_own' | 'deal:read_any' | 'deal:update' | 'deal:delete'
  'lead:create' | 'lead:read_own' | 'lead:read_any' | 'lead:update' | 'lead:delete'
  'person:create' | 'person:read_own' | 'person:read_any' | 'person:update' | 'person:delete'
  'organization:create' | 'organization:read_own' | 'organization:read_any' | 'organization:update' | 'organization:delete'
  'custom_field:create' | 'custom_field:read' | 'custom_field:update' | 'custom_field:delete'
  'wfm_workflow:read_any' | 'wfm_workflow:create' | 'wfm_workflow:update' | 'wfm_workflow:delete'
}
```

---

## Core GraphQL API

### Schema Overview

#### Root Types
```graphql
type Query {
  # Health & Status
  health: String!
  supabaseConnectionTest: String!
  me: User
  
  # Core Entities
  deals: [Deal!]!
  deal(id: ID!): Deal
  leads: [Lead!]!
  lead(id: ID!): Lead
  people: [Person!]!
  person(id: ID!): Person
  organizations: [Organization!]!
  organization(id: ID!): Organization
  activities: [Activity!]!
  activity(id: ID!): Activity
}

type Mutation {
  # Deal Operations
  createDeal(input: DealInput!): Deal!
  updateDeal(id: ID!, input: DealUpdateInput!): Deal
  deleteDeal(id: ID!): Boolean
  updateDealWFMProgress(dealId: ID!, targetWfmWorkflowStepId: ID!): Deal!
  
  # Lead Operations
  createLead(input: LeadInput!): Lead!
  updateLead(id: ID!, input: LeadUpdateInput!): Lead
  deleteLead(id: ID!): Boolean
  convertLead(id: ID!, input: LeadConversionInput!): LeadConversionResult!
  recalculateLeadScore(leadId: ID!): Lead!
  updateLeadWFMProgress(leadId: ID!, targetWfmWorkflowStepId: ID!): Lead!
  
  # Person Operations
  createPerson(input: PersonInput!): Person!
  updatePerson(id: ID!, input: PersonInput!): Person
  deletePerson(id: ID!): Boolean
  
  # Organization Operations
  createOrganization(input: OrganizationInput!): Organization!
  updateOrganization(id: ID!, input: OrganizationInput!): Organization
  deleteOrganization(id: ID!): Boolean
  
  # Activity Operations
  createActivity(input: ActivityInput!): Activity!
  updateActivity(id: ID!, input: ActivityInput!): Activity
  deleteActivity(id: ID!): ID
}
```

### Deal Management API

#### Deal Type
```graphql
type Deal {
  id: ID!
  name: String!
  amount: Float
  expected_close_date: String
  deal_specific_probability: Float
  weighted_amount: Float # Calculated field
  user_id: ID!
  assigned_to_user_id: ID
  person_id: ID
  organization_id: ID
  wfm_project_id: ID
  created_at: DateTime!
  updated_at: DateTime!
  
  # Relations
  createdBy: User
  assignedToUser: User
  person: Person
  organization: Organization
  activities: [Activity!]!
  customFieldValues: [CustomFieldValue!]!
  history: [DealHistoryEntry!]!
  currentWfmStep: WFMWorkflowStep
  currentWfmStatus: WFMStatus
}
```

#### Deal Input Types
```graphql
input DealInput {
  name: String!
  amount: Float
  expected_close_date: String
  deal_specific_probability: Float
  assigned_to_user_id: ID
  person_id: ID
  organization_id: ID
  wfm_project_type_id: ID!
  custom_field_values: [CustomFieldValueInput!]
}

input DealUpdateInput {
  name: String
  amount: Float
  expected_close_date: String
  deal_specific_probability: Float
  assigned_to_user_id: ID
  person_id: ID
  organization_id: ID
  custom_field_values: [CustomFieldValueInput!]
}
```

#### Deal Operations

**Create Deal**
```graphql
mutation CreateDeal($input: DealInput!) {
  createDeal(input: $input) {
    id
    name
    amount
    expected_close_date
    currentWfmStep {
      id
      status {
        name
        color
      }
    }
    customFieldValues {
      definition {
        fieldName
        fieldLabel
      }
      stringValue
      numberValue
    }
  }
}
```

**Update Deal**
```graphql
mutation UpdateDeal($id: ID!, $input: DealUpdateInput!) {
  updateDeal(id: $id, input: $input) {
    id
    name
    amount
    updated_at
  }
}
```

**Move Deal Through Workflow**
```graphql
mutation UpdateDealWFMProgress($dealId: ID!, $targetWfmWorkflowStepId: ID!) {
  updateDealWFMProgress(dealId: $dealId, targetWfmWorkflowStepId: $targetWfmWorkflowStepId) {
    id
    currentWfmStep {
      id
      status {
        name
        color
      }
    }
    history {
      id
      eventType
      timestamp
      changes
    }
  }
}
```

### Lead Management API

#### Lead Type
```graphql
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
  estimated_close_date: String
  lead_score: Int!
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
  last_activity_at: DateTime
  automation_score_factors: JSON
  ai_insights: JSON
  user_id: ID!
  created_at: DateTime!
  updated_at: DateTime!
  
  # Relations
  assignedToUser: User
  convertedToDeal: Deal
  convertedToPerson: Person
  convertedToOrganization: Organization
  convertedByUser: User
  activities: [Activity!]!
  customFieldValues: [CustomFieldValue!]!
  history: [LeadHistoryEntry!]!
  currentWfmStep: WFMWorkflowStep
  currentWfmStatus: WFMStatus
}
```

#### Lead Input Types
```graphql
input LeadInput {
  name: String!
  source: String
  description: String
  contact_name: String
  contact_email: String
  contact_phone: String
  company_name: String
  estimated_value: Float
  estimated_close_date: String
  assigned_to_user_id: ID
  custom_field_values: [CustomFieldValueInput!]
}

input LeadConversionInput {
  target_type: LeadConversionTargetType!
  deal_data: DealInput
  person_data: PersonInput
  organization_data: OrganizationInput
  preserve_activities: Boolean!
  create_conversion_activity: Boolean!
}

enum LeadConversionTargetType {
  DEAL
  PERSON
  ORGANIZATION
  ALL
}
```

#### Lead Operations

**Create Lead**
```graphql
mutation CreateLead($input: LeadInput!) {
  createLead(input: $input) {
    id
    name
    lead_score
    lead_score_factors
    currentWfmStep {
      id
      status {
        name
        color
      }
    }
  }
}
```

**Convert Lead**
```graphql
mutation ConvertLead($id: ID!, $input: LeadConversionInput!) {
  convertLead(id: $id, input: $input) {
    success
    message
    convertedLead {
      id
      converted_at
      converted_to_deal_id
      converted_to_person_id
      converted_to_organization_id
    }
    createdDeal {
      id
      name
      amount
    }
    createdPerson {
      id
      name
      email
    }
    createdOrganization {
      id
      name
    }
  }
}
```

**Recalculate Lead Score**
```graphql
mutation RecalculateLeadScore($leadId: ID!) {
  recalculateLeadScore(leadId: $leadId) {
    id
    lead_score
    lead_score_factors
    ai_insights
  }
}
```

---

## AI Agent API

### Agent Conversation Management

#### Agent Types
```graphql
type AgentConversation {
  id: ID!
  userId: ID!
  messages: [AgentMessage!]!
  plan: AgentPlan
  context: JSON!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type AgentMessage {
  role: String! # 'user' | 'assistant' | 'system'
  content: String!
  timestamp: DateTime!
  thoughts: [AgentThought!]
}

type AgentThought {
  id: ID!
  conversationId: ID!
  type: AgentThoughtType!
  content: String!
  metadata: JSON!
  timestamp: DateTime!
}

enum AgentThoughtType {
  REASONING
  QUESTION
  TOOL_CALL
  OBSERVATION
  PLAN
}

type AgentResponse {
  conversation: AgentConversation!
  message: AgentMessage!
  thoughts: [AgentThought!]!
  plan: AgentPlan
}
```

#### Agent Configuration
```graphql
type AgentConfig {
  maxThinkingSteps: Int!
  enableExtendedThinking: Boolean!
  thinkingBudget: ThinkingBudget!
  maxClarifyingQuestions: Int!
  autoExecute: Boolean!
}

enum ThinkingBudget {
  STANDARD
  THINK
  THINK_HARD
  THINK_HARDER
  ULTRATHINK
}

input AgentConfigInput {
  maxThinkingSteps: Int
  enableExtendedThinking: Boolean
  thinkingBudget: ThinkingBudget
  maxClarifyingQuestions: Int
  autoExecute: Boolean
}
```

#### Agent Operations

**Send Message to AI Agent**
```graphql
mutation SendAgentMessage($input: SendMessageInput!) {
  sendAgentMessage(input: $input) {
    conversation {
      id
      messages {
        role
        content
        timestamp
        thoughts {
          type
          content
          metadata
        }
      }
    }
    message {
      role
      content
      thoughts {
        type
        content
      }
    }
    thoughts {
      type
      content
      metadata
    }
  }
}
```

**Input Type**
```graphql
input SendMessageInput {
  conversationId: ID # Optional - creates new conversation if not provided
  content: String!
  config: AgentConfigInput
}
```

**Create New Conversation**
```graphql
mutation CreateAgentConversation($config: AgentConfigInput) {
  createAgentConversation(config: $config) {
    id
    userId
    context
    createdAt
  }
}
```

**Get Conversations**
```graphql
query GetAgentConversations($limit: Int, $offset: Int) {
  agentConversations(limit: $limit, offset: $offset) {
    id
    messages {
      role
      content
      timestamp
    }
    createdAt
    updatedAt
  }
}
```

### AI Tools Discovery

**Discover Available Tools**
```graphql
query DiscoverAgentTools {
  discoverAgentTools {
    tools
    error
  }
}
```

**Response Format:**
```json
{
  "tools": [
    {
      "name": "search_deals",
      "description": "Search for deals with advanced filtering",
      "parameters": {
        "type": "object",
        "properties": {
          "search_term": {"type": "string"},
          "assigned_to": {"type": "string"},
          "min_amount": {"type": "number"},
          "max_amount": {"type": "number"},
          "limit": {"type": "number", "default": 20}
        }
      }
    }
  ]
}
```

### AI Tool Categories

#### Deal Tools (5 tools)
- `search_deals` - Advanced deal filtering and discovery
- `get_deal_details` - Complete deal information with custom fields
- `create_deal` - Full deal creation with custom fields support
- `update_deal` - Deal modifications and updates
- `delete_deal` - Deal removal with validation

#### Lead Tools (6 tools)
- `search_leads` - Lead filtering by score, qualification status, source
- `get_lead_details` - Complete lead information with scoring factors
- `create_lead` - Lead creation with AI scoring
- `qualify_lead` - Mark leads as qualified with notes
- `convert_lead` - Convert leads to deals/contacts/organizations
- `update_lead_score` - Recalculate AI-powered lead scores

#### Custom Fields Tools (2 tools)
- `get_custom_field_definitions` - List available custom fields by entity type
- `create_custom_field_definition` - Create new field types on-demand

#### Organization Tools (4 tools)
- `search_organizations` - Find organizations by name/criteria
- `get_organization_details` - Full organization data with custom fields
- `create_organization` - Organization creation
- `update_organization` - Organization modifications

#### Contact Tools (4 tools)
- `search_contacts` - Find people by name, email, organization
- `get_contact_details` - Complete contact information with custom fields
- `create_contact` - Contact creation
- `update_contact` - Contact modifications

#### Activity Tools (5 tools)
- `search_activities` - Filter tasks/meetings/calls
- `get_activity_details` - Activity information
- `create_activity` - Task/meeting/call creation
- `update_activity` - Activity modifications
- `complete_activity` - Mark activities complete with notes

#### Relationship Intelligence Tools (5 tools)
- `create_organization_relationship` - Create business relationships
- `create_person_relationship` - Map personal connections
- `create_stakeholder_analysis` - Analyze stakeholder networks
- `analyze_stakeholder_network` - Network visualization data
- `find_missing_stakeholders` - Identify relationship gaps

---

## Smart Stickers API

### Smart Sticker Types
```graphql
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
  mentions: [ID!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  createdByUserId: ID!
  lastEditedByUserId: ID
  lastEditedAt: DateTime
  createdBy: User
  lastEditedBy: User
}

type StickerCategory {
  id: ID!
  name: String!
  color: String!
  icon: String
  description: String
  isSystem: Boolean!
  displayOrder: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
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
```

### Smart Sticker Operations

**Get Entity Stickers**
```graphql
query GetEntityStickers(
  $entityType: EntityType!
  $entityId: ID!
  $filters: StickerFilters
  $sortBy: StickerSortBy
  $first: Int = 20
  $after: String
) {
  getEntityStickers(
    entityType: $entityType
    entityId: $entityId
    filters: $filters
    sortBy: $sortBy
    first: $first
    after: $after
  ) {
    nodes {
      id
      title
      content
      positionX
      positionY
      width
      height
      color
      isPinned
      priority
      tags
      category {
        id
        name
        color
        icon
      }
      createdAt
    }
    totalCount
    hasNextPage
    hasPreviousPage
  }
}
```

**Create Sticker**
```graphql
mutation CreateSticker($input: CreateStickerInput!) {
  createSticker(input: $input) {
    id
    title
    content
    positionX
    positionY
    width
    height
    color
    isPinned
    priority
    category {
      id
      name
      color
    }
  }
}
```

**Input Types**
```graphql
input CreateStickerInput {
  entityType: EntityType!
  entityId: ID!
  title: String!
  content: String
  categoryId: ID
  positionX: Int = 0
  positionY: Int = 0
  width: Int = 200
  height: Int = 150
  color: String = "#FFE066"
  isPinned: Boolean = false
  isPrivate: Boolean = false
  priority: StickerPriority = NORMAL
  mentions: [ID!] = []
  tags: [String!] = []
}

input UpdateStickerInput {
  id: ID!
  title: String
  content: String
  categoryId: ID
  positionX: Int
  positionY: Int
  width: Int
  height: Int
  color: String
  isPinned: Boolean
  isPrivate: Boolean
  priority: StickerPriority
  mentions: [ID!]
  tags: [String!]
}

input StickerFilters {
  entityType: EntityType
  entityId: ID
  categoryIds: [ID!]
  isPinned: Boolean
  isPrivate: Boolean
  priority: StickerPriority
  tags: [String!]
  createdByUserId: ID
  search: String # Search in title and content
}
```

**Bulk Operations**
```graphql
mutation MoveStickersBulk($moves: [StickerMoveInput!]!) {
  moveStickersBulk(moves: $moves) {
    id
    positionX
    positionY
    lastEditedAt
  }
}

input StickerMoveInput {
  id: ID!
  positionX: Int!
  positionY: Int!
}
```

**Toggle Pin Status**
```graphql
mutation ToggleStickerPin($id: ID!) {
  toggleStickerPin(id: $id) {
    id
    isPinned
  }
}
```

---

## Custom Fields API

### Custom Field Types
```graphql
type CustomFieldDefinition {
  id: ID!
  entityType: CustomFieldEntityType!
  fieldName: String! # Internal name, unique per entity_type
  fieldLabel: String! # Display name for UI
  fieldType: CustomFieldType!
  isRequired: Boolean!
  dropdownOptions: [CustomFieldOption!] # Null if not DROPDOWN or MULTI_SELECT
  isActive: Boolean!
  displayOrder: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type CustomFieldValue {
  definition: CustomFieldDefinition!
  stringValue: String
  numberValue: Float
  booleanValue: Boolean
  dateValue: DateTime
  selectedOptionValues: [String!] # For MULTI_SELECT
}

enum CustomFieldType {
  TEXT
  NUMBER
  DATE
  BOOLEAN
  DROPDOWN
  MULTI_SELECT
}

enum CustomFieldEntityType {
  DEAL
  PERSON
  ORGANIZATION
  LEAD
}
```

### Custom Field Operations

**Get Custom Field Definitions**
```graphql
query GetCustomFieldDefinitions(
  $entityType: CustomFieldEntityType!
  $includeInactive: Boolean = false
) {
  customFieldDefinitions(
    entityType: $entityType
    includeInactive: $includeInactive
  ) {
    id
    fieldName
    fieldLabel
    fieldType
    isRequired
    dropdownOptions {
      value
      label
    }
    isActive
    displayOrder
  }
}
```

**Create Custom Field Definition**
```graphql
mutation CreateCustomFieldDefinition($input: CustomFieldDefinitionInput!) {
  createCustomFieldDefinition(input: $input) {
    id
    fieldName
    fieldLabel
    fieldType
    dropdownOptions {
      value
      label
    }
    createdAt
  }
}
```

**Input Types**
```graphql
input CustomFieldDefinitionInput {
  entityType: CustomFieldEntityType!
  fieldName: String!
  fieldLabel: String!
  fieldType: CustomFieldType!
  isRequired: Boolean # Defaults to false
  dropdownOptions: [CustomFieldOptionInput!] # Required if fieldType is DROPDOWN or MULTI_SELECT
  displayOrder: Int # Defaults to 0
}

input CustomFieldOptionInput {
  value: String!
  label: String!
}

input CustomFieldValueInput {
  definitionId: ID!
  stringValue: String
  numberValue: Float
  booleanValue: Boolean
  dateValue: DateTime
  selectedOptionValues: [String!] # For MULTI_SELECT
}
```

---

## WFM (Workflow Management) API

### WFM Types
```graphql
type WFMStatus {
  id: ID!
  name: String!
  description: String
  color: String!
  isArchived: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type WFMWorkflow {
  id: ID!
  name: String!
  description: String
  isActive: Boolean!
  defaultProjectTypeId: ID
  createdAt: DateTime!
  updatedAt: DateTime!
  steps: [WFMWorkflowStep!]!
  transitions: [WFMWorkflowTransition!]!
}

type WFMWorkflowStep {
  id: ID!
  workflowId: ID!
  statusId: ID!
  stepOrder: Int!
  isInitialStep: Boolean!
  isFinalStep: Boolean!
  metadata: JSON!
  status: WFMStatus!
  workflow: WFMWorkflow!
}

type WFMProjectType {
  id: ID!
  name: String!
  description: String
  defaultWorkflowId: ID
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  defaultWorkflow: WFMWorkflow
}

type WFMProject {
  id: ID!
  projectTypeId: ID!
  workflowId: ID!
  currentStepId: ID
  sourceEntityId: ID
  createdAt: DateTime!
  updatedAt: DateTime!
  projectType: WFMProjectType!
  workflow: WFMWorkflow!
  currentStep: WFMWorkflowStep
}
```

### WFM Operations

**Get WFM Workflows**
```graphql
query GetWFMWorkflows($includeInactive: Boolean = false) {
  wfmWorkflows(includeInactive: $includeInactive) {
    id
    name
    description
    isActive
    steps {
      id
      stepOrder
      isInitialStep
      isFinalStep
      metadata
      status {
        id
        name
        color
      }
    }
    transitions {
      id
      fromStepId
      toStepId
      conditions
    }
  }
}
```

**Create WFM Workflow**
```graphql
mutation CreateWFMWorkflow($input: WFMWorkflowInput!) {
  createWFMWorkflow(input: $input) {
    id
    name
    description
    isActive
    createdAt
  }
}
```

---

## Relationship Intelligence API

### Relationship Types
```graphql
type OrganizationRelationship {
  id: ID!
  fromOrganizationId: ID!
  toOrganizationId: ID!
  relationshipType: OrganizationRelationshipType!
  strength: Float
  description: String
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  fromOrganization: Organization!
  toOrganization: Organization!
}

type PersonRelationship {
  id: ID!
  fromPersonId: ID!
  toPersonId: ID!
  relationshipType: PersonRelationshipType!
  strength: Float
  description: String
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  fromPerson: Person!
  toPerson: Person!
}

type StakeholderAnalysis {
  id: ID!
  entityType: EntityType!
  entityId: ID!
  analysisData: JSON!
  insights: [RelationshipInsight!]!
  recommendedActions: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum OrganizationRelationshipType {
  PARENT_COMPANY
  SUBSIDIARY
  PARTNER
  COMPETITOR
  VENDOR
  CLIENT
  ACQUISITION_TARGET
}

enum PersonRelationshipType {
  COLLEAGUE
  MANAGER
  DIRECT_REPORT
  MENTOR
  MENTEE
  CONTACT
  INFLUENCER
  DECISION_MAKER
}
```

### Relationship Operations

**Create Organization Relationship**
```graphql
mutation CreateOrganizationRelationship($input: OrganizationRelationshipInput!) {
  createOrganizationRelationship(input: $input) {
    id
    relationshipType
    strength
    fromOrganization {
      id
      name
    }
    toOrganization {
      id
      name
    }
  }
}
```

**Create Stakeholder Analysis**
```graphql
mutation CreateStakeholderAnalysis($input: StakeholderAnalysisInput!) {
  createStakeholderAnalysis(input: $input) {
    id
    entityType
    entityId
    analysisData
    insights {
      id
      type
      description
      priority
      status
    }
    recommendedActions
  }
}
```

---

## Google Integration API

### Google Integration Types
```graphql
type GoogleIntegrationStatus {
  isConnected: Boolean!
  connectedEmail: String
  hasValidTokens: Boolean!
  lastSyncAt: DateTime
  permissions: [String!]!
}

type DriveFile {
  id: ID!
  name: String!
  mimeType: String!
  size: String
  webViewLink: String
  downloadLink: String
  parentIds: [String!]!
  createdTime: DateTime!
  modifiedTime: DateTime!
}

type DriveFolderStructure {
  dealId: ID!
  rootFolderId: String!
  subfolders: JSON!
  createdAt: DateTime!
}
```

### Google Integration Operations

**Connect Google Integration**
```graphql
mutation ConnectGoogleIntegration($input: ConnectGoogleIntegrationInput!) {
  connectGoogleIntegration(input: $input) {
    isConnected
    connectedEmail
    hasValidTokens
    permissions
  }
}
```

**Upload to Google Drive**
```graphql
mutation UploadToGoogleDrive(
  $entityType: String!
  $entityId: ID!
  $fileName: String!
  $fileContent: String!
  $mimeType: String!
) {
  uploadToGoogleDrive(
    entityType: $entityType
    entityId: $entityId
    fileName: $fileName
    fileContent: $fileContent
    mimeType: $mimeType
  ) {
    id
    name
    webViewLink
  }
}
```

---

## Error Handling

### Error Response Format
```typescript
interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: {
    code: string;
    details?: any;
  };
}
```

### Common Error Codes
- `UNAUTHENTICATED` - Missing or invalid authentication token
- `FORBIDDEN` - Insufficient permissions for the operation
- `NOT_FOUND` - Requested resource does not exist
- `VALIDATION_ERROR` - Input validation failed
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `CONFLICT` - Resource conflict (e.g., duplicate creation)

### Error Examples
```json
{
  "errors": [
    {
      "message": "Deal not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["deal"],
      "extensions": {
        "code": "NOT_FOUND",
        "details": {
          "dealId": "123e4567-e89b-12d3-a456-426614174000"
        }
      }
    }
  ],
  "data": {
    "deal": null
  }
}
```

---

## Rate Limiting

### Rate Limits
- **Authentication Required Queries:** 1000 requests/hour per user
- **AI Agent Operations:** 100 requests/hour per user  
- **Bulk Operations:** 50 requests/hour per user
- **Anonymous Health Checks:** 10 requests/minute per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Code Examples

### JavaScript/TypeScript Client Setup

#### Using GraphQL Request
```typescript
import { GraphQLClient } from 'graphql-request';

const endpoint = 'https://your-domain.netlify.app/.netlify/functions/graphql';

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${supabaseJwtToken}`,
  },
});
```

#### Using Apollo Client
```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://your-domain.netlify.app/.netlify/functions/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('supabase.auth.token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

### Common Operations Examples

#### Create Deal with Custom Fields
```typescript
const CREATE_DEAL = gql`
  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
      id
      name
      amount
      currentWfmStep {
        status {
          name
          color
        }
      }
      customFieldValues {
        definition {
          fieldLabel
          fieldType
        }
        stringValue
        numberValue
      }
    }
  }
`;

const newDeal = await graphQLClient.request(CREATE_DEAL, {
  input: {
    name: "Enterprise Software Deal",
    amount: 50000,
    expected_close_date: "2025-03-01",
    person_id: "123e4567-e89b-12d3-a456-426614174000",
    wfm_project_type_id: "wfm-sales-type-id",
    custom_field_values: [
      {
        definitionId: "custom-field-def-id",
        stringValue: "High Priority"
      },
      {
        definitionId: "custom-field-number-id",
        numberValue: 85
      }
    ]
  }
});
```

#### AI Agent Conversation
```typescript
const SEND_AGENT_MESSAGE = gql`
  mutation SendAgentMessage($input: SendMessageInput!) {
    sendAgentMessage(input: $input) {
      conversation {
        id
        messages {
          role
          content
          timestamp
          thoughts {
            type
            content
            metadata
          }
        }
      }
      message {
        content
        thoughts {
          type
          content
        }
      }
    }
  }
`;

const aiResponse = await graphQLClient.request(SEND_AGENT_MESSAGE, {
  input: {
    content: "Create a deal for Microsoft partnership worth $100k closing in March",
    config: {
      thinkingBudget: "THINK_HARD",
      autoExecute: false
    }
  }
});
```

#### Smart Stickers Management
```typescript
const CREATE_STICKER = gql`
  mutation CreateSticker($input: CreateStickerInput!) {
    createSticker(input: $input) {
      id
      title
      positionX
      positionY
      category {
        name
        color
      }
    }
  }
`;

const GET_ENTITY_STICKERS = gql`
  query GetEntityStickers($entityType: EntityType!, $entityId: ID!) {
    getEntityStickers(entityType: $entityType, entityId: $entityId) {
      nodes {
        id
        title
        content
        positionX
        positionY
        isPinned
        priority
        tags
      }
    }
  }
`;

// Create a sticker
const sticker = await graphQLClient.request(CREATE_STICKER, {
  input: {
    entityType: "DEAL",
    entityId: dealId,
    title: "Important Note",
    content: "Client prefers evening calls",
    categoryId: "important-category-id",
    positionX: 100,
    positionY: 150,
    isPinned: true,
    tags: ["client-preference", "scheduling"]
  }
});

// Get all stickers for a deal
const stickers = await graphQLClient.request(GET_ENTITY_STICKERS, {
  entityType: "DEAL",
  entityId: dealId
});
```

### Custom Fields Dynamic Creation
```typescript
const CREATE_CUSTOM_FIELD = gql`
  mutation CreateCustomFieldDefinition($input: CustomFieldDefinitionInput!) {
    createCustomFieldDefinition(input: $input) {
      id
      fieldName
      fieldLabel
      fieldType
      dropdownOptions {
        value
        label
      }
    }
  }
`;

// Create a dropdown custom field
const customField = await graphQLClient.request(CREATE_CUSTOM_FIELD, {
  input: {
    entityType: "DEAL",
    fieldName: "deal_priority",
    fieldLabel: "Deal Priority",
    fieldType: "DROPDOWN",
    isRequired: false,
    dropdownOptions: [
      { value: "low", label: "Low Priority" },
      { value: "medium", label: "Medium Priority" },
      { value: "high", label: "High Priority" },
      { value: "urgent", label: "Urgent" }
    ]
  }
});
```

---

## Performance Considerations

### Query Optimization
- Use field selection to request only needed data
- Implement pagination for large datasets
- Cache frequently accessed data client-side
- Use DataLoader pattern for N+1 query prevention

### Best Practices
- Batch related operations when possible
- Use optimistic updates for better UX
- Implement proper error boundaries
- Monitor GraphQL query complexity
- Use persisted queries for production

### Monitoring & Observability
- Track query performance metrics
- Monitor error rates by operation
- Implement distributed tracing
- Set up alerts for rate limit violations
- Log slow queries for optimization

---

This documentation covers the complete PipeCD API surface. For additional questions or support, refer to the Developer Guide or contact the development team. 