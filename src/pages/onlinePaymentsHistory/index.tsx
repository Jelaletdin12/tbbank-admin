// pages/OnlinePaymentHistoryPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import type { VisibilityState } from "@tanstack/react-table";
import {
  useGetOnlinePayments,
  useTriggerPaymentCallback,
} from "@/features/onlinePaymentHistory/hooks/useOnlinePaymentsHistory";
import type { OnlinePayment } from "@/features/onlinePaymentHistory/api/onlinePaymentsHistoryApi";
import { PaymentStatusBadge } from "../../features/onlinePaymentHistory/components/PaymentStatusBadge";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_VISIBILITY = {
  amount: true,
  apiClient: true,
  description: true,
  status: true,
  username: true,
  createdAt: true,
};
const DEFAULT_ORDER = [
  "amount",
  "apiClient",
  "description",
  "status",
  "username",
  "createdAt",
  "actions",
];

// ─── OnlinePaymentHistoryPage ─────────────────────────────────────────────────

export default function OnlinePaymentHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(DEFAULT_VISIBILITY);
  const [columnOrder, setColumnOrder] = useState(DEFAULT_ORDER);

  const { data, isLoading } = useGetOnlinePayments({ page, perPage, search });
  const callbackMutation = useTriggerPaymentCallback();

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // ─── Columns ──────────────────────────────────────────────────────────────

  const columns: ColumnDef<OnlinePayment>[] = [
    {
      accessorKey: "amount",
      header: t("onlinePayments.columns.amount", "MÖÇBERI"),
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground font-medium">
          {row.original.amount}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "apiClient",
      header: t("onlinePayments.columns.apiClient", "API CLIENT"),
      cell: ({ row }) => (
        <span className="text-foreground text-xs font-mono truncate max-w-[180px] block">
          {row.original.apiClient}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: t("onlinePayments.columns.description", "DESC"),
      cell: ({ row }) => (
        <span className="text-foreground text-sm">
          {row.original.description}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "status",
      header: t("onlinePayments.columns.status", "STATUS"),
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
      size: 140,
    },
    {
      accessorKey: "username",
      header: t("onlinePayments.columns.username", "USERNAME"),
      cell: ({ row }) => (
        <span className="text-foreground text-xs font-mono">
          {row.original.username}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("onlinePayments.columns.createdAt", "DÖREDILEN WAGTY"),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
      size: 140,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {/* Callback trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={callbackMutation.isPending}
            onClick={() => callbackMutation.mutate(row.original.id)}
            title={t("onlinePayments.actions.callback", "Callback ugrat")}
          >
            <Rss size={15} />
          </Button>
          {/* View detail */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() =>
              navigate(`/online-payments-history/${row.original.id}`)
            }
            title={t("common.view", "Görmek")}
          >
            <Eye size={15} />
          </Button>
        </div>
      ),
      size: 90,
    },
  ];

  const columnMeta = columns
    .filter((c) => "accessorKey" in c && c.accessorKey)
    .map((c) => ({
      id: String(("accessorKey" in c ? c.accessorKey : c.id) ?? ""),
      label: typeof c.header === "string" ? c.header : "",
    }));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground mb-5">
        {t("onlinePayments.title", "Onlaýn töleg taryhy")}
      </h1>
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
        totalPages={data?.totalPages ?? 1}
        totalCount={data?.total ?? 0}
        onPageChange={setPage}
      />
</div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${hh}:${mm}, ${dd}.${mo}.${yy}`;
}
