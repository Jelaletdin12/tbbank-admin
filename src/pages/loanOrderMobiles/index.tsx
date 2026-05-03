import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'

import { DataTable } from '@/components/dataTable'
import { DataTableToolbar, type ActiveFilter, type FilterField } from '@/components/dataTableToolbar'
import { LoanOrderStatusBadge } from '@/features/loanOrders/components/loanOrderStatusBadge'
import {
  useLoanOrderMobiles,
  useDeleteLoanOrderMobile,
} from '@/features/loanOrderMobiles/hooks/useLoanOrderMobiles'
import type { LoanOrderMobile, LoanOrderMobileStatus } from '@/features/loanOrderMobiles/api/loanOrderMobilesApi'

// ─── Column IDs ────────────────────────────────────────────────────────────────

const COLUMN_IDS = [
  'id',
  'loanType',
  'createdAt',
  'region',
  'branch',
  'firstName',
  'lastName',
  'phone',
  'status',
] as const

// ─── Filter options ────────────────────────────────────────────────────────────

const REGION_OPTIONS = [
  { value: 'Balkan',  label: 'Balkan'  },
  { value: 'Ahal',    label: 'Ahal'    },
  { value: 'Daşoguz', label: 'Daşoguz' },
  { value: 'Lebap',   label: 'Lebap'   },
  { value: 'Mary',    label: 'Mary'    },
  { value: 'Aşgabat', label: 'Aşgabat' },
]

const STATUS_OPTIONS: { value: LoanOrderMobileStatus; label: string }[] = [
  { value: 'GARAŞYLÝAR',        label: 'GARAŞYLÝAR'        },
  { value: 'KANAGATLANDYRYLAN', label: 'KANAGATLANDYRYLAN' },
  { value: 'RED_EDILDI',        label: 'RED EDILDI'        },
  { value: 'IŞLENÝÄR',          label: 'IŞLENÝÄR'          },
]

// ─── Page Component ────────────────────────────────────────────────────────────

export default function LoanOrderMobilesPage() {
  const { t } = useTranslation()
  const deleteMutation = useDeleteLoanOrderMobile()

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch]                         = useState('')
  const [page, setPage]                             = useState(1)
  const [perPage, setPerPage]                       = useState(25)
  const [columnVisibility, setColumnVisibility]     = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder]               = useState<string[]>([...COLUMN_IDS])
  const [activeFilters, setActiveFilters]           = useState<ActiveFilter[]>([
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
      status:   (filterMap.status as LoanOrderMobileStatus) || undefined,
      branch:   filterMap.branch   || undefined,
      archived: filterMap.archived || undefined,
      page,
      perPage,
    }
  }, [search, activeFilters, page, perPage])

  const { data, isLoading } = useLoanOrderMobiles(queryParams)
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
      if (!window.confirm(t('loanOrderMobiles.deleteConfirm', 'Bu sargyt pozulsynmy?'))) return
      deleteMutation.mutate(id)
    },
    [deleteMutation, t],
  )

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<LoanOrderMobile>[]>(
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
        header: t('loanOrderMobiles.columns.loanType', 'KARZ GÖRNÜŞI'),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
            {row.original.loanType}
          </span>
        ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: t('loanOrderMobiles.columns.createdAt', 'DÖREDILEN WAGTY'),
        cell: ({ row }) => (
          <span className="text-sm text-foreground whitespace-nowrap">{row.original.createdAt}</span>
        ),
        size: 160,
      },
      {
        id: 'region',
        accessorKey: 'region',
        header: t('loanOrderMobiles.columns.region', 'WELAÝAT'),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.region}</span>
        ),
        size: 100,
      },
      {
        id: 'branch',
        accessorKey: 'branch',
        header: t('loanOrderMobiles.columns.branch', 'ŞAHAMÇA'),
        cell: ({ row }) => (
          <span className="text-sm text-emerald-500 font-medium">{row.original.branch}</span>
        ),
        size: 100,
      },
      {
        id: 'firstName',
        accessorKey: 'firstName',
        header: t('loanOrderMobiles.columns.firstName', 'ADY'),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.firstName}</span>
        ),
        size: 110,
      },
      {
        id: 'lastName',
        accessorKey: 'lastName',
        header: t('loanOrderMobiles.columns.lastName', 'FAMILIÝASY'),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.lastName}</span>
        ),
        size: 120,
      },
      {
        id: 'phone',
        accessorKey: 'phone',
        header: t('loanOrderMobiles.columns.phone', 'TELEFON'),
        cell: ({ row }) => (
          <span className="text-sm font-mono text-foreground">{row.original.phone}</span>
        ),
        size: 110,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('loanOrderMobiles.columns.status', 'STATUS'),
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
              className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t('common.view', 'Görmek')}
            >
              <Eye size={15} />
            </button>
            <button
              className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t('common.edit', 'Üýtgetmek')}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              title={t('common.delete', 'Pozmak')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
        size: 100,
      },
    ],
    [t, handleDelete, deleteMutation.isPending],
  )

  // ── Column meta for toolbar ────────────────────────────────────────────────
  const toggleableColumns = useMemo(
    () => COLUMN_IDS.map((id) => ({ id, label: t(`loanOrderMobiles.columns.${id}`, id) })),
    [t],
  )

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        id: 'region',
        label: t('loanOrderMobiles.filters.region', 'WELAÝAT'),
        options: REGION_OPTIONS,
      },
      {
        id: 'status',
        label: t('loanOrderMobiles.filters.status', 'STATUS'),
        options: STATUS_OPTIONS,
      },
      {
        id: 'branch',
        label: t('loanOrderMobiles.filters.branch', 'ŞAHAMÇA'),
        options: [],
      },
      {
        id: 'archived',
        label: t('loanOrderMobiles.filters.archived', 'ARHIWLENEN'),
        options: [
          { value: 'true',  label: t('common.yes', 'Hawa') },
          { value: 'false', label: t('common.no',  'Ýok')  },
        ],
      },
    ],
    [t],
  )

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t('loanOrderMobiles.title', 'Karz sargytlary')}
        </h1>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          searchPlaceholder={t('loanOrderMobiles.searchPlaceholder', 'Gözlemek')}
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
          actionLabel={t('loanOrderMobiles.createButton', 'Karz sargyt dörediň')}
          onAction={() => {
            // navigate to create page or open modal
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