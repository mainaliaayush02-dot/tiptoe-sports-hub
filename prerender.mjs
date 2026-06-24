import fs   from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  const { render } = await import('./dist-server/entry-server.js')
  const template   = fs.readFileSync(path.join(__dirname, 'dist/index.html'), 'utf-8')

  let ok = 0, fail = 0

  for (const route of ROUTES) {
    try {
      const { appHtml, helmet } = render(route)

      // Inject rendered app HTML
      let html = template.replace('<!--app-html-->', appHtml)

      // Inject Helmet head tags
      if (helmet) {
        // REPLACE the stale static <title> with the per-page Helmet title
        const helmetTitle = helmet.title?.toString()
        if (helmetTitle) {
          html = html.replace(/<title[^>]*>.*?<\/title>/s, helmetTitle)
        }

        // APPEND other Helmet tags (meta, link, script) before </head>
        const otherTags = [
          helmet.meta?.toString()   ?? '',
          helmet.link?.toString()   ?? '',
          helmet.script?.toString() ?? '',
        ].filter(s => s && s.trim()).join('\n')

        if (otherTags) {
          html = html.replace('</head>', otherTags + '\n</head>')
        }
      }

      const outDir = route === '/'
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

  console.log(`\nPre-render: ${ok} ok, ${fail} failed.`)
  if (fail > 0) process.exit(1)
}

main()
