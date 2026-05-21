import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { CardRequisiteForm } from '@/features/cardRequisites/components/cardRequisiteForm'
import { useCardRequisite } from '@/features/cardRequisites/hooks/useCardRequisites'

export default function CardRequisiteEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data, isLoading } = useCardRequisite(id ?? '')

  if (isLoading) return <PageSpinner />
  if (!data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <CardRequisiteForm mode="edit" initialData={data} />
}
