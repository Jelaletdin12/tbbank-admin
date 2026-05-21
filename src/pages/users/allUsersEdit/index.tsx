import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { UserForm } from '@/features/allUsers/components/allUsersForm'
import { useUser } from '@/features/allUsers/hooks/useAllUsers'

export default function UserEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const { data: user, isLoading, isError } = useUser(numericId)

  if (isLoading) return <PageSpinner />
  if (isError || !user) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <UserForm mode="edit" initialData={user} />
}
