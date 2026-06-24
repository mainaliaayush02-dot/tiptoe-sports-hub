import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // SSR bundle goes to dist-server/ so it doesn't overwrite the client build in dist/
    outDir: isSsrBuild ? 'dist-server' : 'dist',
    rollupOptions: isSsrBuild ? {} : {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-motion':   ['framer-motion'],
          'vendor-quill':    ['react-quill'],
        },
      },
    },
  },
}))
