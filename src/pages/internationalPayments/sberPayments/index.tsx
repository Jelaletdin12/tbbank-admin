import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Eye, Edit, ArrowUpDown, Trash2 } from "lucide-react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/dataTable";
import { DataTableToolbar, type ColumnMeta, type FilterField, type ActiveFilter } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { MonthSelect } from "@/components/monthSelect";
import { useSberPaymentOrders, useDeleteSberPayment } from "@/features/sberPayments/hooks/useSberPayments";
import {
  type SberPaymentOrder,
  WELAYATLAR,
  STATUSES,
  type PaymentStatus,
  type PaymentPaidStatus,
} from "@/features/sberPayments/api/sberPaymentsApi";
import { DeleteDialog } from "@/components/deleteDialog";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

// ─── Status badge ─────────────────────────────────────────────────────────────

function getStatusConfig(t: (key: string, fallback?: string) => string) {
  return {
    GARASYLYYAR: {
      label: t("sberPayments.status.pending", "Garaşylýar"),
      variant: "warning" as StatusBadgeVariant,
      icon: AlertCircle,
    },
    KANAGATLANDYRYLAN: {
      label: t("sberPayments.status.approved", "Tassyklandy"),
      variant: "success" as StatusBadgeVariant,
      icon: CheckCircle2,
    },
    RET_EDILEN: {
      label: t("sberPayments.status.rejected", "Ýatyryldy"),
      variant: "error" as StatusBadgeVariant,
      icon: XCircle,
    },
  } satisfies Record<PaymentStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }>;
}

function getPaidStatusConfig(t: (key: string, fallback?: string) => string) {
  return {
    Tolenmedik: {
      label: t("sberPayments.paidStatus.unpaid", "Tölmedi"),
      variant: "error" as StatusBadgeVariant,
      icon: XCircle,
    },
    Tolendi: {
      label: t("sberPayments.paidStatus.paid", "Tölendi"),
      variant: "success" as StatusBadgeVariant,
      icon: CheckCircle2,
    },
  } satisfies Record<PaymentPaidStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }>;
}

function PaymentPaidStatusBadge({ status, t }: { status: PaymentPaidStatus; t: (key: string, fallback?: string) => string }) {
  const cfg = getPaidStatusConfig(t)[status];
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>;
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />;
}

function PaymentStatusBadge({ status, t }: { status: PaymentStatus; t: (key: string, fallback?: string) => string }) {
  const cfg = getStatusConfig(t)[status];
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>;
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />;
}

// ─── Column Definitions ───────────────────────────────────────────────────────

// ─── Column Meta for Toolbar ──────────────────────────────────────────────────

function getColumnMeta(t: (key: string, fallback?: string) => string): ColumnMeta[] {
  return [
    { id: "id", label: t("sberPayments.columns.id", "ID") },
    { id: "createdAt", label: t("sberPayments.columns.createdAt", "Döredilen wagty") },
    { id: "welayat", label: t("sberPayments.columns.welayat", "Welaýat") },
    { id: "sahamca", label: t("sberPayments.columns.sahamca", "Şahamça") },
    { id: "firstName", label: t("sberPayments.columns.firstName", "Ady") },
    { id: "lastName", label: t("sberPayments.columns.lastName", "Familiýasy") },
    { id: "phone", label: t("sberPayments.columns.phone", "Telefon") },
    { id: "status", label: t("sberPayments.columns.status", "Status") },
    { id: "paidStatus", label: t("sberPayments.columns.paidStatus", "Tölenen (şul aý)") },
  ];
}

// ─── Filter Fields ────────────────────────────────────────────────────────────

function getFilterFields(t: (key: string, fallback?: string) => string): FilterField[] {
  return [
    {
      id: "welayat",
      label: t("sberPayments.filters.welayat", "Welaýat"),
      options: WELAYATLAR.map((w) => ({ value: w, label: w })),
    },
    {
      id: "status",
      label: t("sberPayments.filters.status", "Status"),
      options: STATUSES,
    },
  ];
}

// ─── List Page Component ──────────────────────────────────────────────────────

export default function SberPaymentsListPage() {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback((key, fallback) => _t(key, fallback ?? key) as string, [_t]);
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<SberPaymentOrder | null>(null);
  const deleteMutation = useDeleteSberPayment();

  const colMeta = useMemo(() => getColumnMeta(t), [i18n.language]);
  const filterFlds = useMemo(() => getFilterFields(t), [i18n.language]);

  const columns = useMemo<ColumnDef<SberPaymentOrder>[]>(() => {
    const colMetaLabels = getColumnMeta(t);
    const idLabel = colMetaLabels.find((c) => c.id === "id")?.label ?? "ID";
    const createdAtLabel = colMetaLabels.find((c) => c.id === "createdAt")?.label ?? "Döredilen wagty";
    const welayatLabel = colMetaLabels.find((c) => c.id === "welayat")?.label ?? "Welaýat";
    const sahamcaLabel = colMetaLabels.find((c) => c.id === "sahamca")?.label ?? "Şahamça";
    const firstNameLabel = colMetaLabels.find((c) => c.id === "firstName")?.label ?? "Ady";
    const lastNameLabel = colMetaLabels.find((c) => c.id === "lastName")?.label ?? "Familiýasy";
    const phoneLabel = colMetaLabels.find((c) => c.id === "phone")?.label ?? "Telefon";
    const statusLabel = colMetaLabels.find((c) => c.id === "status")?.label ?? "Status";
    const paidStatusLabel = colMetaLabels.find((c) => c.id === "paidStatus")?.label ?? "Tölenen (şul aý)";

    return [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {idLabel}
            <ArrowUpDown size={12} />
          </button>
        ),
        cell: ({ row }) => <span className="font-medium text-foreground">{row.getValue("id")}</span>,
      },
      {
        accessorKey: "createdAt",
        header: createdAtLabel,
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div className="text-sm">
              <div>{format(date, "HH:mm, dd.MM.yyyy")}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "welayat",
        header: welayatLabel,
        cell: ({ row }) => <span>{row.getValue("welayat")}</span>,
      },
      {
        accessorKey: "sahamca",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {sahamcaLabel}
            <ArrowUpDown size={12} />
          </button>
        ),
        cell: ({ row }) => <span className="text-primary font-medium">{row.getValue("sahamca")}</span>,
      },
      {
        accessorKey: "firstName",
        header: firstNameLabel,
        cell: ({ row }) => <span>{row.getValue("firstName")}</span>,
      },
      {
        accessorKey: "lastName",
        header: lastNameLabel,
        cell: ({ row }) => <span>{row.getValue("lastName")}</span>,
      },
      {
        accessorKey: "phone",
        header: phoneLabel,
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("phone")}</span>,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {statusLabel}
            <ArrowUpDown size={12} />
          </button>
        ),
        cell: ({ row }) => <PaymentStatusBadge status={row.getValue("status")} t={t} />,
      },
      {
        accessorKey: "paidStatus",
        header: paidStatusLabel,
        cell: ({ row }) => <PaymentPaidStatusBadge status={row.getValue("paidStatus")} t={t} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const order = row.original;

          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(`/sber-payments/${order.id}`)}
                className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title={t("common.view", "View")}
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => navigate(`/sber-payments/${order.id}/edit`)}
                className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title={t("common.edit", "Edit")}
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(order)}
                className="p-1.5 rounded hover:bg-accent text-destructive hover:bg-destructive/10 transition-colors"
                title={t("common.delete", "Delete")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      },
    ];
  }, [navigate, deleteMutation, t, i18n.language]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Search state
  const [search, setSearch] = useState("");

  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Column visibility & order
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(colMeta.map((c) => c.id));

  // Month filter
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Get filter values
  const welayatFilter = activeFilters.find((f) => f.fieldId === "welayat")?.value ?? "";
  const statusFilter = activeFilters.find((f) => f.fieldId === "status")?.value ?? "";

  // Fetch data
  const { data, isLoading } = useSberPaymentOrders({
    page,
    perPage,
    search,
    welayat: welayatFilter,
    status: statusFilter,
  });

  const handleFilterChange = (fieldId: string, value: string) => {
    setActiveFilters((prev) => {
      const existing = prev.find((f) => f.fieldId === fieldId);
      if (existing) {
        return prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f));
      }
      return [...prev, { fieldId, value }];
    });
    setPage(1);
  };

  const handleFilterReset = () => {
    setActiveFilters([]);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-foreground">{t("sberPayments.list.title", "Sber tölegler (talyplar üçin)")}</h1>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <TableSearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder={t("common.search", "Gözlemek")}
        />
        <CreateButton
          label={t("sberPayments.list.actionLabel", "Sber töleg (talyplar üçin) dörediň")}
          onClick={() => navigate("/sber-payments/create")}
        />
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        {/* Toolbar */}
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={colMeta}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={filterFlds}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
          perPage={perPage}
          onPerPageChange={(val) => {
            setPerPage(val);
            setPage(1);
          }}
          hideSearch
          hideAction
          extraActions={
            <MonthSelect
              value={selectedMonth}
              onChange={(v) => {
                setSelectedMonth(v);
                setPage(1);
              }}
            />
          }
        />

        {/* Data Table */}
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
          currentPage={data?.pagination.currentPage ?? 1}
          totalPages={data?.pagination.totalPages ?? 1}
          totalCount={data?.pagination.totalCount ?? 0}
          onPageChange={setPage}
        />
      </div>
      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title={t("sberPayments.deleteDialog.title", "Bu tölegi pozmak isleýärsiňizmi?")}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
