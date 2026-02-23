import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
    // for docker compose : watch
    watch: {
      usePolling: true,
    },
    hmr: {
      host: '0.0.0.0',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})
