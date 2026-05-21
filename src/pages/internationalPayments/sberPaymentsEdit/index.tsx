import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { SberPaymentForm } from '@/features/sberPayments/components/sberPaymentsForm'
import { useSberPaymentOrder } from '@/features/sberPayments/hooks/useSberPayments'

export default function SberPaymentEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data: order, isLoading } = useSberPaymentOrder(id ?? '')

  if (isLoading) return <PageSpinner />
  if (!order) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <SberPaymentForm mode="edit" initialData={order} />
}
