import { useTranslation } from 'react-i18next'
import { CardBalanceForm } from '@/features/cardBalance/components/cardBalanceForm'

export default function CardBalanceCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground tracking-tight">
        {t('Create card balance', 'Kart galyndysy dörediň')}
      </h1>

      <CardBalanceForm mode="create" />
    </div>
  )
}
