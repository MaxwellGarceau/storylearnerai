/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/types/app'),
      '@sidebar': path.resolve(__dirname, './src/components/sidebar'),
    },
  },
  test: {
    globals: true, // Enable global access to `expect`, `describe`, etc.
    environment: 'jsdom', // Add this line to set the test environment
    setupFiles: './setupTests.ts', // Ensure your setup file is included if needed
    testTimeout: 30000, // 30 seconds timeout for individual tests
    hookTimeout: 30000, // 30 seconds timeout for hooks
    teardownTimeout: 5000, // 5 seconds timeout for teardown
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
