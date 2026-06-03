// pages/CurrencyRatesPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { Button } from "@/components/ui/button";
import { useGetCurrencyRates, useDeleteCurrencyRate } from "@/features/currencyRates/hooks/useCurrencyRates";
import type { CurrencyRate } from "@/features/currencyRates/api/currencyRatesApi";
import { DeleteDialog } from "@/components/deleteDialog";

// ─── Column visibility defaults ───────────────────────────────────────────────

const DEFAULT_VISIBILITY = {
  id: true,
  currencyFrom: true,
  currencyTo: true,
  value: true,
};
const DEFAULT_ORDER = ["id", "currencyFrom", "currencyTo", "value", "actions"];

// ─── CurrencyRatesPage ────────────────────────────────────────────────────────

export default function CurrencyRatesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(DEFAULT_VISIBILITY);
  const [columnOrder, setColumnOrder] = useState(DEFAULT_ORDER);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useGetCurrencyRates({ page, perPage, search });
  const deleteMutation = useDeleteCurrencyRate();

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // ─── Columns ──────────────────────────────────────────────────────────────

  const columns: ColumnDef<CurrencyRate>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <button
          className="text-primary font-semibold hover:underline"
          onClick={() => navigate(`/resources/currency-rates/${row.original.id}`)}
        >
          {row.original.id}
        </button>
      ),
      size: 80,
    },
    {
      accessorKey: "currencyFrom",
      header: t("currencyRates.columns.currencyFrom", "CURRENCY FROM"),
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.currencyFrom}</span>,
    },
    {
      accessorKey: "currencyTo",
      header: t("currencyRates.columns.currencyTo", "CURRENCY TO"),
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.currencyTo}</span>,
    },
    {
      accessorKey: "value",
      header: t("currencyRates.columns.value", "VALUE"),
      cell: ({ row }) => <span className="text-foreground tabular-nums">{row.original.value}</span>,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/currency-rates/${row.original.id}`)}
            title={t("common.view", "Görmek")}
          >
            <Eye size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/currency-rates/${row.original.id}/edit`)}
            title={t("common.edit", "Üýtgetmek")}
          >
            <Pencil size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
            title={t("common.delete", "Pozmak")}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
      size: 120,
    },
  ];

  const columnMeta = columns
    .filter((c) => "accessorKey" in c && c.accessorKey)
    .map((c) => ({
      id: String(("accessorKey" in c ? c.accessorKey : c.id) ?? ""),
      label: typeof c.header === "string" ? c.header : String(("accessorKey" in c ? c.accessorKey : "") ?? ""),
    }));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground mb-5">{t("currencyRates.title", "Walýuta kursy")}</h1>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <TableSearchInput value={search} onChange={handleSearchChange} placeholder={t("common.search", "Gözlemek")} />
        <CreateButton
          label={t("currencyRates.actions.create", "Walýuta kursy dörediň")}
          onClick={() => navigate("/currency-rates/create")}
        />
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={columnMeta}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
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
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.total ?? 0}
          onPageChange={setPage}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("currencyRates.deleteDialog.title", "Pozmak isleýärsiňizmi?")}
        description={t("currencyRates.deleteDialog.description", "Bu amal yzyna gaýtarylyp bilinmez. Walýuta kursy hemişelik pozular.")}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
