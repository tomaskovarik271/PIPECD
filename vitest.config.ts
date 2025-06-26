import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env file in the root
dotenv.config({ path: resolve(__dirname, '.env') })

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/testEnvironment.ts'],
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts', 
      'tests/performance/**/*.test.ts',
      'frontend/src/**/*.test.tsx', 
      'frontend/src/**/*.test.ts'
    ],
    testTimeout: 30000,
    reporters: ['default', 'html'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**', 'netlify/functions/**'],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
  },
  resolve: {
    alias: {
      '@/': resolve(__dirname, './frontend/src'),
      '@tests/': resolve(__dirname, './tests'),
    },
  },
});
