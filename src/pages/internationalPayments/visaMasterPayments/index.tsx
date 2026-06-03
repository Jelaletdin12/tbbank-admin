import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { DataTable } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { useIntlPayments, useDeleteIntlPayment } from "@/features/visaMasterPayments/hooks/useVisaMasterPayments";
import type { IntlPaymentItem, IntlPaymentStatus } from "@/features/visaMasterPayments/api/visaMasterPaymentsApi";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/deleteDialog";
import { MonthSelect } from "@/components/monthSelect";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
// ─── Status badge (defined inside component for t() access) ───────────────────

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntlPaymentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [statusFilter, setStatusFilter] = useState<IntlPaymentStatus | "">("");

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<IntlPaymentItem | null>(null);

  const { data, isLoading } = useIntlPayments({ page, per_page: perPage, search, status: statusFilter, month });
  const { mutate: deletePayment, isPending: isDeleting } = useDeleteIntlPayment();

  function IntlPaymentStatusBadge({ status }: { status: IntlPaymentStatus }) {
    const STATUS_CONFIG = {
      pending: { label: t("intlPayment.status.pending", "Garaşylýar"), variant: "warning" as StatusBadgeVariant, icon: AlertCircle },
      approved: { label: t("intlPayment.status.approved", "Tassyklandy"), variant: "success" as StatusBadgeVariant, icon: CheckCircle2 },
      rejected: { label: t("intlPayment.status.rejected", "Ret edildi"), variant: "error" as StatusBadgeVariant, icon: XCircle },
    };
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return <span className="text-xs text-muted-foreground">{status}</span>;
    return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />;
  }

  const columns: ColumnDef<IntlPaymentItem>[] = [
    {
      accessorKey: "id",
      header: t("intlPayment.col.id", "ID"),
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: "currency_type_label",
      header: t("intlPayment.currencyType", "Ýüztumanyň görnüşi"),
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.currency_type_label}</span>,
    },
    {
      accessorKey: "created_at",
      header: t("intlPayment.createdAt", "Döredilen wagty"),
      cell: ({ row }) => <span className="text-sm text-muted-foreground whitespace-nowrap">{row.original.created_at}</span>,
    },
    {
      accessorKey: "province_label",
      header: t("intlPayment.province", "Welaýat"),
    },
    {
      accessorKey: "branch_label",
      header: t("intlPayment.branch", "Şahamça"),
      cell: ({ row }) => <span className="text-primary font-medium">{row.original.branch_label}</span>,
    },
    {
      accessorKey: "passport_first_name",
      header: t("intlPayment.firstName", "Ady"),
    },
    {
      accessorKey: "passport_last_name",
      header: t("intlPayment.lastName", "Familiýasy"),
    },
    {
      accessorKey: "phone",
      header: t("intlPayment.phone", "Telefon"),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.phone}</span>,
    },
    {
      accessorKey: "status",
      header: t("intlPayment.status", "Status"),
      cell: ({ row }) => <IntlPaymentStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => navigate(`/visa-master/${row.original.id}`)}>
            <Eye size={14} />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => navigate(`/visa-master/${row.original.id}/edit`)}>
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
      const label = typeof c.header === "string" ? c.header : "accessorKey" in c ? String(c.accessorKey) : id;
      return { id, label };
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("intlPayment.title", "Halkara tölegler (Visa/Mastercard)")}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <TableSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("intlPayment.search", "Gözlemek")}
        />
        <CreateButton
          label={t("intlPayment.createBtn", "Visa/Master tölegler (talyplar üçin) dörediň")}
          onClick={() => navigate("/visa-master/create")}
        />
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t("intlPayment.search", "Gözlemek")}
          columns={columnMeta}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={[
            {
              id: "status",
              label: t("intlPayment.status", "Status"),
              options: [
                { value: "pending", label: t("intlPayment.status.pending", "Garaşylýar") },
                { value: "approved", label: t("intlPayment.status.approved", "Tassyklandy") },
                { value: "rejected", label: t("intlPayment.status.rejected", "Ret edildi") },
              ],
            },
          ]}
          activeFilters={[{ fieldId: "status", value: statusFilter }]}
          onFilterChange={(fieldId, value) => {
            if (fieldId === "status") setStatusFilter(value as IntlPaymentStatus | "");
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
          hideSearch
          hideAction
          extraActions={
            <MonthSelect
              value={month}
              onChange={(v) => {
                setMonth(v);
                setPage(1);
              }}
            />
          }
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

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title={t("intlPayment.deleteTitle", "Pozmak isleýärsiňizmi?")}
        description={`${t("intlPayment.deleteDesc", "Bu amal yzyna dolanyp bolmaz.")} ${deleteTarget?.id ?? ""}`}
        onConfirm={() => {
          if (deleteTarget) {
            deletePayment(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
