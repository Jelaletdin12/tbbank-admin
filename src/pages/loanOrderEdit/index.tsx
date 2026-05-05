import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { LoanOrderForm } from '@/features/loanOrders/components/loanOrderForm'
import { useLoanOrderById } from '@/features/loanOrders/hooks/useLoanOrders'

export default function LoanOrderEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useLoanOrderById(id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-destructive">
          Maglumat ýüklenilmedi. Sahypany täzeleläň.
        </p>
      </div>
    )
  }

  return (
    <LoanOrderForm
      mode="edit"
      initialData={data}
      loanOrderId={id}
    />
  )
}