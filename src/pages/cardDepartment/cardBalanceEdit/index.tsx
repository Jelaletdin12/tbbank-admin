import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { CardBalanceForm } from '@/features/cardBalance/components/cardBalanceForm'
import { useCardBalance } from '@/features/cardBalance/hooks/useCardBalance'

export default function CardBalanceEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const { data, isLoading } = useCardBalance(numericId)

  if (isLoading) return <PageSpinner />
  if (!data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <CardBalanceForm mode="edit" initialData={data} />
}
