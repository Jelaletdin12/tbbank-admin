// pages/VisaMasterSettingCreatePage.tsx

import { useTranslation } from 'react-i18next'
import { VisaMasterSettingForm } from '@/features/visaMasterSberSettings/components/visaMasterSberSettingsForm'

// ─── VisaMasterSettingCreatePage ──────────────────────────────────────────────

export default function VisaMasterSettingCreatePage() {
  const { t }    = useTranslation()

  return (
    <div className="p-6">
      

      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('visaMasterSettings.actions.create', 'Visa/Master, Sber sazlamalar dörediň')}
      </h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <VisaMasterSettingForm mode="create" />
      </div>
    </div>
  )
}