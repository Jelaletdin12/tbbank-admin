import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Trash2, Pencil, DownloadCloud } from 'lucide-react'
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
  useCardRequisite,
  useDeleteCardRequisite,
  useDownloadCardRequisite,
} from '@/features/cardRequisites/hooks/useCardRequisites'
import type { CardRequisiteStatus } from '@/features/cardRequisites/api/cardRequisitesApi'

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<CardRequisiteStatus, { label: string; className: string }> = {
  pending:  { label: 'GARAŞYLÝAR', className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  approved: { label: 'TASSYKLANAN', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  rejected: { label: 'RET EDILEN',  className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[220px_1fr] border-b border-border/50 last:border-0">
      <div className="px-4 py-3 text-sm text-muted-foreground font-medium bg-muted/10">
        {label}
      </div>
      <div className="px-4 py-3 text-sm text-foreground">{children}</div>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-foreground mt-6 mb-3">{children}</h2>
  )
}

// ─── Passport image row ───────────────────────────────────────────────────────

function PassportImageRow({ label, url }: { label: string; url?: string }) {
  return (
    <div className="grid grid-cols-[220px_1fr] border-b border-border/50 last:border-0">
      <div className="px-4 py-3 text-sm text-muted-foreground font-medium bg-muted/10">
        {label}
      </div>
      <div className="px-4 py-4 flex flex-col gap-2">
        {url ? (
          <>
            <img
              src={url}
              alt={label}
              className="max-w-[200px] rounded-md border border-border object-cover"
            />
            <a
              href={url}
              download
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <DownloadCloud size={13} />
              {('Download', 'Göçürip al')}
            </a>
          </>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardRequisiteViewPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading } = useCardRequisite(id ?? '')
  const deleteMutation      = useDeleteCardRequisite()
  const downloadMutation    = useDownloadCardRequisite()

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id ?? '')
    navigate('/card-requisites')
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

  const statusCfg = STATUS_BADGE[data.status] ?? STATUS_BADGE.pending

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-foreground">
          {t('Card requisite detail', 'Kart rekwizit giňişleýin')}: {data.id}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => downloadMutation.mutate(data.id)}
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
            <Link to={`/card-requisites/${data.id}/edit`}>
              <Pencil size={14} />
            </Link>
          </Button>
        </div>
      </div>

      {/* General info */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DetailRow label={t('ID', 'ID')}>{data.id}</DetailRow>
        <DetailRow label={t('Created at', 'Döredilen wagty')}>{data.created_at}</DetailRow>
        <DetailRow label={t('Status', 'Status')}>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
        </DetailRow>
        <DetailRow label={t('Note', 'Bellik')}>
          {data.note || '—'}
        </DetailRow>
        <DetailRow label={t('Requested by', 'Sargyt eden:')}>
          {data.first_name && data.last_name ? (
            <span className="text-primary font-medium">
              {data.last_name}_{data.first_name} ({data.first_name})
            </span>
          ) : '—'}
        </DetailRow>
      </div>

      {/* Card */}
      <SectionTitle>{t('Card', 'Kart')}</SectionTitle>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DetailRow label={t('Card number', 'Kart belgisi')}>{data.card_number}</DetailRow>
        <DetailRow label={t('Card expiry month', 'Kart Möhleti (aý)')}>{data.card_expiry_month}</DetailRow>
        <DetailRow label={t('Card expiry year', 'Kart Möhleti (ýyl)')}>{data.card_expiry_year}</DetailRow>
      </div>

      {/* Location */}
      <SectionTitle>{t('Location', 'Lokasiýa')}</SectionTitle>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DetailRow label={t('Province', 'Welaýat')}>{data.province_name ?? '—'}</DetailRow>
        <DetailRow label={t('Branch', 'Şahamça')}>
          <span className="text-primary font-medium">{data.branch_name ?? '—'}</span>
        </DetailRow>
      </div>

      {/* Personal */}
      <SectionTitle>{t('Personal information', 'Şahsy maglumatlar')}</SectionTitle>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DetailRow label={t('Full name', 'Doly ady')}>
          {[data.first_name, data.last_name, data.middle_name].filter(Boolean).join(' ')}
        </DetailRow>
        <DetailRow label={t('Birth date', 'Doglan güni')}>{data.birth_date}</DetailRow>
        <DetailRow label={t('Phone', 'Telefon')}>{data.phone}</DetailRow>
      </div>

      {/* Passport */}
      <SectionTitle>{t('Passport', 'Pasport')}</SectionTitle>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DetailRow label={t('Passport series', 'Pasport seriýasy')}>{data.passport_series}</DetailRow>
        <DetailRow label={t('Passport number', 'Pasport belgisi')}>{data.passport_number}</DetailRow>
        <PassportImageRow
          label={t('Passport (page 1)', 'Pasport (sahypa 1)')}
          url={data.passport_page1_url}
        />
        <PassportImageRow
          label={t('Passport (pages 2-3)', 'Pasport (2-3-nji sahypa)')}
          url={data.passport_page2_3_url}
        />
        <PassportImageRow
          label={t('Passport (pages 8-9)', 'Pasport (8-9 sahypa)')}
          url={data.passport_page8_9_url}
        />
        <PassportImageRow
          label={t('Passport (page 32)', 'Pasport (32-nji sahypa)')}
          url={data.passport_page32_url}
        />
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?', 'Eminsiňizmi?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'This action cannot be undone.',
                'Bu amal yzyna gaýtarylmaz. Kart rekwiziti hemişelik öçüriler.',
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
