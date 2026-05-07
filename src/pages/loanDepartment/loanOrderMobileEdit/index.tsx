import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { LoanOrderMobileForm } from "@/features/loanOrderMobiles/components/loanOrderMobileForm";
import { useLoanOrderMobileById } from "@/features/loanOrderMobiles/hooks/useLoanOrderMobiles";

export default function LoanOrderMobilesEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useLoanOrderMobileById(id ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-destructive">
          Maglumat ýüklenilmedi. Sahypany täzeleläň.
        </p>
      </div>
    );
  }

  return (
    <LoanOrderMobileForm mode="edit" initialData={data} loanOrderId={id} />
  );
}
