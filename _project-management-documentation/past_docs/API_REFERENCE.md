# PipeCD API Reference

**Version:** 2.0  
**Last Updated:** January 2025  
**Base URL:** `/.netlify/functions/graphql`  
**Protocol:** GraphQL over HTTP  

## Quick Start

```bash
# GraphQL Endpoint
POST /.netlify/functions/graphql
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

## Table of Contents

- [Authentication](#authentication)
- [Core Entities API](#core-entities-api)
- [AI Agent API](#ai-agent-api)
- [Smart Stickers API](#smart-stickers-api)
- [Custom Fields API](#custom-fields-api)
- [WFM API](#wfm-api)
- [Relationship Intelligence API](#relationship-intelligence-api)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Authentication

### Bearer Token Authentication
```http
Authorization: Bearer <supabase-jwt-token>
```

### Permission System
All operations respect Row Level Security (RLS) policies:
- Users access only their owned data
- Admin users have extended permissions  
- AI operations respect user context

---

## Core Entities API

### Deal Management

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

#### Deal Operations

**Query Deals**
```graphql
query GetDeals {
  deals {
    id
    name
    amount
    expected_close_date
    currentWfmStep {
      status {
        name
        color
      }
    }
    assignedToUser {
      display_name
      email
    }
  }
}
```

**Create Deal**
```graphql
mutation CreateDeal($input: DealInput!) {
  createDeal(input: $input) {
    id
    name
    amount
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

# Input Type
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

### Lead Management

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
  converted_at: DateTime
  converted_to_deal_id: ID
  converted_to_person_id: ID
  converted_to_organization_id: ID
  wfm_project_id: ID
  user_id: ID!
  created_at: DateTime!
  updated_at: DateTime!
  
  # Relations
  assignedToUser: User
  convertedToDeal: Deal
  convertedToPerson: Person
  convertedToOrganization: Organization
  activities: [Activity!]!
  customFieldValues: [CustomFieldValue!]!
  currentWfmStep: WFMWorkflowStep
}
```

#### Lead Operations

**Query Leads**
```graphql
query GetLeads {
  leads {
    id
    name
    lead_score
    source
    is_qualified
    currentWfmStep {
      status {
        name
        color
      }
    }
  }
}
```

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

# Input Type
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

# Input Type
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

### Person Management

#### Person Type
```graphql
type Person {
  id: ID!
  name: String!
  email: String
  phone: String
  job_title: String
  organization_id: ID
  user_id: ID!
  created_at: DateTime!
  updated_at: DateTime!
  
  # Relations
  organization: Organization
  deals: [Deal!]!
  activities: [Activity!]!
  customFieldValues: [CustomFieldValue!]!
}
```

**Query People**
```graphql
query GetPeople {
  people {
    id
    name
    email
    job_title
    organization {
      id
      name
    }
  }
}
```

**Create Person**
```graphql
mutation CreatePerson($input: PersonInput!) {
  createPerson(input: $input) {
    id
    name
    email
    job_title
    organization {
      id
      name
    }
  }
}

# Input Type  
input PersonInput {
  name: String!
  email: String
  phone: String
  job_title: String
  organization_id: ID
  custom_field_values: [CustomFieldValueInput!]
}
```

### Organization Management

#### Organization Type
```graphql
type Organization {
  id: ID!
  name: String!
  domain: String
  industry: String
  size: String
  website: String
  user_id: ID!
  created_at: DateTime!
  updated_at: DateTime!
  
  # Relations
  people: [Person!]!
  deals: [Deal!]!
  customFieldValues: [CustomFieldValue!]!
}
```

**Query Organizations**
```graphql
query GetOrganizations {
  organizations {
    id
    name
    domain
    industry
    size
    website
  }
}
```

**Create Organization**
```graphql
mutation CreateOrganization($input: OrganizationInput!) {
  createOrganization(input: $input) {
    id
    name
    domain
    industry
    size
    website
  }
}

# Input Type
input OrganizationInput {
  name: String!
  domain: String
  industry: String
  size: String
  website: String
  custom_field_values: [CustomFieldValueInput!]
}
```

### Activity Management

#### Activity Type
```graphql
type Activity {
  id: ID!
  type: String!
  subject: String!
  description: String
  due_date: DateTime
  completed_at: DateTime
  user_id: ID!
  assigned_to_user_id: ID
  deal_id: ID
  person_id: ID
  organization_id: ID
  is_system_activity: Boolean!
  created_at: DateTime!
  updated_at: DateTime!
  
  # Relations
  createdBy: User
  assignedToUser: User
  deal: Deal
  person: Person
  organization: Organization
}
```

**Query Activities**
```graphql
query GetActivities {
  activities {
    id
    type
    subject
    due_date
    completed_at
    assignedToUser {
      display_name
    }
    deal {
      id
      name
    }
  }
}
```

**Create Activity**
```graphql
mutation CreateActivity($input: ActivityInput!) {
  createActivity(input: $input) {
    id
    type
    subject
    due_date
    assignedToUser {
      display_name
    }
  }
}

# Input Type
input ActivityInput {
  type: String!
  subject: String!
  description: String
  due_date: DateTime
  assigned_to_user_id: ID
  deal_id: ID
  person_id: ID
  organization_id: ID
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

type AgentResponse {
  conversation: AgentConversation!
  message: AgentMessage!
  thoughts: [AgentThought!]!
  plan: AgentPlan
}

enum AgentThoughtType {
  REASONING
  QUESTION
  TOOL_CALL
  OBSERVATION
  PLAN
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

# Input Type
input SendMessageInput {
  conversationId: ID # Optional - creates new conversation if not provided
  content: String!
  config: AgentConfigInput
}

input AgentConfigInput {
  maxThinkingSteps: Int
  enableExtendedThinking: Boolean
  thinkingBudget: ThinkingBudget
  maxClarifyingQuestions: Int
  autoExecute: Boolean
}

enum ThinkingBudget {
  STANDARD
  THINK
  THINK_HARD
  THINK_HARDER
  ULTRATHINK
}
```

**Get Agent Conversations**
```graphql
query GetAgentConversations($limit: Int = 10, $offset: Int = 0) {
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

**Discover Available AI Tools**
```graphql
query DiscoverAgentTools {
  discoverAgentTools {
    tools
    error
  }
}
```

### AI Tool Categories (27 Tools Total)

#### Deal Tools (5 tools)
- `search_deals` - Advanced deal filtering
- `get_deal_details` - Complete deal information  
- `create_deal` - Deal creation with custom fields
- `update_deal` - Deal modifications
- `delete_deal` - Deal removal

#### Lead Tools (6 tools)
- `search_leads` - Lead filtering by score/status
- `get_lead_details` - Complete lead information
- `create_lead` - Lead creation with AI scoring
- `qualify_lead` - Mark leads as qualified
- `convert_lead` - Convert to deals/contacts/organizations
- `update_lead_score` - Recalculate AI scores

#### Organization Tools (4 tools)
- `search_organizations` - Find by name/criteria
- `get_organization_details` - Full organization data
- `create_organization` - Organization creation
- `update_organization` - Organization modifications

#### Contact Tools (4 tools)
- `search_contacts` - Find people by name/email
- `get_contact_details` - Complete contact information
- `create_contact` - Contact creation  
- `update_contact` - Contact modifications

#### Activity Tools (5 tools)
- `search_activities` - Filter tasks/meetings/calls
- `get_activity_details` - Activity information
- `create_activity` - Task/meeting/call creation
- `update_activity` - Activity modifications
- `complete_activity` - Mark complete with notes

#### Relationship Tools (5 tools)
- `create_organization_relationship` - Business relationships
- `create_person_relationship` - Personal connections
- `create_stakeholder_analysis` - Stakeholder networks
- `analyze_stakeholder_network` - Network visualization
- `find_missing_stakeholders` - Relationship gaps

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
}

type StickerCategory {
  id: ID!
  name: String!
  color: String!
  icon: String
  description: String
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
```

### Smart Sticker Operations

**Get Entity Stickers**
```graphql
query GetEntityStickers(
  $entityType: EntityType!
  $entityId: ID!
  $filters: StickerFilters
) {
  getEntityStickers(
    entityType: $entityType
    entityId: $entityId
    filters: $filters
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
    }
    totalCount
  }
}

# Filter Input
input StickerFilters {
  categoryIds: [ID!]
  isPinned: Boolean
  priority: StickerPriority
  tags: [String!]
  search: String # Search in title and content
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

# Input Type
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
```

**Update Sticker**
```graphql
mutation UpdateSticker($input: UpdateStickerInput!) {
  updateSticker(input: $input) {
    id
    title
    content
    positionX
    positionY
    lastEditedAt
  }
}

# Input Type
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
  priority: StickerPriority
  tags: [String!]
}
```

**Bulk Move Stickers**
```graphql
mutation MoveStickersBulk($moves: [StickerMoveInput!]!) {
  moveStickersBulk(moves: $moves) {
    id
    positionX
    positionY
    lastEditedAt
  }
}

# Input Type
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

**Get Sticker Categories**
```graphql
query GetStickerCategories {
  getStickerCategories {
    id
    name
    color
    icon
    description
    isSystem
    displayOrder
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
  dropdownOptions: [CustomFieldOption!] # For DROPDOWN/MULTI_SELECT
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

type CustomFieldOption {
  value: String!
  label: String!
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

# Input Type
input CustomFieldDefinitionInput {
  entityType: CustomFieldEntityType!
  fieldName: String!
  fieldLabel: String!
  fieldType: CustomFieldType!
  isRequired: Boolean # Defaults to false
  dropdownOptions: [CustomFieldOptionInput!] # Required for DROPDOWN/MULTI_SELECT
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

**Update Custom Field Definition**
```graphql
mutation UpdateCustomFieldDefinition($id: ID!, $input: CustomFieldDefinitionInput!) {
  updateCustomFieldDefinition(id: $id, input: $input) {
    id
    fieldName
    fieldLabel
    dropdownOptions {
      value
      label
    }
    updatedAt
  }
}
```

**Deactivate Custom Field**
```graphql
mutation DeactivateCustomFieldDefinition($id: ID!) {
  deactivateCustomFieldDefinition(id: $id) {
    id
    isActive
  }
}
```

---

## WFM API

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
    }
  }
}
```

**Get WFM Project Types**
```graphql
query GetWFMProjectTypes {
  wfmProjectTypes {
    id
    name
    description
    isActive
    defaultWorkflow {
      id
      name
      steps {
        id
        stepOrder
        status {
          name
          color
        }
      }
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

# Input Type
input WFMWorkflowInput {
  name: String!
  description: String
  defaultProjectTypeId: ID
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

# Input Type
input OrganizationRelationshipInput {
  fromOrganizationId: ID!
  toOrganizationId: ID!
  relationshipType: OrganizationRelationshipType!
  strength: Float
  description: String
}
```

**Create Person Relationship**
```graphql
mutation CreatePersonRelationship($input: PersonRelationshipInput!) {
  createPersonRelationship(input: $input) {
    id
    relationshipType
    strength
    fromPerson {
      id
      name
    }
    toPerson {
      id
      name
    }
  }
}

# Input Type
input PersonRelationshipInput {
  fromPersonId: ID!
  toPersonId: ID!
  relationshipType: PersonRelationshipType!
  strength: Float
  description: String
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

# Input Type
input StakeholderAnalysisInput {
  entityType: EntityType!
  entityId: ID!
  analysisData: JSON!
  insights: [RelationshipInsightInput!]
  recommendedActions: [String!]
}
```

---

## Error Handling

### Error Response Format
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

### Common Error Codes
- `UNAUTHENTICATED` - Missing or invalid authentication token
- `FORBIDDEN` - Insufficient permissions for the operation
- `NOT_FOUND` - Requested resource does not exist
- `VALIDATION_ERROR` - Input validation failed
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `CONFLICT` - Resource conflict (e.g., duplicate creation)

---

## Examples

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

#### Custom Fields Dynamic Creation
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

#### Lead Conversion Workflow
```typescript
const CONVERT_LEAD = gql`
  mutation ConvertLead($id: ID!, $input: LeadConversionInput!) {
    convertLead(id: $id, input: $input) {
      success
      message
      convertedLead {
        id
        converted_at
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
`;

// Convert lead to deal, person, and organization
const conversion = await graphQLClient.request(CONVERT_LEAD, {
  id: leadId,
  input: {
    target_type: "ALL",
    deal_data: {
      name: "Partnership Deal",
      amount: 75000,
      expected_close_date: "2025-04-15",
      wfm_project_type_id: "sales-project-type-id"
    },
    person_data: {
      name: "John Smith",
      email: "john.smith@company.com",
      job_title: "VP of Sales"
    },
    organization_data: {
      name: "Tech Corp",
      domain: "techcorp.com",
      industry: "Technology"
    },
    preserve_activities: true,
    create_conversion_activity: true
  }
});
```

---

## Rate Limits & Performance

### Rate Limits
- **Standard Operations:** 1000 requests/hour per user
- **AI Agent Operations:** 100 requests/hour per user  
- **Bulk Operations:** 50 requests/hour per user

### Performance Tips
- Use field selection to request only needed data
- Implement pagination for large datasets  
- Cache frequently accessed data client-side
- Batch related operations when possible

---

This API reference covers the complete PipeCD GraphQL API surface. For implementation details and architectural information, refer to the [Developer Guide](DEVELOPER_GUIDE_V2.md). 