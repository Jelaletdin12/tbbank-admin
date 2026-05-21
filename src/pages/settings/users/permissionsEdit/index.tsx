import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { PermissionForm } from '@/features/permissions/components/permissionsForm'
import { usePermission } from '@/features/permissions/hooks/usePermissions'

export default function PermissionEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const { data: permission, isLoading, isError } = usePermission(numericId)

  if (isLoading) return <PageSpinner />
  if (isError || !permission) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <PermissionForm mode="edit" initialData={permission} />
}
