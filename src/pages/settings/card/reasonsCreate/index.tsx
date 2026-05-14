import { useTranslation } from 'react-i18next'
import { CardReasonForm } from '@/features/cardReasons/components/reasonForm'

export function CardReasonCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="p-6">
      <div className="mb-6">
     
        <h1 className="text-2xl font-bold text-foreground">
          {t('CardReasons.create.title', 'Kartyň çykarylmagynyň sebäbi dörediň')}
        </h1>
      </div>

      <CardReasonForm mode="create" />
    </div>
  )
}

export default CardReasonCreatePage
