import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'

import { DataTable } from '@/components/dataTable'
import { DataTableToolbar, type ActiveFilter, type FilterField } from '@/components/dataTableToolbar'
import { LoanOrderStatusBadge } from '@/features/loanOrders/components/loanOrderStatusBadge'
import { useLoanOrders, useDeleteLoanOrder } from '@/features/loanOrders/hooks/useLoanOrders'
import type { LoanOrder, LoanOrderStatus } from '@/features/loanOrders/api/loanOrdersApi'

// ─── Column meta for toggle dropdown ─────────────────────────────────────────

const COLUMN_IDS = [
  'id', 'loanType', 'createdAt', 'region', 'branch',
  'firstName', 'lastName', 'phone', 'status',
] as const

// ─── Filter fields ────────────────────────────────────────────────────────────

const REGION_OPTIONS = [
  { value: 'Balkan',   label: 'Balkan'   },
  { value: 'Ahal',     label: 'Ahal'     },
  { value: 'Daşoguz',  label: 'Daşoguz'  },
  { value: 'Lebap',    label: 'Lebap'    },
  { value: 'Mary',     label: 'Mary'     },
  { value: 'Aşgabat',  label: 'Aşgabat'  },
]

const STATUS_OPTIONS: { value: LoanOrderStatus; label: string }[] = [
  { value: 'GARAŞYLÝAR',        label: 'GARAŞYLÝAR'        },
  { value: 'KANAGATLANDYRYLAN', label: 'KANAGATLANDYRYLAN' },
  { value: 'RED_EDILDI',        label: 'RED EDILDI'        },
  { value: 'IŞLENÝÄR',          label: 'IŞLENÝÄR'          },
]

// ─── Page Component ───────────────────────────────────────────────────────────

export default function LoanOrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteMutation = useDeleteLoanOrder()

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch]               = useState('')
  const [page, setPage]                   = useState(1)
  const [perPage, setPerPage]             = useState(10)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder]     = useState<string[]>([...COLUMN_IDS])
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { fieldId: 'region',   value: '' },
    { fieldId: 'status',   value: '' },
    { fieldId: 'branch',   value: '' },
    { fieldId: 'archived', value: '' },
  ])

  // ── Query params ───────────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const filterMap = Object.fromEntries(activeFilters.map((f) => [f.fieldId, f.value]))
    return {
      search:   search || undefined,
      region:   filterMap.region   || undefined,
      status:   (filterMap.status as LoanOrderStatus) || undefined,
      branch:   filterMap.branch   || undefined,
      archived: filterMap.archived || undefined,
      page,
      perPage,
    }
  }, [search, activeFilters, page, perPage])

  const { data, isLoading } = useLoanOrders(queryParams)

  const totalPages = data ? Math.ceil(data.total / perPage) : 1

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((fieldId: string, value: string) => {
    setActiveFilters((prev) => prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f)))
    setPage(1)
  }, [])

  const handleFilterReset = useCallback(() => {
    setActiveFilters((prev) => prev.map((f) => ({ ...f, value: '' })))
    setPage(1)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm(t('loanOrders.deleteConfirm', 'Bu sargyt pozulsynmy?'))) return
      deleteMutation.mutate(id)
    },
    [deleteMutation, t]
  )

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<LoanOrder>[]>(
    () => [
      {
        id: 'id',
        accessorKey: 'id',
        header: t('ID', 'ID'),
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.id}</span>
        ),
        size: 130,
      },
      {
        id: 'loanType',
        accessorKey: 'loanType',
        header: t('Loan type', 'KARZ GÖRNÜŞI'),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
            {row.original.loanType}
          </span>
        ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: t('Created at', 'DÖREDILEN WAGTY'),
        cell: ({ row }) => (
          <span className="text-sm text-foreground whitespace-nowrap">{row.original.createdAt}</span>
        ),
        size: 160,
      },
      {
        id: 'region',
        accessorKey: 'region',
        header: t('Region', 'WELAÝAT'),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.region}</span>
        ),
        size: 100,
      },
      {
        id: 'branch',
        accessorKey: 'branch',
        header: t('Branch', 'ŞAHAMÇA'),
        cell: ({ row }) => (
          <span className="text-sm text-emerald-500 font-medium">{row.original.branch}</span>
        ),
        size: 100,
      },
      {
        id: 'firstName',
        accessorKey: 'firstName',
        header: t('Name', 'ADY'),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.firstName}</span>
        ),
        size: 110,
      },
      {
        id: 'lastName',
        accessorKey: 'lastName',
        header: t('Surname', 'FAMILIÝASY'),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.lastName}</span>
        ),
        size: 120,
      },
      {
        id: 'phone',
        accessorKey: 'phone',
        header: t('Phone', 'TELEFON'),
        cell: ({ row }) => (
          <span className="text-sm font-mono text-foreground">{row.original.phone}</span>
        ),
        size: 110,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('Status', 'STATUS'),
        cell: ({ row }) => <LoanOrderStatusBadge status={row.original.status} />,
        size: 180,
      },
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button
              className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t('common.view', 'View')}
              onClick={() => navigate(`/loan-orders/${row.original.id}`)}
            >
              <Eye size={15} />
            </button>
            <button
              className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t('common.edit', 'Edit')}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 cursor-pointer rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              title={t('common.delete', 'Delete')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
        size: 100,
      },
    ],
    [t, handleDelete, deleteMutation.isPending]
  )

  // ── Column meta for toolbar ────────────────────────────────────────────────
  const toggleableColumns = useMemo(
    () => COLUMN_IDS.map((id) => ({ id, label: t(`loanOrders.columns.${id}`, id) })),
    [t]
  )

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        id: 'region',
        label: t('Region', 'WELAÝAT'),
        options: REGION_OPTIONS,
      },
      {
        id: 'status',
        label: t('Status', 'STATUS'),
        options: STATUS_OPTIONS,
      },
      {
        id: 'branch',
        label: t('Branch', 'ŞAHAMÇA'),
        options: [],
      },
      {
        id: 'archived',
        label: t('loanOrders.filters.archived', 'ARHIWLENEN'),
        options: [
          { value: 'true',  label: t('common.yes', 'Hawa') },
          { value: 'false', label: t('common.no',  'Ýok')  },
        ],
      },
    ],
    [t]
  )

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t('loanOrders.title', 'Karz sargytlary')}
        </h1>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          searchPlaceholder={t('loanOrders.searchPlaceholder', 'Gözlemek')}
          columns={toggleableColumns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
          perPageOptions={[10, 25, 50, 100]}
          perPage={perPage}
          onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
          actionLabel={t('loanOrders.createButton', 'Karz sargyt dörediñ')}
          onAction={() => {
            navigate('/loan-orders/create')
          }}
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
          getRowId={(row) => row.id}
          currentPage={page}
          totalPages={totalPages}
          totalCount={data?.total}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}