import { defineConfig }  from 'vite'
import react             from '@vitejs/plugin-react'
import vitePrerender     from 'vite-plugin-prerender'
import { createRequire } from 'module'
import path              from 'path'
import { fileURLToPath } from 'url'

const require    = createRequire(import.meta.url)
const __dirname  = path.dirname(fileURLToPath(import.meta.url))

// Puppeteer renderer lives in @prerenderer/renderer-puppeteer (installed with the plugin)
const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer')

const ROUTES = [
  '/',
  '/about',
  '/academy',
  '/programs',
  '/coaches',
  '/schedule',
  '/events',
  '/gallery',
  '/blog',
  '/testimonials',
  '/contact',
  '/enroll',
  '/pricing',
  '/faq',
  '/sports/football-futsal',
  '/sports/cricket',
  '/sports/basketball',
  '/sports/pickleball',
  '/sports/snooker',
  '/sports/sports-lounge',
]

export default defineConfig({
  plugins: [
    react(),
    vitePrerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: ROUTES,
      renderer: new PuppeteerRenderer({
        // Wait until the React app has mounted (root div has children)
        renderAfterElementExists: '#root > *',
        // Extra safety buffer for Firestore to load
        renderAfterTime: 2000,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }),
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
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
})
