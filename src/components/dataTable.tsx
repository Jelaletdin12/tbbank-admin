import { useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
  type RowSelectionState,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { useOutsideClick } from '@/lib/hooks/useOutsideClick'
import { ChevronDown } from 'lucide-react'

export type { ColumnDef }

// ─── Pagination ───────────────────────────────────────────────────────────────

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null

  const getPages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

    const pages: (number | 'ellipsis')[] = [1]

    if (currentPage > 3) pages.push('ellipsis')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < totalPages - 2) pages.push('ellipsis')

    pages.push(totalPages)
    return pages
  }

  return (
    <Pagination className="justify-center mt-3">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) onPageChange(currentPage - 1)
            }}
            className={cn(currentPage === 1 && 'pointer-events-none opacity-40')}
          />
        </PaginationItem>

        {getPages().map((page, i) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(page)
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) onPageChange(currentPage + 1)
            }}
            className={cn(currentPage === totalPages && 'pointer-events-none opacity-40')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

// ─── Select All Dropdown ──────────────────────────────────────────────────────

interface SelectAllDropdownProps {
  isAllPageSelected: boolean
  isSomePageSelected: boolean
  isAllTotalSelected: boolean
  totalCount: number
  pageCount: number
  onTogglePage: (checked: boolean) => void
  onSelectThisPage: () => void
  onSelectAll: () => void
  onClearAll: () => void
}

function SelectAllDropdown({
  isAllPageSelected,
  isSomePageSelected,
  isAllTotalSelected,
  totalCount,
  pageCount,
  onTogglePage,
  onSelectThisPage,
  onSelectAll,
  onClearAll,
}: SelectAllDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))

  const checkboxChecked = isAllTotalSelected || isAllPageSelected 
    ? true 
    : isSomePageSelected 
      ? 'indeterminate' 
      : false

  return (
    <div ref={ref} className="flex items-center gap-1">
      <Checkbox
        checked={checkboxChecked}
        onCheckedChange={(value) => onTogglePage(!!value)}
        aria-label="Select all on page"
        onClick={(e) => e.stopPropagation()}
        className="after:content-none"
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="relative z-10 flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded"
        aria-label="Selection options"
      >
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute top-8 left-0 z-50 w-52 bg-card border border-border rounded-md shadow-lg py-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSelectThisPage()
              setOpen(false)
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
          >
            Select this page
            <span className="ml-1 text-muted-foreground text-xs">({pageCount})</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSelectAll()
              setOpen(false)
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
          >
            Select all records
            <span className="ml-1 text-muted-foreground text-xs">({totalCount})</span>
          </button>
          {(isAllPageSelected || isAllTotalSelected || isSomePageSelected) && (
            <>
              <div className="border-t border-border my-1" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onClearAll()
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                Clear selection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── DataTable ────────────────────────────────────────────────────────────────

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  columnOrder?: string[]
  onColumnOrderChange?: (order: string[]) => void
  enableRowSelection?: boolean
  onRowSelectionChange?: (rows: TData[]) => void
  getRowId?: (row: TData) => string

  // Pagination — server-side
  currentPage?: number
  totalPages?: number
  totalCount?: number
  onPageChange?: (page: number) => void
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
  enableRowSelection = false,
  onRowSelectionChange,
  getRowId,
  currentPage = 1,
  totalPages = 1,
  totalCount,
  onPageChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  // Tracks whether ALL records (across pages) are logically selected
  const [allTotalSelected, setAllTotalSelected] = useState(false)

  const resolvedTotalCount = totalCount ?? data.length

  // ── Build selection column ──────────────────────────────────────────────────
  const selectionColumn: ColumnDef<TData> = {
    id: 'select',
    header: ({ table }) => (
      <div className="relative">
        <SelectAllDropdown
          isAllPageSelected={table.getIsAllPageRowsSelected()}
          isSomePageSelected={table.getIsSomePageRowsSelected()}
          isAllTotalSelected={allTotalSelected}
          totalCount={resolvedTotalCount}
          pageCount={data.length}
          onTogglePage={(checked) => {
            if (!checked) {
              if (allTotalSelected) setAllTotalSelected(false)
              table.toggleAllPageRowsSelected(false)
              table.setRowSelection({})
            } else {
              table.toggleAllPageRowsSelected(true)
            }
          }}
          onSelectThisPage={() => {
            table.toggleAllPageRowsSelected(true)
            setAllTotalSelected(false)
          }}
          onSelectAll={() => {
            table.toggleAllPageRowsSelected(true)
            setAllTotalSelected(true)
          }}
          onClearAll={() => {
            table.toggleAllPageRowsSelected(false)
            table.setRowSelection({})
            setAllTotalSelected(false)
          }}
        />
      </div>
    ),
    cell: ({ row, table }) => {
      const isSelected = allTotalSelected || row.getIsSelected()
      return (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(value) => {
            if (allTotalSelected && !value) {
              const newSelection: RowSelectionState = {}
              table.getRowModel().rows.forEach((r) => {
                if (r.id !== row.id) {
                  newSelection[r.id] = true
                }
              })
              table.setRowSelection(newSelection)
              setAllTotalSelected(false)
            } else {
              row.toggleSelected(!!value)
            }
          }}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 48,
  }

  const allColumns: ColumnDef<TData>[] = enableRowSelection
    ? [selectionColumn, ...columns]
    : columns

  const effectiveColumnOrder: string[] = enableRowSelection
    ? columnOrder && columnOrder.length > 0
      ? columnOrder[0] === 'select'
        ? columnOrder
        : ['select', ...columnOrder.filter((id) => id !== 'select')]
      : []
    : (columnOrder ?? [])

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      rowSelection,
      columnVisibility: columnVisibility ?? {},
      columnOrder: effectiveColumnOrder,
    },
    getRowId,
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      // If deselecting anything, clear allTotalSelected
      if (Object.keys(newSelection).length < data.length) {
        setAllTotalSelected(false)
      }
      if (onRowSelectionChange) {
        const selectedRows = data.filter((_, index) =>
          newSelection[getRowId ? getRowId(data[index]) : String(index)]
        )
        onRowSelectionChange(selectedRows)
      }
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: (updater) => {
      if (!onColumnVisibilityChange) return
      const next =
        typeof updater === 'function' ? updater(columnVisibility ?? {}) : updater
      onColumnVisibilityChange(next)
    },
    onColumnOrderChange: (updater) => {
      if (!onColumnOrderChange) return
      const next =
        typeof updater === 'function' ? updater(columnOrder ?? []) : updater
      onColumnOrderChange(next)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // ── Selection banner ────────────────────────────────────────────────────────
  const selectedCount = Object.keys(rowSelection).length
  const showBanner = enableRowSelection && (selectedCount > 0 || allTotalSelected)

  return (
    <div className="space-y-0">
      {/* Selection banner */}
      {showBanner && (
        <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border border-primary/20 rounded-t-lg text-sm border-b-0">
          <span className="text-primary font-medium">
            {allTotalSelected
              ? `All ${resolvedTotalCount} records selected`
              : `${selectedCount} row${selectedCount !== 1 ? 's' : ''} selected`}
          </span>
          <button
            onClick={() => {
              table.toggleAllPageRowsSelected(false)
              table.setRowSelection({})
              setAllTotalSelected(false)
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          'border border-border overflow-hidden',
          showBanner ? 'rounded-b-lg rounded-t-none' : 'rounded-md'
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                    className={cn(
                      'text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap',
                      header.column.getCanSort() && 'cursor-pointer select-none'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <TableRow key={i}>
                  {allColumns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="text-center py-16 text-muted-foreground"
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="hover:bg-muted/30 transition-colors border-border"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {onPageChange && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            // Clear selection on page change (server-side pattern)
            if (!allTotalSelected) {
              table.toggleAllPageRowsSelected(false)
              setRowSelection({})
            }
            onPageChange(page)
          }}
        />
      )}
    </div>
  )
}