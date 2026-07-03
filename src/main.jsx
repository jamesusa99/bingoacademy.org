import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { LazyAuthProvider } from './contexts/LazyAuthContext.jsx'
import FunnelOverlays from './components/funnel/FunnelOverlays.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LazyAuthProvider>
          <App />
          <FunnelOverlays />
        </LazyAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
