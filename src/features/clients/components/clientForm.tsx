import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@/components/ui/checkbox'
import { FormActions } from '@/components/formActions'
import { FormInput } from '@/components/formInput'
import { useCreateClient, useUpdateClient } from '../hooks/useClients'
import { clientFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/client.schema'
import type { ClientFormData } from '../schemas/client.schema'
import type { Client } from '../api/clientsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientFormProps {
  mode: 'create' | 'edit'
  initialData?: Client
  clientId?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof ClientFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof ClientFormData] = msg
  }
  return result
}

// ─── ClientForm ───────────────────────────────────────────────────────────────

export function ClientForm({ mode, initialData, clientId }: ClientFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient(clientId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  const schema = useMemo(() => clientFormSchema(mode), [mode])

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, trigger,
  } = useForm<ClientFormData>({
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

  const setField = <K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) => {
    ;(setValue as (name: K, val: ClientFormData[K]) => void)(key, value)
    clearErrors(key)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    const data = getValues()

    if (mode === 'create') {
      const payload = buildPayload(data)
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/clients'),
      })
    } else {
      updateMutation.mutate({
        username: data.username.trim(),
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim() || undefined,
        isActive: data.isActive,
        ...(data.password.trim() ? { password: data.password } : {}),
      }, {
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
          onChange={(v) => setField('username', v)}
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
          onChange={(v) => setField('name', v)}
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
          onChange={(v) => setField('phone', v)}
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
          onChange={(v) => setField('email', v)}
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
            onChange={(v) => setField('password', v)}
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
          ? t('clients.createBtn', 'Müşderi döredin')
          : t('clients.updateBtn', 'Üýtgetmeleri sakla')}
        className="px-6 py-4 border-t border-border bg-muted/20"
      />
    </div>
  )
}