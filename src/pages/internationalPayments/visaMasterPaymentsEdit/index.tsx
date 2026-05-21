import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { IntlPaymentForm } from '@/features/visaMasterPayments/components/intlPaymentForm'
import { useIntlPayment } from '@/features/visaMasterPayments/hooks/useVisaMasterPayments'

export default function IntlPaymentEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useIntlPayment(id ?? '')

  if (isLoading) return <PageSpinner />
  if (isError || !data) return <PageError message={t('common.notFound', 'Maglumat tapylmady')} />

  return <IntlPaymentForm mode="edit" initialData={data} />
}
