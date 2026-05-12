// pages/CurrencyRateEditPage.tsx

import {  useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CurrencyRateForm } from '@/features/currencyRates/components/currencyRatesForm'
import { useGetCurrencyRateById } from '@/features/currencyRates/hooks/useCurrencyRates'

// ─── CurrencyRateEditPage ─────────────────────────────────────────────────────

export default function CurrencyRateEditPage() {
  const { id }    = useParams<{ id: string }>()
  const numericId = Number(id)
  const { t }     = useTranslation()

  const { data: rate, isLoading } = useGetCurrencyRateById(numericId)

  // ─── Loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-64 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!rate) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          {t('currencyRates.notFound', 'Walýuta kursy tapylmady')}
        </p>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
     

      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('currencyRates.detail.editTitle', 'Walýuta kursyny üýtgetmek')}: {rate.id}
      </h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <CurrencyRateForm
          mode="edit"
          initialData={rate}
          rateId={numericId}
        />
      </div>
    </div>
  )
}