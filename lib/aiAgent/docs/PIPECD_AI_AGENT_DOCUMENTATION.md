# 🤖 PipeCD AI Agent - Complete Documentation

**Last Updated:** January 31, 2025  
**Version:** 2.0 (Major Custom Fields Update)

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [AI Agent Capabilities](#ai-agent-capabilities)
3. [Custom Fields Revolution](#custom-fields-revolution)
4. [Setup & Configuration](#setup--configuration)
5. [Available Tools Reference](#available-tools-reference)
6. [Usage Examples](#usage-examples)
7. [Development Guide](#development-guide)
8. [Architecture Deep Dive](#architecture-deep-dive)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## 🎯 System Overview

PipeCD's AI Agent is an **autonomous Claude 4 Sonnet-powered assistant** that provides intelligent CRM management with full custom fields support. The system enables natural language interaction with your CRM data, autonomous workflow execution, and intelligent data capture.

### **Core Capabilities**
- 🧠 **Natural Language Processing** - Understand complex CRM requests
- 🔧 **30+ Integrated Tools** - Complete CRM operation coverage
- 🎯 **Sequential Workflow Execution** - Multi-step autonomous task completion
- 📝 **Custom Fields Management** - Create and manage custom fields on-the-fly
- 📊 **Real-time Thinking Visualization** - See AI decision-making process
- 🔄 **Conversation Memory** - Persistent conversation history
- 🛡️ **Permission-Aware** - Respects user roles and permissions

### **Key Features**
- **RFP Processing**: Automatically extract requirements and create custom fields
- **Pipeline Analysis**: Intelligent deal pipeline insights and recommendations
- **Data Enrichment**: Smart data capture with custom field suggestions
- **Sequential Workflows**: Complex multi-step operations without user intervention
- **Thought Tracking**: Complete audit trail of AI decision-making

---

## 🚀 AI Agent Capabilities

### **1. Deal Management**
- Search and filter deals by multiple criteria
- Create comprehensive deals with smart defaults
- Update deal information and workflow progress
- Analyze pipeline performance and trends
- Extract deal information from documents/RFPs

### **2. Organization Management**
- Search and create organizations
- Update organization details
- Link deals and contacts to organizations
- Track organization relationships

### **3. Contact Management**
- Search contacts by name, email, organization
- Create and update contact information
- Associate contacts with deals and organizations
- Manage contact relationships

### **4. Activity Management**
- Create tasks, meetings, calls, emails
- Search and filter activities
- Complete activities with notes
- Link activities to deals, contacts, organizations
- Set due dates and priorities

### **5. Custom Fields Revolution**
- **Dynamic Field Creation**: Create custom fields based on conversation context
- **All Entity Types**: Support for DEAL, PERSON, ORGANIZATION custom fields
- **Rich Field Types**: TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT
- **Intelligent Suggestions**: AI recommends when custom fields are needed
- **RFP Integration**: Automatically create fields for unique RFP requirements

### **6. Workflow Management**
- Move deals through workflow stages
- Track project types and statuses
- Automate workflow progression
- Generate workflow insights

### **7. Analytics & Insights**
- Pipeline performance analysis
- Deal trend identification
- Activity completion tracking
- Custom field usage analytics

---

## 🔥 Custom Fields Revolution

### **Major Update: Democratized Permissions**
**Before:** Only admins could create custom fields → **After:** All users can create custom fields

This removes the bottleneck for RFP processing and enables immediate data capture.

### **AI-Powered Custom Field Management**

#### **Automatic Field Creation**
The AI agent intelligently identifies when custom fields are needed:

```
User: "Create deal for this RFP - they need SOC 2 compliance and prefer multi-cloud deployment"

AI Process:
1. Checks existing DEAL custom fields
2. Creates "SOC 2 Compliance" dropdown if missing
3. Creates "Deployment Preference" dropdown if missing  
4. Creates deal with custom field values populated
5. Explains what fields were created and why
```

#### **Smart Field Type Selection**
- **DROPDOWN**: For standardized options (Yes/No/Maybe, compliance levels)
- **TEXT**: For free-form descriptions and details
- **NUMBER**: For quantities, percentages, scores
- **DATE**: For deadlines, milestones, review dates  
- **BOOLEAN**: For simple yes/no questions
- **MULTI_SELECT**: For multiple choice scenarios

#### **RFP Processing Workflow**
```
1. User pastes RFP content or describes requirements
2. AI extracts unique information not in standard fields
3. AI checks existing custom fields for the entity type
4. AI creates missing custom field definitions as needed
5. AI populates custom field values during entity creation
6. AI explains what fields were created and why they're useful
```

### **Custom Field Tools**
- `get_custom_field_definitions` - List available custom fields
- `create_custom_field_definition` - Create new field definitions
- `get_entity_custom_fields` - Read custom field values
- `set_entity_custom_fields` - Write custom field values

---

## ⚙️ Setup & Configuration

### **1. Environment Variables**
```bash
# Required for AI functionality
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# GraphQL endpoint (auto-configured for Netlify)
GRAPHQL_ENDPOINT=http://localhost:8888/.netlify/functions/graphql

# Optional: Custom MCP endpoint
MCP_ENDPOINT=http://localhost:3001
```

### **2. Database Setup**
Ensure all migrations are applied:
```bash
cd supabase
npx supabase db push --include-all
```

Key migrations:
- `20250730000004_democratize_custom_fields_permissions.sql` - Grants custom field permissions to all users

### **3. AI Service Configuration**
```typescript
// lib/aiAgent/aiService.ts
const aiService = new AIService({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.7,
});
```

### **4. Testing Setup**
```bash
# Start development server
netlify dev

# Test AI agent in frontend
# Navigate to AI chat interface
# Try: "What custom fields do we have for deals?"
```

---

## 🛠️ Available Tools Reference

### **Deal Operations**
| Tool | Purpose | Key Parameters |
|------|---------|---------------|
| `search_deals` | Find deals by criteria | `search_term`, `assigned_to`, `min_amount`, `max_amount` |
| `get_deal_details` | Complete deal information + custom fields | `deal_id` |
| `create_deal` | Create new deal with custom fields | `name`, `organization_id`, `custom_fields` |
| `update_deal` | Update deal information | `deal_id`, various update fields |
| `delete_deal` | Remove deal permanently | `deal_id` |
| `analyze_pipeline` | Pipeline performance analysis | `time_period_days` |

### **Organization Operations**
| Tool | Purpose | Key Parameters |
|------|---------|---------------|
| `search_organizations` | Find organizations | `search_term`, `limit` |
| `get_organization_details` | Organization information + custom fields | `organization_id` |
| `create_organization` | Create new organization | `name`, `address`, `notes` |
| `update_organization` | Update organization | `organization_id`, update fields |

### **Contact Operations**
| Tool | Purpose | Key Parameters |
|------|---------|---------------|
| `search_contacts` | Find people/contacts | `search_term`, `organization_id` |
| `get_contact_details` | Contact information + custom fields | `person_id` |
| `create_contact` | Create new contact | `first_name`, `last_name`, `email` |
| `update_contact` | Update contact information | `person_id`, update fields |

### **Activity Operations**
| Tool | Purpose | Key Parameters |
|------|---------|---------------|
| `search_activities` | Find activities/tasks | `deal_id`, `person_id`, `is_done` |
| `get_activity_details` | Activity information | `activity_id` |
| `create_activity` | Create task/meeting/call | `type`, `subject`, `due_date` |
| `update_activity` | Update activity | `activity_id`, update fields |
| `complete_activity` | Mark activity done | `activity_id`, `completion_notes` |

### **Custom Fields Operations**
| Tool | Purpose | Key Parameters |
|------|---------|---------------|
| `get_custom_field_definitions` | List custom fields for entity type | `entity_type`, `include_inactive` |
| `create_custom_field_definition` | Create new custom field | `entity_type`, `field_name`, `field_label`, `field_type` |
| `get_entity_custom_fields` | Get custom field values for entity | `entity_type`, `entity_id` |
| `set_entity_custom_fields` | Set custom field values | `entity_type`, `entity_id`, `custom_fields` |

### **Workflow & Analytics**
| Tool | Purpose | Key Parameters |
|------|---------|---------------|
| `get_wfm_project_types` | List workflow project types | `is_archived` |
| `update_deal_workflow_progress` | Move deal through stages | `deal_id`, `target_step_id` |
| `get_price_quotes` | Get quotes for deal | `deal_id` |
| `create_price_quote` | Create new quote | `deal_id`, pricing fields |

### **User Operations**
| Tool | Purpose | Key Parameters |
|------|---------|---------------|
| `search_users` | Find users for assignment | `search_term`, `limit` |
| `get_user_profile` | Current user information | none |

---

## 💡 Usage Examples

### **Example 1: RFP Processing with Custom Fields**
```
User: "Create a deal for this RFP from Orbis Solutions. They need ISO 27001 certification, prefer cloud deployment, require 24/7 support, and want the project completed by Q3 2025. The deal is worth €85,000."

AI Response:
1. Searches for "Orbis Solutions" organization
2. Checks existing custom fields for DEAL entity
3. Creates missing custom fields:
   - "Required Certifications" (DROPDOWN: ISO 27001, SOC 2, GDPR, etc.)
   - "Deployment Preference" (DROPDOWN: Cloud, On-Premise, Hybrid)
   - "Support Level" (DROPDOWN: Business Hours, Extended, 24/7)
4. Creates deal with:
   - Standard fields: name, value, organization, close date
   - Custom fields: ISO 27001, Cloud, 24/7 support
5. Explains what was created and why
```

### **Example 2: Pipeline Analysis**
```
User: "Analyze our pipeline for the last 60 days"

AI Response:
1. Executes analyze_pipeline with 60-day timeframe
2. Provides insights on:
   - Total deals and pipeline value
   - Average deal size
   - Expected closes this month
   - Recent activity trends
3. Offers follow-up suggestions
```

### **Example 3: Complex Deal Creation**
```
User: "Create a deal for the new Microsoft partnership. It's a 3-year contract worth $500K annually. Contact is Sarah Johnson at Microsoft. They need multi-region support and GDPR compliance."

AI Process:
1. Searches for Microsoft organization
2. Searches for Sarah Johnson contact
3. Checks/creates custom fields for:
   - "Contract Duration" (NUMBER)
   - "Regional Support" (MULTI_SELECT)
   - "Compliance Requirements" (MULTI_SELECT)
4. Creates deal with all information captured
```

### **Example 4: Custom Field Management**
```
User: "What custom fields do we have for organizations?"

AI Response:
1. Executes get_custom_field_definitions for ORGANIZATION
2. Lists all available custom fields with:
   - Field names and labels
   - Field types and requirements
   - Creation dates and status
   - Available options for dropdowns
```

---

## 🔧 Development Guide

### **Adding New Tools**

1. **Define Tool in `discoverTools()`**:
```typescript
{
  name: 'my_new_tool',
  description: 'What this tool does',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' },
    },
    required: ['param1'],
  },
}
```

2. **Implement Tool in `executeToolDirectly()`**:
```typescript
case 'my_new_tool': {
  const { param1 } = parameters;
  
  const query = `
    query MyQuery($param1: String!) {
      myData(param1: $param1) {
        field1
        field2
      }
    }
  `;
  
  const result = await executeGraphQL(query, { param1 });
  return `Tool executed with result: ${JSON.stringify(result)}`;
}
```

### **Extending Custom Fields**

To add new entity types for custom fields:

1. **Update enum in GraphQL schema**:
```graphql
enum CustomFieldEntityType {
  DEAL
  PERSON
  ORGANIZATION
  ACTIVITY  # New entity type
}
```

2. **Add GraphQL queries** in custom field tools
3. **Update AI system prompt** with new entity guidance

### **Sequential Workflow Patterns**

The AI agent follows these patterns for multi-step operations:

```typescript
// Pattern 1: Dependent workflows (ONE tool per response)
User: "Create deal for Company X"
Response 1: search_organizations("Company X") only
Response 2: create_deal(with organization_id from step 1)

// Pattern 2: Independent workflows (multiple tools okay)
User: "Show me deals and contacts"
Response 1: search_deals() AND search_contacts() (parallel)
```

### **Debugging Tools**

1. **Thought Tracking**: Check `agent_thoughts` table for AI reasoning
2. **GraphQL Logs**: Monitor Netlify function logs for query execution
3. **Error Handling**: All tools include comprehensive error responses

---

## 🏗️ Architecture Deep Dive

### **System Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  • AIAgentChat.tsx - React chat interface                  │
│  • ConversationHistory - Message management                │
│  • ThoughtVisualization - AI reasoning display             │
│  • CustomFieldsUI - Dynamic field management               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  • GraphQL Endpoint (/functions/graphql)                   │
│  • Authentication & Authorization                          │
│  • Request/Response Processing                              │
│  • Rate Limiting & Security                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI AGENT LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  • AgentService - Core orchestration                       │
│  • AIService - Claude 4 Sonnet integration                 │
│  • Tool Discovery & Execution                              │
│  • Sequential Workflow Management                          │
│  • Custom Fields Intelligence                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  • Supabase Client & RLS                                   │
│  • GraphQL Resolvers                                       │
│  • Custom Fields Schema                                    │
│  • Conversation & Thought Storage                          │
└─────────────────────────────────────────────────────────────┘
```

### **Tool Execution Flow**

```
User Message → AI Analysis → Tool Selection → Sequential Execution → Response
     │              │              │                   │              │
     ▼              ▼              ▼                   ▼              ▼
1. Parse Intent → 2. Reason → 3. Choose Tools → 4. Execute One → 5. Continue?
                     │              │                   │              │
                     ▼              ▼                   ▼              ▼
              Claude 4 Thinking  Tool Discovery   GraphQL Query   Next Action?
```

### **Custom Fields Data Flow**

```
RFP Content → Requirements Extraction → Field Check → Field Creation → Value Setting
     │                 │                     │            │              │
     ▼                 ▼                     ▼            ▼              ▼
1. AI Analysis → 2. Identify Unique → 3. Query Existing → 4. Create Missing → 5. Populate
                    Information           Custom Fields      Definitions       Values
```

---

## 🔍 Troubleshooting

### **Common Issues**

#### **"Unknown tool" Error**
**Symptom**: Tool is discovered but fails to execute
**Solution**: Check that tool is implemented in `executeToolDirectly()` switch statement

#### **GraphQL Errors**
**Symptom**: Tool execution fails with GraphQL errors
**Solutions**:
- Verify user authentication and permissions
- Check GraphQL schema matches tool queries
- Ensure required fields are provided

#### **Custom Fields Not Working**
**Symptom**: Custom field tools fail
**Solutions**:
- Verify custom fields migration was applied
- Check user has `custom_fields:manage_definitions` permission
- Ensure custom field schema exists in database

#### **AI Responses Are Slow**
**Symptom**: Long wait times for AI responses
**Solutions**:
- Check Anthropic API key and rate limits
- Monitor Claude API usage in Anthropic console
- Optimize tool queries for performance

#### **Sequential Workflows Stuck**
**Symptom**: Multi-step workflows don't complete
**Solutions**:
- Check task completion detection logic
- Verify tool results are properly formatted
- Ensure proper error handling in tool chains

### **Debug Commands**

```bash
# Check database migrations
cd supabase && npx supabase db push --dry-run

# Test GraphQL endpoint
curl -X POST http://localhost:8888/.netlify/functions/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "{ me { id email } }"}'

# Check custom fields permissions
# Run in Supabase SQL editor:
SELECT r.name, p.resource, p.action 
FROM roles r 
JOIN role_permissions rp ON r.id = rp.role_id 
JOIN permissions p ON rp.permission_id = p.id 
WHERE p.resource = 'custom_fields';
```

---

## 📚 API Reference

### **Agent Service Methods**

#### **`processMessage(input, userId)`**
Main entry point for AI agent interaction.

**Parameters:**
- `input: SendMessageInput` - Message content and configuration
- `userId: string` - User ID for authentication

**Returns:** `AgentResponse` with conversation, message, thoughts, and plan

#### **`discoverTools()`**
Returns array of available tools with descriptions and parameters.

**Returns:** `MCPTool[]` - Complete tool definitions

#### **`callTool(toolCall, accessToken?)`**
Execute a specific tool with parameters.

**Parameters:**
- `toolCall: MCPToolCall` - Tool name and parameters
- `accessToken?: string` - Optional authentication token

**Returns:** `MCPToolResponse` - Tool execution result

### **Custom Fields API**

#### **GraphQL Mutations**
```graphql
# Create custom field definition
mutation CreateCustomFieldDefinition($input: CustomFieldDefinitionInput!) {
  createCustomFieldDefinition(input: $input) {
    id
    entityType
    fieldName
    fieldLabel
    fieldType
    isRequired
    isActive
  }
}

# Update entity with custom fields
mutation UpdateDealWithCustomFields($id: ID!, $input: DealUpdateInput!) {
  updateDeal(id: $id, input: $input) {
    id
    customFieldValues {
      definition { fieldLabel }
      stringValue
      numberValue
      booleanValue
    }
  }
}
```

#### **GraphQL Queries**
```graphql
# Get custom field definitions
query GetCustomFieldDefinitions($entityType: CustomFieldEntityType!) {
  customFieldDefinitions(entityType: $entityType) {
    id
    fieldName
    fieldLabel
    fieldType
    dropdownOptions { value label }
  }
}

# Get entity with custom fields
query GetDealWithCustomFields($dealId: ID!) {
  deal(id: $dealId) {
    id
    name
    customFieldValues {
      definition { fieldLabel fieldType }
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
    }
  }
}
```

---

## 🎯 Next Steps & Roadmap

### **Immediate Improvements**
- [ ] Add more entity types for custom fields (Activities, Quotes)
- [ ] Implement bulk custom field operations
- [ ] Add custom field templates for common use cases
- [ ] Enhanced custom field validation

### **Advanced Features**
- [ ] AI-powered custom field suggestions based on content
- [ ] Custom field analytics and usage insights
- [ ] Automated field migration and cleanup
- [ ] Custom field permissions at field level

### **Integration Enhancements**
- [ ] Email integration for RFP processing
- [ ] Document parsing and field extraction
- [ ] Webhook notifications for custom field changes
- [ ] Export/import custom field configurations

---

## 📝 Conclusion

The PipeCD AI Agent represents a **revolutionary approach to CRM automation** with its combination of:

- **Autonomous Intelligence** via Claude 4 Sonnet
- **Comprehensive Tool Coverage** (30+ integrated tools)
- **Dynamic Custom Fields** that adapt to your business needs
- **Sequential Workflow Execution** for complex operations
- **Real-time Transparency** through thought tracking

The **Custom Fields Revolution** enables immediate capture of unique business requirements without admin bottlenecks, making the system truly adaptive to your evolving needs.

**Ready to get started?** Follow the setup guide and try your first RFP processing workflow!

---

*This documentation reflects the current state as of January 2025. For technical support or feature requests, refer to the development team or create an issue in the project repository.* 