import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/lucky-mini/',  // Add this line
  build: {
    outDir: '../docs'
  }
})
