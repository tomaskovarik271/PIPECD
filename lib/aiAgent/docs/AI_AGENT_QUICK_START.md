# 🚀 PipeCD AI Agent - Quick Start Guide

**Get up and running with the AI agent in 10 minutes**

## ✅ Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase project configured
- [ ] Anthropic API key (for Claude 4)
- [ ] Netlify CLI installed

## 🏁 Quick Setup (5 minutes)

### 1. Environment Variables
Create/update your `.env` file:
```bash
# Required for AI functionality
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Auto-configured for Netlify dev
GRAPHQL_ENDPOINT=http://localhost:8888/.netlify/functions/graphql

# Supabase credentials (already configured)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Setup
```bash
cd supabase
npx supabase db reset
npx supabase db push
```

Verify custom fields permissions:
```sql
-- Run in Supabase SQL editor
SELECT r.name, p.resource, p.action 
FROM roles r 
JOIN role_permissions rp ON r.id = rp.role_id 
JOIN permissions p ON rp.permission_id = p.id 
WHERE p.resource = 'custom_fields';
-- Should show 'member' role has 'manage_definitions' permission
```

### 3. Start Development Server
```bash
netlify dev
```

### 4. Test AI Agent
Navigate to your app and try:
- "What deals do we have?"
- "Create a deal for Microsoft"
- "What custom fields do we have for deals?"

## 🧠 How It Works (2 minutes)

### Core Architecture
```
User Message → Claude 4 Analysis → Tool Selection → GraphQL Execution → Response
```

### Tool Execution Flow
1. **User sends message** via chat interface
2. **Claude 4 analyzes** intent and determines needed tools
3. **AgentService executes tools** via GraphQL queries
4. **Sequential workflow** continues until task complete
5. **Formatted response** returned with tool results

### Custom Fields Magic
```typescript
// AI automatically:
// 1. Checks existing custom fields
// 2. Creates missing fields for unique requirements
// 3. Populates values during entity creation
// 4. Explains what was created and why

"Create deal for RFP requiring SOC 2 compliance"
→ Creates "SOC 2 Compliance" dropdown field
→ Creates deal with compliance requirement set
→ Returns complete deal with custom field explanation
```

## 🛠️ Key Files to Know

### Main AI Service
- `lib/aiAgent/agentService.ts` - Core orchestration (2000+ lines)
- `lib/aiAgent/aiService.ts` - Claude 4 integration
- `lib/aiAgent/types.ts` - Type definitions

### Frontend
- `frontend/src/components/agent/` - AI chat interface
- `frontend/src/hooks/useAgent.ts` - React hooks for AI

### GraphQL
- `netlify/functions/graphql/` - GraphQL server and resolvers

## 🔧 Adding a New Tool (5 minutes)

### 1. Define Tool
Add to `discoverTools()` in `agentService.ts`:
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

### 2. Implement Tool
Add case to `executeToolDirectly()`:
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
  return `Tool executed: ${JSON.stringify(result)}`;
}
```

### 3. Test Tool
Ask the AI: "Use my_new_tool with param1 as 'test'"

## 📋 30+ Available Tools

### Deal Operations (6 tools)
- `search_deals` - Find deals by criteria
- `get_deal_details` - Full deal info + custom fields
- `create_deal` - Create with custom fields support
- `update_deal`, `delete_deal`, `analyze_pipeline`

### Custom Fields (4 tools) ⭐ NEW
- `get_custom_field_definitions` - List fields by entity type
- `create_custom_field_definition` - Create new field types
- `get_entity_custom_fields` - Read values
- `set_entity_custom_fields` - Write values

### Organizations (4 tools)
- `search_organizations`, `get_organization_details`
- `create_organization`, `update_organization`

### Contacts (4 tools)
- `search_contacts`, `get_contact_details`
- `create_contact`, `update_contact`

### Activities (5 tools)
- `search_activities`, `get_activity_details`
- `create_activity`, `update_activity`, `complete_activity`

### Workflow & Analytics (4+ tools)
- `get_wfm_project_types`, `update_deal_workflow_progress`
- `get_price_quotes`, `create_price_quote`

### User Operations (2 tools)
- `search_users`, `get_user_profile`

## 🧪 Testing Examples

### Basic Tests
```
"Show me all deals"
"Who are our contacts at Microsoft?"
"Create a task for follow-up call"
"Analyze our pipeline for last 30 days"
```

### Custom Fields Tests ⭐
```
"What custom fields do we have for deals?"
"Create a deal for RFP requiring GDPR compliance"
"Show me deals with their custom field values"
"Create a 'Contract Type' dropdown for deals"
```

### Complex Workflows
```
"Create a deal for Acme Corp's cloud migration project worth $50K, 
they need multi-region support and SOC 2 compliance, 
contact is John Smith at john@acme.com"

Expected: Multi-step execution:
1. Search/create Acme Corp organization
2. Search/create John Smith contact  
3. Check/create custom fields for requirements
4. Create deal with all information linked
5. Explain what was created
```

## 🔍 Debugging Tips

### Check AI Thoughts
```sql
-- See AI reasoning process
SELECT * FROM agent_thoughts 
WHERE conversation_id = 'your-conversation-id'
ORDER BY timestamp DESC;
```

### Monitor GraphQL
Watch Netlify function logs:
```bash
netlify dev --inspect
# Check browser dev tools for GraphQL requests
```

### Common Issues
- **"Unknown tool" error**: Tool defined but not implemented in switch statement
- **GraphQL errors**: Check authentication, schema, required fields
- **Slow responses**: Check Anthropic API rate limits
- **Custom fields failing**: Verify migration applied and permissions granted

## 📝 Next Steps

1. **Try the examples above** to understand capabilities
2. **Read the full documentation** in `PIPECD_AI_AGENT_DOCUMENTATION.md`
3. **Explore custom fields** - this is the game-changer feature
4. **Add your own tools** using the pattern shown
5. **Monitor AI thoughts** to understand decision-making

## 🎯 Pro Tips

- **Let Claude decide**: Don't hardcode workflows, let AI choose tools
- **Sequential execution**: Complex tasks happen step-by-step automatically
- **Custom fields revolution**: AI creates fields on-demand for unique requirements
- **Thought tracking**: Every AI decision is logged for transparency
- **Natural language**: Speak normally, AI understands context and intent

**Ready to build the future of CRM automation? Start with "What deals do we have?" and see the magic happen! 🪄** 