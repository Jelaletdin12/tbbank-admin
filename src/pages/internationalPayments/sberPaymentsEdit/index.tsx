import { useParams } from 'react-router-dom'
import { SberPaymentForm } from '@/features/sberPayments/components/sberPaymentsForm'
import { useSberPaymentOrder } from '@/features/sberPayments/hooks/useSberPayments'
import { Spinner } from '@/components/ui/spinner'

export default function SberPaymentEditPage() {
  const params = useParams()
  const id = params.id as string
  
  const { data: order, isLoading } = useSberPaymentOrder(id)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }
  
  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6">
        Sber toleg (talyplar ucin) uytgetmek: {id}
      </h1>
      <SberPaymentForm mode="edit" initialData={order} orderId={id} />
    </div>
  )
}
