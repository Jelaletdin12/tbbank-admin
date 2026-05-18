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
import { Section, InfoRow } from '@/components/viewPageComponents'
import { usePermission, useDeletePermission } from '@/features/permissions/hooks/usePermissions'

// ─── LangTabs ─────────────────────────────────────────────────────────────────

type LangKey = 'tk' | 'ru' | 'en'

function LangTabs({
  active,
  onChange,
}: {
  active: LangKey
  onChange: (l: LangKey) => void
}) {
  const { t } = useTranslation()
  const LANG_TABS: { key: LangKey; label: string }[] = [
    { key: 'tk', label: t('languages.tk', 'Türkmen') },
    { key: 'ru', label: t('languages.ru', 'Русский') },
    { key: 'en', label: t('languages.en', 'English') },
  ]
  return (
    <div className="flex gap-1 justify-end mb-2">
      {LANG_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-3 py-0.5 text-xs font-medium rounded-md transition-colors ${
            active === tab.key
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── PermissionViewPage ───────────────────────────────────────────────────────

export default function PermissionViewPage() {
  const { t }        = useTranslation()
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const permissionId = Number(id)

  const [activeLang, setActiveLang] = useState<LangKey>('tk')
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
            <div key={i} className="grid grid-cols-[220px_1fr] items-center py-3 px-4">
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

        {/* Name row — with lang switcher */}
        <div className="grid grid-cols-[220px_1fr] items-start py-2.5 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground pt-1">
            {t('permissions.fields.name', 'Ady')}
          </span>
          <div>
            <LangTabs active={activeLang} onChange={setActiveLang} />
            <span className="text-sm text-foreground">
              {permission.name?.[activeLang] || '—'}
            </span>
          </div>
        </div>

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
