import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@/components/ui/checkbox'
import { FormActions } from '@/components/formActions'
import { FormInput } from '@/components/formInput'
import type { CardReason } from '../api/cardReasonsApi'
import { useCreateCardReason, useUpdateCardReason } from '../hooks/useCardReasons'
import { createCardReasonFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/cardReason.schema'
import type { CardReasonFormData } from '../schemas/cardReason.schema'

// ─── Form errors helper ──────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof CardReasonFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof CardReasonFormData] = msg
  }
  return result
}

type FormErrors = FlatErrors

// ─── Lang Tab ─────────────────────────────────────────────────────────────────

type LangKey = 'tk' | 'ru' | 'en'

const LANG_TABS: { key: LangKey; label: string }[] = [
  { key: 'tk', label: 'Türkmen' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
]

// ─── CardReasonForm ─────────────────────────────────────────────────────────────

interface CardReasonFormProps {
  mode: 'create' | 'edit'
  initialData?: CardReason
  CardReasonId?: number
}

function mapInitial(data: CardReason): CardReasonFormData {
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    value: String(data.value),
    description: data.description ?? '',
    isActive: data.isActive,
  }
}

export function CardReasonForm({ mode, initialData, CardReasonId }: CardReasonFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t],
  )
  const navigate = useNavigate()

  const createMutation = useCreateCardReason()
  const updateMutation = useUpdateCardReason()

  const isPending = createMutation.isPending || updateMutation.isPending

  const schema = useMemo(() => createCardReasonFormSchema(t), [t, i18n.language])

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, trigger,
  } = useForm<CardReasonFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const [activeLang, setActiveLang] = useState<LangKey>('tk')

  const set = useCallback(<K extends keyof CardReasonFormData>(key: K, value: CardReasonFormData[K]) => {
    (setValue as (name: K, val: CardReasonFormData[K]) => void)(key, value)
    clearErrors(key)
  }, [setValue, clearErrors])

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

  const handleSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    const values = getValues()
    const payload = buildPayload(values)

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/resources/card-states'),
      })
    } else if (CardReasonId !== undefined) {
      updateMutation.mutate(
        { id: CardReasonId, ...payload },
        { onSuccess: () => navigate('/resources/card-states') }
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
        {/* Name row */}
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('CardReasons.fields.name', 'Ady')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="text"
            value={form[nameFieldKey]}
            onChange={(v) => set(nameFieldKey, v)}
            placeholder={t('CardReasons.fields.name', 'Ady')}
            error={errors[nameErrorKey]}
          />
        </div>

        {/* Value row */}
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('CardReasons.fields.value', 'Baha')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="number"
            value={form.value}
            onChange={(v) => set('value', v)}
            placeholder={t('CardReasons.fields.value', 'Baha')}
            error={errors.value}
          />
        </div>

        {/* Description row */}
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {t('CardReasons.fields.description', 'Bellikler')}
          </span>
          <FormInput
            type="text"
            value={form.description}
            onChange={(v) => set('description', v)}
            placeholder={t('CardReasons.fields.description', 'Bellikler')}
          />
        </div>

        {/* isActive row */}
        <div className="grid grid-cols-[220px_1fr] items-center py-3 px-4">
          <span className="text-sm text-muted-foreground">
            {t('CardReasons.fields.isActive', 'Işjeň')}
          </span>
          <Checkbox
            checked={form.isActive}
            onCheckedChange={(checked) => set('isActive', !!checked)}
          />
        </div>
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/resources/card-states')}
        cancelVariant="ghost"
        submitLabel={mode === 'create'
          ? t('CardReasons.actions.create', 'Kartyň çykarylmagynyň sebäbini döretdiň')
          : t('CardReasons.actions.update', 'Täzelemek')}
        className="mt-6"
      />
    </div>
  )
}
