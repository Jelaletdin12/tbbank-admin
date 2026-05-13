import { useNavigate, } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CardReasonForm } from '@/features/cardReasons/components/reasonForm'

export function CardReasonCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="p-6">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/resources/card-states')}
          >
            {t('nav.resources', 'Resurslar')}
          </span>
          <span>›</span>
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/resources/card-states')}
          >
            {t('CardReasons.title', 'Kartyň çykarylmagynyň sebäpleri')}
          </span>
          <span>›</span>
          <span className="text-foreground font-medium">
            {t('CardReasons.create.breadcrumb', 'Kartyň çykarylmagynyň sebäbi dörediň')}
          </span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">
          {t('CardReasons.create.title', 'Kartyň çykarylmagynyň sebäbi dörediň')}
        </h1>
      </div>

      <CardReasonForm mode="create" />
    </div>
  )
}

export default CardReasonCreatePage
