# 🚀 **Quick Start: Testing Bi-Directional Conversion System**

## **🎯 TL;DR - Run All Tests**

```bash
# Run complete test suite (automated)
node scripts/run-conversion-tests.js

# Or run individual test phases
node scripts/test-conversion-system.js      # Backend tests
node scripts/test-graphql-conversion.js     # GraphQL API tests  
node scripts/test-frontend-conversion.js    # Frontend tests
```

---

## **📋 Prerequisites Checklist**

Before running tests, ensure you have:

- [ ] **Local Supabase running**: `npx supabase start`
- [ ] **Database migration applied**: `npx supabase db reset` (includes conversion system)
- [ ] **Netlify dev running**: `netlify dev` (for GraphQL endpoint)
- [ ] **Dependencies installed**: `npm install` (both root and frontend/)
- [ ] **Environment variables set**: Check `.env` files

---

## **🧪 Test Phases Overview**

### **Phase 1: Backend Services** 🗄️
Tests database schema, services, and business logic
```bash
node scripts/test-conversion-system.js
```

**What it tests:**
- ✅ Database tables (conversion_history, reactivation_plans)
- ✅ Service layer functions (conversion, validation, history)
- ✅ Database constraints and relationships
- ✅ Performance with bulk operations

### **Phase 2: GraphQL API** 🔌
Tests GraphQL schema, resolvers, and operations
```bash
node scripts/test-graphql-conversion.js
```

**What it tests:**
- ✅ Schema introspection and type definitions
- ✅ Queries (validation, history, statistics)
- ✅ Mutations (lead-to-deal, deal-to-lead, bulk conversion)
- ✅ Error handling and validation responses

### **Phase 3: Frontend Components** 🎨
Tests React components, hooks, and TypeScript compilation
```bash
node scripts/test-frontend-conversion.js
```

**What it tests:**
- ✅ Component files exist and compile
- ✅ TypeScript type checking passes
- ✅ Build process succeeds
- ✅ Import/export structure is correct
- ✅ Generates manual testing guide

### **Phase 4: End-to-End (E2E)** 🔄
Tests complete user workflows in browser
```bash
npx playwright test conversion.spec.ts
```

**What it tests:**
- ✅ Modal opening and form interactions
- ✅ Navigation between pages
- ✅ Responsive design
- ✅ Error handling and accessibility

---

## **⚡ Quick Test Commands**

### **Run Everything (Recommended)**
```bash
# Complete automated test suite
node scripts/run-conversion-tests.js
```

### **Individual Phase Testing**
```bash
# Test just the backend
node scripts/test-conversion-system.js

# Test just GraphQL API
node scripts/test-graphql-conversion.js

# Test just frontend compilation
node scripts/test-frontend-conversion.js

# Test just E2E (requires Playwright)
npx playwright test conversion.spec.ts
```

### **Manual Testing**
```bash
# Generate manual testing guide
node scripts/test-frontend-conversion.js
# Then open: scripts/FRONTEND_CONVERSION_TESTING_GUIDE.md
```

---

## **🔧 Troubleshooting Common Issues**

### **"Supabase not running"**
```bash
npx supabase start
# Wait for all services to start (30-60 seconds)
```

### **"GraphQL endpoint not accessible"**
```bash
netlify dev
# Wait for functions to compile
# Test: curl http://localhost:8888/.netlify/functions/graphql
```

### **"Migration not applied"**
```bash
npx supabase db reset
# This applies all migrations including conversion system
```

### **"TypeScript compilation failed"**
```bash
cd frontend
npm run type-check
# Fix any TypeScript errors shown
```

### **"Missing dependencies"**
```bash
npm install
cd frontend && npm install
```

---

## **📊 Understanding Test Results**

### **✅ All Tests Pass**
```
🎉 ALL CRITICAL TESTS PASSED!
📋 Manual testing guide available at: scripts/FRONTEND_CONVERSION_TESTING_GUIDE.md
🚀 Conversion system is ready for manual testing and deployment!
```

**Next Steps:**
1. Follow manual testing guide
2. Test in staging environment
3. Deploy to production

### **❌ Some Tests Fail**
```
❌ SOME TESTS FAILED
📊 Check the test report for details: scripts/CONVERSION_SYSTEM_TEST_REPORT.md
🛠️ Fix the issues and re-run the tests
```

**Next Steps:**
1. Review test report for specific failures
2. Fix identified issues
3. Re-run tests until all pass

---

## **📁 Generated Files**

After running tests, you'll find:

- **`scripts/CONVERSION_SYSTEM_TEST_REPORT.md`** - Comprehensive test results
- **`scripts/FRONTEND_CONVERSION_TESTING_GUIDE.md`** - Manual testing instructions
- **Console output** - Real-time test progress and results

---

## **🎯 Success Metrics**

### **Automated Tests Should Show:**
- ✅ Backend: 6/6 tests passed
- ✅ GraphQL: 8/8 tests passed  
- ✅ Frontend: 5/5 tests passed
- ✅ E2E: Tests passed or skipped (optional)

### **Manual Testing Should Verify:**
- ✅ Lead-to-deal conversion works end-to-end
- ✅ Deal-to-lead conversion works with reactivation plans
- ✅ Bulk conversion processes multiple leads
- ✅ Conversion history displays correctly
- ✅ Form validation prevents invalid submissions
- ✅ UI is responsive and accessible

---

## **🚨 When Tests Fail**

### **Backend Failures**
- Check Supabase is running: `npx supabase status`
- Verify migration applied: `npx supabase db reset`
- Check database connectivity and permissions

### **GraphQL Failures**  
- Ensure netlify dev is running
- Check GraphQL endpoint: `curl http://localhost:8888/.netlify/functions/graphql`
- Verify schema compilation in netlify functions

### **Frontend Failures**
- Run TypeScript check: `cd frontend && npm run type-check`
- Check for missing imports or type errors
- Verify all component files exist

### **E2E Failures**
- Install Playwright: `npx playwright install`
- Check if frontend dev server is running
- Verify authentication flow works

---

## **📞 Need Help?**

1. **Check the test report**: `scripts/CONVERSION_SYSTEM_TEST_REPORT.md`
2. **Review console output** for specific error messages
3. **Follow manual testing guide** for step-by-step instructions
4. **Verify prerequisites** are all met

---

**🎉 Happy Testing! The conversion system is designed to be robust and well-tested at every layer.** 