import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env file in the root
dotenv.config({ path: resolve(__dirname, '.env') })

export default defineConfig({
  test: {
    globals: true, // Use describe, it, expect, etc. without importing
    environment: 'jsdom', // Set the environment to jsdom for React components
    setupFiles: ['./frontend/src/setupTests.ts'], // Use the frontend setup file
    include: ['lib/**/*.test.ts', 'netlify/functions/**/*.test.ts', 'frontend/src/**/*.test.tsx', 'frontend/src/**/*.test.ts'], // Look for tests in these locations
    // reporters: ['default', 'html'], // Optional: Generate HTML report
    // coverage: { // Optional: Configure code coverage
    //   provider: 'v8',
    //   reporter: ['text', 'json', 'html'],
    //   include: ['lib/**', 'netlify/functions/**'],
    //   exclude: [
    //       '**/*.test.ts',
    //       '**/*.d.ts'
    //   ],
    // },
  },
  resolve: {
    // Add aliases if needed for imports
    // alias: {
    //   '@/': resolve(__dirname, './frontend/src'),
    // },
  },
}); 