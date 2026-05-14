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
  useCardBalances,
  useDeleteCardBalance,
  useDownloadCardBalance,
} from '@/features/cardBalance/hooks/useCardBalance'
import { type CardBalance } from '@/features/cardBalance/api/cardBalanceApi'

const PER_PAGE = 25

export default function CardBalancesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [page, setPage]         = useState(1)
  const [perPage, setPerPage]   = useState(PER_PAGE)
  const [search, setSearch]     = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder]           = useState<string[]>([])

  const { data, isLoading } = useCardBalances({ page, per_page: perPage, search })
  const deleteMutation      = useDeleteCardBalance()
  const downloadMutation    = useDownloadCardBalance()

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<CardBalance>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: t('ID', 'ID'),
      cell: ({ row }) => (
        <button
          className="text-primary font-medium hover:underline"
          onClick={() => navigate(`/card-balances/${row.original.id}`)}
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
            onClick={() => navigate(`/card-balances/${row.original.id}`)}
            title={t('View', 'Görmek')}
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => navigate(`/card-balances/${row.original.id}/edit`)}
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

  const columnMeta: ColumnMeta[] = columns
    .filter((c) => c.id !== 'actions')
    .map((c) => ({
      id: c.id!,
      label: typeof c.header === 'string' ? c.header : c.id!,
    }))

  const total      = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  const handleDelete = async () => {
    if (deleteId === null) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t('Card balances', 'Kart galyndylary')}
        </h1>
      </div>
<div className="bg-card border border-border rounded-xl p-4">

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('Search', 'Gözlemek')}
        columns={columnMeta}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        actionLabel={t('Create card balance', 'Kart galyndysy dörediň')}
        onAction={() => navigate('/card-balances/create')}
        perPageOptions={[10, 25, 50, 100]}
        perPage={perPage}
        onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
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
        getRowId={(row) => String(row.id)}
        currentPage={page}
        totalPages={totalPages}
        totalCount={total}
        onPageChange={setPage}
      />
</div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?', 'Eminsiňizmi?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'This action cannot be undone.',
                'Bu amal yzyna gaýtarylmaz. Kart galyndysy hemişelik öçüriler.',
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