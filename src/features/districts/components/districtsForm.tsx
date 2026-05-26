import { useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@/components/ui/checkbox'
import { FormActions } from '@/components/formActions'
import { FormInput } from '@/components/formInput'
import { MultiLangInput } from '@/components/multiLangInput'
import type { District } from '../api/districtsApi'
import { useCreateDistrict, useUpdateDistrict } from '../hooks/useDistricts'
import { createDistrictFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/district.schema'
import type { DistrictFormData } from '../schemas/district.schema'

type FlatErrors = Partial<Record<keyof DistrictFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof DistrictFormData] = msg
  }
  return result
}

export interface DistrictFormProps {
  mode: 'create' | 'edit'
  initialData?: District
}

function mapInitial(data: District): DistrictFormData {
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    description: data.description ?? '',
    isActive: data.isActive,
  }
}

export function DistrictForm({ mode, initialData }: DistrictFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  )
  const navigate = useNavigate()

  const createMutation = useCreateDistrict()
  const updateMutation = useUpdateDistrict()

  const isPending = createMutation.isPending || updateMutation.isPending

  const schema = useMemo(() => createDistrictFormSchema(t), [t, i18n.language])

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, trigger,
  } = useForm<DistrictFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const set = useCallback(<K extends keyof DistrictFormData>(key: K) =>
    (value: DistrictFormData[K]) => {
      (setValue as (name: K, val: DistrictFormData[K]) => void)(key, value)
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

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/settings/location/districts'),
      })
    } else if (initialData) {
      updateMutation.mutate(
        { id: initialData.id, ...payload },
        { onSuccess: () => navigate('/settings/location/districts') },
      )
    }
  }

  const nameFields = {
    tk: { value: form.nameTk, onChange: set('nameTk'), error: errors.nameTk },
    ru: { value: form.nameRu, onChange: set('nameRu'), error: errors.nameRu },
    en: { value: form.nameEn, onChange: set('nameEn'), error: errors.nameEn },
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === 'create'
          ? t('districts.createTitle', 'Etrap dörediň')
          : t('districts.editTitle', 'Etrap üýtgetmek')}
      </h1>
      <div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[220px_1fr] items-start px-4 py-4 border-b border-border">
          <span className="text-sm text-muted-foreground pt-2">
            {t('districts.fields.name', 'Ady')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <MultiLangInput fields={nameFields} placeholder={t('districts.fields.name', 'Ady')} />
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
    </div>
  )
}
