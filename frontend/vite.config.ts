import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootNodeModules = path.resolve(__dirname, '../node_modules')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      react: path.resolve(rootNodeModules, 'react'),
      'react-dom': path.resolve(rootNodeModules, 'react-dom'),
      'react-router-dom': path.resolve(rootNodeModules, 'react-router-dom'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: 3000,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
