import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store/authStore'
import { loginApi, type LoginRequest } from '../api/authApi'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginApi(credentials),
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      navigate('/dashboard', { replace: true })
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  return () => {
    clearAuth()
    navigate('/login', { replace: true })
  }
}
