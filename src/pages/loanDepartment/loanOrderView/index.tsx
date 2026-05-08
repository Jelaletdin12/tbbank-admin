import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, Pencil, Download, ChevronRight, Eye } from 'lucide-react'
import { useLoanOrderById, useDeleteLoanOrder } from '@/features/loanOrders/hooks/useLoanOrders'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/statusBadge'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import type { LoanOrderMobileStatus } from '@/features/loanOrderMobiles/api/loanOrderMobilesApi'


const STATUS_CONFIG = {
  GARAŞYLÝAR: {
    label:   'Garaşylýar',
    variant: 'warning' as StatusBadgeVariant,
    icon:    AlertCircle,
  },
  KANAGATLANDYRYLAN: {
    label:   'Tassyklandy',
    variant: 'success' as StatusBadgeVariant,
    icon:    CheckCircle2,
  },
  RED_EDILDI: {
    label:   'Ýatyryldy',
    variant: 'error' as StatusBadgeVariant,
    icon:    XCircle,
  },
  IŞLENÝÄR: {
    label:   'Işlenýär',
    variant: 'warning' as StatusBadgeVariant,
    icon:    AlertCircle,
  },
} satisfies Record<LoanOrderMobileStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }>

function LoanOrderMobileStatusBadge({ status }: { status: LoanOrderMobileStatus }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
}


// ─── Sub-component Types ──────────────────────────────────────────────────────

interface InfoRowProps {
  label: string
  value?: string | null
  isLink?: boolean
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

interface PassportImageProps {
  label: string
  src?: string | null
}

interface AuditRowProps {
  id: string
  action: string
  by: string
  target: string
  status: string
  date: string
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, isLink }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {value ? (
        <span className={`text-sm ${isLink ? 'text-primary font-medium' : 'text-foreground'}`}>
          {value}
        </span>
      ) : (
        <span className="text-muted-foreground/40 text-sm">—</span>
      )}
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-foreground mb-2">{title}</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">{children}</div>
    </div>
  )
}

// ─── PassportImage ────────────────────────────────────────────────────────────

function PassportImage({ label, src }: PassportImageProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-[220px_1fr] items-start py-3 px-4 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground pt-1">{label}</span>
      <div className="flex flex-col gap-2">
        {src ? (
          <img
            src={src}
            alt={label}
            className="w-28 h-20 object-cover rounded-md border border-border"
          />
        ) : (
          <div className="w-28 h-20 bg-muted rounded-md border border-border flex items-center justify-center">
            <span className="text-xs text-muted-foreground">—</span>
          </div>
        )}
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit">
          <Download size={12} />
          {t('common.download', 'Göçürip al')}
        </button>
      </div>
    </div>
  )
}

// ─── AuditRow ─────────────────────────────────────────────────────────────────

function AuditRow({ id, action, by, target, status, date }: AuditRowProps) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-2.5 text-xs font-mono text-primary">{id}</td>
      <td className="px-4 py-2.5 text-sm text-foreground">{action}</td>
      <td className="px-4 py-2.5 text-sm text-foreground">{by}</td>
      <td className="px-4 py-2.5 text-sm text-foreground">{target}</td>
      <td className="px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {status}
        </span>
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{date}</td>
      <td className="px-4 py-2.5">
        <button className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
          <Eye size={13} />
        </button>
      </td>
    </tr>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LoanOrderViewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-64" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
          <Skeleton className="h-4 w-32 mb-1" />
          {[...Array(3)].map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoanOrderViewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const deleteMutation = useDeleteLoanOrder()

  const { data: order, isLoading } = useLoanOrderById(id!)

  const handleDelete = () => {
    if (!window.confirm(t('loanOrders.deleteConfirm', 'Bu sargyt pozulsynmy?'))) return
    deleteMutation.mutate(id!, {
      onSuccess: () => {
        toast.success(t('loanOrders.deleteSuccess', 'Sargyt pozuldy'))
        navigate('/loan-orders')
      },
      onError: () => {
        toast.error(t('loanOrders.deleteError', 'Pozma wagty ýalňyşlyk ýüze çykdy'))
      },
    })
  }

  if (isLoading) return <LoanOrderViewSkeleton />

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        {t('common.notFound', 'Tapylmady')}
      </div>
    )
  }

  // Replace with real audit data from API when available
  const auditLogs: AuditRowProps[] = [
    {
      id: '44548',
      action: t('audit.actions.view', 'Görmek'),
      by: order.createdBy ?? '',
      target: `${t('loanOrders.title', 'Karz sargyt')}: ${order.id}`,
      status: 'FINISHED',
      date: order.createdAt ?? '',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-foreground">
          {t('loanOrders.view.title', 'Karz sargyt giriş')}: {order.id}
        </h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-md cursor-pointer hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            title={t('common.delete', 'Poz')}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => navigate(`/loan-orders/${order.id}/edit`)}
            className="p-2 rounded-md cursor-pointer hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t('common.edit', 'Redaktirle')}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <InfoRow label="ID" value={order.id} />
        <InfoRow
          label={t('loanOrders.columns.createdAt', 'Döredilen wagty')}
          value={order.createdAt}
        />
        {/* Status row — special render */}
        <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('loanOrders.columns.status', 'Status')}
          </span>
          <LoanOrderMobileStatusBadge status={order.status} />
        </div>
        <InfoRow
          label={t('loanOrders.fields.amount', 'Berlik')}
          value={order.amount ? String(order.amount) : undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.createdBy', 'Sargyt eden')}
          value={order.createdBy ?? undefined}
          isLink
        />
      </div>

      {/* ── Loan ───────────────────────────────────────────────────────────── */}
      <Section title={t('loanOrders.sections.loan', 'Karz')}>
        <InfoRow
          label={t('loanOrders.columns.loanType', 'Karz görnüşi')}
          value={order.loanType}
          isLink
        />
        <InfoRow
          label={t('loanOrders.fields.loanAmount', 'Karz mukdary')}
          value={order.loanAmount ? String(order.loanAmount) : undefined}
        />
      </Section>

      {/* ── Location ───────────────────────────────────────────────────────── */}
      <Section title={t('loanOrders.sections.location', 'Lokasiýa')}>
        <InfoRow label={t('loanOrders.columns.region', 'Welaýat')} value={order.region} />
        <InfoRow
          label={t('loanOrders.columns.branch', 'Şahamça')}
          value={order.branch}
          isLink
        />
      </Section>

      {/* ── Personal Info ──────────────────────────────────────────────────── */}
      <Section title={t('loanOrders.sections.personal', 'Şahsy maglumatlar')}>
        <InfoRow
          label={t('loanOrders.fields.fullName', 'Doly ady')}
          value={order.fullName ?? `${order.firstName} ${order.lastName}`}
        />
        <InfoRow
          label={t('loanOrders.fields.education', 'Bilimi')}
          value={order.education ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.maritalStatus', 'Maşgala ýagdaýy')}
          value={order.maritalStatus ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.birthDate', 'Doglan güni')}
          value={order.birthDate ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.registeredAddress', 'Ýazgy edilen salgyňyz')}
          value={order.registeredAddress ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.currentAddress', 'Häzirki ýaşaýyş ýeri')}
          value={order.currentAddress ?? undefined}
        />
      </Section>

      {/* ── Contacts ───────────────────────────────────────────────────────── */}
      <Section title={t('loanOrders.sections.contacts', 'Habarlaşmak üçin maglumatlar')}>
        <InfoRow
          label={t('loanOrders.fields.email', 'E-poçta')}
          value={order.email ?? undefined}
        />
        <InfoRow label={t('loanOrders.columns.phone', 'Telefon')} value={order.phone} />
        <InfoRow
          label={t('loanOrders.fields.phoneAlt', 'Telefon goşmaça')}
          value={order.phoneAlt ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.homePhone', 'Öý telefony')}
          value={order.homePhone ?? undefined}
        />
      </Section>

      {/* ── Employment ─────────────────────────────────────────────────────── */}
      <Section title={t('loanOrders.sections.employment', 'Iş')}>
        <InfoRow
          label={t('loanOrders.fields.employer', 'Işleýän edaranyň/kärhananyn ady')}
          value={order.employer ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.deptPhone', 'Işgärler bölüminiň iş belgisi')}
          value={order.deptPhone ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.workRegion', 'Işleýän welaýatyňyz')}
          value={order.workRegion ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.workCity', 'Işleýän etrabyňyz')}
          value={order.workCity ?? undefined}
          isLink
        />
        <InfoRow
          label={t('loanOrders.fields.position', 'Wezipe')}
          value={order.position ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.salary', 'Zähmet haky')}
          value={order.salary ? String(order.salary) : undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.employedSince', 'Işe başlan wagtyňyz')}
          value={order.employedSince ?? undefined}
        />
      </Section>

      {/* ── Passport ───────────────────────────────────────────────────────── */}
      <Section title={t('loanOrders.sections.passport', 'Pasport')}>
        <InfoRow
          label={t('loanOrders.fields.passportNumber', 'Pasport')}
          value={order.passportNumber ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.passportIssuedBy', 'Kim tarapyndan berildi')}
          value={order.passportIssuedBy ?? undefined}
        />
        <InfoRow
          label={t('loanOrders.fields.passportBirthPlace', 'Doglan ýeri (pasport)')}
          value={order.passportBirthPlace ?? undefined}
        />
        <PassportImage
          label={t('loanOrders.fields.passportPage1', 'Pasport (sahypa 1)')}
          src={order.passportPage1Url ?? undefined}
        />
        <PassportImage
          label={t('loanOrders.fields.passportPage23', 'Pasport (2-3-nji sahypa)')}
          src={order.passportPage23Url ?? undefined}
        />
        <PassportImage
          label={t('loanOrders.fields.passportPage89', 'Pasport (8-9 sahypa)')}
          src={order.passportPage89Url ?? undefined}
        />
        <PassportImage
          label={t('loanOrders.fields.passportPage32', 'Pasport (32-nji sahypa)')}
          src={order.passportPage32Url ?? undefined}
        />
      </Section>

      {/* ── Audit Log ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <details open>
          <summary className="text-base font-semibold text-foreground mb-2 cursor-pointer select-none list-none flex items-center gap-1.5 w-fit">
            {t('loanOrders.sections.audit', 'Ammallar')}
            <ChevronRight size={15} className="text-muted-foreground" />
          </summary>
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      'ID',
                      t('audit.columns.action', 'AMALYŇ ADY'),
                      t('audit.columns.by', 'KIM TARAPYNDAN'),
                      t('audit.columns.target', 'AMALYŇ NYŞANY (TARIBESI)'),
                      t('audit.columns.status', 'AMALYŇ STATUSY'),
                      t('audit.columns.date', 'SENE'),
                      '',
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <AuditRow key={log.id} {...log} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
              <span>{t('common.prev', 'Öňki')}</span>
              <span>1–{auditLogs.length} / {auditLogs.length}</span>
              <span>{t('common.next', 'Soňky')}</span>
            </div>
          </div>
        </details>
      </div>

    </div>
  )
}