import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { CardPinForm } from '@/features/cardPins/components/cardPinForm'
import { useCardPin } from '@/features/cardPins/hooks/useCardPins'

export default function CardPinEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useCardPin(id ?? '')

  if (isLoading) return <PageSpinner />
  if (isError || !data) return <PageError message={t('common.notFound', 'Maglumat tapylmady')} />

  return <CardPinForm mode="edit" initialData={data} />
}
