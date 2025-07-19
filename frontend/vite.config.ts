import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Import the 'path' module

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // ========= THE FIX IS HERE =========
    // This tells Vite that '@' is an alias for the '/src' directory.
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // ===================================
  },
})