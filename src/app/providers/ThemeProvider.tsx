import type { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Theme is managed by useThemeStore in src/app/store/themeStore.ts
  // next-themes was removed to avoid conflicts and double persistence issues.
  return <>{children}</>
}
