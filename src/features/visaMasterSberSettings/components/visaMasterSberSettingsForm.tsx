// features/visaMasterSettings/components/VisaMasterSettingForm.tsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { type VisaMasterSetting } from '../api/visaMasterSberSettingsApi'
import {
  useCreateVisaMasterSetting,
  useUpdateVisaMasterSetting,
} from '../hooks/useVisaMasterSettings'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  kod:   string
  ady:   string
  yazgy: string
}

interface FormErrors {
  kod?:   string
  ady?:   string
  yazgy?: string
}

export interface VisaMasterSettingFormProps {
  mode:         'create' | 'edit'
  initialData?: VisaMasterSetting
  settingId?:   number
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(
  form: FormState,
  t: (key: string, fallback: string) => string
): FormErrors {
  const errors: FormErrors = {}

  if (!form.kod.trim())
    errors.kod = t('visaMasterSettings.errors.kodRequired', 'Kod giriziň')

  if (!form.ady.trim())
    errors.ady = t('visaMasterSettings.errors.adyRequired', 'Ady giriziň')

  if (!form.yazgy.trim())
    errors.yazgy = t('visaMasterSettings.errors.yazgyRequired', 'Yazgy giriziň')

  return errors
}

// ─── VisaMasterSettingForm ────────────────────────────────────────────────────

export function VisaMasterSettingForm({
  mode,
  initialData,
  settingId,
}: VisaMasterSettingFormProps) {
  const { t }    = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    kod:   initialData?.kod   ?? '',
    ady:   initialData?.ady   ?? '',
    yazgy: initialData?.yazgy ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const createMutation = useCreateVisaMasterSetting()
  const updateMutation = useUpdateVisaMasterSetting(settingId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  // Sync when initialData arrives (edit mode async fetch)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        kod:   initialData.kod,
        ady:   initialData.ady,
        yazgy: initialData.yazgy,
      })
    }
  }, [mode, initialData])

  const setField = (field: keyof FormState) => (val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async () => {
    const validationErrors = validate(form, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const payload = { kod: form.kod.trim(), ady: form.ady.trim(), yazgy: form.yazgy.trim() }

    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      navigate('/resources/visa-master-settings')
    } else {
      await updateMutation.mutateAsync(payload)
      navigate('/resources/visa-master-settings')
    }
  }

  const handleCancel = () => navigate('/resources/visa-master-settings')

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0">
      {/* Kod */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <label className="text-sm text-muted-foreground pt-1.5">
          {t('visaMasterSettings.fields.kod', 'Kod')}
          <span className="text-destructive ml-0.5">*</span>
        </label>
        <FormInput
          type="text"
          value={form.kod}
          onChange={setField('kod')}
          placeholder={t('visaMasterSettings.fields.kod', 'Kod')}
          error={errors.kod}
          disabled={isPending}
        />
      </div>

      {/* Ady */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <label className="text-sm text-muted-foreground pt-1.5">
          {t('visaMasterSettings.fields.ady', 'Ady')}
          <span className="text-destructive ml-0.5">*</span>
        </label>
        <FormInput
          type="text"
          value={form.ady}
          onChange={setField('ady')}
          placeholder={t('visaMasterSettings.fields.ady', 'Ady')}
          error={errors.ady}
          disabled={isPending}
        />
      </div>

      {/* Yazgy */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6">
        <label className="text-sm text-muted-foreground pt-1.5">
          {t('visaMasterSettings.fields.yazgy', 'Yazgy')}
          <span className="text-destructive ml-0.5">*</span>
        </label>
        <FormInput
          type="textarea"
          value={form.yazgy}
          onChange={setField('yazgy')}
          placeholder={t('visaMasterSettings.fields.yazgy', 'Yazgy')}
          error={errors.yazgy}
          disabled={isPending}
          rows={3}
        />
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        cancelVariant="ghost"
        submitLabel={mode === 'create'
          ? t('visaMasterSettings.actions.create', 'Visa/Master, Sber sazlamalar dörediň')
          : t('visaMasterSettings.actions.update', 'Ýatda sakla')}
        className="px-6 py-4 border-t border-border"
      />
    </div>
  )
}