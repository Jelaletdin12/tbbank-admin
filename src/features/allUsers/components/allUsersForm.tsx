import { useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/formInput'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FormActions } from '@/components/formActions'
import { useCreateUser, useUpdateUser } from '../hooks/useAllUsers'
import type { User } from '../api/allUsersApi'
import { allUserFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/allUser.schema'
import type { AllUserFormData } from '../schemas/allUser.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserFormProps {
  mode: 'create' | 'edit'
  initialData?: User
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof AllUserFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof AllUserFormData] = msg
  }
  return result
}

// ─── UserForm ─────────────────────────────────────────────────────────────────

export function UserForm({ mode, initialData }: UserFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  )
  const navigate = useNavigate()

  const createUser = useCreateUser()
  const updateUser = useUpdateUser(initialData?.id ?? 0)

  const isPending = createUser.isPending || updateUser.isPending

  const schema = useMemo(() => allUserFormSchema(mode, t), [mode, t, i18n.language])

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, trigger,
  } = useForm<AllUserFormData>({
    resolver: zodResolver(schema as any),
    defaultValues: initialData
      ? {
          ...DEFAULT_FORM_VALUES,
          username: initialData.username,
          name: initialData.name,
          phone: initialData.phone.replace(/^\+993[-\s]?/, ''),
          email: initialData.email ?? '',
          password: '',
          phoneVerified: initialData.phoneVerified,
          isActive: initialData.isActive,
        }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const setField = <K extends keyof AllUserFormData>(key: K, value: AllUserFormData[K]) => {
    (setValue as (name: K, val: AllUserFormData[K]) => void)(key, value)
    clearErrors(key)
  }

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) {
      trigger()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

  const handleSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    const data = getValues()

    if (mode === 'create') {
      const payload = buildPayload(data)
      await createUser.mutateAsync(payload)
      navigate('/users')
    } else {
      await updateUser.mutateAsync({
        username: data.username.trim(),
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim() || undefined,
        phoneVerified: data.phoneVerified,
        isActive: data.isActive,
      })
      navigate(`/users/${initialData!.id}`)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === 'create'
          ? t('users.createTitle', 'Ulanyjy dörediň')
          : t('users.editTitle', 'Ulanyjy üýtgetmek')}
      </h1>
      <div className="space-y-6">
      {/* Form card */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">

        {/* Username */}
        <div className="grid grid-cols-[280px_1fr] items-start px-6 py-4">
          <div className="pt-0.5">
            <p className="text-sm font-medium text-foreground">
              {t('users.fields.username', 'Ulanyjy ady')}
              <span className="text-destructive ml-0.5">*</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('users.fields.usernameHint', 'Unikal login ady')}
            </p>
          </div>
          <FormInput
            type="text"
            value={form.username}
            onChange={(v) => setField('username', v)}
            placeholder={t('users.fields.username', 'Ulanyjy ady')}
            error={errors.username}
            disabled={isPending}
          />
        </div>

        {/* Full name */}
        <div className="grid grid-cols-[280px_1fr] items-start px-6 py-4">
          <div className="pt-0.5">
            <p className="text-sm font-medium text-foreground">
              {t('users.fields.name', 'Ady')}
              <span className="text-destructive ml-0.5">*</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('users.fields.nameHint', 'Doly ady we familiýasy')}
            </p>
          </div>
          <FormInput
            type="text"
            value={form.name}
            onChange={(v) => setField('name', v)}
            placeholder={t('users.fields.name', 'Ady')}
            error={errors.name}
            disabled={isPending}
          />
        </div>

        {/* Phone */}
        <div className="grid grid-cols-[280px_1fr] items-start px-6 py-4">
          <div className="pt-0.5">
            <p className="text-sm font-medium text-foreground">
              {t('users.fields.phone', 'Telefon')}
              <span className="text-destructive ml-0.5">*</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('users.fields.phoneHint', '+993 bilen başlanýar')}
            </p>
          </div>
          <FormInput
            type="phone"
            value={form.phone}
            onChange={(v) => setField('phone', v)}
            placeholder="62-38-49-56"
            error={errors.phone}
            disabled={isPending}
          />
        </div>

        {/* Email */}
        <div className="grid grid-cols-[280px_1fr] items-start px-6 py-4">
          <div className="pt-0.5">
            <p className="text-sm font-medium text-foreground">
              {t('users.fields.email', 'E-poçta')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('users.fields.emailHint', 'Islege görä')}
            </p>
          </div>
          <FormInput
            type="email"
            value={form.email}
            onChange={(v) => setField('email', v)}
            placeholder={t('users.fields.email', 'E-poçta')}
            error={errors.email}
            disabled={isPending}
          />
        </div>

        {/* Password — only in create mode */}
        {mode === 'create' && (
          <div className="grid grid-cols-[280px_1fr] items-start px-6 py-4">
            <div className="pt-0.5">
              <p className="text-sm font-medium text-foreground">
                {t('users.fields.password', 'Açar sözi')}
                <span className="text-destructive ml-0.5">*</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('users.fields.passwordHint', 'Iň az 6 harp')}
              </p>
            </div>
            <FormInput
              type="password"
              value={form.password}
              onChange={(v) => setField('password', v)}
              placeholder={t('users.fields.password', 'Açar sözi')}
              error={errors.password}
              disabled={isPending}
            />
          </div>
        )}

        {/* Phone verified */}
        <div className="grid grid-cols-[280px_1fr] items-center px-6 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {t('users.fields.phoneVerified', 'Telefon tassyklanan')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('users.fields.phoneVerifiedHint', 'SMS arkaly tassyklandy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="phoneVerified"
              checked={form.phoneVerified}
              onCheckedChange={(v) => setField('phoneVerified', !!v)}
              disabled={isPending}
            />
            <Label htmlFor="phoneVerified" className="text-sm text-muted-foreground cursor-pointer">
              {form.phoneVerified
                ? t('common.yes', 'Hawa')
                : t('common.no', 'Ýok')}
            </Label>
          </div>
        </div>

        {/* Active */}
        <div className="grid grid-cols-[280px_1fr] items-center px-6 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {t('users.fields.isActive', 'Işjeň')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('users.fields.isActiveHint', 'Ulanyjynyň ulgama girip-bilmezligi')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(v) => setField('isActive', !!v)}
              disabled={isPending}
            />
            <Label htmlFor="isActive" className="text-sm text-muted-foreground cursor-pointer">
              {form.isActive
                ? t('common.active', 'Işjeň')
                : t('common.inactive', 'Işjeň däl')}
            </Label>
          </div>
        </div>
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel={mode === 'create'
          ? t('users.actions.create', 'Ulanyjy dörediň')
          : t('users.actions.save', 'Ýatda sakla')}
      />
    </div>
    </div>
  )
}
