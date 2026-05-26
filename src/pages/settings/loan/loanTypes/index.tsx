// pages/LoanTypesListPage.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/dataTable'
import { DataTableToolbar } from '@/components/dataTableToolbar'
import { useGetLoanTypes, useDeleteLoanType } from '@/features/loanTypes/hooks/useLoanTypes'
import type { LoanType } from '@/features/loanTypes/api/loanTypesApi'
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

// ─── Column definitions ───────────────────────────────────────────────────────

function useLoanTypeColumns(
  onView: (id: number) => void,
  onEdit: (id: number) => void,
  onDelete: (id: number) => void
): ColumnDef<LoanType>[] {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language ?? 'tk') as 'tk' | 'ru' | 'en'

  return [
    {
      accessorKey: 'id',
      header: t('common.id', 'ID'),
      size: 60,
      cell: ({ row }) => (
        <span className="text-primary font-semibold text-sm">{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: t('loanTypes.columns.name', 'ADY'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.name[lang]}</span>
      ),
    },
    {
      accessorKey: 'tax',
      header: t('loanTypes.columns.tax', 'SALGYT'),
      size: 90,
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.tax}</span>
      ),
    },
    {
      accessorKey: 'loanTerm',
      header: t('loanTypes.columns.loanTerm', 'KARZ MÖHLETI'),
      size: 130,
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.loanTerm}</span>
      ),
    },
    {
      accessorKey: 'notes',
      header: t('loanTypes.columns.notes', 'BELLIKLER'),
      cell: ({ row }) => {
        const notes = row.original.notes
        return (
          <span className="text-sm text-foreground">
            {notes ? notes[lang] || '—' : '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: t('loanTypes.columns.isActive', 'IŞJEŇ'),
      size: 80,
      cell: ({ row }) =>
        row.original.isActive ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <XCircle size={18} className="text-muted-foreground" />
        ),
    },
    {
      id: 'actions',
      header: '',
      size: 120,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(row.original.id)}
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t('common.view', 'Görmek')}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onEdit(row.original.id)}
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t('common.edit', 'Redaktirlemek')}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(row.original.id)}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title={t('common.delete', 'Pozmak')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]
}

// ─── LoanTypesListPage ────────────────────────────────────────────────────────

export default function LoanTypesListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [page, setPage]         = useState(1)
  const [perPage]               = useState(25)
  const [search, setSearch]     = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [columnOrder, setColumnOrder]           = useState<string[]>([])

  const { data, isLoading } = useGetLoanTypes({ page, perPage, search })
  const deleteMutation      = useDeleteLoanType()

  const handleView   = (id: number) => navigate(`/settings/loan/loan-types/${id}`)
  const handleEdit   = (id: number) => navigate(`/settings/loan/loan-types/${id}/edit`)
  const handleDelete = (id: number) => setDeleteId(id)

  const confirmDelete = async () => {
    if (deleteId === null) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const columns = useLoanTypeColumns(handleView, handleEdit, handleDelete)

  const columnMeta = columns
    .filter((c) => c.id !== 'actions' && 'accessorKey' in c)
    .map((c) => ({
      id:    'accessorKey' in c ? String(c.accessorKey) : String(c.id),
      label: typeof c.header === 'string' ? c.header : String(c.id ?? ''),
    }))

  return (
    <div>
    

      <h1 className="text-xl font-semibold text-foreground mb-5">
        {t('loanTypes.title', 'Karz görnüşleri')}
      </h1>
<div className="bg-card border border-border rounded-xl p-4">

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('common.search', 'Gözlemek')}
        columns={columnMeta}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        actionLabel={t('loanTypes.actions.create', 'Karz görnüşi dörediň')}
        onAction={() => navigate('/settings/loan/loan-types/create')}
      />

      <DataTable<LoanType>
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
        totalPages={data?.totalPages ?? 1}
        totalCount={data?.total}
        onPageChange={setPage}
      />
</div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('loanTypes.deleteDialog.title', 'Pozmak')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('loanTypes.deleteDialog.description', 'Bu karz görnüşini pozmak isleýärsiňizmi? Bu amal yzyna gaýtarylyp bilinmez.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t('common.cancel', 'Ýatyr')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('common.deleting', 'Pozulýar...') : t('common.delete', 'Pozmak')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}