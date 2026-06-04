import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { TableActions } from "@/components/tableActions";
import { useGetRequiredDocuments, useDeleteRequiredDocument } from "@/features/requiredDocuments/hooks/useRequiredDocuments";
import type { LoanDocument } from "@/features/requiredDocuments/api/requiredDocumentsApi";
import type { VisibilityState } from "@tanstack/react-table";
import { DeleteDialog } from "@/components/deleteDialog";

// ─── Column visibility defaults ───────────────────────────────────────────────

const DEFAULT_VISIBILITY: VisibilityState = {};
const DEFAULT_ORDER = ["id", "name", "actions"];

export default function RequiredDocumentsListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const lang = (i18n.language?.slice(0, 2) ?? "tk") as "tk" | "ru" | "en";

  // ── Table state ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY);
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_ORDER);

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data, isLoading } = useGetRequiredDocuments({ page, perPage, search });
  const deleteMutation = useDeleteRequiredDocument();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId === null) return;
    deleteMutation.mutate(deleteId);
    setDeleteId(null);
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns: ColumnDef<LoanDocument>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: t("common.id", "ID"),
      size: 72,
      cell: ({ row }) => (
        <span
          className="text-primary font-semibold cursor-pointer hover:underline"
          onClick={() => navigate(`/settings/loan/required-documents/${row.original.id}`)}
        >
          {row.original.id}
        </span>
      ),
    },
    {
      id: "name",
      header: t("loanDocuments.columns.name", "ADY"),
      accessorFn: (row) => row.name[lang],
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.name[lang]}</span>,
    },
    {
      id: "actions",
      header: "",
      size: 100,
      enableSorting: false,
      cell: ({ row }) => (
        <TableActions
          onView={() => navigate(`/settings/loan/required-documents/${row.original.id}`)}
          onEdit={() => navigate(`/settings/loan/required-documents/${row.original.id}/edit`)}
          onDelete={() => handleDelete(row.original.id)}
          isDeleting={deleteMutation.isPending}
        />
      ),
    },
  ];

  const columnMetas = columns
    .filter((c) => c.id !== "actions" && c.id !== "select")
    .map((c) => ({ id: c.id as string, label: typeof c.header === "string" ? c.header : (c.id as string) }));

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <h1 className="text-xl font-semibold text-foreground mb-4">{t("loanDocuments.title", "Karz gerekli resminamalary")}</h1>
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
          label={t("loanDocuments.createBtn", "Karz gerekli resminamalary döretiň")}
          onClick={() => navigate("/settings/loan/required-documents/create")}
        />
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
          hideSearch
          hideAction
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
          enableRowSelection
          currentPage={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.total}
          onPageChange={setPage}
        />

        <DeleteDialog
          open={deleteId !== null}
          onOpenChange={(o) => {
            if (!o) setDeleteId(null);
          }}
          title={t("loanDocuments.deleteConfirm", "Bu resminamany öçürmek isleýärsiňizmi?")}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
