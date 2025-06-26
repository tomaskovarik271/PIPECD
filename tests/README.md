# PipeCD Testing Stack - Business-Focused Testing

## 🚀 Overview

PipeCD's redesigned testing stack focuses on **business value** rather than testing for the sake of testing. Every test validates real business scenarios that matter to our users.

## 📁 Test Structure

```
tests/
├── setup/
│   └── testEnvironment.ts     # Test environment setup & cleanup
├── factories/
│   └── businessScenarios.ts   # Business scenario data factories
├── unit/
│   ├── dealLifecycle.test.ts       # Deal business logic
│   └── collaborationModel.test.ts  # Permission system
├── integration/
│   └── aiAgentV2.test.ts           # AI agent tools integration
├── performance/
│   └── databaseOperations.test.ts  # Performance benchmarks
└── e2e/
    └── [future playwright tests]   # End-to-end user journeys
```

## 🎯 Testing Philosophy

### **Business-Focused Testing**
- ✅ **Test business logic that users depend on**
- ✅ **Validate real user scenarios**
- ✅ **Ensure collaboration model works**
- ✅ **Verify AI tools perform correctly**
- ❌ **Don't test implementation details**
- ❌ **Don't mock what you should test**

### **Test Categories**

#### **Unit Tests** (`tests/unit/`)
Focus on core business logic:
- Deal lifecycle (creation, updates, WFM integration)
- Collaboration permissions (new team editing model)
- Service layer business rules
- Data validation and integrity

#### **Integration Tests** (`tests/integration/`)
Test system integrations:
- AI Agent V2 tools (CreateDealTool, SearchDealsTool)
- GraphQL API with real database
- Service layer interactions
- Permission system integration

#### **Performance Tests** (`tests/performance/`)
Ensure system performance:
- Database operation benchmarks
- AI tool response times
- Bulk data handling
- Memory usage validation

## 🛠 Usage

### **Run All Tests**
```bash
npm run test:all
```

### **Focused Test Categories**
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only  
npm run test:performance   # Performance tests only
npm run test:business      # Core business logic
npm run test:ai            # AI agent functionality
```

### **Development Workflow**
```bash
npm run test:watch         # Watch mode for active development
npm run test:coverage      # Coverage report
npm run test:ui            # Visual test interface
```

## 🏗 Test Environment

### **Automatic Setup**
Each test gets:
- ✅ Isolated Supabase environment
- ✅ Clean test user with proper permissions  
- ✅ Automatic cleanup after test completion
- ✅ Business scenario data factories

### **Business Scenarios**
Pre-built realistic scenarios:
- **Enterprise Sales**: BNP Paribas-style large deals, multiple stakeholders
- **Startup Sales**: SMB deals, faster cycles, smaller amounts

```typescript
// Example usage
const scenario = await factory.createEnterpriseSalesScenario();
// Creates: organizations, people, deals, leads with realistic data
```

## 📊 Performance Thresholds

### **Response Time Targets**
- Deal creation: < 1000ms
- Deal search: < 500ms  
- AI tool execution: < 1000ms
- Bulk operations (10 items): < 3000ms

### **Coverage Goals**
- Business Logic: 85%+
- Service Layer: 80%+
- AI Tools: 90%+
- Overall: 70%+

## 🔧 Configuration

### **Environment Variables**
```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
```

### **Test Database**
- Uses local Supabase instance
- Isolated test data per test
- Automatic cleanup prevents pollution

## 🎨 Writing Tests

### **Good Test Example**
```typescript
it('should create deal with proper WFM integration', async () => {
  // Arrange: Create business scenario
  const scenario = await factory.createEnterpriseSalesScenario();
  
  // Act: Perform business operation
  const deal = await dealService.createDeal(testUserId, dealInput, 'token');
  
  // Assert: Verify business requirements
  expect(deal.wfm_project_id).toBeDefined(); // Critical for Kanban
  expect(deal.amount).toBe(750000);
  
  await scenario.cleanup();
});
```

### **Testing Guidelines**
1. **Test behavior, not implementation**
2. **Use realistic business data**  
3. **Focus on user-facing functionality**
4. **Include performance assertions**
5. **Clean up after each test**

## 🚦 CI/CD Integration

### **Pre-commit Hooks**
- Run unit tests
- Check code coverage
- Lint code quality

### **Pull Request Tests**
- Full test suite
- Performance benchmarks
- Coverage report

### **Deployment Tests**
- Smoke tests in staging
- Integration verification
- Performance monitoring

## 📈 Metrics & Monitoring

### **Test Metrics**
- Test execution time
- Coverage percentages  
- Failure rates
- Performance benchmarks

### **Business Metrics**
- Feature reliability
- User scenario coverage
- Performance compliance
- Bug prevention rate

---

## 🎯 Key Benefits

1. **Business Confidence**: Tests validate real user scenarios
2. **Fast Development**: Quick feedback on business logic
3. **Performance Assurance**: Built-in performance monitoring
4. **Collaboration Testing**: Validates new team editing model
5. **AI Reliability**: Ensures AI tools work correctly
6. **Clean Architecture**: Tests reflect real system usage 