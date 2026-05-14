import { useTranslation } from 'react-i18next'
import { CardTypeForm } from '@/features/cardTypes/components/cardTypesForm'

export default function CardTypeCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="p-6">
      <div className="mb-6">
        

        <h1 className="text-2xl font-bold text-foreground">
          {t('cardTypes.create.title', 'Kart görnüşi döretmek')}
        </h1>
      </div>

      <CardTypeForm mode="create" />
    </div>
  )
}
