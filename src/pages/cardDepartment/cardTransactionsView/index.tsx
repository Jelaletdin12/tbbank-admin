import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
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
import {
  useCardTransaction,
  useDeleteCardTransaction,
  useDownloadCardTransaction,
} from '@/features/cardTransactions/hooks/useCardTransactions'

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[220px_1fr] border-b border-border/50 last:border-0">
      <div className="px-4 py-3 text-sm text-muted-foreground font-medium bg-muted/10">
        {label}
      </div>
      <div className="px-4 py-3 text-sm text-foreground">{value}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardTransactionViewPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [deleteOpen, setDeleteOpen] = useState(false)

  const numericId = Number(id)
  const { data, isLoading } = useCardTransaction(numericId)
  const deleteMutation = useDeleteCardTransaction()
  const downloadMutation = useDownloadCardTransaction()

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(numericId)
    navigate('/card-transactions')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-7 text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        {t('Not found', 'Tapylmady')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t('Card transaction detail', 'Kart herekedi giňişleýin')}:
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => downloadMutation.mutate(numericId)}
            disabled={downloadMutation.isPending}
          >
            <Download size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            asChild
          >
            <Link to={`/card-transactions/${numericId}/edit`}>
              <Pencil size={14} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Detail card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DetailRow label={t('ID', 'ID')} value={data.id} />
        <DetailRow label={t('Passport series', 'Pasport seriýasy')} value={data.passport_series} />
        <DetailRow label={t('Passport number', 'Pasport belgisi')} value={data.passport_number} />
        <DetailRow label={t('Card number', 'Kart belgisi')} value={data.card_number} />
        <DetailRow label={t('Card expiry month', 'Kart Möhleti (aý)')} value={data.card_expiry_month} />
        <DetailRow label={t('Card expiry year', 'Kart Möhleti (ýyl)')} value={data.card_expiry_year} />
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?', 'Eminsiňizmi?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'This action cannot be undone. This will permanently delete the card transaction.',
                'Bu amal yzyna gaýtarylmaz. Kart herekedi hemişelik öçüriler.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? t('Deleting...', 'Öçürilýär...')
                : t('Delete', 'Öçür')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
