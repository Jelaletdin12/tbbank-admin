import { useTranslation } from 'react-i18next'
import { DistrictForm } from '@/features/districts/components/districtsForm'

export default function DistrictCreatePage() {
  const { t } = useTranslation()

  return (
    <div >
      <div className="mb-6">
       

        <h1 className="text-2xl font-bold text-foreground">
          {t('districts.create.title', 'Etrap döretmek')}
        </h1>
      </div>

      <DistrictForm mode="create" />
    </div>
  )
}
