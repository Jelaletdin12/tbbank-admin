
import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Eye, Edit, ArrowUpDown, Trash2 } from 'lucide-react'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/dataTable'
import { DataTableToolbar, type ColumnMeta, type FilterField, type ActiveFilter } from '@/components/dataTableToolbar'
import { useSberPaymentOrders, useDeleteSberPayment } from '@/features/sberPayments/hooks/useSberPayments'
import { type SberPaymentOrder, WELAYATLAR, STATUSES, type PaymentStatus, type PaymentPaidStatus } from '@/features/sberPayments/api/sberPaymentsApi'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/statusBadge'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  GARASYLYYAR: {
    label:   'Garaşylýar',
    variant: 'warning' as StatusBadgeVariant,
    icon:    AlertCircle,
  },
  KANAGATLANDYRYLAN: {
    label:   'Tassyklandy',
    variant: 'success' as StatusBadgeVariant,
    icon:    CheckCircle2,
  },
  RET_EDILEN: {
    label:   'Ýatyryldy',
    variant: 'error' as StatusBadgeVariant,
    icon:    XCircle,
  },
 
} satisfies Record<PaymentStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }>

const PAID_STATUS_CONFIG = {
  Tolenmedik: {
    label:   'Tölmedi',
    variant: 'error' as StatusBadgeVariant,
    icon:    XCircle,
  },
  Tolendi: {
    label:   'Tölendi',
    variant: 'success' as StatusBadgeVariant,
    icon:    CheckCircle2,
  },
} satisfies Record<PaymentPaidStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }>

function PaymentPaidStatusBadge({ status }: { status: PaymentPaidStatus }) {
  const cfg = PAID_STATUS_CONFIG[status]
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
}

// ─── Column Definitions ───────────────────────────────────────────────────────



// ─── Column Meta for Toolbar ──────────────────────────────────────────────────

const columnMeta: ColumnMeta[] = [
  { id: 'id', label: 'ID' },
  { id: 'createdAt', label: 'Doredilen wagty' },
  { id: 'welayat', label: 'Welayat' },
  { id: 'sahamca', label: 'Sahamca' },
  { id: 'firstName', label: 'Ady' },
  { id: 'lastName', label: 'Familiyasy' },
  { id: 'phone', label: 'Telefon' },
  { id: 'status', label: 'Status' },
  { id: 'paidStatus', label: 'Tolenen (sul ay)' },
]

// ─── Filter Fields ────────────────────────────────────────────────────────────

const filterFields: FilterField[] = [
  {
    id: 'welayat',
    label: 'Welayat',
    options: WELAYATLAR.map((w) => ({ value: w, label: w })),
  },
  {
    id: 'status',
    label: 'Status',
    options: STATUSES,
  },
]

// ─── List Page Component ──────────────────────────────────────────────────────

export default function SberPaymentsListPage() {
  const navigate = useNavigate()
  const deleteMutation = useDeleteSberPayment()
  
  const columns = useMemo<ColumnDef<SberPaymentOrder>[]>(() => [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.getValue('id')}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Doredilen wagty',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return (
          <div className="text-sm">
            <div>{format(date, 'HH:mm, dd.MM.yyyy')}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'welayat',
      header: 'Welayat',
      cell: ({ row }) => <span>{row.getValue('welayat')}</span>,
    },
    {
      accessorKey: 'sahamca',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sahamca
          <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-primary font-medium">{row.getValue('sahamca')}</span>
      ),
    },
    {
      accessorKey: 'firstName',
      header: 'Ady',
      cell: ({ row }) => <span>{row.getValue('firstName')}</span>,
    },
    {
      accessorKey: 'lastName',
      header: 'Familiyasy',
      cell: ({ row }) => <span>{row.getValue('lastName')}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Telefon',
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('phone')}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }) => <PaymentStatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'paidStatus',
      header: 'Tolenen (sul ay)',
      cell: ({ row }) => <PaymentPaidStatusBadge status={row.getValue('paidStatus')} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const order = row.original
        
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/sber-payments/${order.id}`)}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="View"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => navigate(`/sber-payments/${order.id}/edit`)}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={async () => {
                if (confirm('Bu tolegi pozmak isleyanizmi?')) {
                  await deleteMutation.mutateAsync(order.id)
                }
              }}
              className="p-1.5 rounded hover:bg-accent text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      },
    },
  ], [navigate, deleteMutation])
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  
  // Search state
  const [search, setSearch] = useState('')
  
  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  
  // Column visibility & order
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>(columnMeta.map((c) => c.id))
  
  // Month filter
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  
  // Get filter values
  const welayatFilter = activeFilters.find((f) => f.fieldId === 'welayat')?.value ?? ''
  const statusFilter = activeFilters.find((f) => f.fieldId === 'status')?.value ?? ''
  
  // Fetch data
  const { data, isLoading } = useSberPaymentOrders({
    page,
    perPage,
    search,
    welayat: welayatFilter,
    status: statusFilter,
  })
  
  const handleFilterChange = (fieldId: string, value: string) => {
    setActiveFilters((prev) => {
      const existing = prev.find((f) => f.fieldId === fieldId)
      if (existing) {
        return prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f))
      }
      return [...prev, { fieldId, value }]
    })
    setPage(1)
  }
  
  const handleFilterReset = () => {
    setActiveFilters([])
    setPage(1)
  }
  
  return (
    <div className="space-y-4">
      {/* Month Filter Card */}
      <div className="bg-card border border-border rounded-lg p-4 max-w-xs">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Ay Tolegi
        </label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="--" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="01">Yanwar</SelectItem>
            <SelectItem value="02">Fewral</SelectItem>
            <SelectItem value="03">Mart</SelectItem>
            <SelectItem value="04">Aprel</SelectItem>
            <SelectItem value="05">May</SelectItem>
            <SelectItem value="06">Iýun</SelectItem>
            <SelectItem value="07">Iýul</SelectItem>
            <SelectItem value="08">Awgust</SelectItem>
            <SelectItem value="09">Sentýabr</SelectItem>
            <SelectItem value="10">Oktýabr</SelectItem>
            <SelectItem value="11">Noýabr</SelectItem>
            <SelectItem value="12">Dekabr</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-foreground">
        Sber tolegier (talyplar ucin)
      </h1>
      
      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Gozlemek"
        columns={columnMeta}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        filterFields={filterFields}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterReset={handleFilterReset}
        perPage={perPage}
        onPerPageChange={(val) => {
          setPerPage(val)
          setPage(1)
        }}
        actionLabel="Sber toleg (talyplar ucin) doredih"
        onAction={() => navigate('/sber-payments/create')}
      />
      
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        enableRowSelection
        getRowId={(row) => row.id}
        currentPage={data?.pagination.currentPage ?? 1}
        totalPages={data?.pagination.totalPages ?? 1}
        totalCount={data?.pagination.totalCount ?? 0}
        onPageChange={setPage}
      />
    </div>
  )
}
