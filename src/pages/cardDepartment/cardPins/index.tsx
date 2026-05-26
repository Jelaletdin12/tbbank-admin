import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { DataTable } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { useCardPins } from "@/features/cardPins/hooks/useCardPins";
import { useDeleteCardPin } from "@/features/cardPins/hooks/useCardPins";
import type {
  CardPinItem,
  CardPinStatus,
} from "@/features/cardPins/api/cardPinApi";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/ui/statusBadge";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "Garaşylýar",
    variant: "warning" as StatusBadgeVariant,
    icon: AlertCircle,
  },
  approved: {
    label: "Tassyklandy",
    variant: "success" as StatusBadgeVariant,
    icon: CheckCircle2,
  },
  rejected: {
    label: "Ýatyryldy",
    variant: "error" as StatusBadgeVariant,
    icon: XCircle,
  },
} satisfies Record<
  CardPinStatus,
  { label: string; variant: StatusBadgeVariant; icon: React.ElementType }
>;

function CardPinStatusStatusBadge({ status }: { status: CardPinStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg)
    return (
      <span className="text-xs text-muted-foreground">{String(status)}</span>
    );
  return (
    <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardPinsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CardPinStatus | "">("");

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<CardPinItem | null>(null);

  const { data, isLoading } = useCardPins({
    page,
    per_page: perPage,
    search,
    status: statusFilter,
  });
  const { mutate: deletePin, isPending: isDeleting } = useDeleteCardPin();

  const columns: ColumnDef<CardPinItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "card_type_label",
      header: t("cardPin.cardType", "Görnüşi"),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary">
          {row.original.card_type_label}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("cardPin.createdAt", "Döredilen wagty"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.original.created_at}
        </span>
      ),
    },
    {
      accessorKey: "province_label",
      header: t("cardPin.province", "Welaýat"),
    },
    {
      accessorKey: "branch_label",
      header: t("cardPin.branch", "Şahamça"),
      cell: ({ row }) => (
        <span className="text-primary font-medium">
          {row.original.branch_label}
        </span>
      ),
    },
    {
      accessorKey: "first_name",
      header: t("cardPin.firstName", "Ady"),
    },
    {
      accessorKey: "last_name",
      header: t("cardPin.lastName", "Familiýasy"),
    },
    {
      accessorKey: "phone",
      header: t("cardPin.phone", "Telefon"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("cardPin.status", "Status"),
      cell: ({ row }) => (
        <CardPinStatusStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => navigate(`/card-pins/${row.original.id}`)}
          >
            <Eye size={14} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => navigate(`/card-pins/${row.original.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const columnMeta = columns
    .filter((c) => ("accessorKey" in c || "id" in c) && c.id !== "actions")
    .map((c) => {
      const id = ("accessorKey" in c ? String(c.accessorKey) : c.id) as string;
      const label =
        typeof c.header === "string"
          ? c.header
          : "accessorKey" in c
            ? String(c.accessorKey)
            : id;
      return { id, label };
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t("Card pins", "Kart pin bukjalary")}
        </h1>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t('common.search', 'Gözlemek')}
          columns={columnMeta}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={[
            {
              id: "status",
              label: t("cardPin.status", "Status"),
              options: [
                { value: "pending", label: "Garaşylýar" },
                { value: "approved", label: "Tassyklandy" },
                { value: "rejected", label: "Ret edildi" },
              ],
            },
          ]}
          activeFilters={[{ fieldId: "status", value: statusFilter }]}
          onFilterChange={(fieldId, value) => {
            if (fieldId === "status")
              setStatusFilter(value as CardPinStatus | "");
            setPage(1);
          }}
          onFilterReset={() => {
            setStatusFilter("");
            setPage(1);
          }}
          perPage={perPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
          actionLabel={t("cardPin.createBtn", "Kart pin bukja dörediň")}
          onAction={() => navigate("/card-pins/create")}
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
          currentPage={data?.meta?.current_page ?? 1}
          totalPages={data?.meta?.last_page ?? 1}
          totalCount={data?.meta?.total}
          onPageChange={setPage}
        />
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("cardPin.deleteTitle", "Pozmak isleýärsiňizmi?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("cardPin.deleteDesc", "Bu amal yzyna dolanyp bolmaz.")}{" "}
              {deleteTarget?.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel", "Ýatyr")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deletePin(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {t("common.delete", "Poz")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
