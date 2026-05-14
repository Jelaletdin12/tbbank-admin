// pages/VisaMasterSettingsPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
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
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/visa-master-sber-settings/${row.original.id}/edit`)}
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground mb-5">{t("visaMasterSettings.title", "Visa/Master, Sber sazlamalar")}</h1>

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
          actionLabel={t("visaMasterSettings.actions.create", "Visa/Master, Sber sazlamalar dörediň")}
          onAction={() => navigate("/visa-master-sber-settings/create")}
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
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("visaMasterSettings.deleteDialog.title", "Pozmak isleýärsiňizmi?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("visaMasterSettings.deleteDialog.description", "Bu amal yzyna gaýtarylyp bilinmez. Sazlama hemişelik pozular.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Ýatyr")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t("common.deleting", "Pozulýar...") : t("common.delete", "Pozmak")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
