import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { CardBalanceForm } from '@/features/cardBalance/components/cardBalanceForm'
import { useCardBalance } from '@/features/cardBalance/hooks/useCardBalance'
 
export default function CardBalanceEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
 
  const numericId = Number(id)
  const { data, isLoading } = useCardBalance(numericId)
 
  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }
 
  if (!data) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        {t('Not found', 'Tapylmady')}
      </div>
    )
  }
 
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground tracking-tight">
        {t('Edit card balance', 'Kart galyndysyny düzetmek')}:{' '}
        <span className="text-primary font-mono">{data.id}</span>
      </h1>
 
      <CardBalanceForm
        mode="edit"
        initialData={data}
        cardBalanceId={numericId}
      />
    </div>
  )
}