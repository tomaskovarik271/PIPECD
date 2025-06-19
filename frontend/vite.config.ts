/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Disable PWA features completely
    __PWA_ENABLED__: false,
    __WORKBOX_ENABLED__: false
  },
  build: {
    rollupOptions: {
      output: {
        // Prevent problematic chunks
        manualChunks: undefined
      }
    }
  },
  test: {
    globals: true, // Use Vitest globals (describe, it, expect) without importing
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/setupTests.ts', // Optional setup file (create if needed)
    css: true, // Enable CSS processing if needed (e.g., for component styles)
  },
})
