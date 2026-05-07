import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { DataTable } from '@/components/dataTable'
import { DataTableToolbar } from '@/components/dataTableToolbar'
import { useIntlPayments, useDeleteIntlPayment } from '@/features/visaMasterPayments/hooks/useVisaMasterPayments'
import type { IntlPaymentItem, IntlPaymentStatus } from '@/features/visaMasterPayments/api/visaMasterPaymentsApi'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2, ChevronDown } from 'lucide-react'
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
import { cn } from '@/lib/utils'

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<IntlPaymentStatus, { label: string; className: string }> = {
  pending:  { label: 'Garaşylýar', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  approved: { label: 'Tassyklandy', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'Ret edildi',  className: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

function StatusBadge({ status }: { status: IntlPaymentStatus }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', cfg.className)}>
      {cfg.label}
    </span>
  )
}

// ─── Month selector (AÝ TOLEGI) ───────────────────────────────────────────────

const MONTHS = [
  { value: '01', label: 'Ýanwar' },
  { value: '02', label: 'Fewral' },
  { value: '03', label: 'Mart' },
  { value: '04', label: 'Aprel' },
  { value: '05', label: 'Maý' },
  { value: '06', label: 'Iýun' },
  { value: '07', label: 'Iýul' },
  { value: '08', label: 'Awgust' },
  { value: '09', label: 'Sentýabr' },
  { value: '10', label: 'Oktýabr' },
  { value: '11', label: 'Noýabr' },
  { value: '12', label: 'Dekabr' },
]

function MonthSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4 inline-flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {t('intlPayment.monthFilter', 'AÝ TÖLEGI')}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-9 pl-3 pr-8 rounded-md border border-border bg-background',
            'text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            'appearance-none cursor-pointer min-w-[120px]',
          )}
        >
          <option value="">—</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntlPaymentsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [page, setPage]       = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [search, setSearch]   = useState('')
  const [month, setMonth]     = useState('')
  const [statusFilter, setStatusFilter] = useState<IntlPaymentStatus | ''>('')

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder]           = useState<string[]>([])

  const [deleteTarget, setDeleteTarget] = useState<IntlPaymentItem | null>(null)

  const { data, isLoading } = useIntlPayments({ page, per_page: perPage, search, status: statusFilter, month })
  const { mutate: deletePayment, isPending: isDeleting } = useDeleteIntlPayment()

  const columns: ColumnDef<IntlPaymentItem>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'currency_type_label',
      header: t('intlPayment.currencyType', 'Ýüztumanyň görnüşi'),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.currency_type_label}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: t('intlPayment.createdAt', 'Döredilen wagty'),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">{row.original.created_at}</span>
      ),
    },
    {
      accessorKey: 'province_label',
      header: t('intlPayment.province', 'Welaýat'),
    },
    {
      accessorKey: 'branch_label',
      header: t('intlPayment.branch', 'Şahamça'),
      cell: ({ row }) => (
        <span className="text-primary font-medium">{row.original.branch_label}</span>
      ),
    },
    {
      accessorKey: 'passport_first_name',
      header: t('intlPayment.firstName', 'Ady'),
    },
    {
      accessorKey: 'passport_last_name',
      header: t('intlPayment.lastName', 'Familiýasy'),
    },
    {
      accessorKey: 'phone',
      header: t('intlPayment.phone', 'Telefon'),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('intlPayment.status', 'Status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="icon" variant="ghost" className="h-7 w-7"
            onClick={() => navigate(`/visa-master-payments/${row.original.id}`)}
          >
            <Eye size={14} />
          </Button>
          <Button
            size="icon" variant="ghost" className="h-7 w-7"
            onClick={() => navigate(`/visa-master-payments/${row.original.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            size="icon" variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  const columnMeta = columns
    .filter((c) => 'accessorKey' in c)
    .map((c) => ({
      id:    ('accessorKey' in c ? String(c.accessorKey) : c.id) as string,
      label: typeof c.header === 'string' ? c.header : String(('accessorKey' in c ? c.accessorKey : '') ?? ''),
    }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t("intlPayment.title", "Halkara tölegler (Visa/Mastercard)")}
        </h1>
      </div>
      <MonthSelector value={month} onChange={(v) => { setMonth(v); setPage(1) }} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('intlPayment.search', 'Gözlemek')}
        columns={columnMeta}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        filterFields={[
          {
            id: 'status',
            label: t('intlPayment.status', 'Status'),
            options: [
              { value: 'pending',  label: 'Garaşylýar' },
              { value: 'approved', label: 'Tassyklandy' },
              { value: 'rejected', label: 'Ret edildi' },
            ],
          },
        ]}
        activeFilters={[{ fieldId: 'status', value: statusFilter }]}
        onFilterChange={(fieldId, value) => {
          if (fieldId === 'status') setStatusFilter(value as IntlPaymentStatus | '')
          setPage(1)
        }}
        onFilterReset={() => { setStatusFilter(''); setPage(1) }}
        perPage={perPage}
        onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
        actionLabel={t('intlPayment.createBtn', 'Visa/Master tölegler (talyplar üçin) dörediň')}
        onAction={() => navigate('/visa-master-payments/create')}
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        enableRowSelection
        currentPage={data?.meta?.current_page ?? 1}
        totalPages={data?.meta?.last_page ?? 1}
        totalCount={data?.meta?.total}
        onPageChange={setPage}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('intlPayment.deleteTitle', 'Pozmak isleýärsiňizmi?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('intlPayment.deleteDesc', 'Bu amal yzyna dolanyp bolmaz.')} {deleteTarget?.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deletePayment(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
                }
              }}
            >
              {t('common.delete', 'Poz')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
