import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormInput } from '@/components/formInput'
import type { CardType, CreateCardTypePayload } from '../api/cardTypesApi'
import { useCreateCardType, useUpdateCardType } from '../hooks/useCardTypes'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  nameTk?: string
  nameRu?: string
  nameEn?: string
  value?: string
}

interface FormState {
  nameTk: string
  nameRu: string
  nameEn: string
  value: string
  description: string
  isActive: boolean
}

export interface CardTypeFormProps {
  mode: 'create' | 'edit'
  initialData?: CardType
  cardTypeId?: number
}

type LangKey = 'tk' | 'ru' | 'en'

const LANG_TABS: { key: LangKey; label: string }[] = [
  { key: 'tk', label: 'Türkmen' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialState(data?: CardType): FormState {
  if (!data) {
    return { nameTk: '', nameRu: '', nameEn: '', value: '', description: '', isActive: true }
  }
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    value: String(data.value),
    description: data.description ?? '',
    isActive: data.isActive,
  }
}

function validate(form: FormState, t: (k: string, fb: string) => string): FormErrors {
  const errors: FormErrors = {}
  if (!form.nameTk.trim()) errors.nameTk = t('validation.required', 'Hökmany meýdan')
  if (!form.nameRu.trim()) errors.nameRu = t('validation.required', 'Hökmany meýdan')
  if (!form.nameEn.trim()) errors.nameEn = t('validation.required', 'Hökmany meýdan')
  if (!form.value.trim() || isNaN(Number(form.value)) || Number(form.value) < 0)
    errors.value = t('validation.invalidNumber', 'Dogry san giriziň')
  return errors
}

// ─── CardTypeForm ─────────────────────────────────────────────────────────────

export function CardTypeForm({ mode, initialData, cardTypeId }: CardTypeFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateCardType()
  const updateMutation = useUpdateCardType()

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

    const payload: CreateCardTypePayload = {
      name: { tk: form.nameTk, ru: form.nameRu, en: form.nameEn },
      value: Number(form.value),
      description: form.description.trim() || null,
      isActive: form.isActive,
    }

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/settings/card/card-types'),
      })
    } else if (cardTypeId !== undefined) {
      updateMutation.mutate(
        { id: cardTypeId, ...payload },
        { onSuccess: () => navigate('/settings/card/card-types') }
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
      {/* Language tabs */}
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

      {/* Form rows */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Name */}
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('cardTypes.fields.name', 'Ady')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="text"
            value={form[nameFieldKey]}
            onChange={set(nameFieldKey)}
            placeholder={t('cardTypes.fields.name', 'Ady')}
            error={errors[nameErrorKey]}
          />
        </div>

        {/* Value */}
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('cardTypes.fields.value', 'Baha')}
          </span>
          <FormInput
            type="number"
            value={form.value}
            onChange={set('value')}
            placeholder={t('cardTypes.fields.value', 'Baha')}
            error={errors.value}
          />
        </div>

        {/* Description */}
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('cardTypes.fields.description', 'Bellikler')}
          </span>
          <FormInput
            type="text"
            value={form.description}
            onChange={set('description')}
            placeholder={t('cardTypes.fields.description', 'Bellikler')}
          />
        </div>

        {/* isActive */}
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4">
          <span className="text-sm text-muted-foreground">
            {t('cardTypes.fields.isActive', 'Işjeň')}
          </span>
          <Checkbox
            checked={form.isActive}
            onCheckedChange={(checked) => set('isActive')(!!checked)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/settings/card/card-types')}
          disabled={isPending}
        >
          {t('common.cancel', 'Ýatyr')}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending
            ? t('common.saving', 'Saklanýar...')
            : mode === 'create'
            ? t('cardTypes.actions.create', 'Kart görnüşi döretdiň')
            : t('cardTypes.actions.update', 'Täzelemek')}
        </Button>
      </div>
    </div>
  )
}
