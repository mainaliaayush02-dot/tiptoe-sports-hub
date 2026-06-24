/**
 * Pre-render script — runs after `vite build` and `vite build --ssr`.
 * Renders each public route to a static HTML file in dist/ so search engines
 * receive real crawlable HTML instead of an empty React shell.
 */

import fs   from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Every public route that should have a pre-rendered HTML file
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

async function main() {
  // Load the SSR bundle produced by `vite build --ssr`
  const { render } = await import('./dist-server/entry-server.js')

  // Read the client-side HTML template (produced by `vite build`)
  const template = fs.readFileSync(path.join(__dirname, 'dist/index.html'), 'utf-8')

  let ok = 0, fail = 0

  for (const route of ROUTES) {
    try {
      const { appHtml, helmet } = render(route)

      // Inject rendered app HTML
      let html = template.replace('<!--app-html-->', appHtml)

      // Inject Helmet head tags (title, meta description, canonical, OG, etc.)
      if (helmet) {
        html = html
          .replace(/<title>[^<]*<\/title>/, helmet.title?.toString() ?? '')
          .replace(
            '</head>',
            [
              helmet.meta?.toString()     ?? '',
              helmet.link?.toString()     ?? '',
              helmet.script?.toString()   ?? '',
            ].filter(Boolean).join('\n') + '\n</head>'
          )
      }

      // Write to the correct path
      const outDir  = route === '/'
        ? path.join(__dirname, 'dist')
        : path.join(__dirname, 'dist', route)

      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, 'index.html'), html)

      console.log(`  ✓  ${route}`)
      ok++
    } catch (err) {
      console.error(`  ✗  ${route} — ${err.message}`)
      fail++
    }
  }

  console.log(`\nPre-rendering done: ${ok} succeeded, ${fail} failed.\n`)
  if (fail > 0) process.exit(1)
}

main()
