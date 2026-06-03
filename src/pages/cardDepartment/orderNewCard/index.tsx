import { useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, Pencil, Trash2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";

import { DataTable } from "@/components/dataTable";
import { DataTableToolbar, type ActiveFilter, type FilterField } from "@/components/dataTableToolbar";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { useCardOrders, useDeleteCardOrder, useProvinces, useBranches } from "@/features/orderNewCard/hooks/useOrderNewCard";
import type { CardOrderListItem, CardOrderStatus } from "@/features/orderNewCard/api/orderNewCardApi";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";
import { DeleteDialog } from "@/components/deleteDialog";

// ─── Status badge ─────────────────────────────────────────────────────────────

function OrderNewCardStatusBadge({ status }: { status: CardOrderStatus }) {
  const { t } = useTranslation();
  const STATUS_CONFIG = {
    PENDING: { label: t("cardOrder.status.pending", "Garaşylýar"), variant: "warning" as StatusBadgeVariant, icon: AlertCircle },
    APPROVED: { label: t("cardOrder.status.approved", "Tassyklandy"), variant: "success" as StatusBadgeVariant, icon: CheckCircle2 },
    REJECTED: { label: t("cardOrder.status.rejected", "Ýatyryldy"), variant: "error" as StatusBadgeVariant, icon: XCircle },
  };
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-muted-foreground">{status}</span>;
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />;
}

// ─── Coloured text helper ─────────────────────────────────────────────────────

function HighlightText({ value, variant }: { value: string; variant: "teal" | "cyan" | "muted" }) {
  const cls =
    variant === "teal" ? "text-teal-400 font-semibold" : variant === "cyan" ? "text-cyan-400 font-semibold" : "text-muted-foreground";
  return <span className={cls}>{value}</span>;
}

const SPECIAL_BRANCHES = ["Köpetdag", "Türkmenabat", "Türkmenbaşy", "Seýdi", "Çandybil", "Balkan", "Baş bank"];

// ─── CardOrdersPage ───────────────────────────────────────────────────────────

export default function CardOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteMutation = useDeleteCardOrder();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Column meta (toolbar toggle) ──────────────────────────────────────────
  const COLUMN_META = useMemo(
    () => [
      { id: "id", label: t("cardOrder.col.id", "ID") },
      { id: "issuanceReasonName", label: t("cardOrder.col.reason", "Sebäp") },
      { id: "createdAt", label: t("cardOrder.col.createdAt", "Döredilen wagty") },
      { id: "cardTypeName", label: t("cardOrder.col.cardType", "Görnüşi") },
      { id: "provinceName", label: t("cardOrder.col.province", "Welaýat") },
      { id: "branchName", label: t("cardOrder.col.branch", "Şahamça") },
      { id: "fullName", label: t("cardOrder.col.name", "Ady") },
      { id: "status", label: t("cardOrder.col.status", "Status") },
    ],
    [t],
  );
  const DEFAULT_ORDER = useMemo(() => COLUMN_META.map((c) => c.id), [COLUMN_META]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_ORDER);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { fieldId: "status", value: "" },
    { fieldId: "provinceId", value: "" },
    { fieldId: "branchId", value: "" },
  ]);

  // ── Lookup data ────────────────────────────────────────────────────────────
  const provinceId = activeFilters.find((f) => f.fieldId === "provinceId")?.value;
  const { data: provincesData } = useProvinces();
  const { data: branchesData } = useBranches(provinceId ? Number(provinceId) : undefined);

  // ── Query params ───────────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const filterMap = Object.fromEntries(activeFilters.map((f) => [f.fieldId, f.value]));
    return {
      search: search || undefined,
      status: (filterMap.status as CardOrderStatus) || undefined,
      provinceId: filterMap.provinceId ? Number(filterMap.provinceId) : undefined,
      branchId: filterMap.branchId ? Number(filterMap.branchId) : undefined,
      page,
      perPage,
    };
  }, [search, activeFilters, page, perPage]);

  const { data, isLoading } = useCardOrders(queryParams);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((fieldId: string, value: string) => {
    setActiveFilters((prev) => {
      const updated = prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f));
      if (fieldId === "provinceId") {
        return updated.map((f) => (f.fieldId === "branchId" ? { ...f, value: "" } : f));
      }
      return updated;
    });
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

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<CardOrderListItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("cardOrder.col.id", "ID"),
        cell: ({ row }) => (
          <Link to={`/order-new-card/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
            {row.original.id}
          </Link>
        ),
        size: 130,
      },
      {
        accessorKey: "issuanceReasonName",
        header: t("cardOrder.col.reason", "Sebäp"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.issuanceReasonName}</span>,
      },
      {
        accessorKey: "createdAt",
        header: t("cardOrder.col.createdAt", "Döredilen wagty"),
        cell: ({ row }) => <span className="text-sm text-muted-foreground whitespace-nowrap">{row.original.createdAt}</span>,
        size: 160,
      },
      {
        accessorKey: "cardTypeName",
        header: t("cardOrder.col.cardType", "Görnüşi"),
        cell: ({ row }) => (
          <HighlightText value={row.original.cardTypeName} variant={row.original.cardTypeName === "Altyn Asyr" ? "cyan" : "teal"} />
        ),
      },
      {
        accessorKey: "provinceName",
        header: t("cardOrder.col.province", "Welaýat"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.provinceName}</span>,
      },
      {
        accessorKey: "branchName",
        header: t("cardOrder.col.branch", "Şahamça"),
        cell: ({ row }) => (
          <HighlightText value={row.original.branchName} variant={SPECIAL_BRANCHES.includes(row.original.branchName) ? "cyan" : "muted"} />
        ),
      },
      {
        id: "fullName",
        header: t("cardOrder.col.name", "Ady"),
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.lastName} {row.original.firstName}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t("cardOrder.col.status", "Status"),
        cell: ({ row }) => <OrderNewCardStatusBadge status={row.original.status} />,
        size: 130,
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button
              className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t("common.view", "Görkez")}
              onClick={() => navigate(`/order-new-card/${row.original.id}`)}
            >
              <Eye size={15} />
            </button>
            <button
              className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              title={t("common.edit", "Düzet")}
              onClick={() => navigate(`/order-new-card/${row.original.id}/edit`)}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 cursor-pointer rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              title={t("common.delete", "Poz")}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
        size: 100,
      },
    ],
    [t, navigate, handleDelete, deleteMutation.isPending],
  );

  // ── Filter fields ──────────────────────────────────────────────────────────
  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        id: "status",
        label: t("cardOrder.col.status", "Status"),
        options: [
          { value: "PENDING", label: t("cardOrder.status.pending", "Garaşylýar") },
          { value: "APPROVED", label: t("cardOrder.status.approved", "Tassyklandy") },
          { value: "REJECTED", label: t("cardOrder.status.rejected", "Ýatyryldy") },
        ],
      },
      {
        id: "provinceId",
        label: t("cardOrder.col.province", "Welaýat"),
        options: provincesData?.map((p) => ({ value: String(p.id), label: p.name })) ?? [],
      },
      {
        id: "branchId",
        label: t("cardOrder.col.branch", "Şahamça"),
        options: branchesData?.map((b) => ({ value: String(b.id), label: b.name })) ?? [],
      },
    ],
    [t, provincesData, branchesData],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{t("cardOrder.title", "Kart sargytlary")}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <TableSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("common.search", "Gözlemek")}
        />
        <CreateButton label={t("cardOrder.create", "Kart sargyt dörediň")} onClick={() => navigate("/order-new-card/create")} />
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={COLUMN_META}
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
          getRowId={(row) => row.id}
          currentPage={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount}
          onPageChange={setPage}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title={t("cardOrder.deleteConfirm", "Bu sargyt pozulsynmy?")}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
