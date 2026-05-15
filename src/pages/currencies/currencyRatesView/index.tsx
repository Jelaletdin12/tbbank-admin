// pages/CurrencyRateDetailPage.tsx

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section, InfoRow } from '@/components/viewPageComponents'
import { useGetCurrencyRateById, useDeleteCurrencyRate } from '@/features/currencyRates/hooks/useCurrencyRates'
import { ConfirmDialog } from '@/components/confirmDialog'

// ─── CurrencyRateDetailPage ───────────────────────────────────────────────────

export default function CurrencyRateDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const numericId = Number(id)
  const { t }     = useTranslation()
  const navigate  = useNavigate()

  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: rate, isLoading } = useGetCurrencyRateById(numericId)
  const deleteMutation             = useDeleteCurrencyRate()

  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync(numericId)
    navigate('/resources/currency-rates')
  }

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
    

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {t('currencyRates.detail.title', 'Walýuta kursy giňişleýin')}: {rate.id}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            title={t('common.delete', 'Pozmak')}
          >
            <Trash2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/resources/currency-rates/${rate.id}/edit`)}
            title={t('common.edit', 'Üýtgetmek')}
          >
            <Pencil size={18} />
          </Button>
        </div>
      </div>

      {/* Detail Card */}
      <Section>
        <InfoRow label="ID"                                                            value={rate.id}           />
        <InfoRow label={t('currencyRates.fields.currencyFrom', 'Currency from')}      value={rate.currencyFrom} />
        <InfoRow label={t('currencyRates.fields.currencyTo',   'Currency to')}        value={rate.currencyTo}   />
        <InfoRow label={t('currencyRates.fields.value',        'Value')}              value={rate.value}        />
        <InfoRow label={t('common.createdAt', 'Döredilen senesi')}
          value={new Date(rate.createdAt).toLocaleString()}
        />
        <InfoRow label={t('common.updatedAt', 'Üýtgedilen senesi')}
          value={new Date(rate.updatedAt).toLocaleString()}
        />
      </Section>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('currencyRates.deleteDialog.title', 'Pozmak isleýärsiňizmi?')}
        description={t('currencyRates.deleteDialog.description', 'Bu amal yzyna gaýtarylyp bilinmez. Walýuta kursy hemişelik pozular.')}
        confirmLabel={deleteMutation.isPending ? t('common.deleting', 'Pozulýar...') : t('common.delete', 'Pozmak')}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}