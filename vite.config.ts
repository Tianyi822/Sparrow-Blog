import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import svgr from 'vite-plugin-svgr';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:2234',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  resolve: {
      alias: {
          '@': path.resolve(__dirname, './src'), // 使用 @ 指向 src 目录
      },
  },
})
