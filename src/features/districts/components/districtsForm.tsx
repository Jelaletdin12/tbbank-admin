import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { FormActions } from '@/components/formActions'
import { FormInput } from '@/components/formInput'
import type { District, CreateDistrictPayload } from '../api/districtsApi'
import { useCreateDistrict, useUpdateDistrict } from '../hooks/useDistricts'

interface FormErrors {
  nameTk?: string
  nameRu?: string
  nameEn?: string
}

interface FormState {
  nameTk: string
  nameRu: string
  nameEn: string
  description: string
  isActive: boolean
}

export interface DistrictFormProps {
  mode: 'create' | 'edit'
  initialData?: District
  districtId?: number
}

type LangKey = 'tk' | 'ru' | 'en'

const LANG_TABS: { key: LangKey; label: string }[] = [
  { key: 'tk', label: 'Türkmen' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
]

function buildInitialState(data?: District): FormState {
  if (!data) {
    return { nameTk: '', nameRu: '', nameEn: '', description: '', isActive: true }
  }
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    description: data.description ?? '',
    isActive: data.isActive,
  }
}

function validate(form: FormState, t: (k: string, fb: string) => string): FormErrors {
  const errors: FormErrors = {}
  if (!form.nameTk.trim()) errors.nameTk = t('validation.required', 'Hökmany meýdan')
  if (!form.nameRu.trim()) errors.nameRu = t('validation.required', 'Hökmany meýdan')
  if (!form.nameEn.trim()) errors.nameEn = t('validation.required', 'Hökmany meýdan')
  return errors
}

export function DistrictForm({ mode, initialData, districtId }: DistrictFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateDistrict()
  const updateMutation = useUpdateDistrict()

  const isPending = createMutation.isPending || updateMutation.isPending

  const [activeLang, setActiveLang] = useState<LangKey>('tk')
  const [form, setForm] = useState<FormState>(() => buildInitialState(initialData))
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (initialData) setForm(buildInitialState(initialData))
  }, [initialData])

  const set = (key: keyof FormState) => (value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    const errs = validate(form, t)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})

    const payload: CreateDistrictPayload = {
      name: { tk: form.nameTk, ru: form.nameRu, en: form.nameEn },
      description: form.description.trim() || null,
      isActive: form.isActive,
    }

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/settings/location/districts'),
      })
    } else if (districtId !== undefined) {
      updateMutation.mutate(
        { id: districtId, ...payload },
        { onSuccess: () => navigate('/settings/location/districts') },
      )
    }
  }

  const nameFieldKey = `name${activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}` as
    | 'nameTk'
    | 'nameRu'
    | 'nameEn'
  const nameErrorKey = nameFieldKey as keyof FormErrors

  return (
    <div>
      <div className="flex gap-3 justify-end mb-4">
        {LANG_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveLang(tab.key)}
            className={`text-sm transition-colors ${
              activeLang === tab.key
                ? 'text-primary font-semibold underline underline-offset-4'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('districts.fields.name', 'Ady')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="text"
            value={form[nameFieldKey]}
            onChange={set(nameFieldKey)}
            placeholder={t('districts.fields.name', 'Ady')}
            error={errors[nameErrorKey]}
          />
        </div>

        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('districts.fields.description', 'Bellikler')}
          </span>
          <FormInput
            type="text"
            value={form.description}
            onChange={set('description')}
            placeholder={t('districts.fields.description', 'Bellikler')}
          />
        </div>

        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4">
          <span className="text-sm text-muted-foreground">
            {t('districts.fields.isActive', 'Işjeň')}
          </span>
          <Checkbox
            checked={form.isActive}
            onCheckedChange={(checked) => set('isActive')(!!checked)}
          />
        </div>
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/settings/location/districts')}
        cancelVariant="ghost"
        submitLabel={mode === 'create'
          ? t('districts.actions.create', 'Etrap döret')
          : t('districts.actions.update', 'Täzelemek')}
        className="mt-6"
      />
    </div>
  )
}
