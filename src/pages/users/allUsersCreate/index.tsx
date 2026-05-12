import { useTranslation } from 'react-i18next'
import { UserForm } from '@/features/allUsers/components/allUsersForm'

// ─── UserCreatePage ───────────────────────────────────────────────────────────

export default function UserCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-4 max-w-4xl">
     
      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground">
        {t('users.actions.create', 'Ulanyjy dörediň')}
      </h1>

      {/* Shared form — create mode */}
      <UserForm mode="create" />
    </div>
  )
}