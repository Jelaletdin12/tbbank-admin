import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { toast } from 'sonner'
import i18next from 'i18next'
import { router } from '@/app/router'

function App() {
  useEffect(() => {
    // Fired by the Axios response interceptor (client.ts) when a 401 is received
    // and the refresh token attempt also fails — the user must re-authenticate.
    const handleUnauthorized = () => {
      router.navigate('/login', { replace: true })
    }

    // Fired by the Axios response interceptor (client.ts) on 403 Forbidden.
    // The user stays on the current page but receives a toast notification.
    const handleForbidden = () => {
      toast.error(
        i18next.t('errors.forbidden', 'You do not have permission to perform this action.'),
        { id: 'auth-forbidden' },
      )
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    window.addEventListener('auth:forbidden', handleForbidden)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
      window.removeEventListener('auth:forbidden', handleForbidden)
    }
  }, [])

  return <RouterProvider router={router} />
}

export default App
