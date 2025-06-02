# 📡 PipeCD AI Agent - API Reference

**Comprehensive technical reference for all AI agent interfaces**

## 📋 Table of Contents

1. [AgentService API](#agentservice-api)
2. [AIService API](#aiservice-api)
3. [Tool Definitions](#tool-definitions)
4. [GraphQL Integration](#graphql-integration)
5. [Custom Fields API](#custom-fields-api)
6. [Type Definitions](#type-definitions)
7. [Error Handling](#error-handling)

---

## 🎯 AgentService API

### **Constructor**
```typescript
constructor(
  supabase: SupabaseClient<Database>,
  mcpEndpoint?: string
)
```

**Parameters:**
- `supabase` - Authenticated Supabase client instance
- `mcpEndpoint` - Optional MCP server endpoint (defaults to env var)

---

### **Core Methods**

#### **`processMessage(input: SendMessageInput, userId: string): Promise<AgentResponse>`**

Main entry point for AI agent interaction.

**Parameters:**
```typescript
interface SendMessageInput {
  content: string;                    // User message content
  conversationId?: string;            // Optional existing conversation ID
  config?: Partial<AgentConfig>;      // Optional AI configuration
}
```

**Returns:**
```typescript
interface AgentResponse {
  conversation: AgentConversation;    // Updated conversation
  message: AgentMessage;              // AI response message
  thoughts: AgentThought[];           // AI reasoning thoughts
  plan?: AgentPlan;                   // Optional execution plan
}
```

**Example:**
```typescript
const response = await agentService.processMessage({
  content: "Create a deal for Microsoft worth $100K",
  config: { temperature: 0.7, maxTokens: 4096 }
}, userId);

console.log(response.message.content); // AI response
console.log(response.thoughts);        // AI reasoning
```

---

#### **`discoverTools(): Promise<MCPTool[]>`**

Returns all available tools with their definitions.

**Returns:**
```typescript
interface MCPTool {
  name: string;                       // Tool identifier
  description: string;                // Human-readable description
  parameters: JSONSchema;             // Parameter schema
}
```

**Example:**
```typescript
const tools = await agentService.discoverTools();
console.log(tools.length); // 30+ tools available

const dealTools = tools.filter(t => t.name.includes('deal'));
console.log(dealTools.map(t => t.name));
// ['search_deals', 'get_deal_details', 'create_deal', ...]
```

---

#### **`callTool(toolCall: MCPToolCall, accessToken?: string): Promise<MCPToolResponse>`**

Execute a specific tool with parameters.

**Parameters:**
```typescript
interface MCPToolCall {
  toolName: string;                   // Tool to execute
  parameters: Record<string, any>;    // Tool parameters
  conversationId: string;             // Context conversation
}
```

**Returns:**
```typescript
interface MCPToolResponse {
  success: boolean;                   // Execution success
  result?: any;                       // Tool result data
  error?: string;                     // Error message if failed
  metadata?: Record<string, any>;     // Additional metadata
}
```

**Example:**
```typescript
const response = await agentService.callTool({
  toolName: 'search_deals',
  parameters: { search_term: 'Microsoft', limit: 10 },
  conversationId: 'conv-123'
}, userToken);

if (response.success) {
  console.log(response.result); // Deal search results
} else {
  console.error(response.error); // Error message
}
```

---

### **Conversation Management**

#### **`createConversation(data: ConversationCreateData): Promise<AgentConversation>`**

Create a new conversation.

```typescript
interface ConversationCreateData {
  userId: string;
  messages?: AgentMessage[];
  context?: Record<string, any>;
  plan?: AgentPlan;
}
```

#### **`getConversation(id: string, userId: string): Promise<AgentConversation | null>`**

Retrieve an existing conversation.

#### **`updateConversation(id: string, userId: string, updates: ConversationUpdateData): Promise<AgentConversation>`**

Update conversation data.

#### **`deleteConversation(id: string, userId: string): Promise<boolean>`**

Delete a conversation permanently.

---

### **Thought Management**

#### **`addThoughts(conversationId: string, thoughts: ThoughtCreateData[]): Promise<AgentThought[]>`**

Add AI reasoning thoughts to a conversation.

```typescript
interface ThoughtCreateData {
  type: 'reasoning' | 'tool_call' | 'observation' | 'planning';
  content: string;
  metadata?: Record<string, any>;
}
```

#### **`getThoughts(conversationId: string, limit?: number): Promise<AgentThought[]>`**

Retrieve thoughts for a conversation.

---

### **Configuration Methods**

#### **`setAccessToken(token: string | null): void`**

Set authentication token for tool calls.

#### **`setThoughtUpdateCallback(callback: Function): void`**

Set callback for real-time thought updates (WebSocket/SSE integration).

---

## 🧠 AIService API

### **Constructor**
```typescript
constructor(config: AIServiceConfig)

interface AIServiceConfig {
  apiKey: string;                     // Anthropic API key
  model: string;                      // Claude model ID
  maxTokens: number;                  // Max response tokens
  temperature: number;                // Response creativity (0-1)
}
```

### **Main Method**

#### **`generateResponse(...): Promise<AIResponse>`**

Generate AI response with autonomous tool calls.

**Parameters:**
```typescript
generateResponse(
  userMessage: string,
  conversationHistory: AgentMessage[],
  config: AgentConfig,
  availableTools: MCPTool[],
  context: Record<string, any>
): Promise<AIResponse>
```

**Returns:**
```typescript
interface AIResponse {
  content: string;                    // AI response text
  thoughts: AIThought[];              // AI reasoning process
  toolCalls?: Array<{                 // Autonomous tool calls
    toolName: string;
    parameters: Record<string, any>;
    reasoning: string;
  }>;
  metadata?: Record<string, any>;
}
```

---

## 🛠️ Tool Definitions

### **Deal Operations**

#### **`search_deals`**
```typescript
{
  name: 'search_deals',
  description: 'Search and filter deals by various criteria',
  parameters: {
    type: 'object',
    properties: {
      search_term: { type: 'string', description: 'Search term to filter deals by name' },
      assigned_to: { type: 'string', description: 'User ID to filter deals assigned to' },
      min_amount: { type: 'number', description: 'Minimum deal amount' },
      max_amount: { type: 'number', description: 'Maximum deal amount' },
      limit: { type: 'number', description: 'Maximum number of deals to return', default: 20 },
    },
  },
}
```

#### **`create_deal`**
```typescript
{
  name: 'create_deal',
  description: 'Create a new deal in the CRM system',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Deal name/title' },
      organization_id: { type: 'string', description: 'Organization ID to associate with deal' },
      primary_contact_id: { type: 'string', description: 'Primary contact person ID' },
      value: { type: 'number', description: 'Deal value/amount' },
      stage: { type: 'string', description: 'Deal stage' },
      priority: { type: 'string', description: 'Deal priority (HIGH, MEDIUM, LOW)' },
      description: { type: 'string', description: 'Deal description' },
      close_date: { type: 'string', description: 'Expected close date (YYYY-MM-DD format)' },
      custom_fields: { type: 'array', description: 'Custom field values array' },
    },
    required: ['name'],
  },
}
```

### **Custom Fields Operations**

#### **`get_custom_field_definitions`**
```typescript
{
  name: 'get_custom_field_definitions',
  description: 'Get available custom field definitions for an entity type',
  parameters: {
    type: 'object',
    properties: {
      entity_type: { 
        type: 'string', 
        description: 'Entity type: DEAL, PERSON, ORGANIZATION', 
        enum: ['DEAL', 'PERSON', 'ORGANIZATION'] 
      },
      include_inactive: { type: 'boolean', description: 'Include inactive custom fields', default: false },
    },
    required: ['entity_type'],
  },
}
```

#### **`create_custom_field_definition`**
```typescript
{
  name: 'create_custom_field_definition',
  description: 'Create new custom field definition for capturing unique information',
  parameters: {
    type: 'object',
    properties: {
      entity_type: { 
        type: 'string', 
        description: 'Entity type: DEAL, PERSON, ORGANIZATION', 
        enum: ['DEAL', 'PERSON', 'ORGANIZATION'] 
      },
      field_name: { type: 'string', description: 'Internal field name (unique per entity type)' },
      field_label: { type: 'string', description: 'Display label for the field' },
      field_type: { 
        type: 'string', 
        description: 'Field type: TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT', 
        enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DROPDOWN', 'MULTI_SELECT'] 
      },
      is_required: { type: 'boolean', description: 'Whether field is required', default: false },
      dropdown_options: { 
        type: 'array', 
        description: 'Options for DROPDOWN/MULTI_SELECT fields. Array of {value, label} objects' 
      },
      display_order: { type: 'number', description: 'Display order for UI', default: 0 },
    },
    required: ['entity_type', 'field_name', 'field_label', 'field_type'],
  },
}
```

#### **`set_entity_custom_fields`**
```typescript
{
  name: 'set_entity_custom_fields',
  description: 'Set custom field values for an entity',
  parameters: {
    type: 'object',
    properties: {
      entity_type: { 
        type: 'string', 
        description: 'Entity type: DEAL, PERSON, ORGANIZATION', 
        enum: ['DEAL', 'PERSON', 'ORGANIZATION'] 
      },
      entity_id: { type: 'string', description: 'ID of the entity to set custom fields for' },
      custom_fields: { 
        type: 'array', 
        description: 'Array of custom field values with definitionId and value fields' 
      },
    },
    required: ['entity_type', 'entity_id', 'custom_fields'],
  },
}
```

### **Organization & Contact Operations**

#### **`search_organizations`**
```typescript
{
  name: 'search_organizations',
  description: 'Find organizations by name to get their IDs for deal creation',
  parameters: {
    type: 'object',
    properties: {
      search_term: { type: 'string', description: 'Search term to find organizations by name' },
      limit: { type: 'number', description: 'Maximum number of organizations to return', default: 10 },
    },
    required: ['search_term'],
  },
}
```

#### **`search_contacts`**
```typescript
{
  name: 'search_contacts',
  description: 'Find contacts and people by name or email',
  parameters: {
    type: 'object',
    properties: {
      search_term: { type: 'string', description: 'Search term to find contacts by name or email' },
      organization_id: { type: 'string', description: 'Filter by organization ID' },
      limit: { type: 'number', description: 'Maximum number of contacts to return', default: 10 },
    },
    required: ['search_term'],
  },
}
```

### **Activity Operations**

#### **`create_activity`**
```typescript
{
  name: 'create_activity',
  description: 'Create new activity, task, meeting, or reminder',
  parameters: {
    type: 'object',
    properties: {
      type: { 
        type: 'string', 
        description: 'Activity type', 
        enum: ['TASK', 'MEETING', 'CALL', 'EMAIL', 'DEADLINE', 'SYSTEM_TASK'] 
      },
      subject: { type: 'string', description: 'Activity subject/title' },
      due_date: { type: 'string', description: 'Due date (ISO 8601 format)' },
      notes: { type: 'string', description: 'Activity notes or description' },
      is_done: { type: 'boolean', description: 'Completion status', default: false },
      deal_id: { type: 'string', description: 'Associate with deal ID' },
      person_id: { type: 'string', description: 'Associate with person ID' },
      organization_id: { type: 'string', description: 'Associate with organization ID' },
    },
    required: ['type', 'subject'],
  },
}
```

---

## 🔗 GraphQL Integration

### **Custom Fields Queries**

#### **Get Custom Field Definitions**
```graphql
query GetCustomFieldDefinitions($entityType: CustomFieldEntityType!, $includeInactive: Boolean) {
  customFieldDefinitions(entityType: $entityType, includeInactive: $includeInactive) {
    id
    entityType
    fieldName
    fieldLabel
    fieldType
    isRequired
    isActive
    displayOrder
    dropdownOptions {
      value
      label
    }
    createdAt
    updatedAt
  }
}
```

#### **Create Custom Field Definition**
```graphql
mutation CreateCustomFieldDefinition($input: CustomFieldDefinitionInput!) {
  createCustomFieldDefinition(input: $input) {
    id
    entityType
    fieldName
    fieldLabel
    fieldType
    isRequired
    isActive
    displayOrder
    dropdownOptions {
      value
      label
    }
    createdAt
  }
}
```

### **Entity with Custom Fields**

#### **Deal with Custom Fields**
```graphql
query GetDealWithCustomFields($dealId: ID!) {
  deal(id: $dealId) {
    id
    name
    value
    stage
    priority
    status
    description
    closeDate
    organization {
      id
      name
    }
    primaryContact {
      id
      first_name
      last_name
      email
    }
    customFieldValues {
      definition {
        id
        fieldName
        fieldLabel
        fieldType
      }
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
    }
    created_at
    updated_at
  }
}
```

#### **Create Deal with Custom Fields**
```graphql
mutation CreateDeal($input: DealInput!) {
  createDeal(input: $input) {
    id
    name
    value
    stage
    organization {
      id
      name
    }
    primaryContact {
      id
      first_name
      last_name
    }
    customFieldValues {
      definition {
        fieldLabel
        fieldType
      }
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
    }
    created_at
  }
}
```

---

## 🎯 Custom Fields API

### **Field Types & Value Handling**

#### **Field Type Mapping**
```typescript
type CustomFieldType = 
  | 'TEXT'        // stringValue
  | 'NUMBER'      // numberValue
  | 'DATE'        // dateValue (ISO 8601)
  | 'BOOLEAN'     // booleanValue
  | 'DROPDOWN'    // stringValue (single selection)
  | 'MULTI_SELECT'; // selectedOptionValues (array)
```

#### **Custom Field Value Structure**
```typescript
interface CustomFieldValue {
  definitionId: string;           // Reference to field definition
  stringValue?: string | null;    // For TEXT, DROPDOWN
  numberValue?: number | null;    // For NUMBER
  booleanValue?: boolean | null;  // For BOOLEAN
  dateValue?: string | null;      // For DATE (ISO 8601)
  selectedOptionValues?: string[] | null; // For MULTI_SELECT
}
```

### **Custom Field Definition Input**
```typescript
interface CustomFieldDefinitionInput {
  entityType: 'DEAL' | 'PERSON' | 'ORGANIZATION';
  fieldName: string;              // Unique internal name
  fieldLabel: string;             // Display label
  fieldType: CustomFieldType;     // Field data type
  isRequired?: boolean;           // Required field flag
  displayOrder?: number;          // UI display order
  dropdownOptions?: Array<{       // For DROPDOWN/MULTI_SELECT
    value: string;
    label: string;
  }>;
}
```

### **Entity Update with Custom Fields**
```typescript
interface EntityUpdateInput {
  // Standard entity fields...
  customFieldValues?: CustomFieldValue[];
}
```

---

## 📝 Type Definitions

### **Core Types**

#### **AgentConversation**
```typescript
interface AgentConversation {
  id: string;
  userId: string;
  messages: AgentMessage[];
  plan?: AgentPlan;
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **AgentMessage**
```typescript
interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thoughts: AgentThought[];
}
```

#### **AgentThought**
```typescript
interface AgentThought {
  id: string;
  conversationId: string;
  type: 'reasoning' | 'tool_call' | 'observation' | 'planning';
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}
```

#### **AgentConfig**
```typescript
interface AgentConfig {
  temperature: number;            // AI creativity (0-1)
  maxTokens: number;              // Max response length
  model: string;                  // Claude model version
  enableTools: boolean;           // Tool execution enabled
  enableThoughts: boolean;        // Thought tracking enabled
}
```

### **Tool Types**

#### **MCPTool**
```typescript
interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      default?: any;
    }>;
    required?: string[];
  };
}
```

#### **MCPToolCall**
```typescript
interface MCPToolCall {
  toolName: string;
  parameters: Record<string, any>;
  conversationId: string;
}
```

#### **MCPToolResponse**
```typescript
interface MCPToolResponse {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: {
    timestamp?: string;
    executionTime?: number;
    [key: string]: any;
  };
}
```

---

## ⚠️ Error Handling

### **AgentError**
```typescript
class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  );
}
```

### **Common Error Codes**
- `CREATE_CONVERSATION_ERROR` - Failed to create conversation
- `FETCH_CONVERSATION_ERROR` - Failed to retrieve conversation
- `UPDATE_CONVERSATION_ERROR` - Failed to update conversation
- `ADD_THOUGHTS_ERROR` - Failed to add thoughts
- `PROCESS_MESSAGE_ERROR` - Failed to process user message
- `TOOL_EXECUTION_ERROR` - Tool execution failed
- `GRAPHQL_ERROR` - GraphQL query/mutation failed
- `AUTHENTICATION_ERROR` - Authentication required or failed

### **Error Response Format**
```typescript
interface ErrorResponse {
  success: false;
  error: string;                  // Human-readable error message
  code?: string;                  // Error code for programmatic handling
  details?: Record<string, any>;  // Additional error context
}
```

### **Example Error Handling**
```typescript
try {
  const response = await agentService.processMessage(input, userId);
  console.log(response.message.content);
} catch (error) {
  if (error instanceof AgentError) {
    console.error(`Agent error [${error.code}]:`, error.message);
    console.error('Details:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## 🚀 Advanced Usage

### **Sequential Tool Execution**
```typescript
// The AI agent automatically handles sequential workflows
// Example: Complex deal creation
const response = await agentService.processMessage({
  content: "Create a deal for Acme Corp worth $50K with John Smith as contact"
}, userId);

// AI will autonomously:
// 1. search_organizations("Acme Corp")
// 2. search_contacts("John Smith")  
// 3. create_deal(with found IDs)
// All without additional user input
```

### **Custom Field Workflows**
```typescript
// AI automatically creates custom fields as needed
const response = await agentService.processMessage({
  content: "Create deal for RFP requiring SOC 2 compliance and cloud deployment"
}, userId);

// AI will autonomously:
// 1. get_custom_field_definitions(entity_type: "DEAL")
// 2. create_custom_field_definition for missing fields
// 3. create_deal with custom field values
// 4. Explain what fields were created and why
```

### **Real-time Thought Tracking**
```typescript
agentService.setThoughtUpdateCallback((conversationId, thought) => {
  // Real-time thought updates for UI
  console.log(`New thought for ${conversationId}:`, thought);
  // Update UI with AI reasoning in real-time
});
```

### **Tool Validation**
```typescript
// Validate tool parameters before execution
const tools = await agentService.discoverTools();
const createDealTool = tools.find(t => t.name === 'create_deal');

function validateCreateDealParams(params: any) {
  const schema = createDealTool.parameters;
  // Validate against JSON schema
  return jsonSchemaValidate(params, schema);
}
```

---

**This API reference covers all current functionality as of January 2025. For the latest updates, refer to the TypeScript definitions in the codebase.** 