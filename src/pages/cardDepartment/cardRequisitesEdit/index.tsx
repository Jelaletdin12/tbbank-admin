import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { CardRequisiteForm } from '@/features/cardRequisites/components/cardRequisiteForm'
import { useCardRequisite } from '@/features/cardRequisites/hooks/useCardRequisites'

export default function CardRequisiteEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useCardRequisite(id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-7 text-primary" />
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
      <h1 className="text-xl font-semibold text-foreground">
        {t('Edit card requisite', 'Kart rekwizitini üýtget')}
      </h1>
      <CardRequisiteForm
        mode="edit"
        initialData={data}
        cardRequisiteId={data.id}
      />
    </div>
  )
}
