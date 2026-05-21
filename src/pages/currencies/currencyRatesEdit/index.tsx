import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { CurrencyRateForm } from '@/features/currencyRates/components/currencyRatesForm'
import { useGetCurrencyRateById } from '@/features/currencyRates/hooks/useCurrencyRates'

export default function CurrencyRateEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const numericId = Number(id)
  const { data: rate, isLoading } = useGetCurrencyRateById(numericId)

  if (isLoading) return <PageSpinner />
  if (!rate) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <CurrencyRateForm mode="edit" initialData={rate} />
}
