import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil } from "lucide-react";
import {
  useLoanPaidOffLetterById,
  useDeleteLoanPaidOffLetter,
} from "@/features/loanPaidOffLetters/hooks/useLoanPaidOffLetters";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoRow, Section } from "@/components/viewPageComponents";
import { ConfirmDialog } from "@/components/confirmDialog";

function LoanPaidOffLetterViewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-64" />
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
        {[...Array(5)].map((_, j) => (
          <Skeleton key={j} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function LoanPaidOffLettersViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const deleteMutation = useDeleteLoanPaidOffLetter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: record, isLoading } = useLoanPaidOffLetterById(id!);

  const confirmDelete = () => {
    deleteMutation.mutate(Number(id!), {
      onSuccess: () => navigate("/loan-paid-off-letters"),
    });
  };

  if (isLoading) return <LoanPaidOffLetterViewSkeleton />;

  if (!record) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        {t("common.notFound", "Tapylmady")}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-foreground">
          {t("loanPaidOffLetters.view.title", "Güwanama maglumaty")}:{" "}
          {record.id}
        </h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-md cursor-pointer hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            title={t("common.delete", "Poz")}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => navigate(`/loan-paid-off-letters/${record.id}/edit`)}
            className="p-2 rounded-md cursor-pointer hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t("common.edit", "Redaktirle")}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      <Section title={t("loanPaidOffLetters.sections.info", "Esasy maglumatlar")}>
        <InfoRow label={t("common.id", "ID")} value={String(record.id)} />
        <InfoRow
          label={t("loanPaidOffLetters.columns.passportSeries", "Pasport seriýasy")}
          value={record.passportSeries}
        />
        <InfoRow
          label={t("loanPaidOffLetters.columns.passportNumber", "Pasport belgisi")}
          value={record.passportNumber}
        />
        <InfoRow
          label={t("loanPaidOffLetters.columns.loanAccount", "Karz hasaby")}
          value={record.loanAccount}
        />
        <InfoRow
          label={t("loanPaidOffLetters.columns.issuedAt", "Berlen wagty")}
          value={record.issuedAt}
        />
      </Section>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t("loanPaidOffLetters.deleteConfirm", "Bu ýazgy pozulsynmy?")}
        confirmLabel={t("common.delete", "Poz")}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
