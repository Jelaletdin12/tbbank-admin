import { format } from 'date-fns'
import { Trash2, Edit, Search, Download, XCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/statusBadge'
import { InfoRow, AuditLog, type AuditRowProps } from '@/components/viewPageComponents'
import { useSberPaymentOrder, useDeleteSberPayment } from '@/features/sberPayments/hooks/useSberPayments'
import type { PaymentPaidStatus, PaymentStatus } from '@/features/sberPayments/api/sberPaymentsApi'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirmDialog'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  GARASYLYYAR:       { label: 'Garaşylýar',  variant: 'warning' as StatusBadgeVariant, icon: AlertCircle  },
  KANAGATLANDYRYLAN: { label: 'Tassyklandy', variant: 'success' as StatusBadgeVariant, icon: CheckCircle2 },
  RET_EDILEN:        { label: 'Ýatyryldy',   variant: 'error'   as StatusBadgeVariant, icon: XCircle      },
} satisfies Record<PaymentStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }>

const PAID_STATUS_CONFIG = {
  Tolenmedik: { label: 'Tölmedi',  variant: 'error'   as StatusBadgeVariant, icon: XCircle      },
  Tolendi:    { label: 'Tölendi',  variant: 'success' as StatusBadgeVariant, icon: CheckCircle2 },
} satisfies Record<PaymentPaidStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }>

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
}

function PaymentPaidStatusBadge({ status }: { status: PaymentPaidStatus }) {
  const cfg = PAID_STATUS_CONFIG[status]
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
}

// ─── Bento primitives ─────────────────────────────────────────────────────────

function BentoGrid({ cols = 2, children }: { cols?: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols]
  return <div className={`grid ${colClass} gap-4`}>{children}</div>
}

function BentoCard({
  title,
  span,
  children,
}: {
  title?: string
  span?: 'full' | 2 | 3
  children: React.ReactNode
}) {
  const spanClass =
    span === 'full' ? 'sm:col-span-full' :
    span === 2      ? 'sm:col-span-2'    :
    span === 3      ? 'sm:col-span-3'    : ''

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${spanClass}`}>
      {title && (
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Document row ─────────────────────────────────────────────────────────────

function DocumentRow({
  label,
  fileName,
  fileUrl,
}: {
  label: string
  fileName: string | null
  fileUrl: string | null
}) {
  if (!fileUrl) return (
    <InfoRow label={label}>
      <span className="text-muted-foreground/50">—</span>
    </InfoRow>
  )

  const name = fileName ?? fileUrl.split('/').pop() ?? 'faýl'

  return (
    <InfoRow label={label}>
      <div className="flex items-center gap-2">
        <button className="p-1.5 rounded bg-muted hover:bg-accent transition-colors">
          <Search size={12} className="text-muted-foreground" />
        </button>
        <a
          href={fileUrl}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-xs text-primary transition-colors"
        >
          <Download size={12} />
          <span className="max-w-[140px] truncate">{name}</span>
        </a>
      </div>
    </InfoRow>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SberPaymentViewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <Skeleton className="h-3 w-24 mb-1" />
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SberPaymentViewPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [historySearch, setHistorySearch] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: order, isLoading } = useSberPaymentOrder(id!)
  const deleteMutation = useDeleteSberPayment()

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id!)
    navigate('/sber-payments')
  }

  if (isLoading) return <SberPaymentViewSkeleton />

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Toleg tapylmady
      </div>
    )
  }

  const kabulDocs = order.documents?.slice(0, 6) ?? []
  const ugradDocs = order.documents?.slice(6)    ?? []

  const auditLogs: AuditRowProps[] = order.activityLog?.map((log) => ({
    id:     log.id.split('-')[1] ?? log.id,
    action: log.analysisName,
    by:     log.createdBy,
    target: log.target,
    status: log.status,
    date:   format(new Date(log.createdAt), 'dd/MM/yyyy, HH:mm:ss') + ' GMT+5',
  })) ?? []

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          Sberbank töleg: {order.id}
        </h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDeleteOpen(true)}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-md cursor-pointer hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            title="Poz"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => navigate(`/sber-payments/${id}/edit`)}
            className="p-2 rounded-md cursor-pointer hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title="Redaktirle"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>

      {/* ── Row 1: Meta + Lokasiýa ────────────────────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title="Esasy maglumatlar">
          <InfoRow label="ID" value={order.id} />
          <InfoRow label="Status">
            <PaymentStatusBadge status={order.status} />
          </InfoRow>
          <InfoRow label="Tölenen (Sul aý)">
            <PaymentPaidStatusBadge status={order.paidStatus} />
          </InfoRow>
          <InfoRow label="Bellik" value={order.bellik} />
        </BentoCard>

        <BentoCard title="Lokasiýa">
          <InfoRow label="Welaýat"  value={order.welayat} />
          <InfoRow label="Şahamça" value={order.sahamca} isLink />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 2: Şahsy maglumatlar + Töleg ─────────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title="Şahsy maglumatlar">
          <InfoRow label="Pasportdaky ady"      value={order.firstName} />
          <InfoRow label="Pasportdaky familiýa" value={order.lastName}  />
          <InfoRow label="Telefon"              value={order.phone}     />
          <InfoRow label="E-poçta"              value={order.email}     />
          <InfoRow label="Häzirki ýaşaýyş ýeri" value={order.address}  />
        </BentoCard>

        <BentoCard title="Töleg">
          <InfoRow
            label="Töleg ugradyjynyň maglumatlary"
            value={`I-M${order.passportNumber?.slice(0, 2) ?? 'XX'}-${order.passportNumber ?? ''} ${order.fullName}`}
          />
          <InfoRow label="Töleg ugradyjynyň goýum hasaby" value={order.accountNumber} />
          <InfoRow label="Pasport seriýasy"               value={order.passportSeries} />
          <InfoRow label="Pasport nomeri"                 value={order.passportNumber} />
          <InfoRow label="Ady Familiýasy Atasynyň ady"    value={order.fullName} />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 3: Kabul ediji resminamalary ─────────────────────────────── */}
      <BentoGrid cols={1}>
        <BentoCard title="Kabul ediji talyp boyunca resminamalary">
          {kabulDocs.length > 0
            ? kabulDocs.map((doc) => (
                <DocumentRow key={doc.id} label={doc.label} fileName={doc.name} fileUrl={doc.fileUrl} />
              ))
            : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Resminamalar ýok
              </div>
            )
          }
        </BentoCard>
      </BentoGrid>

      {/* ── Row 4: Ugradyjy resminamalary ────────────────────────────────── */}
      <BentoGrid cols={1}>
        <BentoCard title="Ugradyjy boyunca resminamalary">
          {ugradDocs.length > 0
            ? ugradDocs.map((doc) => (
                <DocumentRow key={doc.id} label={doc.label} fileName={doc.name} fileUrl={doc.fileUrl} />
              ))
            : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Resminamalar ýok
              </div>
            )
          }
        </BentoCard>
      </BentoGrid>

      {/* ── Row 5: Töleg taryhy ───────────────────────────────────────────── */}
      <BentoGrid cols={1}>
        <BentoCard title="Töleg taryhy">
          <div className="p-4">
            <div className="relative max-w-xs mb-4">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Gözlemek"
                className="h-9 w-full pl-9 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/50">
              <div className="w-12 h-12 mb-3 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <p className="text-sm">Berlen kriteriýalara Töleg gabat gelmedi.</p>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* ── Audit log ────────────────────────────────────────────────────── */}
      <AuditLog logs={auditLogs} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Bu tölegi pozmak isleýärsiňizmi?"
        confirmLabel="Poz"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}