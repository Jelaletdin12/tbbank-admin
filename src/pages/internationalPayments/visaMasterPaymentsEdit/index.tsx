import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IntlPaymentForm } from '@/features/visaMasterPayments/components/IntlPaymentForm'
import { useIntlPayment, useUpdateIntlPayment } from '@/features/visaMasterPayments/hooks/useVisaMasterPayments'
import type { IntlPaymentUpdatePayload } from '@/features/visaMasterPayments/api/visaMasterPaymentsApi'
import { Spinner } from '@/components/ui/spinner'

export default function IntlPaymentEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, isError } = useIntlPayment(id!)
  const { mutate: updatePayment, isPending } = useUpdateIntlPayment(id!)

  const handleSubmit = (payload: IntlPaymentUpdatePayload) => {
    updatePayment(payload, {
      onSuccess: () => navigate(`/intl-payments/visa-master/${id}`),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        {t('common.notFound', 'Maglumat tapylmady')}
      </div>
    )
  }

  return (
    <IntlPaymentForm
      mode="edit"
      initialData={data}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  )
}
