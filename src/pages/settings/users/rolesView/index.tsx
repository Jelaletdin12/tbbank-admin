import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Section, InfoRow, MultiLangRow } from '@/components/viewPageComponents'
import { useRole, useDeleteRole } from '@/features/roles/hooks/useRoles'

// ─── RoleViewPage ─────────────────────────────────────────────────────────────

export default function RoleViewPage() {
  const { t }        = useTranslation()
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const roleId       = Number(id)

  const [showDelete, setShowDelete] = useState(false)

  const { data: role, isLoading, isError } = useRole(roleId)
  const deleteRole = useDeleteRole()

  const handleConfirmDelete = () => {
    deleteRole.mutate(roleId, {
      onSuccess: () => navigate('/settings/users/roles'),
      onError:   () => setShowDelete(false),
    })
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-72 mb-6" />
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col sm:grid sm:grid-cols-[minmax(0,42%)_minmax(0,58%)] items-start sm:items-center py-3 px-4 gap-2 sm:gap-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page heading + actions */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t('roles.viewTitle', 'Rol giňişleýin')}: {role.name?.tk}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="text-muted-foreground hover:text-destructive hover:border-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-muted-foreground hover:text-blue-500 hover:border-blue-500"
            onClick={() => navigate(`/settings/users/roles/${roleId}/edit`)}
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>

      {/* Detail section */}
      <Section>
        <InfoRow label="ID"               value={role.id} />
        <InfoRow label={t('roles.fields.code', 'Kod')} value={role.code} />

        <MultiLangRow label={t('roles.fields.name', 'Ady')} value={role.name} />

        <InfoRow label={t('roles.fields.guardName', 'Guard name')} value={role.guard_name} />
      </Section>

      {/* Delete dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('roles.deleteDialog.title', 'Roly pozmak')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'roles.deleteDialog.description',
                'Bu roly pozmak isleýärsiňizmi? Bu amal yzyna gaýtarylmaz.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRole.isPending
                ? t('common.deleting', 'Pozulýar...')
                : t('common.delete', 'Poz')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}