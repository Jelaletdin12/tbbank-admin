import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Trash2, Pencil, ChevronDown } from 'lucide-react'
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
  useCardBalance,
  useDeleteCardBalance,
  useDownloadCardBalance,
} from '@/features/cardBalance/hooks/useCardBalance'

// ─── Types for operations table ───────────────────────────────────────────────

interface Operation {
  id: number
  action_name: string
  performed_by: string
  target: string
  status: 'FINISHED' | 'PENDING' | 'FAILED'
  date: string
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  FINISHED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  PENDING:  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  FAILED:   'bg-red-500/20 text-red-400 border border-red-500/30',
}

function OpStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

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

export default function CardBalanceViewPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [deleteOpen, setDeleteOpen]       = useState(false)
  const [opsExpanded, setOpsExpanded]     = useState(true)
  const [opsPage, setOpsPage]             = useState(1)

  const numericId       = Number(id)
  const { data, isLoading } = useCardBalance(numericId)
  const deleteMutation      = useDeleteCardBalance()
  const downloadMutation    = useDownloadCardBalance()

  // Placeholder operations — in real app fetch from API using numericId
  const operations: Operation[] = []
  const opsTotal = operations.length

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(numericId)
    navigate('/card-balances')
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t('Card balance detail', 'Kart galyndysy giňişleýin')}:
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => downloadMutation.mutate(numericId)}
            disabled={downloadMutation.isPending}
          >
            <Download size={14} />
          </Button>
          <Button
            variant="outline" size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={14} />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/card-balances/${numericId}/edit`}>
              <Pencil size={14} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Detail card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DetailRow label={t('ID', 'ID')}                           value={data.id} />
        <DetailRow label={t('Passport series', 'Pasport seriýasy')} value={data.passport_series} />
        <DetailRow label={t('Passport number', 'Pasport belgisi')}  value={data.passport_number} />
        <DetailRow label={t('Card number', 'Kart belgisi')}         value={data.card_number} />
        <DetailRow label={t('Card expiry month', 'Kart Möhleti (aý)')} value={data.card_expiry_month} />
        <DetailRow label={t('Card expiry year', 'Kart Möhleti (ýyl)')} value={data.card_expiry_year} />
      </div>

      {/* Ammallar (Operations) collapsible section */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Section toggle header */}
        <button
          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
          onClick={() => setOpsExpanded((v) => !v)}
        >
          <span className="font-semibold text-foreground text-sm">
            {t('Operations', 'Ammallar')}
          </span>
          <ChevronDown
            size={15}
            className={`text-muted-foreground transition-transform duration-200 ${opsExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {opsExpanded && (
          <>
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {[
                      t('ID', 'ID'),
                      t('Action name', 'AMALYŇ ADY'),
                      t('Performed by', 'KIM TARAPYNDAN'),
                      t('Target', 'AMALYŇ NYŞANY (TARGEDI)'),
                      t('Status', 'AMALYŇ STATUSY'),
                      t('Date', 'SENE'),
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {operations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        {t('No operations found', 'Amal tapylmady')}
                      </td>
                    </tr>
                  ) : (
                    operations.map((op) => (
                      <tr key={op.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-primary font-medium">{op.id}</td>
                        <td className="px-4 py-3">{op.action_name}</td>
                        <td className="px-4 py-3">{op.performed_by}</td>
                        <td className="px-4 py-3">{op.target}</td>
                        <td className="px-4 py-3"><OpStatusBadge status={op.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{op.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Ops pagination */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" disabled={opsPage <= 1} onClick={() => setOpsPage((p) => p - 1)}>
                {t('Previous', 'Öňki')}
              </Button>
              <span>
                {opsTotal === 0 ? '0' : `1–${opsTotal}`} {t('of', 'of')} {opsTotal}
              </span>
              <Button variant="ghost" size="sm" disabled={true}>
                {t('Next', 'Indiki')}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?', 'Eminsiňizmi?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'This action cannot be undone.',
                'Bu amal yzyna gaýtarylmaz. Kart galyndysy hemişelik öçüriler.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('Deleting...', 'Öçürilýär...') : t('Delete', 'Öçür')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}