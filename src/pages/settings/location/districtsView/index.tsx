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
import { useDistrictById, useDeleteDistrict } from '@/features/districts/hooks/useDistricts'

export function DistrictViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const numericId = Number(id)

  const { data, isLoading } = useDistrictById(numericId)
  const deleteMutation = useDeleteDistrict()
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
         
          <h1 className="text-2xl font-bold text-foreground">
            {isLoading
              ? '...'
              : `${t('districts.viewTitle', 'Etrap giňişleýin')}: ${data?.name.tk ?? ''}`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/settings/location/districts/${numericId}/edit`)}
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
          {Array.from({ length: 3 }).map((_, i) => (
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
        <Section>
          <InfoRow label={t('common.id', 'ID')} value={data.id} />

          <MultiLangRow label={t('districts.fields.name', 'Ady')} value={data.name} />

          <InfoRow
            label={t('districts.fields.description', 'Bellikler')}
            value={data.description ?? undefined}
          />

          <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4">
            <span className="text-sm text-muted-foreground">
              {t('districts.fields.isActive', 'Işjeň')}
            </span>
            {data.isActive ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <XCircle size={18} className="text-destructive" />
            )}
          </div>
        </Section>
      ) : (
        <p className="text-muted-foreground text-sm">{t('common.noData', 'Maglumat ýok')}</p>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete', 'Öçürmegi tassyklaň')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('districts.deleteConfirm', 'Bu etrapy öçürmek isleýärsiňizmi?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteMutation.mutate(numericId, {
                  onSuccess: () => navigate('/settings/location/districts'),
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

export default DistrictViewPage
