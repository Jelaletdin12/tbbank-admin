import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { DeleteDialog } from "@/components/deleteDialog";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar, type ColumnMeta } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { TableActions } from "@/components/tableActions";
import type { VisibilityState } from "@tanstack/react-table";
import { useCardRequisites, useDeleteCardRequisite, useDownloadCardRequisite } from "@/features/cardRequisites/hooks/useCardRequisites";
import type { CardRequisite, CardRequisiteStatus } from "@/features/cardRequisites/api/cardRequisitesApi";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CardRequisiteStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }> = {
  pending: { label: "Garaşylýar", variant: "warning", icon: AlertCircle },
  approved: { label: "Tassyklanan", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Ret edilen", variant: "error", icon: XCircle },
};

function CardRequisiteStatusBadge({ status }: { status: CardRequisiteStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-muted-foreground">{status}</span>;
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PER_PAGE = 25;

export default function CardRequisitesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const { data, isLoading } = useCardRequisites({
    page,
    per_page: perPage,
    search,
  });
  const deleteMutation = useDeleteCardRequisite();
  const downloadMutation = useDownloadCardRequisite();

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns: ColumnDef<CardRequisite>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: t("ID", "ID"),
      cell: ({ row }) => (
        <button
          className="text-primary font-medium hover:underline text-left"
          onClick={() => navigate(`/card-requisites/${row.original.id}`)}
        >
          {row.original.id}
        </button>
      ),
    },
    {
      id: "card_type",
      accessorKey: "card_type",
      header: t("Card type", "GÖRNÜŞI"),
      cell: ({ row }) => <span className="text-primary font-medium">{row.original.card_type}</span>,
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: t("Created at", "DÖREDILEN WAGTY"),
      cell: ({ row }) => <span className="text-foreground">{row.original.created_at}</span>,
    },
    {
      id: "province_name",
      accessorKey: "province_name",
      header: t("Province", "WELAÝAT"),
      cell: ({ row }) => <span className="text-foreground">{row.original.province_name ?? "—"}</span>,
    },
    {
      id: "branch_name",
      accessorKey: "branch_name",
      header: t("Branch", "ŞAHAMÇA"),
      cell: ({ row }) => <span className="text-primary font-medium">{row.original.branch_name ?? "—"}</span>,
    },
    {
      id: "first_name",
      accessorKey: "first_name",
      header: t("First name", "ADY"),
      cell: ({ row }) => <span>{row.original.first_name}</span>,
    },
    {
      id: "last_name",
      accessorKey: "last_name",
      header: t("Last name", "FAMILIÝASY"),
      cell: ({ row }) => <span>{row.original.last_name}</span>,
    },
    {
      id: "status",
      accessorKey: "status",
      header: t("Status", "STATUS"),
      cell: ({ row }) => <CardRequisiteStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <TableActions
          extraActions={[{ icon: Download, title: t("Download", "Ýükle"), onClick: () => downloadMutation.mutate(row.original.id) }]}
          onView={() => navigate(`/card-requisites/${row.original.id}`)}
          onEdit={() => navigate(`/card-requisites/${row.original.id}/edit`)}
          onDelete={() => setDeleteId(row.original.id)}
          isDeleting={deleteMutation.isPending}
        />
      ),
    },
  ];

  // ── Column meta for toolbar ───────────────────────────────────────────────────

  const columnMeta: ColumnMeta[] = columns
    .filter((c) => c.id !== "actions")
    .map((c) => ({
      id: c.id!,
      label: typeof c.header === "string" ? c.header : c.id!,
    }));

  // ── Pagination ────────────────────────────────────────────────────────────────

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / perPage);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("Card requisites", "Kart rekwizitler")}</h1>
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
          label={t("cardRequisites.createTitle", "Kart rekwiziti üçin sargyt dörediň")}
          onClick={() => navigate("/card-requisites/create")}
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
          hideSearch
          hideAction
          perPageOptions={[10, 25, 50, 100]}
          perPage={perPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
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
          getRowId={(row) => row.id}
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
          onPageChange={setPage}
        />
      </div>
      {/* Delete dialog */}
      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("Are you sure?", "Eminsiňizmi?")}
        description={t("This action cannot be undone.", "Bu amal yzyna gaýtarylmaz. Kart rekwiziti hemişelik öçüriler.")}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
