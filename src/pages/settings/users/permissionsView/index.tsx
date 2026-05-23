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
import { usePermission, useDeletePermission } from '@/features/permissions/hooks/usePermissions'

// ─── PermissionViewPage ───────────────────────────────────────────────────────

export default function PermissionViewPage() {
  const { t }        = useTranslation()
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const permissionId = Number(id)

  const [showDelete, setShowDelete] = useState(false)

  const { data: permission, isLoading, isError } = usePermission(permissionId)
  const deletePermission = useDeletePermission()

  const handleConfirmDelete = () => {
    deletePermission.mutate(permissionId, {
      onSuccess: () => navigate('/settings/users/permissions'),
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

  if (isError || !permission) {
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
          {t('permissions.viewTitle', 'Rugsat giňişleýin')}: {permission.name?.tk}
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
            onClick={() => navigate(`/settings/users/permissions/${permissionId}/edit`)}
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>

      {/* Detail section */}
      <Section>
        <InfoRow label={t('common.id', 'ID')} value={permission.id} />
        <InfoRow label={t('permissions.fields.code', 'Kod')} value={permission.code} />

        <MultiLangRow label={t('permissions.fields.name', 'Ady')} value={permission.name} />

        <InfoRow label={t('permissions.fields.guardName', 'Guard name')} value={permission.guard_name} />
      </Section>

      {/* Delete dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('permissions.deleteDialog.title', 'Rugsaty pozmak')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'permissions.deleteDialog.description',
                'Bu rugsaty pozmak isleýärsiňizmi? Bu amal yzyna gaýtarylmaz.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePermission.isPending
                ? t('common.deleting', 'Pozulýar...')
                : t('common.delete', 'Poz')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
