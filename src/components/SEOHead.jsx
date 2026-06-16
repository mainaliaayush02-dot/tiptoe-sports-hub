import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Tiptoe Sports Hub'
const BASE_URL = 'https://tiptoesportshub.com'
const DEFAULT_IMAGE = `${BASE_URL}/logo.jpeg`
const DEFAULT_DESC =
  "Nepal's #1 private football and futsal academy in Tarkeshwar, Kathmandu. Professional coaching for ages 4–18 with international exposure to Thailand."

const BREADCRUMB_BASE = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
  ],
}

export default function SEOHead({
  title,
  description = DEFAULT_DESC,
  path = '',
  image = DEFAULT_IMAGE,
  breadcrumb,
}) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME} — Football & Futsal Academy, Kathmandu`
    : `${SITE_NAME} | Nepal's #1 Football & Futsal Academy in Kathmandu`
  const url = `${BASE_URL}${path}`

  const breadcrumbSchema = breadcrumb
    ? {
        ...BREADCRUMB_BASE,
        itemListElement: [
          ...BREADCRUMB_BASE.itemListElement,
          { '@type': 'ListItem', position: 2, name: title || 'Page', item: url },
        ],
      }
    : null

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_NP" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Breadcrumb structured data */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  )
}
