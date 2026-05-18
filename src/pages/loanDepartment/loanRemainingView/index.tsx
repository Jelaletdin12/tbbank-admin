import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil } from "lucide-react";
import {
  useLoanRemainingById,
  useDeleteLoanRemaining,
} from "@/features/loanRemaining/hooks/useLoanRemaining";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoRow, Section } from "@/components/viewPageComponents";
import { ConfirmDialog } from "@/components/confirmDialog";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LoanRemainingViewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-64" />
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
        {[...Array(4)].map((_, j) => (
          <Skeleton key={j} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoanRemainingViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const deleteMutation = useDeleteLoanRemaining();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: record, isLoading } = useLoanRemainingById(id!);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(Number(id!), {
      onSuccess: () => navigate("/loan-remaining"),
    });
  };

  if (isLoading) return <LoanRemainingViewSkeleton />;

  if (!record) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        {t("common.notFound", "Tapylmady")}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-foreground">
          {t("loanRemaining.view.title", "Karz galyndysy maglumaty")}:{" "}
          {record.id}
        </h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-md cursor-pointer hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            title={t("common.delete", "Poz")}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => navigate(`/loan-remaining/${record.id}/edit`)}
            className="p-2 rounded-md cursor-pointer hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t("common.edit", "Redaktirle")}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <Section title={t("loanRemaining.sections.info", "Esasy maglumatlar")}>
        <InfoRow label={t("common.id", "ID")} value={String(record.id)} />
        <InfoRow
          label={t("loanRemaining.columns.passportSeries", "Pasport seriýasy")}
          value={record.passportSeries}
        />
        <InfoRow
          label={t("loanRemaining.columns.passportNumber", "Pasport belgisi")}
          value={record.passportNumber}
        />
        <InfoRow
          label={t("loanRemaining.columns.loanAccount", "Karz hasaby")}
          value={record.loanAccount}
        />
      </Section>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t("loanRemaining.deleteConfirm", "Bu ýazgy pozulsynmy?")}
        confirmLabel={t("common.delete", "Poz")}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
