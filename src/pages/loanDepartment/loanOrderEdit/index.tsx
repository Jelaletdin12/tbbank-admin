import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageSpinner } from "@/components/pageSpinner";
import { PageError } from "@/components/pageError";
import { LoanOrderForm } from "@/features/loanOrders/components/loanOrderForm";
import { useLoanOrderById } from "@/features/loanOrders/hooks/useLoanOrders";

export default function LoanOrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data, isLoading, isError } = useLoanOrderById(id ?? "");

  if (isLoading) return <PageSpinner />;
  if (isError || !data) return <PageError message={t('common.notFound', 'Maglumat ýüklenilmedi')} />;

  return <LoanOrderForm mode="edit" initialData={data} />;
}
