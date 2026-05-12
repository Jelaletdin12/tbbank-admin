import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RoleForm } from '@/features/roles/components/roleForm'
import { useRole } from '@/features/roles/hooks/useRoles'
import { Skeleton } from '@/components/ui/skeleton'

export default function RoleEditPage() {
  const { t }  = useTranslation()
  const { id } = useParams<{ id: string }>()
  const roleId = Number(id)

  const { data: role, isLoading, isError } = useRole(roleId)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
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

  if (isError || !role) {
    return (
      <p className="text-destructive text-sm">
        {t('common.fetchError', 'Maglumat ýüklenmedi.')}
      </p>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('roles.editTitle', 'Rol üýtget')}: {role.name?.tk}
      </h1>
      <RoleForm mode="edit" initialData={role} roleId={roleId} />
    </div>
  )
}