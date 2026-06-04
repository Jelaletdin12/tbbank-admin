import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Database, CheckCircle2, XCircle, Clock } from "lucide-react";
import { DeleteDialog } from "@/components/deleteDialog";
import { TableActions } from "@/components/tableActions";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar, type ColumnMeta } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";
import type { VisibilityState } from "@tanstack/react-table";
import { useBackups, useCreateBackup, useDeleteBackup, useDownloadBackup } from "@/features/backups/hooks/useBackups";
import type { Backup, BackupStatus } from "@/features/backups/api/backupsApi";

const PER_PAGE = 25;

function BackupStatusBadge({ status }: { status: BackupStatus }) {
  const { t } = useTranslation();
  const cfg: Record<BackupStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }> = {
    completed: { label: t("backups.status.completed", "Tamamlandy"), variant: "success", icon: CheckCircle2 },
    failed: { label: t("backups.status.failed", "Şowsuz"), variant: "error", icon: XCircle },
    in_progress: { label: t("backups.status.inProgress", "Dowam edýär"), variant: "warning", icon: Clock },
  };
  const currentCfg = cfg[status];
  return <StatusBadge label={currentCfg.label} variant={currentCfg.variant} icon={currentCfg.icon} />;
}

export default function BackupsPage() {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const { data, isLoading } = useBackups({ page, per_page: perPage, search });
  const createBackup = useCreateBackup();
  const downloadBackup = useDownloadBackup();
  const deleteBackup = useDeleteBackup();

  const columns: ColumnDef<Backup>[] = [
    {
      id: "fileName",
      accessorKey: "fileName",
      header: t("backups.col.fileName", "Faýl ady"),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.fileName}</span>,
    },
    {
      id: "fileSize",
      accessorKey: "fileSize",
      header: t("backups.col.fileSize", "Ölçegi"),
      cell: ({ row }) => <span>{row.original.fileSize}</span>,
      size: 100,
    },
    {
      id: "status",
      accessorKey: "status",
      header: t("backups.col.status", "Status"),
      cell: ({ row }) => <BackupStatusBadge status={row.original.status} />,
      size: 140,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: t("backups.col.createdAt", "Döredilen wagty"),
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.createdAt}</span>,
      size: 160,
    },
    {
      id: "createdBy",
      accessorKey: "createdBy",
      header: t("backups.col.createdBy", "Döreden"),
      size: 100,
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <TableActions
          extraActions={[
            {
              icon: Download,
              title: t("common.download", "Ýükle"),
              onClick: () => downloadBackup.mutate(row.original.id),
              disabled: row.original.status === "in_progress",
            },
          ]}
          onDelete={() => setDeleteId(row.original.id)}
        />
      ),
    },
  ];

  const columnMeta: ColumnMeta[] = columns
    .filter((c) => c.id !== "actions")
    .map((c) => ({
      id: c.id!,
      label: typeof c.header === "string" ? c.header : c.id!,
    }));

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / perPage);

  const handleDelete = async () => {
    if (deleteId === null) return;
    await deleteBackup.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Database className="size-5 text-muted-foreground" />
          {t("backups.title", "Bekaplar")}
        </h1>
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
          label={createBackup.isPending ? t("common.loading", "Döredilýär...") : t("backups.create", "Backup dörediň")}
          onClick={() => createBackup.mutate()}
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
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
          totalCount={total}
          onPageChange={setPage}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("backups.deleteConfirm.title", "Eminsiňizmi?")}
        description={t("backups.deleteConfirm.description", "Bu backup pozulsynmy? Bu amal yzyna gaýtarylmaz.")}
        onConfirm={handleDelete}
        isLoading={deleteBackup.isPending}
      />
    </div>
  );
}
