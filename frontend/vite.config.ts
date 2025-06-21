/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Disable PWA features completely
    __PWA_ENABLED__: false,
    __WORKBOX_ENABLED__: false,
    // Block service worker registration
    __SW_ENABLED__: false,
    // Disable manifest
    __MANIFEST_ENABLED__: false
  },
  build: {
    rollupOptions: {
      output: {
        // Prevent problematic chunks
        manualChunks: undefined,
        // Block service worker and manifest files
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          // Block any PWA-related files
          if (name.includes('manifest') || name.includes('sw') || name.includes('workbox')) {
            return 'blocked/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      },
      external: (id) => {
        // Block workbox and service worker imports
        return id.includes('workbox') || id.includes('sw.js') || id.includes('service-worker');
      }
    }
  },
  // Completely disable worker support
  worker: {
    format: 'es',
    plugins: () => []
  },
  // Block service workers in development
  server: {
    headers: {
      'Service-Worker-Allowed': 'none',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  },
  test: {
    globals: true, // Use Vitest globals (describe, it, expect) without importing
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/setupTests.ts', // Optional setup file (create if needed)
    css: true, // Enable CSS processing if needed (e.g., for component styles)
  },
})
