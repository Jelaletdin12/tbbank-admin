import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { DataTable } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { TableActions } from "@/components/tableActions";
import { DeleteDialog } from "@/components/deleteDialog";
import { usePermissions, useDeletePermission } from "@/features/permissions/hooks/usePermissions";
import type { Permission } from "@/features/permissions/api/permissionsApi";

// ─── PermissionsPage ──────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columnMeta = useMemo(
    () => [
      { id: "id", label: t("common.id", "ID") },
      { id: "code", label: t("permissions.fields.code", "Kod") },
      { id: "name", label: t("permissions.fields.name", "Ady") },
      { id: "guard_name", label: t("permissions.fields.guardName", "Guard name") },
    ],
    [t],
  );

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading } = usePermissions({ search, page, per_page: perPage });
  const deletePermission = useDeletePermission();

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: ColumnDef<Permission>[] = [
    {
      accessorKey: "id",
      header: t("common.id", "ID"),
      size: 70,
      cell: ({ row }) => <span className="text-primary font-semibold">{row.original.id}</span>,
    },
    {
      accessorKey: "code",
      header: t("permissions.fields.code", "Kod"),
    },
    {
      accessorKey: "name",
      header: t("permissions.fields.name", "Ady"),
      cell: ({ row }) => <span>{row.original.name?.tk ?? "—"}</span>,
    },
    {
      accessorKey: "guard_name",
      header: t("permissions.fields.guardName", "Guard name"),
    },
    {
      id: "actions",
      header: "",
      size: 120,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <TableActions
          onView={() => navigate(`/settings/users/permissions/${row.original.id}`)}
          onEdit={() => navigate(`/settings/users/permissions/${row.original.id}/edit`)}
          onDelete={() => setDeleteId(row.original.id)}
          isDeleting={deletePermission.isPending}
        />
      ),
    },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (deleteId === null) return;
    deletePermission.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: () => setDeleteId(null),
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("permissions.title", "Rugsatlar")}</h1>
      </div>
      <div className="flex items-center gap-3 justify-between">
        <TableSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("permissions.searchPlaceholder", "Gözlemek...")}
        />
        <CreateButton
          label={t("permissions.actions.create", "Rugsat dörediň")}
          onClick={() => navigate("/settings/users/permissions/create")}
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
          searchPlaceholder={t("permissions.searchPlaceholder", "Gözlemek...")}
          columns={columnMeta}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          perPageOptions={[10, 25, 50, 100]}
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
          currentPage={data?.meta?.current_page ?? 1}
          totalPages={data?.meta?.last_page ?? 1}
          totalCount={data?.meta?.total ?? 0}
          onPageChange={setPage}
        />
      </div>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("permissions.deleteDialog.title", "Rugsaty pozmak")}
        description={t("permissions.deleteDialog.description", "Bu rugsaty pozmak isleýärsiňizmi? Bu amal yzyna gaýtarylmaz.")}
        onConfirm={handleConfirmDelete}
        isLoading={deletePermission.isPending}
      />
    </div>
  );
}
