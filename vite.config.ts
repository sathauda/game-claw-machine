import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    // Allow Cursor VM preview hosts (*.cursorvm.com)
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
})
