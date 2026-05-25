import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2, Eye, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/confirmDialog";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import {
  useOperators,
  useDeleteOperator,
} from "@/features/operators/hooks/useOperators";
import type { Operator } from "@/features/operators/api/operatorsApi";

// ─── OperatorsPage ────────────────────────────────────────────────────────────

export default function OperatorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteMutation = useDeleteOperator();

  // ── Table state ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // ── Delete dialog ────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Operator | null>(null);

  // ── Query ────────────────────────────────────────────────────────────────────
  const { data, isLoading } = useOperators({
    page,
    perPage,
    search: search || undefined,
    isActive: isActiveFilter || undefined,
  });

  const operators = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const totalCount = data?.meta.totalCount ?? 0;

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: ColumnDef<Operator>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span
          className="text-primary font-semibold cursor-pointer hover:underline text-sm"
          onClick={() => navigate(`/operators/${row.original.id}`)}
        >
          {row.original.id}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: "username",
      header: t("operators.fields.username", "ULANYJY ADY"),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.username}</span>
      ),
    },
    {
      accessorKey: "name",
      header: t("operators.fields.name", "ADY"),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: t("operators.fields.phone", "TELEFON"),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.phone ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: t("operators.fields.email", "E-POÇTA"),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.email ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: t("operators.fields.isActive", "IŞJEŇ"),
      cell: ({ row }) =>
        row.original.isActive ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <XCircle size={18} className="text-destructive" />
        ),
      size: 80,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/operators/${row.original.id}`)}
          >
            <Eye size={14} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/operators/${row.original.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      size: 120,
      enableSorting: false,
    },
  ];

  const columnMetas = columns
    .filter((c) => "accessorKey" in c && c.accessorKey)
    .map((c) => ({
      id: ("accessorKey" in c ? String(c.accessorKey) : c.id) as string,
      label:
        typeof c.header === "string"
          ? c.header
          : (("accessorKey" in c ? String(c.accessorKey) : "") ?? ""),
    }));

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("operators.title", "Operatorlar")}
        </h1>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        {/* Toolbar */}
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={columnMetas}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={[
            {
              id: "isActive",
              label: t("operators.fields.isActive", "Işjeň"),
              options: [
                { value: "true", label: t("common.active", "Işjeň") },
                { value: "false", label: t("common.inactive", "Işjeň däl") },
              ],
            },
          ]}
          activeFilters={[{ fieldId: "isActive", value: isActiveFilter }]}
          onFilterChange={(fieldId, value) => {
            if (fieldId === "isActive") setIsActiveFilter(value);
            setPage(1);
          }}
          onFilterReset={() => {
            setIsActiveFilter("");
            setPage(1);
          }}
          perPageOptions={[10, 25, 50, 100]}
          perPage={perPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
          actionLabel={t("operators.createBtn", "Operator döredin")}
          onAction={() => navigate("/operators/create")}
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={operators}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          getRowId={(row) => String(row.id)}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
          enableRowSelection
        />
      </div>

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title={t("operators.deleteTitle", "Operatory pozmak")}
        description={t(
          "operators.deleteDescription",
          'Siz "{name}" operatoryny pozjakmy?',
        ).replace("{name}", deleteTarget?.name ?? "")}
        confirmLabel={t("common.delete", "Poz")}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
