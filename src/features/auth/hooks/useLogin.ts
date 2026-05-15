import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import i18next from 'i18next'
import { useAuthStore } from '@/app/store/authStore'
import { loginApi, type LoginRequest } from '../api/authApi'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginApi(credentials),
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      toast.success(i18next.t('Success login', 'Login successful'))
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
