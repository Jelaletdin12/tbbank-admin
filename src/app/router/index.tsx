import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Spinner } from '@/components/ui/spinner'

const LoginPage = lazy(() => import('@/pages/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))


function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}

function PublicGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <Outlet />
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <Spinner className="size-8 text-[var(--brand-500)]" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <PublicGuard />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
