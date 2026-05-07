import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CardOrderForm } from '@/features/orderNewCard/components/orderNewCardForm'
 
export default function CardOrderCreatePage() {
  const navigate = useNavigate()
  const { t }    = useTranslation()
 
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          {t('cardOrder.createTitle', 'Kart sargyt dörediň')}
        </h1>
      </div>
 
      <CardOrderForm
        mode="create"
        onSuccess={() => navigate('/order-new-card')}
        onCancel={()  => navigate('/order-new-card')}
      />
    </div>
  )
}