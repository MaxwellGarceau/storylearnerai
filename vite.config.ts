/// <reference types="vitest/config" />
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true, // Enable global access to `expect`, `describe`, etc.
    environment: 'jsdom', // Add this line to set the test environment
    setupFiles: './setupTests.ts', // Ensure your setup file is included if needed
  }
})
