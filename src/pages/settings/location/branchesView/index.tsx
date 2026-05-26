import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'
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
import { useBranchById, useDeleteBranch } from '@/features/branches/hooks/useBranches'

export function BranchViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const numericId = Number(id)

  const { data, isLoading } = useBranchById(numericId)
  const deleteMutation = useDeleteBranch()
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
        
          <h1 className="text-2xl font-bold text-foreground">
            {isLoading
              ? '...'
              : `${t('branches.viewTitle', 'Şahamça giňişleýin')}: ${data?.name.tk ?? ''}`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/settings/location/branches/${numericId}/edit`)}
            title={t('common.edit', 'Üýtgetmek')}
          >
            <Pencil size={15} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
            title={t('common.delete', 'Öçürmek')}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border last:border-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          <Section title={t('branches.sections.basic', 'Esasy maglumatlar')}>
            <InfoRow label={t('common.id', 'ID')} value={data.id} />
            <InfoRow label={t('branches.fields.code', 'Kod')} value={data.code} />

            <MultiLangRow label={t('branches.fields.name', 'Ady')} value={data.name} />

            <MultiLangRow label={t('branches.fields.district', 'Etrap')} value={data.districtName} />

            <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4">
              <span className="text-sm text-muted-foreground">
                {t('branches.fields.isActive', 'Işjeň')}
              </span>
              {data.isActive ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : (
                <XCircle size={18} className="text-destructive" />
              )}
            </div>
          </Section>

          <Section title={t('branches.sections.address', 'Salgy we habarlaşmak')}>
            <MultiLangRow label={t('branches.fields.address', 'Salgy')} value={data.address} />
            <InfoRow label={t('branches.fields.phone', 'Telefon')} value={data.phone} />
            <InfoRow label={t('branches.fields.email', 'E-poçta')} value={data.email} />
          </Section>

          <Section title={t('branches.sections.hours', 'Iş wagty')}>
            <InfoRow label={t('branches.fields.workingHours', 'Iş wagty')} value={data.workingHours} />
            <InfoRow
              label={t('branches.fields.description', 'Bellikler')}
              value={data.description ?? undefined}
            />
          </Section>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">{t('common.noData', 'Maglumat ýok')}</p>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete', 'Öçürmegi tassyklaň')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('branches.deleteConfirm', 'Bu şahamçany öçürmek isleýärsiňizmi?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteMutation.mutate(numericId, {
                  onSuccess: () => navigate('/settings/location/branches'),
                })
              }
            >
              {deleteMutation.isPending
                ? t('common.deleting', 'Öçürilýär...')
                : t('common.delete', 'Öçürmek')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default BranchViewPage
