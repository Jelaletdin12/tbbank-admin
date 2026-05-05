import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoanRemainingForm } from '@/features/loanRemaining/components/LoanRemainingForm'
import { useLoanRemainingById } from '@/features/loanRemaining/hooks/useLoanRemaining'
import { Skeleton } from '@/components/ui/skeleton'

function LoanRemainingEditSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <div className="bg-card border border-border rounded-xl p-6 h-[250px]">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}

export default function LoanRemainingEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useLoanRemainingById(id)

  if (isLoading) return <LoanRemainingEditSkeleton />

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t('common.notFound', 'Tapylmady')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t('loanRemaining.edit.title', 'Karz galyndysyny üýtget')}: {data.id}
        </h1>
      </div>

      <LoanRemainingForm mode="edit" initialData={data} loanRemainingId={id} />
    </div>
  )
}
