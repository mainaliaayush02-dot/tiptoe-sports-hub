import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { SiteProvider } from './contexts/SiteContext'
import './index.css'

const rootEl = document.getElementById('root')
const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SiteProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#06145F',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#F5C04A', secondary: '#06145F' },
                },
              }}
            />
          </SiteProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

// Use hydrateRoot when the server has injected pre-rendered HTML (SSG),
// createRoot otherwise (dev server / routes without pre-rendered files)
if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, app)
} else {
  ReactDOM.createRoot(rootEl).render(app)
}
