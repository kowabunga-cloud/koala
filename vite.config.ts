import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// public/mockServiceWorker.js is only needed by `npm run dev:mock`, keep it out of production builds.
const dropMockWorker: Plugin = {
  name: 'drop-mock-worker',
  apply: 'build',
  closeBundle() {
    fs.rmSync(path.resolve(__dirname, 'dist/mockServiceWorker.js'), { force: true })
  },
}

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    dropMockWorker,
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      // Kahuna API, override with KAHUNA_URL=http://127.0.0.1:8080 npm run dev
      '/api': {
        target: process.env.KAHUNA_URL ?? 'https://labs.kowabunga.cloud',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
