import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { UserForm } from '@/features/allUsers/components/allUsersForm'
import { useUser } from '@/features/allUsers/hooks/useAllUsers'

// ─── UserEditPage ─────────────────────────────────────────────────────────────

export default function UserEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { data: user, isLoading, isError } = useUser(userId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {t('common.notFound', 'Maglumat tapylmady')}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl">
    

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground">
        {t('users.editTitle', 'Ulanyjy giňişleýin')}: {user.name} ({user.username})
      </h1>

      {/* Shared form — edit mode, passes fetched data */}
      <UserForm mode="edit" initialData={user} userId={userId} />
    </div>
  )
}