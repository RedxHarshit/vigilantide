import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/hindsight-api': {
        target: 'https://api.hindsight.vectorize.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hindsight-api/, ''),
        secure: true,
      },
    },
  },
})
