import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/robots.txt': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
})
