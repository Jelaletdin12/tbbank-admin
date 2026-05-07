import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { VisibilityState } from '@tanstack/react-table'

import { DataTable } from '@/components/dataTable'
import { DataTableToolbar } from '@/components/dataTableToolbar'
import type { ActiveFilter, FilterField } from '@/components/dataTableToolbar'
import {
  useCardOrders,
  useDeleteCardOrder,
  useProvinces,
  useBranches,
} from '@/features/orderNewCard/hooks/useOrderNewCard'
import { useCardOrderColumns } from '@/features/orderNewCard/components/orderNewCardTable'
import type { CardOrderStatus } from '@/features/orderNewCard/api/orderNewCardApi'

// ─── Column meta list (for toolbar toggle) ────────────────────────────────────

const COLUMN_META = [
  { id: 'id',                 label: 'ID'              },
  { id: 'issuanceReasonName', label: 'Sebäp'           },
  { id: 'createdAt',          label: 'Döredilen wagty' },
  { id: 'cardTypeName',       label: 'Görnüşi'         },
  { id: 'provinceName',       label: 'Welaýat'         },
  { id: 'branchName',         label: 'Şahamça'         },
  { id: 'fullName',           label: 'Ady'             },
  { id: 'status',             label: 'Status'          },
]

const DEFAULT_ORDER = COLUMN_META.map((c) => c.id)

// ─── CardOrdersPage ───────────────────────────────────────────────────────────

export default function CardOrdersPage() {
  const { t }    = useTranslation()
  const navigate = useNavigate()
  const deleteMutation = useDeleteCardOrder()

  // ── State ──────────────────────────────────────────────────────────────────
  const [search,           setSearch]           = useState('')
  const [page,             setPage]             = useState(1)
  const [perPage,          setPerPage]          = useState(10)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder,      setColumnOrder]      = useState<string[]>(DEFAULT_ORDER)
  const [activeFilters,    setActiveFilters]    = useState<ActiveFilter[]>([
    { fieldId: 'status',     value: '' },
    { fieldId: 'provinceId', value: '' },
    { fieldId: 'branchId',   value: '' },
  ])

  // ── Lookup data ────────────────────────────────────────────────────────────
  const provinceId = activeFilters.find((f) => f.fieldId === 'provinceId')?.value
  const { data: provincesData } = useProvinces()
  const { data: branchesData }  = useBranches(provinceId ? Number(provinceId) : undefined)

  // ── Data ───────────────────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const filterMap = Object.fromEntries(activeFilters.map((f) => [f.fieldId, f.value]))
    return {
      search:     search || undefined,
      status:     (filterMap.status as CardOrderStatus) || undefined,
      provinceId: filterMap.provinceId ? Number(filterMap.provinceId) : undefined,
      branchId:   filterMap.branchId   ? Number(filterMap.branchId)   : undefined,
      page,
      perPage,
    }
  }, [search, activeFilters, page, perPage])

  const { data, isLoading } = useCardOrders(queryParams)

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((fieldId: string, value: string) => {
    setActiveFilters((prev) => {
      const newFilters = prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f))
      // Reset branch if province changes
      if (fieldId === 'provinceId') {
        return newFilters.map((f) => (f.fieldId === 'branchId' ? { ...f, value: '' } : f))
      }
      return newFilters
    })
    setPage(1)
  }, [])

  const handleFilterReset = useCallback(() => {
    setActiveFilters((prev) => prev.map((f) => ({ ...f, value: '' })))
    setPage(1)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm(t('cardOrder.deleteConfirm', 'Bu sargyt pozulsynmy?'))) return
      deleteMutation.mutate(id)
    },
    [deleteMutation, t]
  )

  // ── Columns ────────────────────────────────────────────────────────────────
  const baseColumns = useCardOrderColumns()
  const columns = useMemo(
    () => [
      ...baseColumns,
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }: { row: any }) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button
              className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t('common.view', 'Görkez')}
              onClick={() => navigate(`/order-new-card/${row.original.id}`)}
            >
              <Eye size={15} />
            </button>
            <button
              className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t('common.edit', 'Düzet')}
              onClick={() => navigate(`/order-new-card/${row.original.id}/edit`)}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 cursor-pointer rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              title={t('common.delete', 'Poz')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
        size: 100,
      },
    ],
    [baseColumns, t, navigate, handleDelete, deleteMutation.isPending]
  )

  // ── Filter fields ──────────────────────────────────────────────────────────
  const filterFields: FilterField[] = useMemo(() => [
    {
      id:      'status',
      label:   t('cardOrder.col.status', 'Status'),
      options: [
        { value: 'PENDING',  label: t('cardOrder.status.pending',  'Garaşylýar') },
        { value: 'APPROVED', label: t('cardOrder.status.approved', 'Tassyklandy') },
        { value: 'REJECTED', label: t('cardOrder.status.rejected', 'Ýatyryldy') },
      ],
    },
    {
      id:      'provinceId',
      label:   t('cardOrder.col.province', 'Welaýat'),
      options: provincesData?.map(p => ({ value: String(p.id), label: p.name })) || [],
    },
    {
      id:      'branchId',
      label:   t('cardOrder.col.branch', 'Şahamça'),
      options: branchesData?.map(b => ({ value: String(b.id), label: b.name })) || [],
    },
  ], [t, provincesData, branchesData])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          {t('cardOrder.title', 'Kart sargytlary')}
        </h1>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          searchPlaceholder={t('common.search', 'Gözlemek')}
          columns={COLUMN_META}
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
          actionLabel={t('cardOrder.create', 'Kart sargyt dörediň')}
          onAction={() => navigate('/order-new-card/create')}
        />

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          getRowId={(row) => row.id}
          currentPage={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}