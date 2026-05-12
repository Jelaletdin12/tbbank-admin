import { useTranslation } from 'react-i18next'
import { PermissionForm } from '@/features/permissions/components/permissionsForm'

export default function PermissionCreatePage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('permissions.actions.create', 'Rugsat dörediň')}
      </h1>
      <PermissionForm mode="create" />
    </div>
  )
}