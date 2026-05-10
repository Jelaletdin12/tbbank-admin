// ─── OperatorCreatePage.tsx ───────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { OperatorForm } from '@/features/operators/components/operatorForms'

export default function OperatorCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <span
          className="cursor-pointer hover:text-foreground transition-colors"
          onClick={() => navigate('/operators')}
        >
          {t('operators.title', 'Operatorlar')}
        </span>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">
          {t('operators.createTitle', 'Operator döredin')}
        </span>
      </nav>

      {/* Page heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('operators.createTitle', 'Operator döredin')}
      </h1>

      <OperatorForm mode="create" />
    </div>
  )
}