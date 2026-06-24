import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { SiteProvider } from './contexts/SiteContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SiteProvider>
            <App />
            <Analytics />
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
