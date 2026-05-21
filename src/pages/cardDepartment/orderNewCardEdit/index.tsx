import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { CardOrderForm } from '@/features/orderNewCard/components/orderNewCardForm'
import { useCardOrderById } from '@/features/orderNewCard/hooks/useOrderNewCard'

export default function CardOrderEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data: order, isLoading } = useCardOrderById(id ?? '')

  if (isLoading) return <PageSpinner />
  if (!order) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <CardOrderForm mode="edit" initialData={order} />
}
