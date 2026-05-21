import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageSpinner } from "@/components/pageSpinner";
import { PageError } from "@/components/pageError";
import { BranchForm } from "@/features/branches/components/branchesForm";
import { useBranchById } from "@/features/branches/hooks/useBranches";

export default function BranchEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const numericId = Number(id);
  const { data, isLoading, isError } = useBranchById(numericId);

  if (isLoading) return <PageSpinner />;
  if (isError || !data) return <PageError message={t("common.error", "Maglumat ýüklenilmedi")} />;

  return <BranchForm mode="edit" initialData={data} />;
}
