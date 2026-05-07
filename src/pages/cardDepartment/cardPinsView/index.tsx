import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCardPin, useDeleteCardPin } from '@/features/cardPins/hooks/useCardPins'
import type { CardPinStatus } from '@/features/cardPins/api/cardPinApi'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Download } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<CardPinStatus, { label: string; className: string }> = {
  pending:  { label: 'Garaşylýar', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  approved: { label: 'Tassyklandy', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
  rejected: { label: 'Ret edildi', className: 'bg-red-500/20 text-red-500 border-red-500/30' },
}

function StatusBadge({ status }: { status: CardPinStatus }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', cfg.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] items-start py-3 border-b border-border last:border-0 gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}

// ─── Passport image ───────────────────────────────────────────────────────────

function PassportImage({ label, url }: { label: string; url: string | null }) {
  if (!url) return null
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="border border-border rounded-lg overflow-hidden inline-block">
        <img
          src={url}
          alt={label}
          className="max-w-[200px] max-h-[160px] object-cover block"
        />
        <div className="px-3 py-2 bg-muted/40 border-t border-border">
          <a
            href={url}
            download
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download size={12} />
            Göçürip al
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardPinViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, isError } = useCardPin(id!)
  const { mutate: deletePin, isPending: isDeleting } = useDeleteCardPin()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        {t('common.notFound', 'Maglumat tapylmady')}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-bold text-foreground">
          {t('cardPin.viewTitle', 'Kart pin bukja giňişleýin')}: {data.id}
        </h1>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 size={15} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('cardPin.deleteTitle', 'Pozmak isleýärsiňizmi?')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('cardPin.deleteDesc', 'Bu amal yzyna dolanyp bolmaz.')} {data.id}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  {t('common.cancel', 'Ýatyr')}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => deletePin(data.id, { onSuccess: () => navigate('/card-pins') })}
                >
                  {t('common.delete', 'Poz')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => navigate(`/card-pins/${id}/edit`)}
          >
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <section className="bg-card border border-border rounded-lg px-6">
        <FieldRow label="ID">
          <span className="font-mono">{data.id}</span>
        </FieldRow>
        <FieldRow label={t('cardPin.createdAt', 'Döredilen wagty')}>
          {data.created_at}
        </FieldRow>
        <FieldRow label={t('cardPin.status', 'Status')}>
          <StatusBadge status={data.status} />
        </FieldRow>
        <FieldRow label={t('cardPin.note', 'Bellik')}>
          {data.note || '—'}
        </FieldRow>
        <FieldRow label={t('cardPin.createdBy', 'Sargyt eden')}>
          <span className="text-primary font-medium">{data.created_by_label}</span>
        </FieldRow>
      </section>

      {/* Kart */}
      <section className="bg-card border border-border rounded-lg px-6 py-4">
        <h2 className="text-base font-semibold text-foreground mb-2">
          {t('cardPin.cardSection', 'Kart')}
        </h2>
        <div className="divide-y divide-border">
          <FieldRow label={t('cardPin.cardNumber', 'Kart belgisi')}>
            <span className="font-mono tracking-wider">{data.card_number}</span>
          </FieldRow>
          <FieldRow label={t('cardPin.cardExpireMonth', 'Kart Möhleti (aý)')}>—</FieldRow>
          <FieldRow label={t('cardPin.cardExpireYear', 'Kart Möhleti (ýyl)')}>—</FieldRow>
        </div>
      </section>

      {/* Lokasiýa */}
      <section className="bg-card border border-border rounded-lg px-6 py-4">
        <h2 className="text-base font-semibold text-foreground mb-2">
          {t('cardPin.locationSection', 'Lokasiýa')}
        </h2>
        <div className="divide-y divide-border">
          <FieldRow label={t('cardPin.province', 'Welaýat')}>{data.province_label}</FieldRow>
          <FieldRow label={t('cardPin.branch', 'Şahamça')}>
            <span className="text-primary font-medium">{data.branch_label}</span>
          </FieldRow>
        </div>
      </section>

      {/* Şahsy maglumatlar */}
      <section className="bg-card border border-border rounded-lg px-6 py-4">
        <h2 className="text-base font-semibold text-foreground mb-2">
          {t('cardPin.personalSection', 'Şahsy maglumatlar')}
        </h2>
        <div className="divide-y divide-border">
          <FieldRow label={t('cardPin.fullName', 'Doly ady')}>
            {`${data.last_name} ${data.first_name} ${data.father_name}`}
          </FieldRow>
          <FieldRow label={t('cardPin.birthDate', 'Doglan güni')}>{data.birth_date}</FieldRow>
          <FieldRow label={t('cardPin.phone', 'Telefon')}>+{data.phone}</FieldRow>
        </div>
      </section>

      {/* Pasport */}
      <section className="bg-card border border-border rounded-lg px-6 py-4">
        <h2 className="text-base font-semibold text-foreground mb-2">
          {t('cardPin.passportSection', 'Pasport')}
        </h2>
        <div className="divide-y divide-border mb-4">
          <FieldRow label={t('cardPin.passportSeries', 'Pasport seriýasy')}>
            {data.passport_series}
          </FieldRow>
          <FieldRow label={t('cardPin.passportNumber', 'Pasport belgisi')}>
            {data.passport_number}
          </FieldRow>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <PassportImage
            label={t('cardPin.passportFile1', 'Pasport (sahypa 1)')}
            url={data.passport_file_1}
          />
          <PassportImage
            label={t('cardPin.passportFile2', 'Pasport (2-3-nji sahypa)')}
            url={data.passport_file_2}
          />
          <PassportImage
            label={t('cardPin.passportFile3', 'Pasport (8-9 sahypa)')}
            url={data.passport_file_3}
          />
          <PassportImage
            label={t('cardPin.passportFile4', 'Pasport (32-nji sahypa)')}
            url={data.passport_file_4}
          />
        </div>
      </section>
    </div>
  )
}