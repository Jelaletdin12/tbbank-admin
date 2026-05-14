import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CardReasonForm } from "@/features/cardReasons/components/reasonForm";
import { useCardReasonById } from "@/features/cardReasons/hooks/useCardReasons";

// ─── CardReasonEditPage ────────────────────────────────────────────────────────

export function CardReasonEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const numericId = Number(id);
  const { data, isLoading } = useCardReasonById(numericId);

  return (
    <div className="p-6">
      <div className="mb-6">
     
        <h1 className="text-2xl font-bold text-foreground">
          {isLoading
            ? "..."
            : `${t("CardReasons.edit.title", "Kartyň çykarylmagynyň sebäbini üýtgetmek")}: ${data?.name.tk ?? ""}`}
        </h1>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border last:border-0"
            >
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <CardReasonForm
          mode="edit"
          initialData={data}
          CardReasonId={numericId}
        />
      )}
    </div>
  );
}

export default CardReasonEditPage
