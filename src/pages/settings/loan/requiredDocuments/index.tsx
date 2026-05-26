import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/dataTable'
import { DataTableToolbar } from '@/components/dataTableToolbar'
import { useGetRequiredDocuments, useDeleteRequiredDocument } from '@/features/requiredDocuments/hooks/useRequiredDocuments'
import type { LoanDocument } from '@/features/requiredDocuments/api/requiredDocumentsApi'
import type { VisibilityState } from '@tanstack/react-table'
import { ConfirmDialog } from '@/components/confirmDialog'

// ─── Column visibility defaults ───────────────────────────────────────────────

const DEFAULT_VISIBILITY: VisibilityState = {}
const DEFAULT_ORDER = ['id', 'name', 'actions']

export default function RequiredDocumentsListPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const lang = (i18n.language?.slice(0, 2) ?? 'tk') as 'tk' | 'ru' | 'en'

  // ── Table state ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY)
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_ORDER)

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data, isLoading } = useGetRequiredDocuments({ page, perPage, search })
  const deleteMutation = useDeleteRequiredDocument()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = (id: number) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId === null) return
    deleteMutation.mutate(deleteId)
    setDeleteId(null)
  }

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns: ColumnDef<LoanDocument>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: t('common.id', 'ID'),
      size: 72,
      cell: ({ row }) => (
        <span
          className="text-primary font-semibold cursor-pointer hover:underline"
          onClick={() => navigate(`/settings/loan/required-documents/${row.original.id}`)}
        >
          {row.original.id}
        </span>
      ),
    },
    {
      id: 'name',
      header: t('loanDocuments.columns.name', 'ADY'),
      accessorFn: (row) => row.name[lang],
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.name[lang]}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 100,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/settings/loan/required-documents/${row.original.id}`)}
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t('common.view', 'Görüntüle')}
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => navigate(`/settings/loan/required-documents/${row.original.id}/edit`)}
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t('common.edit', 'Düzet')}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title={t('common.delete', 'Öçür')}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  const columnMetas = columns
    .filter((c) => c.id !== 'actions' && c.id !== 'select')
    .map((c) => ({ id: c.id as string, label: typeof c.header === 'string' ? c.header : c.id as string }))

  return (
    <div>
      {/* Page heading */}
      <h1 className="text-xl font-semibold text-foreground mb-4">
        {t('loanDocuments.title', 'Karz gerekli resminamalary')}
      </h1>
<div className="bg-card border border-border rounded-xl p-4">

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('common.search', 'Gözlemek')}
        columns={columnMetas}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        actionLabel={t('loanDocuments.createBtn', 'Karz gerekli resminamalary döretiň')}
        onAction={() => navigate('/settings/loan/required-documents/create')}
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
        getRowId={(row) => String(row.id)}
        enableRowSelection
        currentPage={page}
        totalPages={data?.totalPages ?? 1}
        totalCount={data?.total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title={t('loanDocuments.deleteConfirm', 'Bu resminamany öçürmek isleýärsiňizmi?')}
        confirmLabel={t('common.delete', 'Poz')}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
</div>
  )
}