import { useTranslation } from 'react-i18next'
import { BranchForm } from '@/features/branches/components/branchesForm'

export default function BranchCreatePage() {
  const { t } = useTranslation()

  return (
    <div >
      <div className="mb-6">
    

        <h1 className="text-2xl font-bold text-foreground">
          {t('branches.create.title', 'Şahamça döretmek')}
        </h1>
      </div>

      <BranchForm mode="create" />
    </div>
  )
}
