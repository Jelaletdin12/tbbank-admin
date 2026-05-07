import { useNavigate } from 'react-router-dom'
import { IntlPaymentForm } from '@/features/visaMasterPayments/components/intlPaymentForm'
import { useCreateIntlPayment } from '@/features/visaMasterPayments/hooks/useVisaMasterPayments'
import type { IntlPaymentCreatePayload } from '@/features/visaMasterPayments/api/visaMasterPaymentsApi'

export default function IntlPaymentCreatePage() {
  const navigate = useNavigate()
  const { mutate: createPayment, isPending } = useCreateIntlPayment()

  const handleSubmit = (payload: IntlPaymentCreatePayload) => {
    createPayment(payload, {
      onSuccess: (data) => navigate(`/intl-payments/visa-master/${data.id}`),
    })
  }

  return (
    <IntlPaymentForm
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  )
}
