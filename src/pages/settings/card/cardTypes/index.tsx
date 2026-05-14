import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { Eye, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'
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
import { DataTable } from '@/components/dataTable'
import { DataTableToolbar } from '@/components/dataTableToolbar'
import type { FilterField, ActiveFilter } from '@/components/dataTableToolbar'
import { useCardTypes, useDeleteCardType } from '@/features/cardTypes/hooks/useCardTypes'
import type { CardType } from '@/features/cardTypes/api/cardTypesApi'

export function CardTypesListPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const lang = (i18n.language?.slice(0, 2) ?? 'tk') as 'tk' | 'ru' | 'en'

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { fieldId: 'isActive', value: '' },
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'id', 'name', 'value', 'description', 'isActive', 'actions',
  ])
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const deleteMutation = useDeleteCardType()
  const isActiveFilter = activeFilters.find((f) => f.fieldId === 'isActive')?.value ?? ''

  const { data, isLoading } = useCardTypes({ page, perPage, search, isActive: isActiveFilter })

  const filterFields: FilterField[] = [
    {
      id: 'isActive',
      label: t('cardTypes.fields.isActive', 'Işjeň'),
      options: [
        { value: 'true', label: t('common.active', 'Işjeň') },
        { value: 'false', label: t('common.inactive', 'Işjeň däl') },
      ],
    },
  ]

  const handleFilterChange = (fieldId: string, value: string) => {
    setActiveFilters((prev) =>
      prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f))
    )
    setPage(1)
  }

  const handleFilterReset = () => {
    setActiveFilters([{ fieldId: 'isActive', value: '' }])
    setPage(1)
  }

  const columns: ColumnDef<CardType>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="text-primary font-mono text-sm font-medium">{row.original.id}</span>
      ),
      size: 70,
    },
    {
      accessorKey: 'name',
      id: 'name',
      header: t('cardTypes.fields.name', 'ADY').toUpperCase(),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.name[lang]}</span>
      ),
    },
    {
      accessorKey: 'value',
      header: t('cardTypes.fields.value', 'BAHA').toUpperCase(),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.value}</span>
      ),
      size: 120,
    },
    {
      accessorKey: 'description',
      header: t('cardTypes.fields.description', 'BELLIKLER').toUpperCase(),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      id: 'isActive',
      header: t('cardTypes.fields.isActive', 'IŞJEŇ').toUpperCase(),
      cell: ({ row }) =>
        row.original.isActive ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <XCircle size={18} className="text-destructive" />
        ),
      size: 100,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate(`/settings/card/card-types/${row.original.id}`)}
            title={t('common.view', 'Görmek')}
          >
            <Eye size={14} />
          </button>
          <button
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate(`/settings/card/card-types/${row.original.id}/edit`)}
            title={t('common.edit', 'Üýtgetmek')}
          >
            <Pencil size={14} />
          </button>
          <button
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => setDeleteId(row.original.id)}
            title={t('common.delete', 'Öçürmek')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 120,
    },
  ]

  const columnMeta = columns
    .filter(
      (c) =>
        c.id !== 'actions' &&
        (c as { accessorKey?: string }).accessorKey !== undefined
    )
    .map((c) => ({
      id: (c.id ?? (c as { accessorKey?: string }).accessorKey) as string,
      label:
        typeof c.header === 'string'
          ? c.header
          : (c.id ?? (c as { accessorKey?: string }).accessorKey ?? ''),
    }))

  const totalPages = data ? Math.ceil(data.total / perPage) : 1

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
        
          <h1 className="text-2xl font-bold text-foreground">
            {t('cardTypes.title', 'Kart görnüşleri')}
          </h1>
        </div>
      </div>
<div className="bg-card border border-border rounded-xl p-4">

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('common.search', 'Gözlemek')}
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
        onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
        actionLabel={t('cardTypes.actions.create', 'Kart görnüşi döretdiň')}
        onAction={() => navigate('/settings/card/card-types/create')}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        enableRowSelection
        getRowId={(row) => String(row.id)}
        currentPage={page}
        totalPages={totalPages}
        totalCount={data?.total}
        onPageChange={setPage}
      />
</div>

      {/* Delete dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete', 'Öçürmegi tassyklaň')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cardTypes.deleteConfirm', 'Bu kart görnüşini öçürmek isleýärsiňizmi?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId !== null) {
                  deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
                }
              }}
            >
              {deleteMutation.isPending
                ? t('common.deleting', 'Öçürilýär...')
                : t('common.delete', 'Öçürmek')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CardTypesListPage
