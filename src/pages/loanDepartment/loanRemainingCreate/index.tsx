import { useTranslation } from 'react-i18next'
import { LoanRemainingForm } from '@/features/loanRemaining/components/LoanRemainingForm'

export default function LoanRemainingCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t('loanRemaining.create.title', 'Täze karz galyndysy')}
        </h1>
      </div>

      <LoanRemainingForm mode="create" />
    </div>
  )
}
