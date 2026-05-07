import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { DataTable, type ColumnDef } from '@/components/dataTable'
import { DataTableToolbar, type ColumnMeta } from '@/components/dataTableToolbar'
import type { VisibilityState } from '@tanstack/react-table'
import {
  useCardTransactions,
  useDeleteCardTransaction,
  useDownloadCardTransaction,
} from '@/features/cardTransactions/hooks/useCardTransactions'
import type { CardTransaction } from '@/features/cardTransactions/api/cardTransactionsApi'

// ─── Page ─────────────────────────────────────────────────────────────────────

const PER_PAGE = 25

export default function CardTransactionsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [page, setPage]                       = useState(1)
  const [perPage, setPerPage]                 = useState(PER_PAGE)
  const [search, setSearch]                   = useState('')
  const [deleteId, setDeleteId]               = useState<number | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder]           = useState<string[]>([])

  const { data, isLoading } = useCardTransactions({ page, per_page: perPage, search })
  const deleteMutation      = useDeleteCardTransaction()
  const downloadMutation    = useDownloadCardTransaction()

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns: ColumnDef<CardTransaction>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: t('ID', 'ID'),
      cell: ({ row }) => (
        <button
          className="text-primary font-medium hover:underline text-left"
          onClick={() => navigate(`/card-transactions/${row.original.id}`)}
        >
          {row.original.id}
        </button>
      ),
    },
    {
      id: 'passport_series',
      accessorKey: 'passport_series',
      header: t('Passport series', 'PASPORT SERIYASY'),
      cell: ({ row }) => <span>{row.original.passport_series}</span>,
    },
    {
      id: 'passport_number',
      accessorKey: 'passport_number',
      header: t('Passport number', 'PASPORT BELGISI'),
      cell: ({ row }) => <span>{row.original.passport_number}</span>,
    },
    {
      id: 'card_number',
      accessorKey: 'card_number',
      header: t('Card number', 'KART BELGISI'),
      cell: ({ row }) => <span className="font-mono">{row.original.card_number}</span>,
    },
    {
      id: 'card_expiry_month',
      accessorKey: 'card_expiry_month',
      header: t('Expiry month', 'KART MÖHLETI (AÝ)'),
      cell: ({ row }) => <span>{row.original.card_expiry_month}</span>,
    },
    {
      id: 'card_expiry_year',
      accessorKey: 'card_expiry_year',
      header: t('Expiry year', 'KART MÖHLETI (ÝYL)'),
      cell: ({ row }) => <span>{row.original.card_expiry_year}</span>,
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => downloadMutation.mutate(row.original.id)}
            title={t('Download', 'Ýükle')}
          >
            <Download size={14} />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => navigate(`/card-transactions/${row.original.id}`)}
            title={t('View', 'Görmek')}
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => navigate(`/card-transactions/${row.original.id}/edit`)}
            title={t('Edit', 'Üýtgetmek')}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteId(row.original.id)}
            title={t('Delete', 'Öçürmek')}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  // ── Column meta for toolbar ───────────────────────────────────────────────────

  const columnMeta: ColumnMeta[] = columns
    .filter((c) => c.id !== 'actions')
    .map((c) => ({
      id: c.id!,
      label: typeof c.header === 'string' ? c.header : c.id!,
    }))

  // ── Pagination ────────────────────────────────────────────────────────────────

  const total      = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  const handleDelete = async () => {
    if (deleteId === null) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t('Card transactions', 'Kart hereketleri')}
        </h1>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('Search', 'Gözlemek')}
        columns={columnMeta}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        actionLabel={t('Create card transaction', 'Kart herekedi dörediň')}
        onAction={() => navigate('/card-transactions/create')}
        perPageOptions={[10, 25, 50, 100]}
        perPage={perPage}
        onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
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
        getRowId={(row) => row.id.toString()}
        currentPage={page}
        totalPages={totalPages}
        totalCount={total}
        onPageChange={setPage}
      />

      {/* Delete dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?', 'Eminsiňizmi?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'This action cannot be undone. This will permanently delete the card transaction.',
                'Bu amal yzyna gaýtarylmaz. Kart herekedi hemişelik öçüriler.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('Deleting...', 'Öçürilýär...') : t('Delete', 'Öçür')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
