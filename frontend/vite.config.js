import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['__tests__/**/*.test.js'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', '__tests__/']
    }
  }
})
