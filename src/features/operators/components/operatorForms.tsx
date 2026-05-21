import { useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@/components/ui/checkbox'
import { FormActions } from '@/components/formActions'
import { FormInput } from '@/components/formInput'
import { useCreateOperator, useUpdateOperator } from '../hooks/useOperators'
import { operatorFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/operator.schema'
import type { OperatorFormData } from '../schemas/operator.schema'
import type { Operator } from '../api/operatorsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OperatorFormProps {
  mode: 'create' | 'edit'
  initialData?: Operator
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof OperatorFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof OperatorFormData] = msg
  }
  return result
}

// ─── OperatorForm ─────────────────────────────────────────────────────────────

export function OperatorForm({ mode, initialData }: OperatorFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  )
  const navigate = useNavigate()

  const createMutation = useCreateOperator()
  const updateMutation = useUpdateOperator(initialData?.id ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  const schema = useMemo(() => operatorFormSchema(mode, t), [mode, t, i18n.language])

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, trigger,
  } = useForm<OperatorFormData>({
    resolver: zodResolver(schema as any),
    defaultValues: initialData
      ? {
          ...DEFAULT_FORM_VALUES,
          username: initialData.username,
          name: initialData.name,
          phone: initialData.phone ?? '',
          email: initialData.email ?? '',
          password: '',
          isActive: initialData.isActive,
        }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const setField = <K extends keyof OperatorFormData>(key: K, value: OperatorFormData[K]) => {
    ;(setValue as (name: K, val: OperatorFormData[K]) => void)(key, value)
    clearErrors(key)
  }

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) {
      trigger()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    const data = getValues()

    if (mode === 'create') {
      const payload = buildPayload(data)
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/operators'),
      })
    } else {
      updateMutation.mutate({
        username: data.username.trim(),
        name: data.name.trim(),
        phone: data.phone.trim() || undefined,
        email: data.email.trim() || undefined,
        isActive: data.isActive,
        ...(data.password.trim() ? { password: data.password } : {}),
      }, {
        onSuccess: () => navigate(`/operators/${initialData!.id}`),
      })
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === 'create'
          ? t('operators.createTitle', 'Operator dörediň')
          : t('operators.editTitle', 'Operator üýtgetmek')}
      </h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Username */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('operators.fields.username', 'Ulanyjy ady')}
          <span className="text-destructive ml-0.5">*</span>
        </span>
        <FormInput
          type="text"
          value={form.username}
          onChange={(v) => setField('username', v)}
          placeholder={t('operators.fields.username', 'Ulanyjy ady')}
          error={errors.username}
          disabled={isPending}
          className="max-w-lg"
        />
      </div>

      {/* Name */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('operators.fields.name', 'Ady')}
          <span className="text-destructive ml-0.5">*</span>
        </span>
        <FormInput
          type="text"
          value={form.name}
          onChange={(v) => setField('name', v)}
          placeholder={t('operators.fields.name', 'Ady')}
          error={errors.name}
          disabled={isPending}
          className="max-w-lg"
        />
      </div>

      {/* Phone */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('operators.fields.phone', 'Telefon')}
        </span>
        <FormInput
          type="phone"
          value={form.phone}
          onChange={(v) => setField('phone', v)}
          disabled={isPending}
          className="max-w-lg"
        />
      </div>

      {/* Email */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('operators.fields.email', 'E-poçta')}
        </span>
        <FormInput
          type="email"
          value={form.email}
          onChange={(v) => setField('email', v)}
          placeholder={t('operators.fields.email', 'E-poçta')}
          disabled={isPending}
          className="max-w-lg"
        />
      </div>

      {/* Password */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('operators.fields.password', 'Açar sözi')}
          {mode === 'create' && <span className="text-destructive ml-0.5">*</span>}
        </span>
        <div className="max-w-lg space-y-1">
          <FormInput
            type="password"
            value={form.password}
            onChange={(v) => setField('password', v)}
            placeholder={
              mode === 'edit'
                ? t('operators.fields.passwordEditHint', 'Üýtgetmek üçin täze açar söz giriziň')
                : t('operators.fields.password', 'Açar sözi')
            }
            error={errors.password}
            disabled={isPending}
          />
          {mode === 'edit' && (
            <p className="text-xs text-muted-foreground">
              {t(
                'operators.fields.passwordEditNote',
                'Boş goýsaňyz, açar sözi üýtgemez',
              )}
            </p>
          )}
        </div>
      </div>

      {/* isActive */}
      <div className="grid grid-cols-[220px_1fr] items-center py-4 px-6">
        <span className="text-sm text-muted-foreground">
          {t('operators.fields.isActive', 'Işjeň')}
        </span>
        <Checkbox
          checked={form.isActive}
          onCheckedChange={(v) => setField('isActive', !!v)}
          disabled={isPending}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        cancelVariant="ghost"
        submitLabel={mode === 'create'
          ? t('operators.createBtn', 'Operator döredin')
          : t('operators.updateBtn', 'Üýtgetmeleri sakla')}
        className="px-6 py-4 border-t border-border bg-muted/20"
      />
    </div>
    </div>
  )
}
