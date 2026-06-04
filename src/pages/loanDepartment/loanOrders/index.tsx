import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";

import { DataTable } from "@/components/dataTable";
import { DataTableToolbar, type ActiveFilter, type FilterField } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { TableActions } from "@/components/tableActions";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";
import { useLoanOrders, useDeleteLoanOrder } from "@/features/loanOrders/hooks/useLoanOrders";
import type { LoanOrder, LoanOrderStatus } from "@/features/loanOrders/api/loanOrdersApi";
import { DeleteDialog } from "@/components/deleteDialog";

// ─── Status Badge (inline) ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  GARAŞYLÝAR: { label: "Garaşylýar", variant: "warning" as StatusBadgeVariant, icon: AlertCircle },
  KANAGATLANDYRYLAN: { label: "Kanagatlandyrylan", variant: "success" as StatusBadgeVariant, icon: CheckCircle2 },
  RED_EDILDI: { label: "Red edildi", variant: "error" as StatusBadgeVariant, icon: XCircle },
  IŞLENÝÄR: { label: "Işlenýär", variant: "info" as StatusBadgeVariant, icon: Loader2 },
} satisfies Record<LoanOrderStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }>;

function LoanOrderStatusBadge({ status }: { status: LoanOrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>;
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />;
}

// ─── Column meta for toggle dropdown ─────────────────────────────────────────

const COLUMN_IDS = ["id", "loanType", "createdAt", "region", "branch", "firstName", "lastName", "phone", "status"] as const;

// ─── Filter fields ────────────────────────────────────────────────────────────

const REGION_OPTIONS = [
  { value: "Balkan", label: "Balkan" },
  { value: "Ahal", label: "Ahal" },
  { value: "Daşoguz", label: "Daşoguz" },
  { value: "Lebap", label: "Lebap" },
  { value: "Mary", label: "Mary" },
  { value: "Aşgabat", label: "Aşgabat" },
];

const STATUS_OPTIONS: { value: LoanOrderStatus; label: string }[] = [
  { value: "GARAŞYLÝAR", label: "Garaşylýar" },
  { value: "KANAGATLANDYRYLAN", label: "Kanagatlandyrylan" },
  { value: "RED_EDILDI", label: "Red edildi" },
  { value: "IŞLENÝÄR", label: "Işlenýär" },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function LoanOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteMutation = useDeleteLoanOrder();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([...COLUMN_IDS]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { fieldId: "region", value: "" },
    { fieldId: "status", value: "" },
    { fieldId: "branch", value: "" },
    { fieldId: "archived", value: "" },
  ]);

  const queryParams = useMemo(() => {
    const filterMap = Object.fromEntries(activeFilters.map((f) => [f.fieldId, f.value]));
    return {
      search: search || undefined,
      region: filterMap.region || undefined,
      status: (filterMap.status as LoanOrderStatus) || undefined,
      branch: filterMap.branch || undefined,
      archived: filterMap.archived || undefined,
      page,
      perPage,
    };
  }, [search, activeFilters, page, perPage]);

  const { data, isLoading } = useLoanOrders(queryParams);
  const totalPages = data ? Math.ceil(data.total / perPage) : 1;

  const handleFilterChange = useCallback((fieldId: string, value: string) => {
    setActiveFilters((prev) => prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f)));
    setPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setActiveFilters((prev) => prev.map((f) => ({ ...f, value: "" })));
    setPage(1);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setDeleteId(null);
  }, [deleteId, deleteMutation]);

  const columns = useMemo<ColumnDef<LoanOrder>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: t("ID", "ID"),
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.id}</span>,
        size: 130,
      },
      {
        id: "loanType",
        accessorKey: "loanType",
        header: t("Loan type", "KARZ GÖRNÜŞI"),
        cell: ({ row }) => <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{row.original.loanType}</span>,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: t("Created at", "DÖREDILEN WAGTY"),
        cell: ({ row }) => <span className="text-sm text-foreground whitespace-nowrap">{row.original.createdAt}</span>,
        size: 160,
      },
      {
        id: "region",
        accessorKey: "region",
        header: t("Region", "WELAÝAT"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.region}</span>,
        size: 100,
      },
      {
        id: "branch",
        accessorKey: "branch",
        header: t("Branch", "ŞAHAMÇA"),
        cell: ({ row }) => <span className="text-sm text-emerald-500 font-medium">{row.original.branch}</span>,
        size: 100,
      },
      {
        id: "firstName",
        accessorKey: "firstName",
        header: t("Name", "ADY"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.firstName}</span>,
        size: 110,
      },
      {
        id: "lastName",
        accessorKey: "lastName",
        header: t("Surname", "FAMILIÝASY"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.lastName}</span>,
        size: 120,
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: t("Phone", "TELEFON"),
        cell: ({ row }) => <span className="text-sm font-mono text-foreground">{row.original.phone}</span>,
        size: 110,
      },
      {
        id: "status",
        accessorKey: "status",
        header: t("Status", "STATUS"),
        cell: ({ row }) => <LoanOrderStatusBadge status={row.original.status} />,
        size: 180,
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <TableActions
            onView={() => navigate(`/loan-orders/${row.original.id}`)}
            onEdit={() => navigate(`/loan-orders/${row.original.id}/edit`)}
            onDelete={() => handleDelete(row.original.id)}
            isDeleting={deleteMutation.isPending}
          />
        ),
        size: 100,
      },
    ],
    [t, navigate, handleDelete, deleteMutation.isPending],
  );

  const toggleableColumns = useMemo(() => COLUMN_IDS.map((id) => ({ id, label: t(`loanOrders.columns.${id}`, id) })), [t]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        id: "region",
        label: t("Region", "WELAÝAT"),
        options: REGION_OPTIONS,
      },
      {
        id: "status",
        label: t("Status", "STATUS"),
        options: STATUS_OPTIONS,
      },
      {
        id: "branch",
        label: t("Branch", "ŞAHAMÇA"),
        options: [],
      },
      {
        id: "archived",
        label: t("loanOrders.filters.archived", "ARHIWLENEN"),
        options: [
          { value: "true", label: t("common.yes", "Hawa") },
          { value: "false", label: t("common.no", "Ýok") },
        ],
      },
    ],
    [t],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("loanOrders.title", "Karz sargytlary")}</h1>
      </div>

      <div className="flex items-center gap-3 justify-between">
        <TableSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("loanOrderMobiles.searchPlaceholder", "Gözlemek")}
        />
        <CreateButton label={t("loanOrderMobiles.createButton", "Karz sargyt dörediñ")} onClick={() => navigate("/loan-orders/create")} />
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          hideSearch
          hideAction
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t("loanOrderMobiles.searchPlaceholder", "Gözlemek")}
          columns={toggleableColumns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
          perPageOptions={[10, 25, 50, 100]}
          perPage={perPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
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
          getRowId={(row) => row.id}
          currentPage={page}
          totalPages={totalPages}
          totalCount={data?.total}
          onPageChange={setPage}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("loanOrders.deleteConfirm", "Bu sargyt pozulsynmy?")}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
