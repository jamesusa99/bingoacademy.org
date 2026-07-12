import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function manualChunkForId(id) {
  if (!id.includes('node_modules')) {
    if (id.includes('/src/pages/admin/')) return 'admin'
    if (id.includes('/src/pages/lab/') || id.includes('/src/components/lab/')) return 'exploration-labs'
    if (
      id.includes('/src/pages/GoLabPage') ||
      id.includes('/src/pages/labs/IOAITrainingLabSession') ||
      id.includes('/src/components/ioaiLab/')
    ) {
      return 'code-lab'
    }
    return undefined
  }

  if (id.includes('@tensorflow')) return 'vendor-tf'
  if (id.includes('matter-js')) return 'vendor-matter'
  if (id.includes('codemirror') || id.includes('@uiw/react-codemirror')) return 'vendor-codemirror'
  if (id.includes('hls.js')) return 'vendor-hls'
  if (id.includes('@ai-sdk')) return 'vendor-ai-sdk'
  if (id.includes('katex')) return 'vendor-katex'
  if (
    id.includes('react-router') ||
    id.includes('react-dom') ||
    /\/react\//.test(id)
  ) {
    return 'vendor-react'
  }

  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((dep) => /vendor-react/.test(dep)),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          return manualChunkForId(id)
        },
      },
    },
  },
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
      '/sitemap-pages.xml': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/sitemap-programs.xml': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/sitemap-courses.xml': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/sitemap-labs.xml': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/sitemap-news.xml': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
})
