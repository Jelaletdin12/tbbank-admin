// ─── OperatorEditPage.tsx ─────────────────────────────────────────────────────

import { useParams,  } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { OperatorForm } from '@/features/operators/components/operatorForms'
import { useOperator } from '@/features/operators/hooks/useOperators'

export default function OperatorEditPage() {
  const { id } = useParams<{ id: string }>()
  const operatorId = Number(id)
  const { t } = useTranslation()

  const { data: operator, isLoading } = useOperator(operatorId)

  return (
    <div >
      {/* Page heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('operators.editTitle', 'Operator üýtget')}: {operator?.name ?? ''}
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <OperatorForm
          mode="edit"
          initialData={operator}
          operatorId={operatorId}
        />
      )}
    </div>
  )
}