import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  logout: () => void;
  refreshToken: () => Promise<string>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),

      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),

      logout: () => {
        get().clearAuth();
      },

      refreshToken: async () => {
        try {
          const response = await axios.post<{ token: string }>(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            },
          );

          const newToken = response.data.token;
          set((state) => ({ ...state, token: newToken }));
          return newToken;
        } catch (error) {
          get().clearAuth();
          throw error;
        }
      },
    }),
    {
      name: "tbbank-auth",
    },
  ),
);
