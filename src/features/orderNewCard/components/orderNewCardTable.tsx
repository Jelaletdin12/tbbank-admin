import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@/components/dataTable'
import type { CardOrderListItem, CardOrderStatus } from '../api/orderNewCardApi'

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  CardOrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Garaşylýar',
    className:
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ' +
      'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  APPROVED: {
    label: 'Tassyklandy',
    className:
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ' +
      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  REJECTED: {
    label: 'Ýatyryldy',
    className:
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ' +
      'bg-red-500/10 text-red-400 border border-red-500/20',
  },
}

function StatusBadge({ status }: { status: CardOrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  const icons: Record<CardOrderStatus, string> = {
    PENDING:  '⏳',
    APPROVED: '✓',
    REJECTED: '✕',
  }
  return (
    <span className={cfg.className}>
      <span className="text-[10px]">{icons[status]}</span>
      {cfg.label}
    </span>
  )
}

// ─── Coloured text helper ─────────────────────────────────────────────────────

function HighlightText({
  value,
  variant,
}: {
  value: string
  variant: 'teal' | 'cyan' | 'muted'
}) {
  const cls =
    variant === 'teal'  ? 'text-teal-400 font-semibold'  :
    variant === 'cyan'  ? 'text-cyan-400 font-semibold'  :
    'text-muted-foreground'
  return <span className={cls}>{value}</span>
}

// ─── useCardOrderColumns ──────────────────────────────────────────────────────

export function useCardOrderColumns(): ColumnDef<CardOrderListItem>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'id',
      header: t('cardOrder.col.id', 'ID'),
      cell: ({ row }) => (
        <Link
          to={`/order-new-card/${row.original.id}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {row.original.id}
        </Link>
      ),
      size: 130,
    },
    {
      accessorKey: 'issuanceReasonName',
      header: t('cardOrder.col.reason', 'Sebäp'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.issuanceReasonName}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: t('cardOrder.col.createdAt', 'Döredilen wagty'),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.original.createdAt}
        </span>
      ),
      size: 160,
    },
    {
      accessorKey: 'cardTypeName',
      header: t('cardOrder.col.cardType', 'Görnüşi'),
      cell: ({ row }) => {
        const isAltyn = row.original.cardTypeName === 'Altyn Asyr'
        return (
          <HighlightText
            value={row.original.cardTypeName}
            variant={isAltyn ? 'cyan' : 'teal'}
          />
        )
      },
    },
    {
      accessorKey: 'provinceName',
      header: t('cardOrder.col.province', 'Welaýat'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.provinceName}</span>
      ),
    },
    {
      accessorKey: 'branchName',
      header: t('cardOrder.col.branch', 'Şahamça'),
      cell: ({ row }) => {
        const specialBranches = [
          'Köpetdag', 'Türkmenabat', 'Türkmenbaşy',
          'Seýdi', 'Çandybil', 'Balkan', 'Baş bank',
        ]
        const isSpecial = specialBranches.includes(row.original.branchName)
        return (
          <HighlightText
            value={row.original.branchName}
            variant={isSpecial ? 'cyan' : 'muted'}
          />
        )
      },
    },
    {
      id: 'fullName',
      header: t('cardOrder.col.name', 'Ady'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.lastName} {row.original.firstName}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('cardOrder.col.status', 'Status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 130,
    },
    
  ]
}