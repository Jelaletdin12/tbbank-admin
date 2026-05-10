import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'

import { DataTable, type ColumnDef } from '@/components/dataTable'
import { DataTableToolbar, type ActiveFilter } from '@/components/dataTableToolbar'
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
import type { VisibilityState } from '@tanstack/react-table'

import { useUsers, useDeleteUser } from '@/features/allUsers/hooks/useAllUsers'
import type { UserListItem } from '@/features/allUsers/api/allUsersApi'

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PER_PAGE = 25

// ─── UsersListPage ────────────────────────────────────────────────────────────

export default function UsersListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteUser = useDeleteUser()

  // Table state
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'id', 'username', 'name', 'phone', 'email', 'isActive', 'actions',
  ])

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null)

  // ── Derived filter values ───────────────────────────────────────────────────
  const isActiveFilter = activeFilters.find((f) => f.fieldId === 'isActive')?.value ?? ''

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const { data, isLoading } = useUsers({
    page,
    perPage,
    search,
    isActive: isActiveFilter || undefined,
  })

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleFilterChange = (fieldId: string, value: string) => {
    setActiveFilters((prev) => {
      const rest = prev.filter((f) => f.fieldId !== fieldId)
      return value ? [...rest, { fieldId, value }] : rest
    })
    setPage(1)
  }

  const handleFilterReset = () => {
    setActiveFilters([])
    setPage(1)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteUser.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: ColumnDef<UserListItem>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 80,
      cell: ({ row }) => (
        <span className="text-xs font-mono text-primary font-semibold">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: 'username',
      header: t('users.fields.username', 'ULANYJY ADY'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.original.username}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: t('users.fields.name', 'ADY'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: t('users.fields.phone', 'TELEFON'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground font-mono">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: t('users.fields.email', 'E-POÇTA'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.email ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: t('users.fields.isActive', 'IŞJEŇ'),
      size: 80,
      cell: ({ row }) =>
        row.original.isActive ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <XCircle size={18} className="text-muted-foreground/40" />
        ),
    },
    {
      id: 'actions',
      header: '',
      size: 100,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate(`/all-users/${row.original.id}`)}
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate(`/all-users/${row.original.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  const columnMetas = columns
    .filter((c) => 'accessorKey' in c || (c.id && c.id !== 'actions' && c.id !== 'select'))
    .map((c) => ({
      id: 'accessorKey' in c ? (c.accessorKey as string) : (c.id as string),
      label:
        typeof c.header === 'string'
          ? c.header
          : 'accessorKey' in c
          ? (c.accessorKey as string)
          : (c.id as string),
    }))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      {/* Page header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <span>{t('nav.resources', 'Resurslar')}</span>
          <span>›</span>
          <span className="text-foreground font-medium">
            {t('nav.users', 'Ulanyjylar')}
          </span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">
          {t('users.title', 'Ulanyjylar')}
        </h1>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('users.searchPlaceholder', 'Gözlemek')}
        columns={columnMetas}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        filterFields={[
          {
            id: 'isActive',
            label: t('users.fields.isActive', 'Işjeň'),
            options: [
              { value: 'true', label: t('common.active', 'Işjeň') },
              { value: 'false', label: t('common.inactive', 'Işjeň däl') },
            ],
          },
        ]}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterReset={handleFilterReset}
        perPageOptions={[10, 25, 50, 100]}
        perPage={perPage}
        onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
        actionLabel={t('users.actions.create', 'Ulanyjy dörediň')}
        onAction={() => navigate('/all-users/create')}
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
        totalPages={data?.totalPages ?? 1}
        totalCount={data?.total}
        onPageChange={setPage}
      />

      {/* Delete confirm dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('users.deleteDialog.title', 'Ulanyjyny öçürmek')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'users.deleteDialog.description',
                'Siz "{name}" ulanyjysyny öçürjekmi? Bu amal yzyna gaýtarylyp bilinmez.',
              ).replace('{name}', deleteTarget?.username ?? '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Ýok')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete', 'Öçür')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}