import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BranchForm } from "@/features/branches/components/branchesForm";
import { useBranchById } from "@/features/branches/hooks/useBranches";
import { Loader2 } from "lucide-react";

export default function BranchEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const numericId = Number(id);
  const { data, isLoading, isError } = useBranchById(numericId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isLoading
            ? "..."
            : `${t("branches.edit.title", "Şahamçany üýtgetmek")}: ${data?.name.tk ?? ""}`}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : isError || !data ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-destructive">
            {t("common.error", "Maglumat ýüklenilmedi. Sahypany täzeleläň.")}
          </p>
        </div>
      ) : (
        <BranchForm mode="edit" initialData={data} branchId={numericId} />
      )}
    </div>
  );
}
