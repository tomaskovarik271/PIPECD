# PipeCD AI Agent V2 Development Plan
**Target Model: Claude Sonnet 4 with Extended Thinking**

## 🎯 **Core Philosophy**

**Build V2 from scratch alongside V1** - Keep V1 working as fallback while gradually building a clean, modern V2 system that leverages Claude Sonnet 4's extended thinking and reflection capabilities.

## 🏗️ **Parallel Architecture Strategy**

### **Separation Principle**
```
PIPECD/
├── lib/
│   ├── aiAgent/          # V1 (KEEP UNTOUCHED)
│   └── aiAgentV2/        # V2 (NEW, CLEAN)
├── frontend/src/
│   ├── pages/
│   │   ├── AgentPage.tsx     # V1 (keep as-is)
│   │   └── AgentV2Page.tsx   # V2 (new)
│   └── components/agent/
│       ├── AIAgentChat.tsx      # V1 (keep)
│       └── v2/                  # V2 components
│           ├── AIAgentChatV2.tsx
│           ├── MessageBubbleV2.tsx
│           ├── ThinkingDisplay.tsx
│           └── ReflectionPanel.tsx
└── netlify/functions/graphql/
    ├── resolvers/
    │   ├── agentResolvers.ts    # V1 (keep)
    │   └── agentV2Resolvers.ts  # V2 (new)
    └── schema/
        ├── agent.graphql        # V1 (keep)
        └── agentV2.graphql      # V2 (new)
```

### **Database Strategy**
**✅ REUSE EXISTING TABLES** - The current schema is perfectly designed for V2!

**`agent_conversations` table:** Already has everything we need:
- `messages` (JSONB) - Supports V2 message structures with thinking data
- `plan` (JSONB) - Perfect for adaptive planning and strategy pivoting  
- `context` (JSONB) - Ideal for extended thinking context and system state

**`agent_thoughts` table:** Already supports our thinking patterns:
- `type` enum - Has `reasoning`, `question`, `tool_call`, `observation`, `plan`
- `content` - Perfect for Claude's extended thinking content
- `metadata` (JSONB) - Can store structured thinking data and reflections

**V2 Extensions via Migration:**
```sql
-- Add V2-specific fields to existing tables
ALTER TABLE agent_conversations 
ADD COLUMN agent_version text DEFAULT 'v1' CHECK (agent_version IN ('v1', 'v2'));

-- Add extended thinking support to agent_thoughts
ALTER TABLE agent_thoughts 
ADD COLUMN thinking_budget text CHECK (thinking_budget IN ('standard', 'think', 'think_hard', 'think_harder', 'ultrathink')),
ADD COLUMN reflection_data jsonb DEFAULT '{}';
```

**Isolation Strategy:** V2 conversations marked with `agent_version: 'v2'`

---

## 📋 **Phase-by-Phase Development Plan**

### **PHASE 1: Foundation (Week 1-2)**
*Goal: Basic V2 page with Claude Sonnet 4 integration*

#### **Step 1.1: Create V2 Page Structure**
```typescript
// frontend/src/pages/AgentV2Page.tsx
// - Basic page layout
// - Navigation breadcrumb
// - Link from Sidebar to /agent-v2
```

#### **Step 1.2: Basic V2 Chat Component**
```typescript
// frontend/src/components/agent/v2/AIAgentChatV2.tsx
// - Simple message input/output
// - Message history display
// - Loading states
```

#### **Step 1.3: V2 GraphQL Schema Extensions**
```graphql
# netlify/functions/graphql/schema/agentV2.graphql
# Extend existing AgentConversation type for V2
extend type AgentConversation {
  agentVersion: String!
  extendedThinkingEnabled: Boolean!
  thinkingBudget: ThinkingBudget!
}

# Extend existing AgentThought type for V2  
extend type AgentThought {
  thinkingBudget: ThinkingBudget
  reflectionData: JSON!
  reasoning: String
  strategy: String
  concerns: String
  nextSteps: String
}

# V2-specific input types
input SendAgentV2MessageInput {
  conversationId: ID
  content: String!
  enableExtendedThinking: Boolean! 
  thinkingBudget: ThinkingBudget!
}

# V2-specific response types
type AgentV2Response {
  conversation: AgentConversation!
  message: AgentMessage!
  extendedThoughts: [AgentThought!]!
  reflections: [AgentThought!]!
  planModifications: [String!]!
}
```

**Advantage:** Reuse existing types and add V2 extensions rather than duplicating schema.

#### **Step 1.4: V2 Resolvers**
```typescript
// netlify/functions/graphql/resolvers/agentV2Resolvers.ts
// - sendAgentV2Message mutation
// - getAgentV2Conversation query
// - Basic CRUD operations
```

#### **Step 1.5: V2 Agent Service (Minimal)**
```typescript
// lib/aiAgentV2/core/AgentServiceV2.ts
// - Single method: processMessage()
// - Claude Sonnet 4 API integration
// - Extended thinking mode enabled
// - Save to existing agent_conversations table
```

**Phase 1 Deliverable:** Working V2 page that can send messages to Claude Sonnet 4 with extended thinking, save conversations, but NO tools yet.

---

### **PHASE 2: Extended Thinking Integration (Week 2-3)**
*Goal: Leverage Claude Sonnet 4's extended thinking capabilities*

#### **Step 2.1: Extended Thinking Service**
```typescript
// lib/aiAgentV2/services/ExtendedThinkingService.ts
export class ExtendedThinkingService {
  async enableExtendedThinking(prompt: string): Promise<ExtendedThinkingResponse> {
    // Use Claude Sonnet 4's extended thinking mode
    // Extract thinking content from <thinking> tags
    // Structure and save thinking data
  }
}
```

#### **Step 2.2: Thinking Display Component**
```typescript
// frontend/src/components/agent/v2/ThinkingDisplay.tsx
// - Expandable thinking sections
// - Real-time thinking updates
// - Structured reasoning display
// - Strategy visualization
```

#### **Step 2.3: Enhanced Message Bubble**
```typescript
// frontend/src/components/agent/v2/MessageBubbleV2.tsx
// - Extended thinking display
// - Collapsible reasoning sections
// - Visual indicators for thinking depth
// - Time spent thinking metrics
```

**Phase 2 Deliverable:** V2 agent that shows Claude's extended thinking process in real-time, with rich UI for exploring reasoning.

---

### **PHASE 3: Think Tool Implementation (Week 3-4)**
*Goal: Add Anthropic's think tool for workflow reflection*

#### **Step 3.1: Think Tool Service**
```typescript
// lib/aiAgentV2/tools/ThinkTool.ts
export class ThinkTool {
  static definition = {
    name: "think",
    description: "Think through complex problems step by step. Use when you need to reason about multiple options, reflect on previous actions, or plan next steps.",
    input_schema: {
      type: "object",
      properties: {
        reasoning: { type: "string", description: "Your detailed reasoning about the current situation" },
        strategy: { type: "string", description: "Your strategy for proceeding" },
        concerns: { type: "string", description: "Any concerns or potential issues you've identified" },
        next_steps: { type: "string", description: "Specific next steps you plan to take" }
      },
      required: ["reasoning", "strategy", "next_steps"]
    }
  };

  async execute(input: ThinkInput): Promise<ThinkResult> {
    // Save thinking to agent_thoughts table
    // Return structured thinking result
  }
}
```

#### **Step 3.2: Tool Execution Framework**
```typescript
// lib/aiAgentV2/core/ToolExecutorV2.ts
// - Clean, simple tool execution
// - Automatic think tool triggering
// - Reflection after each tool result
// - No complex workflow logic (let Claude decide)
```

#### **Step 3.3: Reflection System**
```typescript
// lib/aiAgentV2/services/ReflectionService.ts
// - Analyze tool results
// - Generate reflection prompts
// - Capture plan modifications
// - Enable strategy pivoting
```

**Phase 3 Deliverable:** V2 agent with working think tool that shows Claude's reasoning process during workflows.

---

### **PHASE 4: Tool Migration (Week 4-6)**
*Goal: Migrate essential tools from V1 with clean architecture*

#### **Step 4.1: Core Tools (GraphQL-First)**
```typescript
// lib/aiAgentV2/tools/
├── SearchDealsToolV2.ts      # Clean GraphQL implementation
├── CreateDealToolV2.ts       # Simplified creation logic
├── SearchOrganizationsToolV2.ts
├── CreateOrganizationToolV2.ts
└── GetDropdownDataToolV2.ts  # System context provider
```

#### **Step 4.2: Tool Registry V2**
```typescript
// lib/aiAgentV2/core/ToolRegistryV2.ts
// - Simple tool registration
// - GraphQL-first tools only
// - No complex domain mapping
// - Clean tool definitions aligned with Claude Sonnet 4
```

#### **Step 4.3: Context Provider**
```typescript
// lib/aiAgentV2/services/ContextProviderV2.ts
// - System state snapshot
// - User permissions context
// - Recent activity summary
// - Relevant data suggestions
```

**Phase 4 Deliverable:** V2 agent with essential CRM tools that work with extended thinking and reflection.

---

### **PHASE 5: Advanced Features (Week 6-8)**
*Goal: Add sophisticated features that leverage V2 architecture*

#### **Step 5.1: Adaptive Planning**
```typescript
// lib/aiAgentV2/services/AdaptivePlanningService.ts
// - Plan generation based on user intent
// - Plan modification after tool results
// - Strategy pivoting when needed
// - Progress tracking
```

#### **Step 5.2: Business Intelligence**
```typescript
// lib/aiAgentV2/services/BusinessIntelligenceService.ts
// - Cross-entity pattern recognition
// - Proactive recommendations
// - Data insights generation
// - Trend analysis
```

#### **Step 5.3: Enhanced UI Components**
```typescript
// frontend/src/components/agent/v2/
├── ReflectionPanel.tsx       # Tool result analysis
├── PlanningBoard.tsx         # Visual plan representation
├── InsightsPanel.tsx         # Business intelligence display
└── ContextPanel.tsx          # System state visualization
```

**Phase 5 Deliverable:** V2 agent that provides business intelligence and adaptive planning capabilities.

---

### **PHASE 6: Production Polish (Week 8-10)**
*Goal: Production-ready V2 system*

#### **Step 6.1: Performance Optimization**
- Response streaming
- Conversation caching
- Tool result optimization
- UI performance tuning

#### **Step 6.2: Error Handling & Recovery**
- Graceful error handling
- Automatic recovery strategies
- User-friendly error messages
- Fallback mechanisms

#### **Step 6.3: User Experience Polish**
- Advanced UI animations
- Keyboard shortcuts
- Mobile responsiveness
- Accessibility features

#### **Step 6.4: Testing & Documentation**
- Comprehensive test suite
- User documentation
- Developer guides
- Migration documentation

**Phase 6 Deliverable:** Production-ready V2 agent system ready for user migration from V1.

---

## 🎯 **Key Design Principles for V2**

### **1. Claude-First Design**
- Let Claude Sonnet 4's extended thinking drive the architecture
- Minimal hardcoded logic
- Trust Claude's reasoning and reflection capabilities
- Design tools for Claude's natural workflow patterns

### **2. Simplicity Over Complexity**
- Remove V1's complex sequential workflow logic
- No hardcoded task completion detection
- Let Claude decide when tasks are complete
- Simple, clean tool definitions

### **3. GraphQL-First Architecture**
- All tools use GraphQL queries/mutations
- Perfect alignment with frontend
- Automatic feature propagation
- Zero code duplication

### **4. Real-time Transparency**
- Show extended thinking process
- Display tool reasoning
- Visualize plan modifications
- Enable user to understand AI decisions

### **5. Gradual Enhancement**
- Start simple, add complexity gradually
- Test each phase thoroughly
- Maintain working system at each step
- Easy rollback to previous phases

---

## 🧪 **Testing Strategy**

### **Phase-by-Phase Testing**
Each phase includes:
- **Unit Tests:** Individual component testing
- **Integration Tests:** Component interaction testing
- **User Testing:** Real workflow validation
- **Performance Testing:** Response time and reliability
- **Comparison Testing:** V2 vs V1 capability comparison

### **Continuous Validation**
- Daily functional testing
- Weekly user feedback sessions
- Performance monitoring
- Error rate tracking

---

## 📊 **Success Metrics**

### **Technical Metrics**
- Response time < 2 seconds for simple queries
- Tool success rate > 95%
- Error rate < 2%
- User satisfaction > 4.5/5

### **Business Metrics**
- Task completion rate > 90%
- Time to complete workflows (target: 50% reduction)
- User adoption rate of V2 over V1
- Business insight generation frequency

### **Quality Metrics**
- Code coverage > 80%
- Zero critical bugs in production
- Documentation completeness > 95%
- User onboarding success rate > 90%

---

## 🚀 **Migration Strategy**

### **Soft Launch (Phase 6)**
- V2 available as optional feature
- V1 remains default
- Power users test V2
- Feedback collection and iteration

### **Gradual Migration (Post-Phase 6)**
- Feature parity validation
- User training and documentation
- Gradual default switching
- V1 deprecation timeline

### **Fallback Plan**
- V1 always available as fallback
- Easy switching between versions
- Data compatibility maintained
- Migration rollback capability

---

## 🎯 **Next Steps**

1. **Approve this plan** and get alignment on approach
2. **Start Phase 1** with basic V2 page structure
3. **Set up development environment** for parallel development
4. **Create project tracking** for phase-by-phase progress
5. **Begin implementation** with regular check-ins and iteration

This plan ensures we build V2 thoughtfully, leveraging Claude Sonnet 4's capabilities while maintaining a working V1 system as our safety net. 