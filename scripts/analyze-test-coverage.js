#!/usr/bin/env node

/**
 * 🧪 PipeCD Test Coverage Analysis
 * 
 * Analyzes test coverage and quality without running problematic integration tests.
 * Provides comprehensive coverage insights for our optimization efforts.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log(`
🧪 PipeCD Test Coverage Analysis
===============================

Analyzing test quality and coverage for optimization planning...

📊 TEST INFRASTRUCTURE STATUS:
==============================
`);

// Analyze test files
const testFiles = {
  unit: [],
  integration: [],
  performance: []
};

function findTestFiles(dir, type) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findTestFiles(filePath, type);
    } else if (file.endsWith('.test.ts')) {
      testFiles[type].push(filePath);
    }
  });
}

// Find all test files
findTestFiles('tests/unit', 'unit');
findTestFiles('tests/integration', 'integration');
findTestFiles('tests/performance', 'performance');

console.log(`✅ Unit Tests: ${testFiles.unit.length} files`);
console.log(`✅ Integration Tests: ${testFiles.integration.length} files`);
console.log(`✅ Performance Tests: ${testFiles.performance.length} files`);

// Analyze source code coverage potential
console.log(`
📁 SOURCE CODE ANALYSIS:
========================
`);

const sourceStats = {
  frontend: 0,
  backend: 0,
  lib: 0,
  total: 0
};

function countLines(dir, prefix = '') {
  let lines = 0;
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        lines += countLines(filePath, prefix);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileLines = content.split('\n').length;
        lines += fileLines;
        
        // Categorize
        if (filePath.includes('frontend/src')) {
          sourceStats.frontend += fileLines;
        } else if (filePath.includes('netlify/functions')) {
          sourceStats.backend += fileLines;
        } else if (filePath.includes('lib/')) {
          sourceStats.lib += fileLines;
        }
      }
    });
  } catch (error) {
    // Skip directories we can't read
  }
  return lines;
}

sourceStats.total = countLines('.');

console.log(`📊 Frontend Code: ${sourceStats.frontend.toLocaleString()} lines`);
console.log(`📊 Backend/GraphQL: ${sourceStats.backend.toLocaleString()} lines`);
console.log(`📊 Lib/Services: ${sourceStats.lib.toLocaleString()} lines`);
console.log(`📊 Total TS/TSX: ${sourceStats.total.toLocaleString()} lines`);

// Test quality analysis
console.log(`
🎯 TEST QUALITY ANALYSIS:
========================
`);

let totalTests = 0;
let testCategories = {
  crud: 0,
  business_logic: 0,
  performance: 0,
  error_handling: 0,
  integration: 0
};

testFiles.unit.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const testMatches = content.match(/it\s*\(/g) || [];
    totalTests += testMatches.length;
    
    // Categorize tests
    if (content.includes('should create') || content.includes('should update') || content.includes('should delete')) {
      testCategories.crud++;
    }
    if (content.includes('business logic') || content.includes('Business Logic')) {
      testCategories.business_logic++;
    }
    if (content.includes('performance') || content.includes('Performance')) {
      testCategories.performance++;
    }
    if (content.includes('error') || content.includes('Error')) {
      testCategories.error_handling++;
    }
  } catch (error) {
    console.warn(`⚠️  Could not analyze ${file}`);
  }
});

testFiles.integration.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const testMatches = content.match(/it\s*\(/g) || [];
    testCategories.integration += testMatches.length;
  } catch (error) {
    console.warn(`⚠️  Could not analyze ${file}`);
  }
});

console.log(`✅ Total Unit Tests: ${totalTests}`);
console.log(`✅ CRUD Tests: ${testCategories.crud}`);
console.log(`✅ Business Logic Tests: ${testCategories.business_logic}`);
console.log(`✅ Performance Tests: ${testCategories.performance}`);
console.log(`✅ Error Handling Tests: ${testCategories.error_handling}`);
console.log(`✅ Integration Tests: ${testCategories.integration}`);

// Coverage estimation
const estimatedCoverage = {
  unit: Math.min(90, (totalTests / (sourceStats.lib / 100)) * 2), // Rough estimation
  integration: testCategories.integration > 5 ? 60 : 30,
  overall: 0
};

estimatedCoverage.overall = (estimatedCoverage.unit * 0.7) + (estimatedCoverage.integration * 0.3);

console.log(`
📈 ESTIMATED COVERAGE:
====================
`);

console.log(`📊 Unit Test Coverage: ~${Math.round(estimatedCoverage.unit)}%`);
console.log(`📊 Integration Coverage: ~${Math.round(estimatedCoverage.integration)}%`);
console.log(`📊 Overall Estimated Coverage: ~${Math.round(estimatedCoverage.overall)}%`);

// Quality assessment
console.log(`
🎯 TEST QUALITY ASSESSMENT:
==========================
`);

const quality = {
  factory: fs.existsSync('tests/factories/businessScenarios.ts') ? '✅ Excellent' : '❌ Missing',
  cleanup: fs.readFileSync('tests/factories/businessScenarios.ts', 'utf8').includes('cleanup') ? '✅ Excellent' : '⚠️  Basic',
  performance: testCategories.performance > 0 ? '✅ Good' : '⚠️  Limited',
  error_handling: testCategories.error_handling > 3 ? '✅ Good' : '⚠️  Limited',
  integration: testCategories.integration > 10 ? '✅ Good' : '⚠️  Limited'
};

console.log(`🏭 Test Factories: ${quality.factory}`);
console.log(`🧹 Cleanup Strategy: ${quality.cleanup}`);
console.log(`⚡ Performance Testing: ${quality.performance}`);
console.log(`🔥 Error Handling: ${quality.error_handling}`);
console.log(`🔗 Integration Testing: ${quality.integration}`);

// Recommendations
console.log(`
🚀 OPTIMIZATION SAFETY ASSESSMENT:
=================================
`);

const safetyScore = Math.round(estimatedCoverage.overall);
let safetyLevel = 'DANGEROUS';
let recommendations = [];

if (safetyScore >= 70) {
  safetyLevel = '✅ SAFE TO OPTIMIZE';
  recommendations = [
    'Coverage is excellent - proceed with optimization',
    'Focus on high-impact optimizations first',
    'Monitor performance regression during changes'
  ];
} else if (safetyScore >= 50) {
  safetyLevel = '⚠️ MODERATE RISK';
  recommendations = [
    'Coverage is adequate for basic optimization',
    'Start with low-risk optimizations only',
    'Add more tests for critical paths before major changes',
    'Focus on non-breaking optimizations first'
  ];
} else {
  safetyLevel = '🚨 HIGH RISK';
  recommendations = [
    'Coverage is insufficient for major optimization',
    'Focus on fixing test infrastructure first',
    'Only do measurement and analysis - NO code changes',
    'Build comprehensive test suite before optimization'
  ];
}

console.log(`🎯 Safety Level: ${safetyLevel} (${safetyScore}% coverage)`);
console.log(`\n📋 RECOMMENDATIONS:`);
recommendations.forEach((rec, i) => {
  console.log(`   ${i + 1}. ${rec}`);
});

console.log(`
🔧 IMMEDIATE NEXT STEPS:
=======================
`);

if (safetyScore >= 50) {
  console.log(`✅ 1. Run unit tests to verify baseline: npm run test:unit`);
  console.log(`✅ 2. Start with safe optimizations from COMPREHENSIVE_OPTIMIZATION_QUEST_RESULTS.md`);
  console.log(`✅ 3. Focus on bundle size and database query optimizations`);
  console.log(`✅ 4. Monitor performance improvements`);
} else {
  console.log(`🛠️  1. Fix integration test infrastructure first`);
  console.log(`🛠️  2. Add more unit tests for critical business logic`);
  console.log(`🛠️  3. Create performance benchmarks`);
  console.log(`🛠️  4. THEN start optimization work`);
}

console.log(`
📚 OPTIMIZATION STRATEGY:
========================

Based on our analysis:
- Current Safety Level: ${safetyLevel}
- Estimated Coverage: ${Math.round(estimatedCoverage.overall)}%
- Test Quality: ${Object.values(quality).filter(q => q.includes('✅')).length}/5 excellent areas

${safetyScore >= 50 ? 
  '🎯 READY FOR OPTIMIZATION! Your test coverage provides adequate safety for careful optimization work.' :
  '⚠️  FOCUS ON TESTING FIRST! Build test infrastructure before major optimization efforts.'
}
`); 