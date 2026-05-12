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
import { useRoles, useDeleteRole } from '@/features/roles/hooks/useRoles'
import type { Role } from '@/features/roles/api/rolesApi'

// ─── Column meta for toolbar ──────────────────────────────────────────────────

const COLUMN_META = [
  { id: 'id',         label: 'ID' },
  { id: 'code',       label: 'Kod' },
  { id: 'name',       label: 'Ady' },
  { id: 'guard_name', label: 'Guard name' },
]

// ─── RolesPage ────────────────────────────────────────────────────────────────

export default function RolesPage() {
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
  const { data, isLoading } = useRoles({ search, page, per_page: perPage })
  const deleteRole          = useDeleteRole()

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: ColumnDef<Role>[] = [
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
      header: t('roles.fields.code', 'Kod'),
    },
    {
      accessorKey: 'name',
      header: t('roles.fields.name', 'Ady'),
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
            onClick={() => navigate(`/settings/users/roles/${row.original.id}`)}
          >
            <Eye size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-blue-500"
            onClick={() => navigate(`/settings/users/roles/${row.original.id}/edit`)}
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
    deleteRole.mutate(deleteId, {
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
          {t('roles.title', 'Rollar')}
        </h1>
        <Button onClick={() => navigate('/settings/users/roles/create')}>
          {t('roles.actions.create', 'Rol dörediň')}
        </Button>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('roles.searchPlaceholder', 'Gözlemek...')}
        columns={COLUMN_META}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
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
        getRowId={(row) => String(row.id)}
        currentPage={data?.meta?.current_page ?? 1}
        totalPages={data?.meta?.last_page ?? 1}
        totalCount={data?.meta?.total ?? 0}
        onPageChange={setPage}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('roles.deleteDialog.title', 'Roly pozmak')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'roles.deleteDialog.description',
                'Bu roly pozmak isleýärsiňizmi? Bu amal yzyna gaýtarylmaz.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRole.isPending
                ? t('common.deleting', 'Pozulýar...')
                : t('common.delete', 'Poz')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}