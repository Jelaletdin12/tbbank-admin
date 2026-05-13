import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CardTypeForm } from '@/features/cardTypes/components/cardTypesForm'

export default function CardTypeCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="p-6">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/settings/card/card-types')}
          >
            {t('nav.settings', 'Sazlamalar')}
          </span>
          <span>›</span>
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/settings/card/card-types')}
          >
            {t('cardTypes.title', 'Kart görnüşleri')}
          </span>
          <span>›</span>
          <span className="text-foreground font-medium">
            {t('cardTypes.create.breadcrumb', 'Kart görnüşi döretmek')}
          </span>
        </nav>

        <h1 className="text-2xl font-bold text-foreground">
          {t('cardTypes.create.title', 'Kart görnüşi döretmek')}
        </h1>
      </div>

      <CardTypeForm mode="create" />
    </div>
  )
}
