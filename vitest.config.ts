import { defineConfig } from 'vitest/config'

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
}); 