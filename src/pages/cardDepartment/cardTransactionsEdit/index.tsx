import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { CardTransactionForm } from '@/features/cardTransactions/components/cardTransactionForm'
import { useCardTransaction } from '@/features/cardTransactions/hooks/useCardTransactions'

export default function CardTransactionEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const { data, isLoading } = useCardTransaction(numericId)

  if (isLoading) return <PageSpinner />
  if (!data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <CardTransactionForm mode="edit" initialData={data} />
}
