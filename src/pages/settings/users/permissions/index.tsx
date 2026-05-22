import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { DataTable } from '@/components/dataTable'
import { DataTableToolbar } from '@/components/dataTableToolbar'
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
import { usePermissions, useDeletePermission } from '@/features/permissions/hooks/usePermissions'
import type { Permission } from '@/features/permissions/api/permissionsApi'

// ─── Column meta for toolbar ──────────────────────────────────────────────────

const COLUMN_META = [
  { id: 'id',         label: 'ID' },
  { id: 'code',       label: 'Kod' },
  { id: 'name',       label: 'Ady' },
  { id: 'guard_name', label: 'Guard name' },
]

// ─── PermissionsPage ──────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const { t }    = useTranslation()
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────────────────────────
  const [search,           setSearch]           = useState('')
  const [page,             setPage]             = useState(1)
  const [perPage,          setPerPage]          = useState(25)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder,      setColumnOrder]      = useState<string[]>([])
  const [deleteId,         setDeleteId]         = useState<number | null>(null)

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading } = usePermissions({ search, page, per_page: perPage })
  const deletePermission    = useDeletePermission()

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: ColumnDef<Permission>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 70,
      cell: ({ row }) => (
        <span className="text-primary font-semibold">{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'code',
      header: t('permissions.fields.code', 'Kod'),
    },
    {
      accessorKey: 'name',
      header: t('permissions.fields.name', 'Ady'),
      cell: ({ row }) => <span>{row.original.name?.tk ?? '—'}</span>,
    },
    {
      accessorKey: 'guard_name',
      header: 'Guard name',
    },
    {
      id: 'actions',
      header: '',
      size: 120,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => navigate(`/settings/users/permissions/${row.original.id}`)}
          >
            <Eye size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-blue-500"
            onClick={() => navigate(`/settings/users/permissions/${row.original.id}/edit`)}
          >
            <Pencil size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ]

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (deleteId === null) return
    deletePermission.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError:   () => setDeleteId(null),
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t('permissions.title', 'Rugsatlar')}
        </h1>
       
      </div>
<div className="bg-card border border-border rounded-xl p-4">

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('permissions.searchPlaceholder', 'Gözlemek...')}
        columns={COLUMN_META}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        perPageOptions={[10, 25, 50, 100]}
        perPage={perPage}
        onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
         actionLabel={t('permissions.actions.create', 'Rugsat dörediň')}
        onAction={() => navigate('/settings/users/permissions/create')}
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
        currentPage={data?.meta?.current_page ?? 1}
        totalPages={data?.meta?.last_page ?? 1}
        totalCount={data?.meta?.total ?? 0}
        onPageChange={setPage}
      />
</div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('permissions.deleteDialog.title', 'Rugsaty pozmak')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'permissions.deleteDialog.description',
                'Bu rugsaty pozmak isleýärsiňizmi? Bu amal yzyna gaýtarylmaz.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePermission.isPending
                ? t('common.deleting', 'Pozulýar...')
                : t('common.delete', 'Poz')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}