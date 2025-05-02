import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Use describe, it, expect, etc. without importing
    environment: 'node', // Explicitly set the environment to Node.js
    // setupFiles: ['./path/to/globalSetup.ts'], // Optional: For global mocks/setup
    include: ['lib/**/*.test.ts', 'netlify/functions/**/*.test.ts'], // Look for tests in these locations
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