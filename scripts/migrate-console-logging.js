#!/usr/bin/env node

/**
 * PipeCD Console Logging Migration Script
 * 
 * This script helps migrate console.* statements to the new Winston-based logging system.
 * 
 * Usage:
 * npm run migrate-logging [file-pattern] [--dry-run] [--service=serviceName]
 * 
 * Examples:
 * node scripts/migrate-console-logging.js "lib/.../*.ts" --dry-run
 * node scripts/migrate-console-logging.js "netlify/functions/graphql/resolvers/lead.ts" --service=leads
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Service mapping based on file paths
const SERVICE_MAPPING = {
  'lib/aiAgent': 'ai',
  'lib/dealService': 'deals',
  'lib/leadService': 'leads',
  'lib/wfmWorkflowService': 'wfm',
  'lib/wfmProjectService': 'wfm',
  'lib/wfmStatusService': 'wfm',
  'netlify/functions/graphql/resolvers/deal': 'deals',
  'netlify/functions/graphql/resolvers/lead': 'leads',
  'netlify/functions/graphql/resolvers/wfm': 'wfm',
  'netlify/functions/graphql': 'graphql',
  'netlify/functions/inngest': 'inngest',
  'mcp': 'mcp',
  'frontend': 'frontend'
};

function getServiceForFile(filePath) {
  for (const [pathPattern, service] of Object.entries(SERVICE_MAPPING)) {
    if (filePath.includes(pathPattern)) {
      return service;
    }
  }
  return 'general';
}

function generateImportStatement(service) {
  if (service === 'general') {
    return `import logger, { logError, logPerformance } from '../lib/logger';`;
  }
  return `import { loggers, logError, logPerformance } from '../lib/logger';`;
}

function transformConsoleStatement(line, service) {
  const loggerName = service === 'general' ? 'logger' : `loggers.${service}`;
  
  // Replace different console types
  const transformations = [
    // console.error with Error object
    {
      pattern: /console\.error\(['"`]([^'"`]+)['"`],\s*(\w+)(?:,\s*(.+))?\);/g,
      replacement: (match, message, errorVar, meta) => {
        const metaStr = meta ? `, { ${meta} }` : '';
        return `logError(${errorVar}, { originalMessage: '${message}'${metaStr} }, '${service}');`;
      }
    },
    
    // console.error with just message and object
    {
      pattern: /console\.error\(['"`]([^'"`]+)['"`](?:,\s*(.+))?\);/g,
      replacement: (match, message, meta) => {
        const metaStr = meta ? `, { error: ${meta} }` : '';
        return `${loggerName}.error('${message}'${metaStr});`;
      }
    },
    
    // console.log
    {
      pattern: /console\.log\(['"`]([^'"`]+)['"`](?:,\s*(.+))?\);/g,
      replacement: (match, message, meta) => {
        const metaStr = meta ? `, { ${meta} }` : '';
        return `${loggerName}.info('${message}'${metaStr});`;
      }
    },
    
    // console.warn
    {
      pattern: /console\.warn\(['"`]([^'"`]+)['"`](?:,\s*(.+))?\);/g,
      replacement: (match, message, meta) => {
        const metaStr = meta ? `, { ${meta} }` : '';
        return `${loggerName}.warn('${message}'${metaStr});`;
      }
    },
    
    // console.debug
    {
      pattern: /console\.debug\(['"`]([^'"`]+)['"`](?:,\s*(.+))?\);/g,
      replacement: (match, message, meta) => {
        const metaStr = meta ? `, { ${meta} }` : '';
        return `${loggerName}.debug('${message}'${metaStr});`;
      }
    },
    
    // console.info
    {
      pattern: /console\.info\(['"`]([^'"`]+)['"`](?:,\s*(.+))?\);/g,
      replacement: (match, message, meta) => {
        const metaStr = meta ? `, { ${meta} }` : '';
        return `${loggerName}.info('${message}'${metaStr});`;
      }
    }
  ];
  
  let transformedLine = line;
  for (const { pattern, replacement } of transformations) {
    transformedLine = transformedLine.replace(pattern, replacement);
  }
  
  return transformedLine;
}

function migrateFile(filePath, dryRun = false, forcedService = null) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const service = forcedService || getServiceForFile(filePath);
    
    let hasConsoleStatements = false;
    let hasLoggerImport = false;
    let transformedLines = [];
    let consoleCount = 0;
    
    // Check if logger is already imported
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('from \'../lib/logger\'') || line.includes('from \'../../lib/logger\'')) {
        hasLoggerImport = true;
        break;
      }
    }
    
    // Transform lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('console.')) {
        hasConsoleStatements = true;
        consoleCount++;
        const transformedLine = transformConsoleStatement(line, service);
        transformedLines.push(transformedLine);
        
        if (dryRun) {
          console.log(`Line ${i + 1}: ${line.trim()}`);
          console.log(`     → ${transformedLine.trim()}`);
        }
      } else {
        transformedLines.push(line);
      }
    }
    
    // Add import if needed
    if (hasConsoleStatements && !hasLoggerImport) {
      // Find the last import statement
      let lastImportIndex = -1;
      for (let i = 0; i < transformedLines.length; i++) {
        if (transformedLines[i].trim().startsWith('import ') && transformedLines[i].includes('from ')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex >= 0) {
        transformedLines.splice(lastImportIndex + 1, 0, generateImportStatement(service));
      }
    }
    
    if (hasConsoleStatements) {
      console.log(`\n📁 ${filePath} (${service} service)`);
      console.log(`   Found ${consoleCount} console statements`);
      
      if (!dryRun) {
        fs.writeFileSync(filePath, transformedLines.join('\n'));
        console.log(`   ✅ Migrated successfully`);
      } else {
        console.log(`   🔍 Would migrate ${consoleCount} statements`);
      }
    }
    
    return { hasConsoleStatements, consoleCount };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { hasConsoleStatements: false, consoleCount: 0 };
  }
}

function main() {
  const args = process.argv.slice(2);
  const filePattern = args[0] || 'lib/**/*.ts';
  const dryRun = args.includes('--dry-run');
  const serviceArg = args.find(arg => arg.startsWith('--service='));
  const forcedService = serviceArg ? serviceArg.split('=')[1] : null;
  
  console.log('🚀 PipeCD Console Logging Migration');
  console.log(`📂 Pattern: ${filePattern}`);
  console.log(`🔍 Dry run: ${dryRun ? 'Yes' : 'No'}`);
  if (forcedService) {
    console.log(`🏷️  Forced service: ${forcedService}`);
  }
  console.log('');
  
  try {
    const files = glob.sync(filePattern, { 
      ignore: ['node_modules/**', '.netlify/**', 'frontend/dist/**', 'frontend/.vite/**'] 
    });
    
    let totalFiles = 0;
    let totalConsoleStatements = 0;
    let migratedFiles = 0;
    
    for (const file of files) {
      const result = migrateFile(file, dryRun, forcedService);
      totalFiles++;
      
      if (result.hasConsoleStatements) {
        migratedFiles++;
        totalConsoleStatements += result.consoleCount;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Total files processed: ${totalFiles}`);
    console.log(`   Files with console statements: ${migratedFiles}`);
    console.log(`   Total console statements: ${totalConsoleStatements}`);
    
    if (dryRun) {
      console.log('\n💡 Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Migration completed!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, getServiceForFile }; 