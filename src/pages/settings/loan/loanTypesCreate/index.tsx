// pages/LoanTypeCreatePage.tsx

import { useTranslation } from 'react-i18next'
import { LoanTypeForm } from '@/features/loanTypes/components/loanTypesForm'

export default function LoanTypeCreatePage() {
  const { t } = useTranslation()

  return (
    <div>
     

      <h1 className="text-xl font-semibold text-foreground mb-5">
        {t('loanTypes.actions.create', 'Karz görnüşi dörediň')}
      </h1>

      <LoanTypeForm mode="create" />
    </div>
  )
}