import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],

  resolve: {
    alias: { '@': '/src' },
  },

  ssr: {
    // Bundle react-helmet-async into the SSR output.
    // It's a CJS module; leaving it external causes a named-export error
    // in Node.js ESM context. Vite's bundler handles the CJS interop correctly.
    noExternal: ['react-helmet-async'],
  },

  build: {
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
