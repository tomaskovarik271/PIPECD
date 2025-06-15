# PipeCD API Reference Documentation

**Version:** 2.0  
**Last Updated:** January 2025  
**Base URL:** `/.netlify/functions/graphql`  
**Protocol:** GraphQL over HTTP  

## Table of Contents

1. [Authentication](#authentication)
2. [Core Entities API](#core-entities-api)
3. [AI Agent API](#ai-agent-api)
4. [Smart Stickers API](#smart-stickers-api)
5. [Custom Fields API](#custom-fields-api)
6. [WFM API](#wfm-api)

8. [Error Handling](#error-handling)
9. [Examples](#examples)

---

## Authentication

### Bearer Token Authentication
```http
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

### Permission System
All operations respect Row Level Security (RLS) policies ensuring users only access data they own or are assigned to.

---

## Core Entities API

### Deal Management

#### Deal Type Definition
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

**Query All Deals**
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

**Get Specific Deal**
```graphql
query GetDeal($id: ID!) {
  deal(id: $id) {
    id
    name
    amount
    expected_close_date
    deal_specific_probability
    weighted_amount
    person {
      id
      name
      email
    }
    organization {
      id
      name
      domain
    }
    activities {
      id
      type
      subject
      due_date
      completed_at
    }
    customFieldValues {
      definition {
        fieldName
        fieldLabel
        fieldType
      }
      stringValue
      numberValue
      booleanValue
      dateValue
    }
    history {
      id
      eventType
      timestamp
      changes
      user {
        display_name
      }
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
```

**Update Deal**
```graphql
mutation UpdateDeal($id: ID!, $input: DealUpdateInput!) {
  updateDeal(id: $id, input: $input) {
    id
    name
    amount
    updated_at
    history {
      id
      eventType
      timestamp
      changes
    }
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

**Delete Deal**
```graphql
mutation DeleteDeal($id: ID!) {
  deleteDeal(id: $id)
}
```

### Lead Management

#### Lead Type Definition
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

input LeadUpdateInput {
  name: String
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

**Query All Leads**
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
    assignedToUser {
      display_name
    }
  }
}
```

**Get Specific Lead**
```graphql
query GetLead($id: ID!) {
  lead(id: $id) {
    id
    name
    lead_score
    lead_score_factors
    is_qualified
    qualification_notes
    ai_insights
    activities {
      id
      type
      subject
      due_date
    }
    customFieldValues {
      definition {
        fieldLabel
      }
      stringValue
      numberValue
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

**Update Lead WFM Progress**
```graphql
mutation UpdateLeadWFMProgress($leadId: ID!, $targetWfmWorkflowStepId: ID!) {
  updateLeadWFMProgress(leadId: $leadId, targetWfmWorkflowStepId: $targetWfmWorkflowStepId) {
    id
    currentWfmStep {
      status {
        name
        color
      }
    }
  }
}
```

### Person Management

#### Person Type Definition
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

#### Person Operations

**Query All People**
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

#### Organization Type Definition
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

#### Organization Operations

**Query All Organizations**
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

#### Activity Type Definition
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

#### Activity Operations

**Query All Activities**
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

**Update Activity**
```graphql
mutation UpdateActivity($id: ID!, $input: ActivityInput!) {
  updateActivity(id: $id, input: $input) {
    id
    type
    subject
    description
    due_date
    completed_at
  }
}
```

**Delete Activity**
```graphql
mutation DeleteActivity($id: ID!) {
  deleteActivity(id: $id)
}
```

---

## AI Agent API

### Agent Conversation Management

#### Agent Type Definitions
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
```

#### Agent Input Types
```graphql
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

**Get Specific Conversation**
```graphql
query GetAgentConversation($id: ID!) {
  agentConversation(id: $id) {
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
    plan {
      goal
      steps {
        id
        description
        toolName
        status
      }
    }
    context
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

The AI Agent has access to 27 specialized tools across 6 domains:

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



---

## Smart Stickers API

### Smart Sticker Type Definitions
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

### Smart Sticker Input Types
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
  priority: StickerPriority
  tags: [String!]
}

input StickerFilters {
  categoryIds: [ID!]
  isPinned: Boolean
  priority: StickerPriority
  tags: [String!]
  search: String # Search in title and content
}

input StickerMoveInput {
  id: ID!
  positionX: Int!
  positionY: Int!
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
      createdAt
    }
    totalCount
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

**Delete Sticker**
```graphql
mutation DeleteSticker($id: ID!) {
  deleteSticker(id: $id)
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

### Custom Field Type Definitions
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

### Custom Field Input Types
```graphql
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

**Get Specific Custom Field Definition**
```graphql
query GetCustomFieldDefinition($id: ID!) {
  customFieldDefinition(id: $id) {
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
    createdAt
    updatedAt
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

**Reactivate Custom Field**
```graphql
mutation ReactivateCustomFieldDefinition($id: ID!) {
  reactivateCustomFieldDefinition(id: $id) {
    id
    isActive
  }
}
```

---

## WFM (Workflow Management) API

### WFM Type Definitions
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

type WFMWorkflowTransition {
  id: ID!
  workflowId: ID!
  fromStepId: ID!
  toStepId: ID!
  conditions: JSON
  workflow: WFMWorkflow!
  fromStep: WFMWorkflowStep!
  toStep: WFMWorkflowStep!
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

**Get WFM Statuses**
```graphql
query GetWFMStatuses($includeArchived: Boolean = false) {
  wfmStatuses(includeArchived: $includeArchived) {
    id
    name
    description
    color
    isArchived
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

**Create WFM Status**
```graphql
mutation CreateWFMStatus($input: WFMStatusInput!) {
  createWFMStatus(input: $input) {
    id
    name
    description
    color
    createdAt
  }
}

# Input Type
input WFMStatusInput {
  name: String!
  description: String
  color: String!
}
```

---





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

| Code | Description | Resolution |
|------|-------------|------------|
| `UNAUTHENTICATED` | Missing or invalid authentication token | Provide valid Bearer token |
| `FORBIDDEN` | Insufficient permissions for the operation | Check user permissions |
| `NOT_FOUND` | Requested resource does not exist | Verify resource ID |
| `VALIDATION_ERROR` | Input validation failed | Check input data format |
| `INTERNAL_SERVER_ERROR` | Unexpected server error | Retry or contact support |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Reduce request frequency |
| `CONFLICT` | Resource conflict (e.g., duplicate creation) | Check for existing resources |

---

## Examples

### JavaScript/TypeScript Setup

```typescript
import { GraphQLClient } from 'graphql-request';

const endpoint = 'https://your-domain.netlify.app/.netlify/functions/graphql';

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${supabaseJwtToken}`,
  },
});
```

### Complete Example: Deal Creation with Custom Fields

```typescript
// 1. First, create custom field definition if needed
const CREATE_CUSTOM_FIELD = gql`
  mutation CreateCustomFieldDefinition($input: CustomFieldDefinitionInput!) {
    createCustomFieldDefinition(input: $input) {
      id
      fieldName
      fieldLabel
      fieldType
    }
  }
`;

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

// 2. Create deal with custom field value
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
        definitionId: customField.createCustomFieldDefinition.id,
        stringValue: "high"
      }
    ]
  }
});
```

### AI Agent Conversation Example

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
        role
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
    content: "Create a deal for Microsoft partnership worth $100k closing in March and add a high priority sticker",
    config: {
      thinkingBudget: "THINK_HARD",
      autoExecute: false
    }
  }
});
```

### Smart Stickers Management Example

```typescript
// Get all stickers for a deal
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
        category {
          name
          color
        }
      }
    }
  }
`;

const stickers = await graphQLClient.request(GET_ENTITY_STICKERS, {
  entityType: "DEAL",
  entityId: dealId
});

// Create a new sticker
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
```

### Lead Conversion Workflow Example

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
- **Anonymous Health Checks:** 10 requests/minute per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Performance Optimization Tips
- Use field selection to request only needed data
- Implement pagination for large datasets  
- Cache frequently accessed data client-side
- Batch related operations when possible
- Use optimistic updates for better UX

---

This comprehensive API reference covers all available operations in the PipeCD system. For architectural details and development setup, refer to the [Developer Guide](DEVELOPER_GUIDE_V2.md). 