// pages/VisaMasterSettingsPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DeleteDialog } from "@/components/deleteDialog";
import { TableActions } from "@/components/tableActions";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { useGetVisaMasterSettings, useDeleteVisaMasterSetting } from "@/features/visaMasterSberSettings/hooks/useVisaMasterSettings";
import type { VisaMasterSetting } from "@/features/visaMasterSberSettings/api/visaMasterSberSettingsApi";

// ─── Column defaults ──────────────────────────────────────────────────────────

const DEFAULT_VISIBILITY = { id: true, kod: true, ady: true, yazgy: true };
const DEFAULT_ORDER = ["id", "kod", "ady", "yazgy", "actions"];

// ─── VisaMasterSettingsPage ───────────────────────────────────────────────────

export default function VisaMasterSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(DEFAULT_VISIBILITY);
  const [columnOrder, setColumnOrder] = useState(DEFAULT_ORDER);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useGetVisaMasterSettings({ page, perPage, search });
  const deleteMutation = useDeleteVisaMasterSetting();

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

  const columns: ColumnDef<VisaMasterSetting>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="text-primary font-semibold">{row.original.id}</span>,
      size: 80,
    },
    {
      accessorKey: "kod",
      header: t("visaMasterSettings.columns.kod", "KOD"),
      cell: ({ row }) => <span className="font-medium text-foreground font-mono text-xs">{row.original.kod}</span>,
    },
    {
      accessorKey: "ady",
      header: t("visaMasterSettings.columns.ady", "ADY"),
      cell: ({ row }) => <span className="text-foreground">{row.original.ady}</span>,
    },
    {
      accessorKey: "yazgy",
      header: t("visaMasterSettings.columns.yazgy", "YAZGY"),
      cell: ({ row }) => <span className="text-foreground line-clamp-1 max-w-xs">{row.original.yazgy}</span>,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <TableActions
          onEdit={() => navigate(`/visa-master-sber-settings/${row.original.id}/edit`)}
          onDelete={() => setDeleteId(row.original.id)}
        />
      ),
      size: 100,
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
      <h1 className="text-2xl font-semibold text-foreground mb-5">{t("visaMasterSettings.title", "Visa/Master, Sber sazlamalar")}</h1>
      <div className="flex items-center gap-3 justify-between">
        <TableSearchInput value={search} onChange={handleSearchChange} placeholder={t("common.search", "Gözlemek")} />
        <CreateButton
          label={t("visaMasterSettings.actions.create", "Visa/Master, Sber sazlamalar dörediň")}
          onClick={() => navigate("/visa-master-sber-settings/create")}
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

      {/* Delete Confirmation */}
      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("visaMasterSettings.deleteDialog.title", "Pozmak isleýärsiňizmi?")}
        description={t("visaMasterSettings.deleteDialog.description", "Bu amal yzyna gaýtarylyp bilinmez. Sazlama hemişelik pozular.")}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
