import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { DataTable, type ColumnDef } from "@/components/dataTable";
import {
  DataTableToolbar,
  type ColumnMeta,
} from "@/components/dataTableToolbar";
import type { VisibilityState } from "@tanstack/react-table";
import {
  useCardRequisites,
  useDeleteCardRequisite,
  useDownloadCardRequisite,
} from "@/features/cardRequisites/hooks/useCardRequisites";
import type {
  CardRequisite,
  CardRequisiteStatus,
} from "@/features/cardRequisites/api/cardRequisitesApi";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  CardRequisiteStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Garaşylýar",
    className: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
  },
  approved: {
    label: "Tassyklanan",
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  },
  rejected: {
    label: "Ret edilen",
    className: "bg-red-500/15 text-red-500 border-red-500/20",
  },
};

function StatusBadge({ status }: { status: CardRequisiteStatus }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
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
      cell: ({ row }) => (
        <span className="text-primary font-medium">
          {row.original.card_type}
        </span>
      ),
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: t("Created at", "DÖREDILEN WAGTY"),
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.created_at}</span>
      ),
    },
    {
      id: "province_name",
      accessorKey: "province_name",
      header: t("Province", "WELAÝAT"),
      cell: ({ row }) => (
        <span className="text-foreground">
          {row.original.province_name ?? "—"}
        </span>
      ),
    },
    {
      id: "branch_name",
      accessorKey: "branch_name",
      header: t("Branch", "ŞAHAMÇA"),
      cell: ({ row }) => (
        <span className="text-primary font-medium">
          {row.original.branch_name ?? "—"}
        </span>
      ),
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
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => downloadMutation.mutate(row.original.id)}
          >
            <Download size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate(`/card-requisites/${row.original.id}`)}
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate(`/card-requisites/${row.original.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
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
        <h1 className="text-xl font-semibold text-foreground">
          {t("Card requisites", "Kart rekwizitler")}
        </h1>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t("Search", "Gözlemek")}
          columns={columnMeta}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          actionLabel={t(
            "Create card requisite order",
            "Kart rekwiziti üçin sargyt dörediň",
          )}
          onAction={() => navigate("/card-requisites/create")}
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
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("Are you sure?", "Eminsiňizmi?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "This action cannot be undone.",
                "Bu amal yzyna gaýtarylmaz. Kart rekwiziti hemişelik öçüriler.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel", "Ýatyr")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? t("Deleting...", "Öçürilýär...")
                : t("Delete", "Öçür")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
