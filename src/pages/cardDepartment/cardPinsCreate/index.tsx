import { useNavigate } from 'react-router-dom'
import { CardPinForm } from '@/features/cardPins/components/cardPinForm'
import { useCreateCardPin } from '@/features/cardPins/hooks/useCardPins'
import type { CardPinCreatePayload } from '@/features/cardPins/api/cardPinApi'

export default function CardPinCreatePage() {
  const navigate = useNavigate()
  const { mutate: createPin, isPending } = useCreateCardPin()

  const handleSubmit = (payload: CardPinCreatePayload) => {
    createPin(payload, {
      onSuccess: (data) => navigate(`/card-pins/${data.id}`),
    })
  }

  return (
    <CardPinForm
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  )
}