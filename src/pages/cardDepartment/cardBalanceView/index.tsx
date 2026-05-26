import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useCardBalance,
  useDeleteCardBalance,
  useDownloadCardBalance,
} from "@/features/cardBalance/hooks/useCardBalance";
import { InfoRow, CollapsibleSection, StatusBadge, EmptyState } from "@/components/viewPageComponents";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";

// ─── Types for operations table ───────────────────────────────────────────────

interface Operation {
  id: number;
  action_name: string;
  performed_by: string;
  target: string;
  status: "FINISHED" | "PENDING" | "FAILED";
  date: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardBalanceViewPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [opsSearch, setOpsSearch] = useState("");

  const numericId = Number(id);
  const { data, isLoading } = useCardBalance(numericId);
  const deleteMutation = useDeleteCardBalance();
  const downloadMutation = useDownloadCardBalance();

  // Placeholder operations — in real app fetch from API using numericId
  const operations: Operation[] = [];

  const filteredOperations = operations.filter(
    (op) =>
      op.action_name.toLowerCase().includes(opsSearch.toLowerCase()) ||
      op.target.toLowerCase().includes(opsSearch.toLowerCase()),
  );

  // ── Operations columns ──────────────────────────────────────────────────

  const operationColumns: ColumnDef<Operation>[] = [
    {
      accessorKey: "id",
      header: t("ID", "ID"),
      cell: ({ row }) => (
        <span className="text-primary font-semibold text-sm">
          {row.original.id}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: "action_name",
      header: t("Action name", "AMALYŇ ADY"),
      cell: ({ row }) => <span className="text-sm">{row.original.action_name}</span>,
    },
    {
      accessorKey: "performed_by",
      header: t("Performed by", "KIM TARAPYNDAN"),
      cell: ({ row }) => <span className="text-sm">{row.original.performed_by}</span>,
    },
    {
      accessorKey: "target",
      header: t("Target", "AMALYŇ NYŞANY (TARGEDI)"),
      cell: ({ row }) => <span className="text-sm">{row.original.target}</span>,
    },
    {
      accessorKey: "status",
      header: t("Status", "AMALYŇ STATUSY"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 160,
    },
    {
      accessorKey: "date",
      header: t("Date", "SENE"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.original.date}
        </span>
      ),
      size: 160,
    },
  ];

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(numericId);
    navigate("/card-balances");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-64" />
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border last:border-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        {t("Not found", "Tapylmady")}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t("Card balance detail", "Kart galyndysy giňişleýin")}:
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadMutation.mutate(numericId)}
            disabled={downloadMutation.isPending}
          >
            <Download size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={14} />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/card-balances/${numericId}/edit`}>
              <Pencil size={14} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Detail card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <InfoRow label={t("ID", "ID")} value={data.id} />
        <InfoRow
          label={t("Passport series", "Pasport seriýasy")}
          value={data.passport_series}
        />
        <InfoRow
          label={t("Passport number", "Pasport belgisi")}
          value={data.passport_number}
        />
        <InfoRow
          label={t("Card number", "Kart belgisi")}
          value={data.card_number}
        />
        <InfoRow
          label={t("Card expiry month", "Kart Möhleti (aý)")}
          value={data.card_expiry_month}
        />
        <InfoRow
          label={t("Card expiry year", "Kart Möhleti (ýyl)")}
          value={data.card_expiry_year}
        />
      </div>

      {/* Ammallar (Operations) collapsible section */}
      <CollapsibleSection title={t("Operations", "Ammallar")}>
        <DataTableToolbar
          searchValue={opsSearch}
          onSearchChange={setOpsSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
        />
        {filteredOperations.length === 0 ? (
          <EmptyState
            label={t(
              "No operations found",
              "Berlen kriterýalara Amal gabat gelmedi.",
            )}
          />
        ) : (
          <DataTable
            columns={operationColumns}
            data={filteredOperations}
            getRowId={(r) => String(r.id)}
            enableRowSelection
          />
        )}
      </CollapsibleSection>

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("Are you sure?", "Eminsiňizmi?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "This action cannot be undone.",
                "Bu amal yzyna gaýtarylmaz. Kart galyndysy hemişelik öçüriler.",
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
