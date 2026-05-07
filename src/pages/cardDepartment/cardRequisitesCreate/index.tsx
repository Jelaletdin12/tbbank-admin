import { useTranslation } from 'react-i18next'
import { CardRequisiteForm } from '@/features/cardRequisites/components/cardRequisiteForm'

export default function CardRequisiteCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">
        {t('Create card requisite order', 'Kart rekwiziti üçin sargyt dörediň dörediň')}
      </h1>
      <CardRequisiteForm mode="create" />
    </div>
  )
}
