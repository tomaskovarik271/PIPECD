module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  rules: {
    // Add any specific rule overrides here later
    // Example: allow jsx in .tsx files (often handled by @typescript-eslint/recommended but good to be aware)
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    // Suppress errors for missing 'import React' astop new JSX transform doesn't require it
    'react/react-in-jsx-scope': 'off',
    // Allow prop-types to be missing (since we use TypeScript)
    'react/prop-types': 'off',
    // Add more specific rules as needed
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_$' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    '.netlify/',
    'netlify/functions/inngest/.netlify/', // Ignore potential nested netlify build artifacts for inngest
    'build/',
    'dist/',
    'public/', // Often contains build artifacts or static assets not to be linted
    'playwright-report/',
    'test-results/',
    '*.lock',
    'frontend/src/generated/', // Ignore auto-generated GraphQL files
    'env.example.txt',
    'netlify.toml',
    '*.md',
    '*.sql',
    'vite.config.ts.timestamp-*.mjs', // Ignore Vite temp files
    'vitest.config.ts.timestamp-*.mjs',
  ],
}; 