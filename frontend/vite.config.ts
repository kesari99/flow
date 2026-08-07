import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootNodeModules = path.resolve(__dirname, '../node_modules')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5050'

  return {
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
        '/api': backendUrl,
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
})
