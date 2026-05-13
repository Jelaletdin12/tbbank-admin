import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BranchForm } from '@/features/branches/components/branchesForm'
import { useBranchById } from '@/features/branches/hooks/useBranches'
import { Loader2 } from 'lucide-react'

export default function BranchEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const numericId = Number(id)
  const { data, isLoading, isError } = useBranchById(numericId)

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
            {t('branches.edit.breadcrumb', 'Üýtgetmek')}
          </span>
        </nav>

        <h1 className="text-2xl font-bold text-foreground">
          {isLoading
            ? '...'
            : `${t('branches.edit.title', 'Şahamçany üýtgetmek')}: ${data?.name.tk ?? ''}`}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : isError || !data ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-destructive">
            {t('common.error', 'Maglumat ýüklenilmedi. Sahypany täzeleläň.')}
          </p>
        </div>
      ) : (
        <BranchForm mode="edit" initialData={data} branchId={numericId} />
      )}
    </div>
  )
}
