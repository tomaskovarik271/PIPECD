/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react-force-graph-3d',
      'three', 
      '@types/three'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    hmr: {
      timeout: 60000 // Increase timeout for heavy dependencies
    }
  },
  test: {
    globals: true, // Use Vitest globals (describe, it, expect) without importing
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/setupTests.ts', // Optional setup file (create if needed)
    css: true, // Enable CSS processing if needed (e.g., for component styles)
  },
})
