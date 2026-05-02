import { createRoot } from 'react-dom/client'
import { QueryProvider } from '@/app/providers/QueryProvider'
import '@/lib/i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
)
