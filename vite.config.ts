import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://heekeunlee.github.io/tourplan/
export default defineConfig({
  base: '/tourplan/',
  plugins: [react()],
})
