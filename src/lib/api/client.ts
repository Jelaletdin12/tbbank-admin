import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

// Request interceptor — attach token
apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('tbbank-auth')
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { token?: string } }
      const token = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // ignore parse errors
    }
  }
  return config
})

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('tbbank-auth')
      window.location.replace('/login')
    }
    return Promise.reject(error)
  },
)
