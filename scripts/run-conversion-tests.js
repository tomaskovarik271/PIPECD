#!/usr/bin/env node

/**
 * Master Test Runner for Bi-Directional Conversion System
 * Orchestrates all testing phases: Backend → GraphQL → Frontend → E2E
 */

const { ConversionSystemTester } = require('./test-conversion-system');
const { GraphQLConversionTester } = require('./test-graphql-conversion');
const { FrontendConversionTester } = require('./test-frontend-conversion');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MasterConversionTester {
  constructor() {
    this.testResults = {
      backend: null,
      graphql: null,
      frontend: null,
      e2e: null
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...', 'info');

    // Check if Supabase is running
    try {
      const supabaseCheck = await this.runCommand('curl', ['-s', 'http://localhost:54321/rest/v1/'], { timeout: 5000 });
      if (supabaseCheck.code !== 0) {
        throw new Error('Supabase not running on localhost:54321');
      }
      this.log('✅ Supabase is running', 'success');
    } catch (error) {
      this.log('❌ Supabase not accessible. Please start local Supabase first.', 'error');
      this.log('   Run: npx supabase start', 'info');
      return false;
    }

    // Check if GraphQL endpoint is accessible
    try {
      const graphqlCheck = await this.runCommand('curl', ['-s', 'http://localhost:8888/.netlify/functions/graphql'], { timeout: 5000 });
      if (graphqlCheck.code !== 0) {
        this.log('⚠️ GraphQL endpoint not accessible. Starting netlify dev...', 'warning');
        // Don't fail here, we'll try to start it
      } else {
        this.log('✅ GraphQL endpoint is accessible', 'success');
      }
    } catch (error) {
      this.log('⚠️ GraphQL endpoint check failed, will attempt to start netlify dev', 'warning');
    }

    // Check if migration has been run
    try {
      const migrationCheck = await this.runCommand('npx', ['supabase', 'db', 'diff', '--schema', 'public'], { cwd: process.cwd() });
      if (migrationCheck.stdout.includes('conversion_history') || migrationCheck.stdout.includes('reactivation_plans')) {
        this.log('⚠️ Conversion system migration may not be applied', 'warning');
        this.log('   Consider running: npx supabase db reset', 'info');
      } else {
        this.log('✅ Database schema appears up to date', 'success');
      }
    } catch (error) {
      this.log('⚠️ Could not verify migration status', 'warning');
    }

    return true;
  }

  async runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        stdio: 'pipe',
        ...options
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = options.timeout ? setTimeout(() => {
        proc.kill();
        reject(new Error(`Command timed out: ${command} ${args.join(' ')}`));
      }, options.timeout) : null;

      proc.on('close', (code) => {
        if (timeout) clearTimeout(timeout);
        resolve({ code, stdout, stderr });
      });

      proc.on('error', (error) => {
        if (timeout) clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async runBackendTests() {
    this.log('🗄️ Running Backend Tests...', 'info');
    this.log('============================', 'info');

    try {
      const tester = new ConversionSystemTester();
      const results = await tester.runAllTests();
      this.testResults.backend = results;
      
      if (results.failed === 0) {
        this.log('✅ Backend tests passed!', 'success');
        return true;
      } else {
        this.log(`❌ Backend tests failed: ${results.failed}/${results.total}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Backend test runner failed: ${error.message}`, 'error');
      this.testResults.backend = { passed: 0, failed: 1, total: 1, error: error.message };
      return false;
    }
  }

  async runGraphQLTests() {
    this.log('🔌 Running GraphQL Tests...', 'info');
    this.log('===========================', 'info');

    try {
      const tester = new GraphQLConversionTester();
      const results = await tester.runAllTests();
      this.testResults.graphql = results;
      
      if (results.failed === 0) {
        this.log('✅ GraphQL tests passed!', 'success');
        return true;
      } else {
        this.log(`❌ GraphQL tests failed: ${results.failed}/${results.total}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ GraphQL test runner failed: ${error.message}`, 'error');
      this.testResults.graphql = { passed: 0, failed: 1, total: 1, error: error.message };
      return false;
    }
  }

  async runFrontendTests() {
    this.log('🎨 Running Frontend Tests...', 'info');
    this.log('============================', 'info');

    try {
      const tester = new FrontendConversionTester();
      const results = await tester.runAutomatedTests();
      this.testResults.frontend = results;
      
      if (results.failed === 0) {
        this.log('✅ Frontend tests passed!', 'success');
        return true;
      } else {
        this.log(`❌ Frontend tests failed: ${results.failed}/${results.total}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Frontend test runner failed: ${error.message}`, 'error');
      this.testResults.frontend = { passed: 0, failed: 1, total: 1, error: error.message };
      return false;
    }
  }

  async runE2ETests() {
    this.log('🔄 Running E2E Tests...', 'info');
    this.log('=======================', 'info');

    try {
      // Check if Playwright is available
      const playwrightCheck = await this.runCommand('npx', ['playwright', '--version'], { timeout: 5000 });
      
      if (playwrightCheck.code !== 0) {
        this.log('⚠️ Playwright not available, skipping E2E tests', 'warning');
        this.log('   Install with: npx playwright install', 'info');
        this.testResults.e2e = { passed: 0, failed: 0, total: 0, skipped: true };
        return true;
      }

      // Run E2E tests (if they exist)
      const e2eTestPath = path.join(process.cwd(), 'e2e', 'conversion.spec.ts');
      
      if (!fs.existsSync(e2eTestPath)) {
        this.log('⚠️ E2E conversion tests not found, skipping', 'warning');
        this.log('   Expected: e2e/conversion.spec.ts', 'info');
        this.testResults.e2e = { passed: 0, failed: 0, total: 0, skipped: true };
        return true;
      }

      const e2eResult = await this.runCommand('npx', ['playwright', 'test', 'conversion.spec.ts'], {
        cwd: process.cwd(),
        timeout: 60000 // 1 minute timeout for E2E
      });

      if (e2eResult.code === 0) {
        this.log('✅ E2E tests passed!', 'success');
        this.testResults.e2e = { passed: 1, failed: 0, total: 1 };
        return true;
      } else {
        this.log('❌ E2E tests failed', 'error');
        this.log(e2eResult.stderr || e2eResult.stdout, 'error');
        this.testResults.e2e = { passed: 0, failed: 1, total: 1 };
        return false;
      }
    } catch (error) {
      this.log(`❌ E2E test runner failed: ${error.message}`, 'error');
      this.testResults.e2e = { passed: 0, failed: 1, total: 1, error: error.message };
      return false;
    }
  }

  generateTestReport() {
    const duration = Date.now() - this.startTime;
    const report = `
# 🧪 Conversion System Test Report

**Generated**: ${new Date().toISOString()}
**Duration**: ${duration}ms (${(duration / 1000).toFixed(2)}s)

## 📊 Test Results Summary

### Backend Tests
${this.testResults.backend ? `
- **Status**: ${this.testResults.backend.failed === 0 ? '✅ PASSED' : '❌ FAILED'}
- **Tests**: ${this.testResults.backend.passed}/${this.testResults.backend.total} passed
${this.testResults.backend.error ? `- **Error**: ${this.testResults.backend.error}` : ''}
` : '- **Status**: ⏭️ SKIPPED'}

### GraphQL Tests
${this.testResults.graphql ? `
- **Status**: ${this.testResults.graphql.failed === 0 ? '✅ PASSED' : '❌ FAILED'}
- **Tests**: ${this.testResults.graphql.passed}/${this.testResults.graphql.total} passed
${this.testResults.graphql.error ? `- **Error**: ${this.testResults.graphql.error}` : ''}
` : '- **Status**: ⏭️ SKIPPED'}

### Frontend Tests
${this.testResults.frontend ? `
- **Status**: ${this.testResults.frontend.failed === 0 ? '✅ PASSED' : '❌ FAILED'}
- **Tests**: ${this.testResults.frontend.passed}/${this.testResults.frontend.total} passed
${this.testResults.frontend.error ? `- **Error**: ${this.testResults.frontend.error}` : ''}
` : '- **Status**: ⏭️ SKIPPED'}

### E2E Tests
${this.testResults.e2e ? `
- **Status**: ${this.testResults.e2e.skipped ? '⏭️ SKIPPED' : this.testResults.e2e.failed === 0 ? '✅ PASSED' : '❌ FAILED'}
- **Tests**: ${this.testResults.e2e.passed}/${this.testResults.e2e.total} passed
${this.testResults.e2e.error ? `- **Error**: ${this.testResults.e2e.error}` : ''}
` : '- **Status**: ⏭️ SKIPPED'}

## 🎯 Overall Status

${this.getOverallStatus()}

## 📋 Next Steps

${this.getNextSteps()}

## 📁 Generated Files

- **Manual Testing Guide**: \`scripts/FRONTEND_CONVERSION_TESTING_GUIDE.md\`
- **Test Report**: \`scripts/CONVERSION_SYSTEM_TEST_REPORT.md\`

---

*Report generated by PipeCD Conversion System Test Runner*
`;

    const reportPath = path.join(__dirname, 'CONVERSION_SYSTEM_TEST_REPORT.md');
    fs.writeFileSync(reportPath, report);
    
    this.log(`Test report generated: ${reportPath}`, 'info');
    return reportPath;
  }

  getOverallStatus() {
    const allResults = Object.values(this.testResults).filter(r => r !== null);
    const totalFailed = allResults.reduce((sum, r) => sum + (r.failed || 0), 0);
    const totalPassed = allResults.reduce((sum, r) => sum + (r.passed || 0), 0);
    const totalTests = allResults.reduce((sum, r) => sum + (r.total || 0), 0);

    if (totalFailed === 0 && totalTests > 0) {
      return '🎉 **ALL TESTS PASSED** - Conversion system is ready for production!';
    } else if (totalFailed > 0) {
      return `❌ **TESTS FAILED** - ${totalFailed} test(s) failed out of ${totalTests} total`;
    } else {
      return '⚠️ **NO TESTS RUN** - Please check prerequisites and try again';
    }
  }

  getNextSteps() {
    const allResults = Object.values(this.testResults).filter(r => r !== null);
    const totalFailed = allResults.reduce((sum, r) => sum + (r.failed || 0), 0);

    if (totalFailed === 0) {
      return `
1. ✅ **All automated tests passed!**
2. 📋 **Proceed with manual testing** using the generated guide
3. 🚀 **Deploy to staging** environment for final validation
4. 🎯 **Ready for production** deployment
`;
    } else {
      return `
1. ❌ **Fix failing tests** before proceeding
2. 🔍 **Review error messages** in the test output above
3. 🛠️ **Make necessary corrections** to code/configuration
4. 🔄 **Re-run tests** until all pass
5. 📋 **Then proceed with manual testing**
`;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Conversion System Testing', 'info');
    this.log('===================================================', 'info');

    // Check prerequisites
    const prereqsOk = await this.checkPrerequisites();
    if (!prereqsOk) {
      this.log('❌ Prerequisites not met. Please fix and try again.', 'error');
      return false;
    }

    let allPassed = true;

    // Run tests in sequence (each depends on the previous)
    const backendPassed = await this.runBackendTests();
    if (!backendPassed) {
      this.log('⏭️ Skipping remaining tests due to backend failures', 'warning');
      allPassed = false;
    } else {
      const graphqlPassed = await this.runGraphQLTests();
      if (!graphqlPassed) {
        this.log('⏭️ Skipping frontend tests due to GraphQL failures', 'warning');
        allPassed = false;
      } else {
        const frontendPassed = await this.runFrontendTests();
        if (!frontendPassed) {
          this.log('⏭️ Skipping E2E tests due to frontend failures', 'warning');
          allPassed = false;
        } else {
          // E2E tests are optional and don't affect overall status
          await this.runE2ETests();
        }
      }
    }

    // Generate comprehensive report
    const reportPath = this.generateTestReport();

    // Print final summary
    this.log('===================================================', 'info');
    this.log('🏁 FINAL TEST SUMMARY', 'info');
    this.log('===================================================', 'info');

    if (allPassed) {
      this.log('🎉 ALL CRITICAL TESTS PASSED!', 'success');
      this.log('📋 Manual testing guide available at: scripts/FRONTEND_CONVERSION_TESTING_GUIDE.md', 'info');
      this.log('📊 Full test report available at: scripts/CONVERSION_SYSTEM_TEST_REPORT.md', 'info');
      this.log('🚀 Conversion system is ready for manual testing and deployment!', 'success');
    } else {
      this.log('❌ SOME TESTS FAILED', 'error');
      this.log('📊 Check the test report for details: scripts/CONVERSION_SYSTEM_TEST_REPORT.md', 'info');
      this.log('🛠️ Fix the issues and re-run the tests', 'info');
    }

    const totalDuration = Date.now() - this.startTime;
    this.log(`⏱️ Total testing time: ${(totalDuration / 1000).toFixed(2)}s`, 'info');

    return allPassed;
  }
}

// Main execution
async function main() {
  const masterTester = new MasterConversionTester();
  
  try {
    const success = await masterTester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Master test runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { MasterConversionTester }; 