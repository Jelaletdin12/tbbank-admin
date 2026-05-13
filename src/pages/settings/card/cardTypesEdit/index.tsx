import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CardTypeForm } from '@/features/cardTypes/components/cardTypesForm'
import { useCardTypeById } from '@/features/cardTypes/hooks/useCardTypes'

export default function CardTypeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const numericId = Number(id)
  const { data, isLoading, isError } = useCardTypeById(numericId)

  return (
    <div className="p-6">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/settings/card/card-types')}
          >
            {t('nav.settings', 'Sazlamalar')}
          </span>
          <span>›</span>
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate('/settings/card/card-types')}
          >
            {t('cardTypes.title', 'Kart görnüşleri')}
          </span>
          <span>›</span>
          <span className="text-foreground font-medium">
            {t('cardTypes.edit.breadcrumb', 'Üýtgetmek')}
          </span>
        </nav>

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
