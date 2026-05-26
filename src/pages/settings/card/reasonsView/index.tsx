import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'
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
import { useCardReasonById, useDeleteCardReason } from '@/features/cardReasons/hooks/useCardReasons'

// ─── CardReasonViewPage ────────────────────────────────────────────────────────

export function CardReasonViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const numericId = Number(id)
  const lang = (i18n.language?.slice(0, 2) ?? 'tk') as 'tk' | 'ru' | 'en'

  const { data, isLoading } = useCardReasonById(numericId)
  const deleteMutation = useDeleteCardReason()
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div >
    
      <div className="flex items-start justify-between mb-6">
        <div>
         
          <h1 className="text-2xl font-bold text-foreground">
            {isLoading
              ? '...'
              : `${t('cardReasons.viewTitle', 'Kartyň çykarylmagynyň sebäbi giňişleýin')}: ${data?.name[lang] ?? ''}`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/resources/card-states/${numericId}/edit`)}
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col sm:grid sm:grid-cols-[minmax(0,42%)_minmax(0,58%)] items-start sm:items-center py-2.5 px-4 border-b border-border last:border-0 gap-2 sm:gap-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ) : data ? (
        <Section>
          <InfoRow label={t('common.id', 'ID')} value={data.id} />

          <MultiLangRow label={t('cardReasons.fields.name', 'Ady')} value={data.name} />

          <InfoRow
            label={t('cardReasons.fields.value', 'Baha')}
            value={data.value}
          />
          <InfoRow
            label={t('cardReasons.fields.description', 'Bellikler')}
            value={data.description ?? undefined}
          />

          {/* isActive custom row */}
          <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,42%)_minmax(0,58%)] items-start sm:items-center py-2.5 px-4 gap-1 sm:gap-0">
            <span className="text-xs sm:text-sm text-muted-foreground leading-snug">
              {t('cardReasons.fields.isActive', 'Işjeň')}
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

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete', 'Öçürmegi tassyklaň')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cardReasons.deleteConfirm', 'Bu kartyň çykarylmagynyň sebäbini öçürmek isleýärsiňizmi?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteMutation.mutate(numericId, {
                  onSuccess: () => navigate('/resources/card-states'),
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

export default CardReasonViewPage
