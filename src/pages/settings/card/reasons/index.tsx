import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import { DeleteDialog } from "@/components/deleteDialog";
import { DataTable } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { TableActions } from "@/components/tableActions";
import type { FilterField, ActiveFilter } from "@/components/dataTableToolbar";
import { useCardReasons, useDeleteCardReason } from "@/features/cardReasons/hooks/useCardReasons";
import type { CardReason } from "@/features/cardReasons/api/cardReasonsApi";

// ─── CardReasonsListPage ───────────────────────────────────────────────────────

export function CardReasonsListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const lang = (i18n.language?.slice(0, 2) ?? "tk") as "tk" | "ru" | "en";

  // ── Table state ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([{ fieldId: "isActive", value: "" }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(["id", "name", "value", "description", "isActive", "actions"]);

  // ── Delete dialog ────────────────────────────────────────────────────────────
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteMutation = useDeleteCardReason();

  const isActiveFilter = activeFilters.find((f) => f.fieldId === "isActive")?.value ?? "";

  const { data, isLoading } = useCardReasons({
    page,
    perPage,
    search,
    isActive: isActiveFilter,
  });

  const filterFields: FilterField[] = [
    {
      id: "isActive",
      label: t("cardReasons.fields.isActive", "Işjeň"),
      options: [
        { value: "true", label: t("common.active", "Işjeň") },
        { value: "false", label: t("common.inactive", "Işjeň däl") },
      ],
    },
  ];

  const handleFilterChange = (fieldId: string, value: string) => {
    setActiveFilters((prev) => prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f)));
    setPage(1);
  };

  const handleFilterReset = () => {
    setActiveFilters([{ fieldId: "isActive", value: "" }]);
    setPage(1);
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: ColumnDef<CardReason>[] = [
    {
      accessorKey: "id",
      header: t("common.id", "ID"),
      cell: ({ row }) => <span className="text-primary font-mono text-sm font-medium">{row.original.id}</span>,
      size: 70,
    },
    {
      accessorKey: "name",
      id: "name",
      header: t("cardReasons.fields.name", "ADY").toUpperCase(),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.name[lang]}</span>,
    },
    {
      accessorKey: "value",
      header: t("cardReasons.fields.value", "BAHA").toUpperCase(),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.value}</span>,
      size: 120,
    },
    {
      accessorKey: "description",
      header: t("cardReasons.fields.description", "BELLIKLER").toUpperCase(),
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.description ?? "—"}</span>,
    },
    {
      accessorKey: "isActive",
      id: "isActive",
      header: t("cardReasons.fields.isActive", "IŞJEŇ").toUpperCase(),
      cell: ({ row }) =>
        row.original.isActive ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <XCircle size={18} className="text-destructive" />
        ),
      size: 100,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <TableActions
          onView={() => navigate(`/settings/card/card-reasons/${row.original.id}`)}
          onEdit={() => navigate(`/settings/card/card-reasons/${row.original.id}/edit`)}
          onDelete={() => setDeleteId(row.original.id)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 120,
    },
  ];

  const columnMeta = columns
    .filter((c) => c.id !== "actions" && (c as { accessorKey?: string }).accessorKey !== undefined)
    .map((c) => ({
      id: (c.id ?? (c as { accessorKey?: string }).accessorKey) as string,
      label: typeof c.header === "string" ? c.header : (c.id ?? (c as { accessorKey?: string }).accessorKey ?? ""),
    }));

  const totalPages = data ? Math.ceil(data.total / perPage) : 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("cardReasons.title", "Kartyň çykarylmagynyň sebäpleri")}</h1>
        </div>
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
          label={t("cardReasons.actions.create", "Kartyň çykarylmagynyň sebäbini döretdiň")}
          onClick={() => navigate("/settings/card/card-reasons/create")}
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
          columns={columnMeta}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
          perPage={perPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
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
          enableRowSelection
          getRowId={(row) => String(row.id)}
          currentPage={page}
          totalPages={totalPages}
          totalCount={data?.total}
          onPageChange={setPage}
        />
      </div>

      {/* Delete dialog */}
      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("common.confirmDelete", "Öçürmegi tassyklaň")}
        description={t("cardReasons.deleteConfirm", "Bu kartyň çykarylmagynyň sebäbini öçürmek isleýärsiňizmi?")}
        onConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CardReasonsListPage;
