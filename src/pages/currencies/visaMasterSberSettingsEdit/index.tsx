// pages/VisaMasterSettingEditPage.tsx

import {useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { VisaMasterSettingForm } from '@/features/visaMasterSberSettings/components/visaMasterSberSettingsForm'
import { useGetVisaMasterSettingById } from '@/features/visaMasterSberSettings/hooks/useVisaMasterSettings'

// ─── VisaMasterSettingEditPage ────────────────────────────────────────────────

export default function VisaMasterSettingEditPage() {
  const { id }    = useParams<{ id: string }>()
  const numericId = Number(id)
  const { t }     = useTranslation()

  const { data: setting, isLoading } = useGetVisaMasterSettingById(numericId)

  // ─── Loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-72 bg-muted rounded animate-pulse" />
        <div className="h-56 bg-muted rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!setting) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          {t('visaMasterSettings.notFound', 'Sazlama tapylmady')}
        </p>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
     

      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('visaMasterSettings.detail.editTitle', 'Sazlamany üýtgetmek')}: {setting.id}
      </h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <VisaMasterSettingForm
          mode="edit"
          initialData={setting}
          settingId={numericId}
        />
      </div>
    </div>
  )
}