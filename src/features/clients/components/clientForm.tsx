import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { FormActions } from '@/components/formActions'
import { FormInput } from '@/components/formInput'
import { useCreateClient, useUpdateClient } from '../hooks/useClients'
import type { Client, CreateClientPayload, UpdateClientPayload } from '../api/clientsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientFormProps {
  mode: 'create' | 'edit'
  initialData?: Client
  clientId?: number
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
  phone?: string
  password?: string
}

// ─── ClientForm ───────────────────────────────────────────────────────────────

export function ClientForm({ mode, initialData, clientId }: ClientFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient(clientId ?? 0)

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
      next.username = t('clients.errors.usernameRequired', 'Ulanyjy ady hökmany')
    if (!form.name.trim())
      next.name = t('clients.errors.nameRequired', 'Ady hökmany')
    if (!form.phone.trim())
      next.phone = t('clients.errors.phoneRequired', 'Telefon hökmany')
    if (mode === 'create' && !form.password.trim())
      next.password = t('clients.errors.passwordRequired', 'Açar sözi hökmany')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return

    if (mode === 'create') {
      const payload: CreateClientPayload = {
        username: form.username.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        isActive: form.isActive,
      }
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/clients'),
      })
    } else {
      const payload: UpdateClientPayload = {
        username: form.username.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        isActive: form.isActive,
      }
      if (form.password.trim()) {
        payload.password = form.password
      }
      updateMutation.mutate(payload, {
        onSuccess: () => navigate(`/clients/${clientId}`),
      })
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Username */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('clients.fields.username', 'Ulanyjy ady')}
          <span className="text-destructive ml-0.5">*</span>
        </span>
        <FormInput
          type="text"
          value={form.username}
          onChange={set('username')}
          placeholder={t('clients.fields.username', 'Ulanyjy ady')}
          error={errors.username}
          disabled={isPending}
          className="max-w-lg"
        />
      </div>

      {/* Name */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('clients.fields.name', 'Ady')}
          <span className="text-destructive ml-0.5">*</span>
        </span>
        <FormInput
          type="text"
          value={form.name}
          onChange={set('name')}
          placeholder={t('clients.fields.name', 'Ady')}
          error={errors.name}
          disabled={isPending}
          className="max-w-lg"
        />
      </div>

      {/* Phone */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('clients.fields.phone', 'Telefon')}
          <span className="text-destructive ml-0.5">*</span>
        </span>
        <FormInput
          type="phone"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          disabled={isPending}
          className="max-w-lg"
        />
      </div>

      {/* Email */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('clients.fields.email', 'E-poçta')}
        </span>
        <FormInput
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder={t('clients.fields.email', 'E-poçta')}
          disabled={isPending}
          className="max-w-lg"
        />
      </div>

      {/* Password */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('clients.fields.password', 'Açar sözi')}
          {mode === 'create' && <span className="text-destructive ml-0.5">*</span>}
        </span>
        <div className="max-w-lg space-y-1">
          <FormInput
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder={
              mode === 'edit'
                ? t('clients.fields.passwordEditHint', 'Üýtgetmek üçin täze açar söz giriziň')
                : t('clients.fields.password', 'Açar sözi')
            }
            error={errors.password}
            disabled={isPending}
          />
          {mode === 'edit' && (
            <p className="text-xs text-muted-foreground">
              {t('clients.fields.passwordEditNote', 'Boş goýsaňyz, açar sözi üýtgemez')}
            </p>
          )}
        </div>
      </div>

      {/* isActive */}
      <div className="grid grid-cols-[220px_1fr] items-center py-4 px-6">
        <span className="text-sm text-muted-foreground">
          {t('clients.fields.isActive', 'Işjeň')}
        </span>
        <Checkbox
          checked={form.isActive}
          onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: !!v }))}
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
          ? t('clients.createBtn', 'Müşderi döredin')
          : t('clients.updateBtn', 'Üýtgetmeleri sakla')}
        className="px-6 py-4 border-t border-border bg-muted/20"
      />
    </div>
  )
}