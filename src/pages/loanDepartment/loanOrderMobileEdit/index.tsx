import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageSpinner } from "@/components/pageSpinner";
import { PageError } from "@/components/pageError";
import { LoanOrderMobileForm } from "@/features/loanOrderMobiles/components/loanOrderMobileForm";
import { useLoanOrderMobileById } from "@/features/loanOrderMobiles/hooks/useLoanOrderMobiles";

export default function LoanOrderMobilesEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data, isLoading, isError } = useLoanOrderMobileById(id ?? "");

  if (isLoading) return <PageSpinner />;
  if (isError || !data) return <PageError message={t('common.notFound', 'Maglumat ýüklenilmedi')} />;

  return <LoanOrderMobileForm mode="edit" initialData={data} />;
}
