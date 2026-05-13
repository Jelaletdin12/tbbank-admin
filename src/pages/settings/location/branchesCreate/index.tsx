import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BranchForm } from '@/features/branches/components/branchesForm'

export default function BranchCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="p-6">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/settings/location/branches')}
          >
            {t('nav.settings', 'Sazlamalar')}
          </span>
          <span>›</span>
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/settings/location/branches')}
          >
            {t('branches.title', 'Şahamçalar')}
          </span>
          <span>›</span>
          <span className="text-foreground font-medium">
            {t('branches.create.breadcrumb', 'Şahamça döretmek')}
          </span>
        </nav>

        <h1 className="text-2xl font-bold text-foreground">
          {t('branches.create.title', 'Şahamça döretmek')}
        </h1>
      </div>

      <BranchForm mode="create" />
    </div>
  )
}
