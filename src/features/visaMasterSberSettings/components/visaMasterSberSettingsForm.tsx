import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import type { VisaMasterSetting } from '../api/visaMasterSberSettingsApi'
import {
  useCreateVisaMasterSetting,
  useUpdateVisaMasterSetting,
} from '../hooks/useVisaMasterSettings'
import {
  visaMasterSettingFormSchema,
  DEFAULT_FORM_VALUES,
  buildPayload,
} from '../schemas/visaMasterSberSetting.schema'
import type { VisaMasterSettingFormData } from '../schemas/visaMasterSberSetting.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisaMasterSettingFormProps {
  mode:         'create' | 'edit'
  initialData?: VisaMasterSetting
  settingId?:   number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapInitial(data: VisaMasterSetting): VisaMasterSettingFormData {
  return {
    kod:   data.kod,
    ady:   data.ady,
    yazgy: data.yazgy,
  }
}

type FlatErrors = Partial<Record<keyof VisaMasterSettingFormData, string>>

function flattenErrors(
  errors: Record<string, { message?: string } | undefined>
): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof VisaMasterSettingFormData] = msg
  }
  return result
}

// ─── VisaMasterSettingForm ────────────────────────────────────────────────────

export function VisaMasterSettingForm({
  mode,
  initialData,
  settingId,
}: VisaMasterSettingFormProps) {
  const { t } = useTranslation()

  const errMsg = (msg: string | undefined) =>
    !msg ? undefined : msg.startsWith('validation.') ? t(msg, msg) : msg
  const navigate = useNavigate()

  const createMutation = useCreateVisaMasterSetting()
  const updateMutation = useUpdateVisaMasterSetting(settingId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    watch,
    setValue,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
    getValues,
  } = useForm<VisaMasterSettingFormData>({
    resolver: zodResolver(visaMasterSettingFormSchema),
    defaultValues: initialData
      ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) }
      : DEFAULT_FORM_VALUES,
  })

  const form   = watch()
  const errors = useMemo(
    () => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>),
    [rhfErrors],
  )

  const set = useCallback(
    (key: keyof VisaMasterSettingFormData) => (value: string) => {
      setValue(key, value)
      clearErrors(key)
    },
    [setValue, clearErrors],
  )

  const handleSubmit = useCallback(async () => {
    const isValid = await trigger()
    if (!isValid) {
      toast.error(t('common.errors.fillRequiredCorrectly', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
      return
    }

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      navigate('/resources/visa-master-settings')
    } else {
      await updateMutation.mutateAsync(payload)
      navigate('/resources/visa-master-settings')
    }
  }, [mode, createMutation, updateMutation, navigate, trigger, getValues])

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
          onChange={set('kod')}
          placeholder={t('visaMasterSettings.fields.kod', 'Kod')}
          error={errMsg(errors.kod)}
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
          onChange={set('ady')}
          placeholder={t('visaMasterSettings.fields.ady', 'Ady')}
          error={errMsg(errors.ady)}
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
          onChange={set('yazgy')}
          placeholder={t('visaMasterSettings.fields.yazgy', 'Yazgy')}
          error={errMsg(errors.yazgy)}
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
