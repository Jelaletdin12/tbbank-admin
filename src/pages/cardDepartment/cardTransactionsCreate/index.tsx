import { useTranslation } from 'react-i18next'
import { CardTransactionForm } from '@/features/cardTransactions/components/cardTransactionForm'

export default function CardTransactionCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">
        {t('Create card transaction', 'Kart herekedi dörediň')}
      </h1>
      <CardTransactionForm mode="create" />
    </div>
  )
}
