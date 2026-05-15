import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'viewer'
  avatar?: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  logout: () => void // Eklendi
  refreshToken: () => Promise<string> // Eklendi
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true }),
        
      clearAuth: () =>
        set({ token: null, user: null, isAuthenticated: false }),
        
      logout: () => {
        // Çıkış yapıldığında hem local state'i temizle hem de gerekirse API'ye logout isteği at
        get().clearAuth()
      },

      refreshToken: async () => {
        try {
          // Interceptor dairesel bağımlılığı bozmasın diye doğrudan bağımsız axios çağrısı yapıyoruz
          const response = await axios.post<{ token: string }>(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${get().token}`, // Mevcut süresi dolmuş token'ı gönderiyoruz
              },
            }
          )
          
          const newToken = response.data.token
          // Yeni token'ı store'a kaydet
          set((state) => ({ ...state, token: newToken }))
          return newToken
        } catch (error) {
          // Eğer refresh token da patlarsa her şeyi sıfırla
          get().clearAuth()
          throw error
        }
      }
    }),
    {
      name: 'tbbank-auth',
    },
  ),
)