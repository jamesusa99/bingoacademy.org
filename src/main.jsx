import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { LazyAuthProvider } from './contexts/LazyAuthContext.jsx'
import FunnelOverlays from './components/funnel/FunnelOverlays.jsx'
import { initAnalytics } from './lib/analytics'

function AnalyticsBootstrap() {
  useEffect(() => {
    initAnalytics()
  }, [])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AnalyticsBootstrap />
      <AuthProvider>
        <LazyAuthProvider>
          <App />
          <FunnelOverlays />
        </LazyAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
