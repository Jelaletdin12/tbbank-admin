import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@/components/ui/checkbox'
import { FormActions } from '@/components/formActions'
import { FormInput } from '@/components/formInput'
import type { CardType } from '../api/cardTypesApi'
import { useCreateCardType, useUpdateCardType } from '../hooks/useCardTypes'
import { createCardTypeFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/cardType.schema'
import type { CardTypeFormData } from '../schemas/cardType.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardTypeFormProps {
  mode: 'create' | 'edit'
  initialData?: CardType
}

type LangKey = 'tk' | 'ru' | 'en'

const LANG_TABS: { key: LangKey; label: string }[] = [
  { key: 'tk', label: 'Türkmen' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapInitial(data: CardType): CardTypeFormData {
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    value: String(data.value),
    description: data.description ?? '',
    isActive: data.isActive,
  }
}

type FlatErrors = Partial<Record<keyof CardTypeFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof CardTypeFormData] = msg
  }
  return result
}

// ─── CardTypeForm ─────────────────────────────────────────────────────────────

export function CardTypeForm({ mode, initialData }: CardTypeFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  )
  const navigate = useNavigate()

  const createMutation = useCreateCardType()
  const updateMutation = useUpdateCardType()

  const isPending = createMutation.isPending || updateMutation.isPending

  const [activeLang, setActiveLang] = useState<LangKey>('tk')

  const schema = useMemo(() => createCardTypeFormSchema(t), [t, i18n.language])

  const {
    watch,
    setValue,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
    getValues,
  } = useForm<CardTypeFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(
    () => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>),
    [rhfErrors],
  )

  const set = useCallback(
    (key: keyof CardTypeFormData) => (value: string | boolean) => {
      (setValue as (k: keyof CardTypeFormData, v: string | boolean) => void)(key, value)
      clearErrors(key)
    },
    [setValue, clearErrors],
  )

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

  const handleSubmit = useCallback(async () => {
    const isValid = await trigger()
    if (!isValid) return

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/settings/card/card-types'),
      })
    } else if (initialData) {
      updateMutation.mutate(
        { id: initialData.id, ...payload },
        { onSuccess: () => navigate('/settings/card/card-types') },
      )
    }
  }, [mode, initialData, createMutation, updateMutation, navigate, trigger, getValues])

  const nameFieldKey = `name${activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}` as
    | 'nameTk'
    | 'nameRu'
    | 'nameEn'
  const nameErrorKey = nameFieldKey as keyof FlatErrors

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === 'create'
          ? t('cardTypes.createTitle', 'Kart görnüşi dörediň')
          : t('cardTypes.editTitle', 'Kart görnüşi üýtgetmek')}
      </h1>
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

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/settings/card/card-types')}
        cancelVariant="ghost"
        submitLabel={mode === 'create'
          ? t('cardTypes.actions.create', 'Kart görnüşi döretdiň')
          : t('cardTypes.actions.update', 'Täzelemek')}
        className="mt-6"
      />
    </div>
    </div>
  )
}
