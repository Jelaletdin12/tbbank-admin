import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { CardTypeForm } from '@/features/cardTypes/components/cardTypesForm'
import { useCardTypeById } from '@/features/cardTypes/hooks/useCardTypes'

export default function CardTypeEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const numericId = Number(id)
  const { data, isLoading, isError } = useCardTypeById(numericId)

  if (isLoading) return <PageSpinner />
  if (isError || !data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <CardTypeForm mode="edit" initialData={data} />
}
