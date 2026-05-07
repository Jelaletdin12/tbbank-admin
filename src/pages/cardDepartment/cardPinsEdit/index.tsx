import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CardPinForm } from '@/features/cardPins/components/cardPinForm'
import { useCardPin, useUpdateCardPin } from '@/features/cardPins/hooks/useCardPins'
import type { CardPinUpdatePayload } from '@/features/cardPins/api/cardPinApi'
import { Spinner } from '@/components/ui/spinner'

export default function CardPinEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, isError } = useCardPin(id!)
  const { mutate: updatePin, isPending } = useUpdateCardPin(id!)

  const handleSubmit = (payload: CardPinUpdatePayload) => {
    updatePin(payload, {
      onSuccess: () => navigate(`/card-pins/${id}`),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        {t('common.notFound', 'Maglumat tapylmady')}
      </div>
    )
  }

  return (
    <CardPinForm
      mode="edit"
      initialData={data}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  )
}