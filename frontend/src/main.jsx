import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './auth/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        richColors
        position="top-right"
        closeButton
        toastOptions={{
          style: {
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f7f1e8',
          },
        }}
      />
    </AuthProvider>
  </StrictMode>,
)
