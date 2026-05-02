import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ru from './locales/ru.json'
import tk from './locales/tk.json'

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'tk'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const savedLang = localStorage.getItem('tbbank-lang') as SupportedLanguage | null
const defaultLang: SupportedLanguage =
  SUPPORTED_LANGUAGES.includes(savedLang as SupportedLanguage) ? (savedLang as SupportedLanguage) : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    tk: { translation: tk },
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
