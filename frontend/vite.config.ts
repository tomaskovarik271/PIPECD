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
        // Enable code splitting with manual chunks for better performance
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          
          // GraphQL and data fetching
          apollo: ['@apollo/client', '@tanstack/react-query'],
          
          // UI Libraries (Material-UI)
          'ui-core': ['@mui/material', '@mui/lab'],
          'ui-icons': ['@mui/icons-material'],
          
          // Rich text editors
          'editor-tiptap': [
            '@tiptap/react', 
            '@tiptap/starter-kit', 
            '@tiptap/extension-bold', 
            '@tiptap/extension-italic', 
            '@tiptap/extension-link'
          ],
          
          // Form and validation
          forms: ['react-hook-form', '@hookform/resolvers'],
          
          // Routing and navigation
          routing: ['react-router-dom'],
          
          // Utilities (only include packages that exist)
          utils: ['date-fns', 'immer', 'zustand'],
          
          // Drag and drop
          dnd: ['@hello-pangea/dnd'],
          
          // Supabase
          supabase: ['@supabase/supabase-js', '@supabase/auth-ui-react', '@supabase/auth-ui-shared']
        },
        
        // Optimize asset naming for better caching
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          // Block any PWA-related files
          if (name.includes('manifest') || name.includes('sw') || name.includes('workbox')) {
            return 'blocked/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      },
      
      // Only block actual service worker imports, not legitimate libraries
      external: (id) => {
        return id.includes('sw.js') || id.includes('service-worker.js');
      }
    },
    
    // Performance optimizations
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500KB warning limit
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
