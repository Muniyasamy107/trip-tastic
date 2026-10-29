import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // If 5173 is taken (e.g. another project is running) Vite just moves to
    // the next free port instead of failing with "Port already in use".
    strictPort: false,
    // Allow the Arena preview proxy host (and any sandbox subdomain).
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
  },
})
