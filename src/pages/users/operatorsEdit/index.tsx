import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { OperatorForm } from '@/features/operators/components/operatorForms'
import { useOperator } from '@/features/operators/hooks/useOperators'

export default function OperatorEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const numericId = Number(id)
  const { data: operator, isLoading } = useOperator(numericId)

  if (isLoading) return <PageSpinner />
  if (!operator) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <OperatorForm mode="edit" initialData={operator} />
}
