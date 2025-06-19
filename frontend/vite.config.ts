/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Completely disable PWA features
    __PWA_ENABLED__: false,
    __WORKBOX_ENABLED__: false,
    global: 'globalThis', // Fix for some libraries that expect global
  },
  build: {
    rollupOptions: {
      output: {
        // Prevent problematic chunks and PWA files
        manualChunks: undefined,
        // Explicitly exclude any PWA-related files
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name ?? '';
          // Block PWA/service worker files
          if (info.includes('manifest') || info.includes('sw.') || info.includes('workbox')) {
            return 'excluded/[name].[ext]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Explicitly exclude service worker generation
    target: 'es2015',
    sourcemap: false,
  },
  worker: {
    // Disable service worker generation
    format: 'es'
  },
  optimizeDeps: {
    // Exclude problematic dependencies that might trigger PWA
    exclude: ['workbox-window', '@vite-pwa/core', 'vite-plugin-pwa']
  },
  test: {
    globals: true, // Use Vitest globals (describe, it, expect) without importing
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/setupTests.ts', // Optional setup file (create if needed)
    css: true, // Enable CSS processing if needed (e.g., for component styles)
  },
})
