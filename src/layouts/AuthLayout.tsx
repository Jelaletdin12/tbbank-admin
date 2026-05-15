import { Outlet } from 'react-router-dom'

/**
 * AuthLayout — a thin semantic wrapper for all unauthenticated pages
 * (login, register, reset-password, 2FA, etc.).
 *
 * The login page manages its own full-screen layout internally,
 * so this component simply renders <Outlet /> without adding any
 * visual chrome. The value of this layout is architectural:
 *   - Clear separation between public and private route trees.
 *   - Any future auth page added here inherits the same guard and error boundary.
 *   - Consistent with the DashboardLayout pattern used for auth'd routes.
 */
export function AuthLayout() {
  return <Outlet />
}
