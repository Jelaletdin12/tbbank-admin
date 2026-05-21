import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { LoanTypeForm } from '@/features/loanTypes/components/loanTypesForm'
import { useGetLoanTypeById } from '@/features/loanTypes/hooks/useLoanTypes'

export default function LoanTypeEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const { data, isLoading, isError } = useGetLoanTypeById(numericId)

  if (isLoading) return <PageSpinner />
  if (isError || !data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <LoanTypeForm mode="edit" initialData={data} />
}
