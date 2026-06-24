import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { SiteProvider } from './contexts/SiteContext'

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

  const { helmet } = helmetContext
  return { appHtml, helmet }
}
