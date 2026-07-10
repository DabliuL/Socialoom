import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Necessário para que o Capacitor encontre os caminhos dos assets no Android
  server: {
    port: 3000,
    watch: {
      ignored: ['**/android/**']
    }
  },
  build: {
    outDir: 'dist'
  }
})
