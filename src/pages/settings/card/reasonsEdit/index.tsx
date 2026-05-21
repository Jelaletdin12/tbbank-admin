import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { CardReasonForm } from '@/features/cardReasons/components/reasonForm'
import { useCardReasonById } from '@/features/cardReasons/hooks/useCardReasons'

export default function CardReasonEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const numericId = Number(id)
  const { data, isLoading } = useCardReasonById(numericId)

  if (isLoading) return <PageSpinner />
  if (!data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <CardReasonForm mode="edit" initialData={data} />
}
