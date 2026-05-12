import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PermissionForm } from '@/features/permissions/components/permissionsForm'
import { usePermission } from '@/features/permissions/hooks/usePermissions'
import { Skeleton } from '@/components/ui/skeleton'

export default function PermissionEditPage() {
  const { t }  = useTranslation()
  const { id } = useParams<{ id: string }>()
  const permissionId = Number(id)

  const { data: permission, isLoading, isError } = usePermission(permissionId)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-56 mb-6" />
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[220px_1fr] items-center p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError || !permission) {
    return (
      <p className="text-destructive text-sm">
        {t('common.fetchError', 'Maglumat ýüklenmedi.')}
      </p>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('permissions.editTitle', 'Rugsaty üýtget')}: {permission.name?.tk}
      </h1>
      <PermissionForm mode="edit" initialData={permission} permissionId={permissionId} />
    </div>
  )
}