import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { CardTransactionForm } from "@/features/cardTransactions/components/cardTransactionForm";
import { useCardTransaction } from "@/features/cardTransactions/hooks/useCardTransactions";

export default function CardTransactionEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data, isLoading } = useCardTransaction(numericId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-7 text-primary" />
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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">
        {t("Edit card transaction", "Kart herekedini üýtget")}
      </h1>
      <CardTransactionForm
        mode="edit"
        initialData={data}
        cardTransactionId={numericId}
      />
    </div>
  );
}
