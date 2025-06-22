#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/React files in src directory
function getAllTsFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.match(/\.(ts|tsx)$/)) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Get ESLint output for a specific file
function getESLintIssues(filePath) {
  try {
    execSync(`npx eslint "${filePath}" --format json > /tmp/eslint-output.json`, { stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = fs.readFileSync('/tmp/eslint-output.json', 'utf8');
    const results = JSON.parse(output);
    return results[0]?.messages || [];
  }
}

// Fix unused imports in a file
function fixUnusedImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = getESLintIssues(filePath);
  
  let fixedContent = content;
  let hasChanges = false;
  
  // Find unused imports
  const unusedImports = issues.filter(issue => 
    issue.ruleId === '@typescript-eslint/no-unused-vars' && 
    issue.message.includes('is defined but never used')
  );
  
  if (unusedImports.length === 0) return false;
  
  console.log(`\nFixing ${unusedImports.length} unused imports in ${filePath}`);
  
  // Process each unused import
  for (const issue of unusedImports) {
    const varName = issue.message.match(/'([^']+)'/)?.[1];
    if (!varName) continue;
    
    console.log(`  - Removing unused import: ${varName}`);
    
    // Remove from named imports
    fixedContent = fixedContent.replace(
      new RegExp(`(import\\s*{[^}]*),\\s*${varName}\\s*,([^}]*})`, 'g'),
      '$1$2'
    );
    
    fixedContent = fixedContent.replace(
      new RegExp(`(import\\s*{)\\s*${varName}\\s*,([^}]*)`, 'g'),
      '$1$2'
    );
    
    fixedContent = fixedContent.replace(
      new RegExp(`(import\\s*{[^,]*),\\s*${varName}\\s*(})`, 'g'),
      '$1$2'
    );
    
    // Remove standalone imports
    fixedContent = fixedContent.replace(
      new RegExp(`import\\s*{\\s*${varName}\\s*}\\s*from\\s*[^;]+;\\s*\\n?`, 'g'),
      ''
    );
    
    // Remove from destructured assignments
    fixedContent = fixedContent.replace(
      new RegExp(`const\\s*${varName}\\s*=\\s*[^;]+;\\s*\\n?`, 'g'),
      ''
    );
    
    hasChanges = true;
  }
  
  // Clean up empty import statements
  fixedContent = fixedContent.replace(/import\s*{\s*}\s*from\s*[^;]+;\s*\n?/g, '');
  
  if (hasChanges) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`  ✅ Fixed ${filePath}`);
  }
  
  return hasChanges;
}

// Main execution
console.log('🔧 Starting automated unused import fixes...\n');

const srcDir = path.join(__dirname, 'frontend', 'src');
const tsFiles = getAllTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to check`);

let totalFixed = 0;

for (const file of tsFiles.slice(0, 10)) { // Limit to first 10 files for safety
  try {
    if (fixUnusedImports(file)) {
      totalFixed++;
    }
  } catch (error) {
    console.log(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n🎉 Completed! Fixed unused imports in ${totalFixed} files.`);
console.log('\n📊 Running ESLint to check remaining issues...');

try {
  execSync('cd frontend && npm run lint 2>&1 | tail -3', { stdio: 'inherit' });
} catch (error) {
  // ESLint will exit with non-zero if there are still issues
} 