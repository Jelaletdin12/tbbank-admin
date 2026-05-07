import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { CardOrderForm }    from '@/features/orderNewCard/components/orderNewCardForm'
import { useCardOrderById } from '@/features/orderNewCard/hooks/useOrderNewCard'
 
export default function CardOrderEditPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t }    = useTranslation()
 
  const { data: order, isLoading } = useCardOrderById(id ?? '')
 
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
 
  if (!order) {
    return (
      <p className="text-muted-foreground text-sm">
        {t('common.notFound', 'Tapylmady')}
      </p>
    )
  }
 
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          {t('cardOrder.editTitle', 'Düzetmek')}:{' '}
          <span className="text-primary font-mono">{order.id}</span>
        </h1>
      </div>
 
      <CardOrderForm
        mode="edit"
        initialData={order}
        cardOrderId={id}
        onSuccess={() => navigate(`/order-new-card/${id}`)}
        onCancel={()  => navigate(`/order-new-card/${id}`)}
      />
    </div>
  )
}