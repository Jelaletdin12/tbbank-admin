import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { type SupportedLanguage } from '@/lib/i18n'

interface I18nState {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: i18n.language as SupportedLanguage,
      setLanguage: (language) => {
        i18n.changeLanguage(language)
        set({ language })
      },
    }),
    {
      name: 'tbbank-lang',
    },
  ),
)
