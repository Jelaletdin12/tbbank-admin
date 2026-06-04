import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { ColumnDef, VisibilityState } from "@tanstack/react-table";

import { DataTable } from "@/components/dataTable";
import { DataTableToolbar, type ActiveFilter, type FilterField } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { TableActions } from "@/components/tableActions";
import { useLoanRemaining, useDeleteLoanRemaining } from "@/features/loanRemaining/hooks/useLoanRemaining";
import type { LoanRemaining } from "@/features/loanRemaining/api/loanRemainingApi";
import { DeleteDialog } from "@/components/deleteDialog";

// ─── Column IDs ────────────────────────────────────────────────────────────────

const COLUMN_IDS = ["id", "passportSeries", "passportNumber", "loanAccount"] as const;

// ─── Page Component ────────────────────────────────────────────────────────────

export default function LoanRemainingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteMutation = useDeleteLoanRemaining();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([...COLUMN_IDS]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // ── Query ──────────────────────────────────────────────────────────────────
  const queryParams = useMemo(() => ({ search: search || undefined, page, perPage }), [search, page, perPage]);

  const { data, isLoading } = useLoanRemaining(queryParams);
  const totalPages = data ? Math.ceil(data.total / perPage) : 1;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((fieldId: string, value: string) => {
    setActiveFilters((prev) => prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f)));
    setPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setActiveFilters((prev) => prev.map((f) => ({ ...f, value: "" })));
    setPage(1);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId === null) return;
    deleteMutation.mutate(deleteId);
    setDeleteId(null);
  }, [deleteId, deleteMutation]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<LoanRemaining>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: t("loanRemaining.columns.id", "ID"),
        cell: ({ row }) => <span className="text-sm font-semibold text-primary">{row.original.id}</span>,
        size: 80,
      },
      {
        id: "passportSeries",
        accessorKey: "passportSeries",
        header: t("loanRemaining.columns.passportSeries", "PASPORT SERIÝASY"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.passportSeries}</span>,
        size: 160,
      },
      {
        id: "passportNumber",
        accessorKey: "passportNumber",
        header: t("loanRemaining.columns.passportNumber", "PASPORT BELGISI"),
        cell: ({ row }) => <span className="text-sm font-mono text-foreground">{row.original.passportNumber}</span>,
        size: 140,
      },
      {
        id: "loanAccount",
        accessorKey: "loanAccount",
        header: t("loanRemaining.columns.loanAccount", "KARZ HASABY"),
        cell: ({ row }) => <span className="text-sm font-mono text-foreground">{row.original.loanAccount}</span>,
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <TableActions
            onView={() => navigate(`/loan-remaining/${row.original.id}`)}
            onEdit={() => navigate(`/loan-remaining/${row.original.id}/edit`)}
            onDelete={() => handleDelete(row.original.id)}
            isDeleting={deleteMutation.isPending}
          />
        ),
        size: 100,
      },
    ],
    [t, handleDelete, deleteMutation.isPending],
  );

  // ── Toggleable columns meta ────────────────────────────────────────────────
  const toggleableColumns = useMemo(() => COLUMN_IDS.map((id) => ({ id, label: t(`loanRemaining.columns.${id}`, id) })), [t]);

  const filterFields = useMemo<FilterField[]>(() => [], []);

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("loanRemaining.title", "Karzyň galyndysy")}</h1>
      </div>

      <div className="flex items-center gap-3 justify-between">
        <TableSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("common.search", "Gözlemek")}
        />
        <CreateButton
          label={t("loanRemaining.createButton", "Karzyň galyndysy dörediň")}
          onClick={() => navigate("/loan-remaining/create")}
        />
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={toggleableColumns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
          perPageOptions={[10, 25, 50, 100]}
          perPage={perPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
          hideSearch
          hideAction
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
          totalCount={data?.total}
          onPageChange={setPage}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("loanRemaining.deleteConfirm", "Bu ýazgy pozulsynmy?")}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
