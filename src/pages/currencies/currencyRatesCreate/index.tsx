// pages/CurrencyRateCreatePage.tsx

import { useTranslation } from 'react-i18next'
import { CurrencyRateForm } from '@/features/currencyRates/components/currencyRatesForm'

// ─── CurrencyRateCreatePage ───────────────────────────────────────────────────

export default function CurrencyRateCreatePage() {
  const { t }    = useTranslation()

  return (
    <div>
    
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('currencyRates.actions.create', 'Walýuta kursy dörediň')}
      </h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <CurrencyRateForm mode="create" />
      </div>
    </div>
  )
}