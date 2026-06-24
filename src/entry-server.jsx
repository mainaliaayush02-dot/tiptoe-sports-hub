import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { SiteProvider } from './contexts/SiteContext'

// react-helmet-async is bundled via ssr.noExternal in vite.config.js so
// Vite resolves the CJS/ESM interop — do NOT externalize it.

export function render(url) {
  const helmetContext = {}

  const appHtml = renderToString(
    React.createElement(HelmetProvider, { context: helmetContext },
      React.createElement(StaticRouter, { location: url },
        React.createElement(AuthProvider, null,
          React.createElement(SiteProvider, null,
            React.createElement(App)
          )
        )
      )
    )
  )

  return { appHtml, helmet: helmetContext.helmet }
}
