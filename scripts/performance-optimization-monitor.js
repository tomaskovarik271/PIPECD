#!/usr/bin/env node

/**
 * PipeCD Performance Optimization Monitor
 * Comprehensive performance analysis and optimization tool
 * 
 * Usage: node scripts/performance-optimization-monitor.js [command]
 * Commands:
 *   analyze    - Run comprehensive performance analysis
 *   bundle     - Analyze bundle size and suggest optimizations
 *   database   - Check database query performance
 *   full       - Run all performance checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      bundle: {},
      database: {},
      frontend: {},
      recommendations: []
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  header(title) {
    this.log(`\n${'='.repeat(60)}`, 'cyan');
    this.log(`🚀 ${title}`, 'bright');
    this.log(`${'='.repeat(60)}`, 'cyan');
  }

  section(title) {
    this.log(`\n📊 ${title}`, 'blue');
    this.log(`${'─'.repeat(40)}`, 'blue');
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'cyan');
  }

  // Bundle Size Analysis
  analyzeBundleSize() {
    this.section('Bundle Size Analysis');
    
    try {
      // Check if dist folder exists
      const distPath = path.join(process.cwd(), 'frontend/dist');
      if (!fs.existsSync(distPath)) {
        this.warning('Build artifacts not found. Running production build...');
        execSync('cd frontend && npm run build', { stdio: 'inherit' });
      }

      // Analyze bundle files
      const assetsPath = path.join(distPath, 'assets');
      if (!fs.existsSync(assetsPath)) {
        this.error('Assets folder not found in dist');
        return;
      }

      const files = fs.readdirSync(assetsPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const cssFiles = files.filter(f => f.endsWith('.css'));

      let totalSize = 0;
      const largeFiles = [];
      const chunkAnalysis = {};

      jsFiles.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += sizeKB;

        if (sizeKB > 100) {
          largeFiles.push({ file, size: sizeKB });
        }

        // Categorize chunks
        if (file.includes('vendor')) chunkAnalysis.vendor = sizeKB;
        else if (file.includes('apollo')) chunkAnalysis.apollo = sizeKB;
        else if (file.includes('supabase')) chunkAnalysis.supabase = sizeKB;
        else if (file.includes('ui-core')) chunkAnalysis.uiCore = sizeKB;
        else if (file.includes('editor')) chunkAnalysis.editor = sizeKB;
        else if (file.includes('index')) chunkAnalysis.main = (chunkAnalysis.main || 0) + sizeKB;
      });

      this.results.bundle = {
        totalSize,
        fileCount: jsFiles.length,
        largeFiles,
        chunkAnalysis
      };

      // Report results
      this.info(`Total Bundle Size: ${totalSize} KB`);
      this.info(`JavaScript Files: ${jsFiles.length}`);
      this.info(`CSS Files: ${cssFiles.length}`);

      if (largeFiles.length > 0) {
        this.warning(`Large Files (>100KB):`);
        largeFiles.forEach(({ file, size }) => {
          this.log(`  📦 ${file}: ${size} KB`, 'yellow');
        });
      }

      // Chunk analysis
      this.info('Chunk Analysis:');
      Object.entries(chunkAnalysis).forEach(([chunk, size]) => {
        const status = size > 200 ? 'red' : size > 100 ? 'yellow' : 'green';
        this.log(`  📊 ${chunk}: ${size} KB`, status);
      });

      // Recommendations
      if (totalSize > 1500) {
        this.results.recommendations.push({
          type: 'bundle',
          priority: 'high',
          message: 'Bundle size is large (>1.5MB). Consider more aggressive code splitting.'
        });
      }

      if (largeFiles.some(f => f.size > 500)) {
        this.results.recommendations.push({
          type: 'bundle',
          priority: 'medium',
          message: 'Some chunks are very large (>500KB). Consider dynamic imports.'
        });
      }

    } catch (error) {
      this.error(`Bundle analysis failed: ${error.message}`);
    }
  }

  // Database Performance Analysis
  analyzeDatabasePerformance() {
    this.section('Database Performance Analysis');
    
    try {
      // Check migration files for index coverage
      const migrationsPath = path.join(process.cwd(), 'supabase/migrations');
      if (!fs.existsSync(migrationsPath)) {
        this.error('Migrations folder not found');
        return;
      }

      const migrationFiles = fs.readdirSync(migrationsPath);
      const indexMigrations = migrationFiles.filter(f => 
        f.includes('index') || f.includes('performance')
      );

      this.info(`Total Migrations: ${migrationFiles.length}`);
      this.info(`Index Migrations: ${indexMigrations.length}`);

      // Count indexes in performance migration
      const perfMigration = migrationFiles.find(f => 
        f.includes('performance_index_optimization')
      );

      if (perfMigration) {
        const migrationPath = path.join(migrationsPath, perfMigration);
        const content = fs.readFileSync(migrationPath, 'utf8');
        const indexCount = (content.match(/CREATE INDEX/g) || []).length;
        
        this.success(`Performance indexes: ${indexCount} indexes created`);
        this.results.database.indexCount = indexCount;
      } else {
        this.warning('Performance index migration not found');
        this.results.recommendations.push({
          type: 'database',
          priority: 'high',
          message: 'Create database performance indexes for better query performance'
        });
      }

      // Check for common performance patterns
      const allMigrations = migrationFiles.map(f => {
        const content = fs.readFileSync(path.join(migrationsPath, f), 'utf8');
        return { file: f, content };
      });

      const hasFullTextSearch = allMigrations.some(m => 
        m.content.includes('pg_trgm') || m.content.includes('gin_trgm_ops')
      );

      if (hasFullTextSearch) {
        this.success('Full-text search optimization enabled');
      } else {
        this.warning('Full-text search optimization not found');
        this.results.recommendations.push({
          type: 'database',
          priority: 'medium',
          message: 'Enable pg_trgm extension for better text search performance'
        });
      }

    } catch (error) {
      this.error(`Database analysis failed: ${error.message}`);
    }
  }

  // Frontend Performance Analysis
  analyzeFrontendPerformance() {
    this.section('Frontend Performance Analysis');
    
    try {
      // Check for lazy loading implementation
      const appPath = path.join(process.cwd(), 'frontend/src/App.tsx');
      if (fs.existsSync(appPath)) {
        const appContent = fs.readFileSync(appPath, 'utf8');
        
        const hasLazyLoading = appContent.includes('lazy(') && appContent.includes('Suspense');
        const lazyImports = (appContent.match(/lazy\(/g) || []).length;
        
        if (hasLazyLoading) {
          this.success(`Lazy loading implemented: ${lazyImports} lazy imports`);
          this.results.frontend.lazyLoading = true;
          this.results.frontend.lazyImports = lazyImports;
        } else {
          this.warning('Lazy loading not implemented');
          this.results.recommendations.push({
            type: 'frontend',
            priority: 'high',
            message: 'Implement lazy loading for route components to reduce initial bundle size'
          });
        }
      }

      // Check Vite configuration
      const viteConfigPath = path.join(process.cwd(), 'frontend/vite.config.ts');
      if (fs.existsSync(viteConfigPath)) {
        const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
        
        const hasManualChunks = viteContent.includes('manualChunks');
        const hasOptimizations = viteContent.includes('chunkSizeWarningLimit');
        
        if (hasManualChunks) {
          this.success('Manual chunk configuration found');
        } else {
          this.warning('Manual chunk configuration missing');
          this.results.recommendations.push({
            type: 'frontend',
            priority: 'medium',
            message: 'Configure manual chunks in Vite for better caching'
          });
        }

        if (hasOptimizations) {
          this.success('Build optimizations configured');
        } else {
          this.warning('Build optimizations not configured');
        }
      }

      // Check for React.memo usage
      const componentsPath = path.join(process.cwd(), 'frontend/src/components');
      if (fs.existsSync(componentsPath)) {
        const componentFiles = this.getAllFiles(componentsPath, '.tsx');
        let memoCount = 0;
        let totalComponents = 0;

        componentFiles.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('export') && (content.includes('function') || content.includes('const'))) {
            totalComponents++;
            if (content.includes('React.memo') || content.includes('memo(')) {
              memoCount++;
            }
          }
        });

        const memoPercentage = totalComponents > 0 ? Math.round((memoCount / totalComponents) * 100) : 0;
        
        this.info(`Components with React.memo: ${memoCount}/${totalComponents} (${memoPercentage}%)`);
        
        if (memoPercentage < 20) {
          this.results.recommendations.push({
            type: 'frontend',
            priority: 'low',
            message: 'Consider adding React.memo to frequently re-rendering components'
          });
        }
      }

    } catch (error) {
      this.error(`Frontend analysis failed: ${error.message}`);
    }
  }

  // Helper method to get all files recursively
  getAllFiles(dir, extension) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.getAllFiles(fullPath, extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // Generate Performance Report
  generateReport() {
    this.section('Performance Recommendations');
    
    if (this.results.recommendations.length === 0) {
      this.success('No performance issues found! 🎉');
      return;
    }

    // Group recommendations by priority
    const grouped = this.results.recommendations.reduce((acc, rec) => {
      if (!acc[rec.priority]) acc[rec.priority] = [];
      acc[rec.priority].push(rec);
      return acc;
    }, {});

    ['high', 'medium', 'low'].forEach(priority => {
      if (grouped[priority]) {
        this.log(`\n🔥 ${priority.toUpperCase()} Priority:`, priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'blue');
        grouped[priority].forEach((rec, index) => {
          this.log(`  ${index + 1}. [${rec.type.toUpperCase()}] ${rec.message}`);
        });
      }
    });

    // Performance Score
    const totalIssues = this.results.recommendations.length;
    const highPriorityIssues = (grouped.high || []).length;
    const score = Math.max(0, 100 - (highPriorityIssues * 20) - (totalIssues * 5));
    
    this.log(`\n📊 Performance Score: ${score}/100`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');
  }

  // Run specific analysis
  async runAnalysis(type) {
    this.header(`PipeCD Performance Monitor - ${type.toUpperCase()}`);
    
    switch (type) {
      case 'bundle':
        this.analyzeBundleSize();
        break;
      case 'database':
        this.analyzeDatabasePerformance();
        break;
      case 'frontend':
        this.analyzeFrontendPerformance();
        break;
      case 'full':
      case 'analyze':
        this.analyzeBundleSize();
        this.analyzeDatabasePerformance();
        this.analyzeFrontendPerformance();
        break;
      default:
        this.error(`Unknown analysis type: ${type}`);
        this.showUsage();
        return;
    }

    this.generateReport();
    
    const duration = Date.now() - this.startTime;
    this.log(`\n⏱️  Analysis completed in ${duration}ms`, 'cyan');
  }

  showUsage() {
    this.log('\nUsage: node scripts/performance-optimization-monitor.js [command]', 'bright');
    this.log('\nCommands:');
    this.log('  analyze    - Run comprehensive performance analysis');
    this.log('  bundle     - Analyze bundle size and suggest optimizations');
    this.log('  database   - Check database query performance');
    this.log('  frontend   - Analyze frontend performance patterns');
    this.log('  full       - Run all performance checks');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';
  
  const monitor = new PerformanceMonitor();
  
  if (command === 'help' || command === '--help' || command === '-h') {
    monitor.showUsage();
    return;
  }
  
  await monitor.runAnalysis(command);
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = PerformanceMonitor; 