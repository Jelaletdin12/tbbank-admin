import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Trash2, Database, CheckCircle2, XCircle, Clock } from 'lucide-react'
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
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/statusBadge'
import type { VisibilityState } from '@tanstack/react-table'
import { useBackups, useCreateBackup, useDeleteBackup, useDownloadBackup } from '@/features/backups/hooks/useBackups'
import type { Backup, BackupStatus } from '@/features/backups/api/backupsApi'

const PER_PAGE = 25

function BackupStatusBadge({ status }: { status: BackupStatus }) {
  const { t } = useTranslation()
  const cfg: Record<BackupStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }> = {
    completed:   { label: t('backups.status.completed', 'Tamamlandy'),    variant: 'success', icon: CheckCircle2 },
    failed:      { label: t('backups.status.failed', 'Şowsuz'),           variant: 'error',   icon: XCircle },
    in_progress: { label: t('backups.status.inProgress', 'Dowam edýär'), variant: 'warning', icon: Clock },
  }
  const currentCfg = cfg[status]
  return <StatusBadge label={currentCfg.label} variant={currentCfg.variant} icon={currentCfg.icon} />
}

export default function BackupsPage() {
  const { t } = useTranslation()

  const [page, setPage]         = useState(1)
  const [perPage, setPerPage]   = useState(PER_PAGE)
  const [search, setSearch]     = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder]           = useState<string[]>([])

  const { data, isLoading } = useBackups({ page, per_page: perPage, search })
  const createBackup        = useCreateBackup()
  const downloadBackup      = useDownloadBackup()
  const deleteBackup        = useDeleteBackup()

  const columns: ColumnDef<Backup>[] = [
    {
      id: 'fileName',
      accessorKey: 'fileName',
      header: t('backups.col.fileName', 'Faýl ady'),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.fileName}</span>
      ),
    },
    {
      id: 'fileSize',
      accessorKey: 'fileSize',
      header: t('backups.col.fileSize', 'Ölçegi'),
      cell: ({ row }) => <span>{row.original.fileSize}</span>,
      size: 100,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('backups.col.status', 'Status'),
      cell: ({ row }) => <BackupStatusBadge status={row.original.status} />,
      size: 140,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: t('backups.col.createdAt', 'Döredilen wagty'),
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.createdAt}</span>,
      size: 160,
    },
    {
      id: 'createdBy',
      accessorKey: 'createdBy',
      header: t('backups.col.createdBy', 'Döreden'),
      size: 100,
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => downloadBackup.mutate(row.original.id)}
            disabled={row.original.status === 'in_progress'}
            title={t('common.download', 'Ýükle')}
          >
            <Download size={14} />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteId(row.original.id)}
            title={t('common.delete', 'Poz')}
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
    await deleteBackup.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Database className="size-5 text-muted-foreground" />
          {t('backups.title', 'Bekaplar')}
        </h1>
      </div>

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
          perPageOptions={[10, 25, 50, 100]}
          perPage={perPage}
          onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
          actionLabel={createBackup.isPending ? t('common.loading', 'Döredilýär...') : t('backups.create', 'Backup dörediň')}
          onAction={() => createBackup.mutate()}
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
            <AlertDialogTitle>{t('backups.deleteConfirm.title', 'Eminsiňizmi?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('backups.deleteConfirm.description', 'Bu backup pozulsynmy? Bu amal yzyna gaýtarylmaz.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBackup.isPending ? t('common.deleting', 'Pozulýar...') : t('common.delete', 'Poz')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
