import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormInput } from '@/components/formInput'
import { useCreateOperator, useUpdateOperator } from '../hooks/useOperators'
import type { Operator, CreateOperatorPayload, UpdateOperatorPayload } from '../api/operatorsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OperatorFormProps {
  mode: 'create' | 'edit'
  initialData?: Operator
  operatorId?: number
}

interface FormState {
  username: string
  name: string
  phone: string
  email: string
  password: string
  isActive: boolean
}

interface FormErrors {
  username?: string
  name?: string
  password?: string
}

// ─── OperatorForm ─────────────────────────────────────────────────────────────

export function OperatorForm({ mode, initialData, operatorId }: OperatorFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateOperator()
  const updateMutation = useUpdateOperator(operatorId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    username: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    isActive: true,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Populate form in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        username: initialData.username ?? '',
        name: initialData.name ?? '',
        phone: initialData.phone ?? '',
        email: initialData.email ?? '',
        password: '',
        isActive: initialData.isActive ?? true,
      })
    }
  }, [mode, initialData])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (field: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!form.username.trim())
      next.username = t('operators.errors.usernameRequired', 'Ulanyjy ady hökmany')
    if (!form.name.trim())
      next.name = t('operators.errors.nameRequired', 'Ady hökmany')
    if (mode === 'create' && !form.password.trim())
      next.password = t('operators.errors.passwordRequired', 'Açar sözi hökmany')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return

    if (mode === 'create') {
      const payload: CreateOperatorPayload = {
        username: form.username.trim(),
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        password: form.password,
        isActive: form.isActive,
      }
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/operators'),
      })
    } else {
      const payload: UpdateOperatorPayload = {
        username: form.username.trim(),
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        isActive: form.isActive,
      }
      if (form.password.trim()) {
        payload.password = form.password
      }
      updateMutation.mutate(payload, {
        onSuccess: () => navigate(`/operators/${operatorId}`),
      })
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
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
          onChange={set('username')}
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
          onChange={set('name')}
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
          onChange={set('phone')}
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
          onChange={set('email')}
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
            onChange={set('password')}
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
          onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: !!v }))}
          disabled={isPending}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          disabled={isPending}
        >
          {t('common.cancel', 'Ýatyr')}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[160px]"
        >
          {isPending
            ? t('common.saving', 'Saklanýar...')
            : mode === 'create'
            ? t('operators.createBtn', 'Operator döredin')
            : t('operators.updateBtn', 'Üýtgetmeleri sakla')}
        </Button>
      </div>
    </div>
  )
}