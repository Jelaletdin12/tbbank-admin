import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { LoanPaidOffLetterForm } from '@/features/loanPaidOffLetters/components/LoanPaidOffLetterForm'
import { useLoanPaidOffLetterById } from '@/features/loanPaidOffLetters/hooks/useLoanPaidOffLetters'

export default function LoanPaidOffLettersEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useLoanPaidOffLetterById(id)

  if (isLoading) return <PageSpinner />
  if (!data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <LoanPaidOffLetterForm mode="edit" initialData={data} />
}
