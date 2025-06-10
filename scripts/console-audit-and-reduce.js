#!/usr/bin/env node

/**
 * PipeCD Console Audit & Reduction Script
 * 
 * Categorizes console statements to help reduce the total count before migration
 * Many console.log statements should be REMOVED, not migrated
 */

const fs = require('fs');
const glob = require('glob');

// Categories for console statements
const CATEGORIES = {
  DEBUG: {
    patterns: [
      /console\.log.*DEBUG/i,
      /console\.log.*debug/,
      /console\.log.*===.*===/,
      /console\.log.*\[.*DEBUG.*\]/i,
      /console\.log.*\[.*Store.*\]/,
      /console\.log.*\[.*Component.*\]/
    ],
    action: 'REMOVE',
    description: 'Debug statements that should be removed'
  },
  
  COMMENTED: {
    patterns: [
      /\/\/\s*console\./
    ],
    action: 'REMOVE',
    description: 'Already commented out console statements'
  },
  
  DEVELOPMENT_ONLY: {
    patterns: [
      /console\.log.*received.*event/i,
      /console\.log.*auth.*state/i,
      /console\.log.*variables.*for/i,
      /console\.log.*response.*from/i
    ],
    action: 'REMOVE_OR_DEBUG',
    description: 'Development logging that should be debug-level or removed'
  },
  
  ERROR_HANDLING: {
    patterns: [
      /console\.error/
    ],
    action: 'MIGRATE',
    description: 'Error logging that should be migrated'
  },
  
  BUSINESS_LOGIC: {
    patterns: [
      /console\.log.*created.*successfully/i,
      /console\.log.*processing.*\d+/i,
      /console\.log.*operation.*completed/i
    ],
    action: 'MIGRATE_INFO',
    description: 'Business events that should become info logs'
  },
  
  WARNINGS: {
    patterns: [
      /console\.warn/
    ],
    action: 'MIGRATE',
    description: 'Warnings that should be migrated'
  }
};

function categorizeConsoleLine(line) {
  for (const [category, config] of Object.entries(CATEGORIES)) {
    for (const pattern of config.patterns) {
      if (pattern.test(line)) {
        return { category, action: config.action, description: config.description };
      }
    }
  }
  return { category: 'OTHER', action: 'REVIEW', description: 'Needs manual review' };
}

function auditFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const results = {
      file: filePath,
      consoleStatements: [],
      categories: {}
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('console.')) {
        const categorization = categorizeConsoleLine(line.trim());
        
        results.consoleStatements.push({
          lineNumber: i + 1,
          line: line.trim(),
          ...categorization
        });
        
        if (!results.categories[categorization.category]) {
          results.categories[categorization.category] = 0;
        }
        results.categories[categorization.category]++;
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

function generateCleanupScript(auditResults) {
  const removeCommands = [];
  const reviewFiles = [];
  
  for (const result of auditResults) {
    if (!result) continue;
    
    const removeLines = result.consoleStatements.filter(s => 
      s.action === 'REMOVE' || s.action === 'REMOVE_OR_DEBUG'
    );
    
    if (removeLines.length > 0) {
      removeCommands.push({
        file: result.file,
        linesToRemove: removeLines.map(l => l.lineNumber),
        count: removeLines.length
      });
    }
    
    const reviewLines = result.consoleStatements.filter(s => 
      s.action === 'REVIEW' || s.action === 'MIGRATE' || s.action === 'MIGRATE_INFO'
    );
    
    if (reviewLines.length > 0) {
      reviewFiles.push({
        file: result.file,
        statements: reviewLines,
        count: reviewLines.length
      });
    }
  }
  
  return { removeCommands, reviewFiles };
}

function main() {
  const args = process.argv.slice(2);
  const filePattern = args[0] || '**/*.{ts,tsx}';
  const action = args[1] || 'audit'; // audit, remove, or migrate
  
  console.log('🔍 PipeCD Console Audit & Reduction');
  console.log(`📂 Pattern: ${filePattern}`);
  console.log(`🎯 Action: ${action}`);
  console.log('');
  
  try {
    const files = glob.sync(filePattern, { 
      ignore: ['node_modules/**', '.netlify/**', 'frontend/dist/**', 'frontend/.vite/**'] 
    });
    
    console.log(`📊 Found ${files.length} files to analyze...\n`);
    
    const auditResults = files.map(auditFile).filter(Boolean);
    
    // Summarize findings
    const summary = {
      totalFiles: auditResults.length,
      totalConsoleStatements: 0,
      categories: {}
    };
    
    for (const result of auditResults) {
      summary.totalConsoleStatements += result.consoleStatements.length;
      
      for (const [category, count] of Object.entries(result.categories)) {
        if (!summary.categories[category]) {
          summary.categories[category] = { count: 0, action: CATEGORIES[category]?.action || 'REVIEW' };
        }
        summary.categories[category].count += count;
      }
    }
    
    // Print summary
    console.log('📋 AUDIT SUMMARY:');
    console.log(`   Total files with console statements: ${summary.totalFiles}`);
    console.log(`   Total console statements: ${summary.totalConsoleStatements}`);
    console.log('');
    
    console.log('📊 BY CATEGORY:');
    for (const [category, data] of Object.entries(summary.categories)) {
      const description = CATEGORIES[category]?.description || 'Other';
      console.log(`   ${category}: ${data.count} statements - ${data.action}`);
      console.log(`      ${description}`);
    }
    
    // Generate recommendations
    const cleanup = generateCleanupScript(auditResults);
    
    console.log('\n🎯 RECOMMENDATIONS:');
    
    const canRemove = Object.entries(summary.categories)
      .filter(([cat, data]) => data.action === 'REMOVE' || data.action === 'REMOVE_OR_DEBUG')
      .reduce((sum, [cat, data]) => sum + data.count, 0);
      
    const shouldMigrate = Object.entries(summary.categories)
      .filter(([cat, data]) => data.action === 'MIGRATE' || data.action === 'MIGRATE_INFO')
      .reduce((sum, [cat, data]) => sum + data.count, 0);
    
    console.log(`   🗑️  REMOVE: ${canRemove} statements (debug/development only)`);
    console.log(`   🔄 MIGRATE: ${shouldMigrate} statements (legitimate logging)`);
    console.log(`   📝 REVIEW: ${summary.totalConsoleStatements - canRemove - shouldMigrate} statements (manual decision needed)`);
    
    const reduction = ((canRemove / summary.totalConsoleStatements) * 100).toFixed(1);
    console.log(`\n   💡 Potential reduction: ${reduction}% by removing debug statements`);
    
    // Show top files to clean up
    console.log('\n🔥 TOP FILES TO CLEAN UP:');
    const filesByConsoleCount = auditResults
      .sort((a, b) => b.consoleStatements.length - a.consoleStatements.length)
      .slice(0, 10);
      
    for (const result of filesByConsoleCount) {
      const removeCount = result.consoleStatements.filter(s => 
        s.action === 'REMOVE' || s.action === 'REMOVE_OR_DEBUG'
      ).length;
      
      console.log(`   ${result.file}: ${result.consoleStatements.length} total (${removeCount} can be removed)`);
    }
    
    if (action === 'detailed') {
      console.log('\n📋 DETAILED BREAKDOWN:');
      for (const result of auditResults.slice(0, 5)) {
        console.log(`\n📁 ${result.file}:`);
        for (const stmt of result.consoleStatements) {
          console.log(`   Line ${stmt.lineNumber}: ${stmt.action} - ${stmt.line.substring(0, 80)}...`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { auditFile, categorizeConsoleLine }; 