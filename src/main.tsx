import { createRoot } from 'react-dom/client'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { Toaster } from '@/components/ui/sonner'
import '@/lib/i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <App />
    <Toaster />
  </QueryProvider>
)
