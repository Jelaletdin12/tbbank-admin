// ─── OperatorCreatePage.tsx ───────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'
import { OperatorForm } from '@/features/operators/components/operatorForms'

export default function OperatorCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="p-6">
      {/* Page heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('operators.createTitle', 'Operator döredin')}
      </h1>

      <OperatorForm mode="create" />
    </div>
  )
}