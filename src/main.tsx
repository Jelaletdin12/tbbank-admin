import { createRoot } from 'react-dom/client'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { GlobalErrorBoundary } from '@/app/providers/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import '@/lib/i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <GlobalErrorBoundary>
    <ThemeProvider>
      <QueryProvider>
        <App />
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  </GlobalErrorBoundary>
)
