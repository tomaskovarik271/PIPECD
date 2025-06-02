# 🗺️ AgentService Refactoring - Implementation Roadmap

**Step-by-step guide to safely refactor the 2,376-line monolith without breaking production**

---

## 🎯 **Phase 1: GraphQL Infrastructure (Week 1)**

### **Step 1.1: Create GraphQLClient.ts** ⚡
```bash
# Create the utils directory
mkdir -p lib/aiAgent/utils

# Create GraphQLClient
touch lib/aiAgent/utils/GraphQLClient.ts
```

**Implementation Strategy:**
1. Extract all GraphQL execution logic from AgentService
2. Centralize authentication and error handling
3. Create typed interfaces for responses
4. Test with existing queries

### **Step 1.2: Create Types** 📝
```bash
mkdir -p lib/aiAgent/types
touch lib/aiAgent/types/tools.ts
touch lib/aiAgent/types/workflows.ts
```

### **Step 1.3: Test Integration** 🧪
- Replace GraphQL calls in AgentService one by one
- Ensure no behavioral changes
- Add unit tests for GraphQLClient

**Expected Reduction: -200 lines from AgentService**

---

## 🛠️ **Phase 2: Tool Registry & Executor (Week 2)**

### **Step 2.1: Create Tool Infrastructure**
```bash
mkdir -p lib/aiAgent/tools
touch lib/aiAgent/tools/ToolRegistry.ts
touch lib/aiAgent/tools/ToolExecutor.ts
```

### **Step 2.2: Extract Tool Definitions**
- Move `discoverTools()` method to ToolRegistry
- Keep tool execution in AgentService temporarily
- Create interfaces for tool categories

### **Step 2.3: Create Base Tool Executor**
- Extract common tool execution patterns
- Create error handling framework
- Add tool result formatting

**Expected Reduction: -400 lines from AgentService**

---

## 📦 **Phase 3: Domain Tool Modules (Weeks 3-4)**

### **Step 3.1: Deal Tools (Day 1-2)**
```bash
mkdir -p lib/aiAgent/tools/deals
touch lib/aiAgent/tools/deals/DealTools.ts
touch lib/aiAgent/tools/deals/DealQueries.ts
```

**Migration Order:**
1. `search_deals` → DealTools.searchDeals()
2. `get_deal_details` → DealTools.getDealDetails()
3. `create_deal` → DealTools.createDeal()
4. `update_deal` → DealTools.updateDeal()
5. `analyze_pipeline` → DealTools.analyzePipeline()

### **Step 3.2: Organization Tools (Day 3-4)**
```bash
mkdir -p lib/aiAgent/tools/organizations
touch lib/aiAgent/tools/organizations/OrganizationTools.ts
touch lib/aiAgent/tools/organizations/OrganizationQueries.ts
```

### **Step 3.3: Contact Tools (Day 5-6)**
```bash
mkdir -p lib/aiAgent/tools/contacts
touch lib/aiAgent/tools/contacts/ContactTools.ts
touch lib/aiAgent/tools/contacts/ContactQueries.ts
```

### **Step 3.4: Activity Tools (Day 7-8)**
```bash
mkdir -p lib/aiAgent/tools/activities
touch lib/aiAgent/tools/activities/ActivityTools.ts
touch lib/aiAgent/tools/activities/ActivityQueries.ts
```

### **Step 3.5: Custom Field Tools (Day 9-10)**
```bash
mkdir -p lib/aiAgent/tools/customFields
touch lib/aiAgent/tools/customFields/CustomFieldTools.ts
touch lib/aiAgent/tools/customFields/CustomFieldQueries.ts
```

**Expected Reduction: -1,200 lines from AgentService**

---

## 🔄 **Phase 4: Workflow Engine (Week 5)**

### **Step 4.1: Extract Sequential Logic**
```bash
mkdir -p lib/aiAgent/core
touch lib/aiAgent/core/WorkflowEngine.ts
touch lib/aiAgent/utils/TaskCompletion.ts
```

### **Step 4.2: Create Workflow Types**
- Define WorkflowStep interface
- Create WorkflowResult types
- Add progress tracking

### **Step 4.3: Migrate Complex Logic**
- Move `executeSequentialWorkflow()`
- Move `isTaskComplete()`
- Add workflow state management

**Expected Reduction: -500 lines from AgentService**

---

## 📋 **Phase 5: Managers (Week 6)**

### **Step 5.1: Conversation Manager**
```bash
touch lib/aiAgent/core/ConversationManager.ts
```
- Move all conversation CRUD operations
- Add conversation state management
- Create conversation utilities

### **Step 5.2: Thought Manager**
```bash
touch lib/aiAgent/core/ThoughtManager.ts
```
- Move all thought CRUD operations
- Add real-time thought updates
- Create thought analytics

**Expected Reduction: -300 lines from AgentService**

---

## 🎯 **Phase 6: Core Service Refactor (Week 7)**

### **Step 6.1: Dependency Injection Setup**
- Refactor constructor to accept managers
- Create factory pattern for service creation
- Add configuration injection

### **Step 6.2: Slim Down to Orchestration**
- Keep only high-level orchestration logic
- Remove all implementation details
- Focus on coordination between modules

**Expected Final Size: ~200 lines for core AgentService**

---

## 🧪 **Testing Strategy Per Phase**

### **Unit Tests**
```bash
mkdir -p lib/aiAgent/__tests__/
mkdir -p lib/aiAgent/__tests__/utils/
mkdir -p lib/aiAgent/__tests__/tools/
mkdir -p lib/aiAgent/__tests__/core/
```

### **Test Files Structure**
```
__tests__/
├── utils/
│   ├── GraphQLClient.test.ts
│   ├── ResponseFormatter.test.ts
│   └── TaskCompletion.test.ts
├── tools/
│   ├── ToolRegistry.test.ts
│   ├── ToolExecutor.test.ts
│   ├── deals/
│   │   ├── DealTools.test.ts
│   │   └── DealQueries.test.ts
│   └── organizations/
│       ├── OrganizationTools.test.ts
│       └── OrganizationQueries.test.ts
└── core/
    ├── AgentService.test.ts
    ├── WorkflowEngine.test.ts
    ├── ConversationManager.test.ts
    └── ThoughtManager.test.ts
```

### **Integration Tests**
- End-to-end workflow tests
- Real GraphQL integration tests
- Performance regression tests

---

## 🔍 **Code Quality Gates**

### **Pre-commit Checks**
```json
{
  "scripts": {
    "lint:aiAgent": "eslint lib/aiAgent/**/*.ts",
    "test:aiAgent": "jest lib/aiAgent",
    "type-check:aiAgent": "tsc --noEmit lib/aiAgent/**/*.ts",
    "complexity:aiAgent": "complexity-report lib/aiAgent"
  }
}
```

### **Quality Metrics**
- ✅ No file > 300 lines
- ✅ Cyclomatic complexity < 10
- ✅ Test coverage > 90%
- ✅ No circular dependencies

---

## 🚀 **Safe Migration Checklist**

### **Before Each Phase**
- [ ] Create feature branch
- [ ] Run full test suite
- [ ] Document current functionality
- [ ] Create rollback plan

### **During Each Phase**
- [ ] Implement new module
- [ ] Add comprehensive tests
- [ ] Update existing code gradually
- [ ] Monitor for breaking changes

### **After Each Phase**
- [ ] Run regression tests
- [ ] Performance benchmarks
- [ ] Code review
- [ ] Documentation update

---

## 📊 **Progress Tracking**

### **Line Count Reduction Goals**
```
Phase 1: 2,376 → 2,176 lines (-200)  [GraphQL extraction]
Phase 2: 2,176 → 1,776 lines (-400)  [Tool registry]
Phase 3: 1,776 → 576 lines (-1,200)  [Domain modules]
Phase 4: 576 → 276 lines (-300)      [Workflow engine]
Phase 5: 276 → 176 lines (-100)      [Managers]
Phase 6: 176 → 150 lines (-26)       [Final cleanup]
```

### **Module Size Verification**
```bash
# Check module sizes after each phase
find lib/aiAgent -name "*.ts" -exec wc -l {} + | sort -n
```

---

## 🔄 **Rollback Strategy**

### **Git Strategy**
```bash
# Create checkpoint branches
git checkout -b refactor/phase-1-complete
git checkout -b refactor/phase-2-complete
# etc.
```

### **Feature Flags**
```typescript
// Use environment variables for gradual rollout
const USE_NEW_TOOL_EXECUTOR = process.env.USE_NEW_TOOL_EXECUTOR === 'true';
```

### **A/B Testing**
- Run old and new implementations in parallel
- Compare performance and behavior
- Gradual traffic migration

---

## ⚡ **Quick Start Commands**

### **Start Phase 1 Now**
```bash
# 1. Create directory structure
mkdir -p lib/aiAgent/{utils,tools,core,types}

# 2. Create GraphQLClient
cat > lib/aiAgent/utils/GraphQLClient.ts << 'EOF'
/**
 * Centralized GraphQL client for PipeCD AI Agent
 */
export class GraphQLClient {
  constructor(private endpoint: string) {}
  
  async execute<T>(query: string, variables?: any, authToken?: string): Promise<T> {
    // Implementation coming...
  }
}
EOF

# 3. Start first migration
git checkout -b refactor/phase-1-graphql-client
```

### **Verify Setup**
```bash
# Check new structure
tree lib/aiAgent/

# Verify TypeScript compilation
npx tsc --noEmit lib/aiAgent/**/*.ts
```

---

## 🎯 **Success Criteria**

### **Phase Completion Criteria**
- ✅ All existing tests pass
- ✅ No performance regression (< 5%)
- ✅ Code coverage maintained
- ✅ Documentation updated
- ✅ Team review approved

### **Final Success Metrics**
- 🎯 **Maintainability**: 15+ focused modules vs 1 monolith
- 🎯 **Testability**: 90%+ test coverage with isolated unit tests
- 🎯 **Developer Experience**: New tool creation in < 30 minutes
- 🎯 **Performance**: Zero performance regression
- 🎯 **Reliability**: Same functionality, better error isolation

---

**Ready to begin? Let's start with Phase 1!** 🚀

```bash
# Your next command:
cd lib/aiAgent && mkdir -p utils tools core types
``` 