import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/Toast'
import App from '@/App'
import '@/i18n'
import '@/index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-dark">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <App />
            </Suspense>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
