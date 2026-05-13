import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DistrictForm } from '@/features/districts/components/districtsForm'

export default function DistrictCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="p-6">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/settings/location/districts')}
          >
            {t('nav.settings', 'Sazlamalar')}
          </span>
          <span>›</span>
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/settings/location/districts')}
          >
            {t('districts.title', 'Etraplar')}
          </span>
          <span>›</span>
          <span className="text-foreground font-medium">
            {t('districts.create.breadcrumb', 'Etrap döretmek')}
          </span>
        </nav>

        <h1 className="text-2xl font-bold text-foreground">
          {t('districts.create.title', 'Etrap döretmek')}
        </h1>
      </div>

      <DistrictForm mode="create" />
    </div>
  )
}
