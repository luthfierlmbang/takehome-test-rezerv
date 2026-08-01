/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/, so assets need that prefix. Local dev and
  // the test run stay at the root.
  base: process.env.GITHUB_ACTIONS ? '/takehome-test-rezerv/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
  },
})
