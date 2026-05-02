import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/app/store/themeStore'
import { useI18nStore } from '@/app/store/i18nStore'
import type { SupportedLanguage } from '@/lib/i18n'

const LANG_LABELS: Record<SupportedLanguage, string> = {
  en: 'EN',
  ru: 'RU',
  tk: 'TK',
}

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()
  const { language, setLanguage } = useI18nStore()

  return (
    <div className="min-h-dvh relative flex items-center justify-center overflow-hidden
                    bg-[var(--bg-base)] transition-colors duration-[var(--transition-slow)]">

      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Gradient orbs */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10
                     bg-gradient-to-br from-[var(--brand-500)] to-blue-400
                     animate-[pulse_8s_ease-in-out_infinite]"
        />
        <div
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full opacity-15 dark:opacity-10
                     bg-gradient-to-tl from-[var(--gold-400)] to-[var(--brand-500)]
                     animate-[pulse_10s_ease-in-out_2s_infinite]"
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(var(--text-primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Top bar — theme & lang switchers */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-500)] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          <span className="font-bold text-[var(--text-primary)] text-sm tracking-wide hidden sm:block">
            TBBank
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-default)]
                          rounded-[var(--radius-md)] p-1 shadow-[var(--shadow-sm)]">
            {(Object.keys(LANG_LABELS) as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                id={`lang-btn-${lang}`}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold transition-all
                            duration-[var(--transition-fast)] cursor-pointer
                            ${
                              language === lang
                                ? 'bg-[var(--brand-500)] text-white'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
                            }`}
              >
                {LANG_LABELS[lang]}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? t('theme.dark') : t('theme.light')}
            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center
                       bg-[var(--bg-surface)] border border-[var(--border-default)]
                       text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                       hover:bg-[var(--bg-muted)] transition-all duration-[var(--transition-fast)]
                       shadow-[var(--shadow-sm)] cursor-pointer"
          >
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} TBBank. All rights reserved.
        </p>
      </div>
    </div>
  )
}
