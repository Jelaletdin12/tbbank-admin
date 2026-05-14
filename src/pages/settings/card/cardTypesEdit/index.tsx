import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CardTypeForm } from '@/features/cardTypes/components/cardTypesForm'
import { useCardTypeById } from '@/features/cardTypes/hooks/useCardTypes'

export default function CardTypeEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const numericId = Number(id)
  const { data, isLoading, isError } = useCardTypeById(numericId)

  return (
    <div className="p-6">
      <div className="mb-6">
    

        <h1 className="text-2xl font-bold text-foreground">
          {isLoading
            ? '...'
            : `${t('cardTypes.edit.title', 'Kart görnüşini üýtgetmek')}: ${data?.name.tk ?? ''}`}
        </h1>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border last:border-0"
            >
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : isError || !data ? (
        <div className="flex items-center justify-center py-20 text-destructive text-sm">
          {t('common.error', 'Ýalňyşlyk ýüze çykdy')}
        </div>
      ) : (
        <CardTypeForm mode="edit" initialData={data} cardTypeId={numericId} />
      )}
    </div>
  )
}
