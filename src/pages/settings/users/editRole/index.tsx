import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { RoleForm } from '@/features/roles/components/roleForm'
import { useRole } from '@/features/roles/hooks/useRoles'

export default function RoleEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const roleId = Number(id)
  const { data: role, isLoading, isError } = useRole(roleId)

  if (isLoading) return <PageSpinner />
  if (isError || !role) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <RoleForm mode="edit" initialData={role} />
}
