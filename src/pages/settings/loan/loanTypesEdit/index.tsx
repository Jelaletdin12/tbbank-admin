// pages/LoanTypeEditPage.tsx

import {  useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoanTypeForm } from '@/features/loanTypes/components/loanTypesForm'
import { useGetLoanTypeById } from '@/features/loanTypes/hooks/useLoanTypes'
import { Skeleton } from '@/components/ui/skeleton'

export default function LoanTypeEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const loanTypeId = Number(id)

  const { data, isLoading, isError } = useGetLoanTypeById(loanTypeId)

  return (
    <div>

      <h1 className="text-xl font-semibold text-foreground mb-5">
        {isLoading
          ? t('common.loading', 'Ýüklenýär...')
          : `${t('loanTypes.editTitle', 'Karz görnüşi redaktirle')}: ${data?.name.tk ?? ''}`}
      </h1>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-20 text-destructive text-sm">
          {t('common.error', 'Ýalňyşlyk ýüze çykdy')}
        </div>
      ) : (
        <LoanTypeForm
          mode="edit"
          initialData={data}
          loanTypeId={loanTypeId}
        />
      )}
    </div>
  )
}