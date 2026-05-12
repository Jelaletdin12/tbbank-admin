import { useTranslation } from 'react-i18next'
import { RoleForm } from '@/features/roles/components/roleForm'

export default function RoleCreatePage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('roles.actions.create', 'Rol dörediň')}
      </h1>
      <RoleForm mode="create" />
    </div>
  )
}