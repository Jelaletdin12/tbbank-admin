import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { UserForm } from '@/features/allUsers/components/allUsersForm'

// ─── UserCreatePage ───────────────────────────────────────────────────────────

export default function UserCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <button
          onClick={() => navigate('/users')}
          className="hover:text-foreground transition-colors"
        >
          {t('nav.resources', 'Resurslar')}
        </button>
        <ChevronRight size={12} />
        <button
          onClick={() => navigate('/users')}
          className="hover:text-foreground transition-colors"
        >
          {t('nav.users', 'Ulanyjylar')}
        </button>
        <ChevronRight size={12} />
        <span className="text-foreground font-medium">
          {t('users.actions.create', 'Ulanyjy dörediň')}
        </span>
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground">
        {t('users.actions.create', 'Ulanyjy dörediň')}
      </h1>

      {/* Shared form — create mode */}
      <UserForm mode="create" />
    </div>
  )
}