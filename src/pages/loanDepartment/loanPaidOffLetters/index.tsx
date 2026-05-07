import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Pencil, Trash2, TableProperties } from "lucide-react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";

import { DataTable } from "@/components/dataTable";
import {
  DataTableToolbar,
  type ActiveFilter,
  type FilterField,
} from "@/components/dataTableToolbar";
import {
  useLoanPaidOffLetters,
  useDeleteLoanPaidOffLetter,
} from "@/features/loanPaidOffLetters/hooks/useLoanPaidOffLetters";
import type { LoanPaidOffLetter } from "@/features/loanPaidOffLetters/api/loanPaidOffLettersApi";

// ─── Column IDs ────────────────────────────────────────────────────────────────

const COLUMN_IDS = [
  "id",
  "passportSeries",
  "passportNumber",
  "loanAccount",
  "issuedAt",
] as const;

// ─── Empty state component ─────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      {/* Grid icon matching screenshot */}
      <div className="text-muted-foreground/40">
        <TableProperties size={64} strokeWidth={1} />
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {t(
          "loanPaidOffLetters.emptyMessage",
          "Berlen kriteriýalara Karzyň ýapylandygy barada güwanama almak gabat gelmedi.",
        )}
      </p>
      <button
        onClick={onCreate}
        className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted/60 transition-colors"
      >
        {t(
          "loanPaidOffLetters.createButton",
          "Karzyň ýapylandygy barada güwanama almak dörediň",
        )}
      </button>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function LoanPaidOffLettersPage() {
  const { t } = useTranslation();
  const deleteMutation = useDeleteLoanPaidOffLetter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([...COLUMN_IDS]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // ── Query ──────────────────────────────────────────────────────────────────
  const queryParams = useMemo(
    () => ({ search: search || undefined, page, perPage }),
    [search, page, perPage],
  );

  const { data, isLoading } = useLoanPaidOffLetters(queryParams);
  const totalPages = data ? Math.ceil(data.total / perPage) : 1;
  const isEmpty = !isLoading && (data?.data?.length ?? 0) === 0;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((fieldId: string, value: string) => {
    setActiveFilters((prev) =>
      prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f)),
    );
    setPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setActiveFilters((prev) => prev.map((f) => ({ ...f, value: "" })));
    setPage(1);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      if (
        !window.confirm(
          t("loanPaidOffLetters.deleteConfirm", "Bu ýazgy pozulsynmy?"),
        )
      )
        return;
      deleteMutation.mutate(id);
    },
    [deleteMutation, t],
  );

  const handleCreate = useCallback(() => {
    // navigate to create page or open modal
  }, []);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<LoanPaidOffLetter>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: t("loanPaidOffLetters.columns.id", "ID"),
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-primary">
            {row.original.id}
          </span>
        ),
        size: 80,
      },
      {
        id: "passportSeries",
        accessorKey: "passportSeries",
        header: t(
          "loanPaidOffLetters.columns.passportSeries",
          "PASPORT SERIÝASY",
        ),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.passportSeries}
          </span>
        ),
        size: 160,
      },
      {
        id: "passportNumber",
        accessorKey: "passportNumber",
        header: t(
          "loanPaidOffLetters.columns.passportNumber",
          "PASPORT BELGISI",
        ),
        cell: ({ row }) => (
          <span className="text-sm font-mono text-foreground">
            {row.original.passportNumber}
          </span>
        ),
        size: 140,
      },
      {
        id: "loanAccount",
        accessorKey: "loanAccount",
        header: t("loanPaidOffLetters.columns.loanAccount", "KARZ HASABY"),
        cell: ({ row }) => (
          <span className="text-sm font-mono text-foreground">
            {row.original.loanAccount}
          </span>
        ),
      },
      {
        id: "issuedAt",
        accessorKey: "issuedAt",
        header: t("loanPaidOffLetters.columns.issuedAt", "BERLEN WAGTY"),
        cell: ({ row }) => (
          <span className="text-sm text-foreground whitespace-nowrap">
            {row.original.issuedAt}
          </span>
        ),
        size: 160,
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button
              className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t("common.view", "Görmek")}
            >
              <Eye size={15} />
            </button>
            <button
              className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t("common.edit", "Üýtgetmek")}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 cursor-pointer rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              title={t("common.delete", "Pozmak")}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
        size: 100,
      },
    ],
    [t, handleDelete, deleteMutation.isPending],
  );

  // ── Toggleable columns meta ────────────────────────────────────────────────
  const toggleableColumns = useMemo(
    () =>
      COLUMN_IDS.map((id) => ({
        id,
        label: t(`loanPaidOffLetters.columns.${id}`, id),
      })),
    [t],
  );

  const filterFields = useMemo<FilterField[]>(() => [], []);

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t(
            "loanPaidOffLetters.title",
            "Karzyň ýapylandygy barada güwanamalar",
          )}
        </h1>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-xl">
        {/* Toolbar: column toggle + filter (right side only, matches screenshot) */}
        <div className="px-4 pt-3 pb-2 border-b border-border">
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
            actionLabel={t(
              "loanPaidOffLetters.createButton",
              "Karzyň ýapylandygy barada güwanama almak dörediň",
            )}
            onAction={handleCreate}
          />
        </div>

        {/* Empty state OR table */}
        {isEmpty ? (
          <EmptyState onCreate={handleCreate} />
        ) : (
          <div className="p-4">
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
        )}
      </div>
    </div>
  );
}
