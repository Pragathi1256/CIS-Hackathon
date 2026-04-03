import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for GitHub Pages deployment
export default defineConfig({
  base: '/Cloud test/', // Important: repository name as the base path
  plugins: [react()],
  server: {
    port: 5173, // optional: default Vite dev server port
  },
  build: {
    outDir: 'dist', // folder that will be deployed
  },
})
