// pages/LoanTypeViewPage.tsx

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Section, InfoRow } from '@/components/viewPageComponents'
import { useGetLoanTypeById, useDeleteLoanType } from '@/features/loanTypes/hooks/useLoanTypes'

// ─── LoanTypeViewPage ─────────────────────────────────────────────────────────

export default function LoanTypeViewPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const loanTypeId = Number(id)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data, isLoading, isError } = useGetLoanTypeById(loanTypeId)
  const deleteMutation                = useDeleteLoanType()

  const lang = (i18n.language ?? 'tk') as 'tk' | 'ru' | 'en'

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(loanTypeId)
    navigate('/resources/loan-types')
  }

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl">
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-7 w-80 mb-6" />
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div className="p-6 flex items-center justify-center py-20 text-destructive text-sm">
        {t('common.error', 'Ýalňyşlyk ýüze çykdy')}
      </div>
    )
  }

  // ── View ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl">
    

      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <h1 className="text-xl font-semibold text-foreground">
          {t('loanTypes.viewTitle', 'Karz görnüşi giňişleýin')}: {data.name[lang]}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title={t('common.delete', 'Pozmak')}
          >
            <Trash2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/resources/loan-types/${loanTypeId}/edit`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={t('common.edit', 'Redaktirlemek')}
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>

      {/* Detail section */}
      <Section>
        <InfoRow label="ID" value={data.id} />

        {/* Multilingual name rows */}
        <div className="grid grid-cols-[220px_1fr] items-start py-2.5 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground pt-1">
            {t('loanTypes.fields.name', 'Ady')}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground w-6">TK</span>
              <span className="text-sm text-foreground">{data.name.tk}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground w-6">RU</span>
              <span className="text-sm text-foreground">{data.name.ru}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground w-6">EN</span>
              <span className="text-sm text-foreground">{data.name.en}</span>
            </div>
          </div>
        </div>

        <InfoRow
          label={t('loanTypes.fields.tax', 'Salgyt')}
          value={data.tax}
        />

        <InfoRow
          label={t('loanTypes.fields.loanTerm', 'Karz möhleti')}
          value={data.loanTerm}
        />

        <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.notes', 'Bellikler')}
          </span>
          <span className="text-sm text-foreground">
            {data.notes ? data.notes[lang] || '—' : '—'}
          </span>
        </div>

        <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border last:border-0">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.isActive', 'Işjeň')}
          </span>
          {data.isActive ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : (
            <XCircle size={20} className="text-muted-foreground" />
          )}
        </div>
      </Section>

      {/* Delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('loanTypes.deleteDialog.title', 'Pozmak')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'loanTypes.deleteDialog.description',
                'Bu karz görnüşini pozmak isleýärsiňizmi? Bu amal yzyna gaýtarylyp bilinmez.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t('common.cancel', 'Ýatyr')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? t('common.deleting', 'Pozulýar...')
                : t('common.delete', 'Pozmak')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}