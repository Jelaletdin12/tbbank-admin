import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/formInput'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FormActions } from '@/components/formActions'
import { useCreateUser, useUpdateUser } from '../hooks/useAllUsers'
import type { User, CreateUserPayload, UpdateUserPayload } from '../api/allUsersApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserFormProps {
  mode: 'create' | 'edit'
  initialData?: User
  userId?: number
}

interface FormState {
  username: string
  name: string
  phone: string
  email: string
  password: string
  phoneVerified: boolean
  isActive: boolean
}

interface FormErrors {
  username?: string
  name?: string
  phone?: string
  email?: string
  password?: string
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(state: FormState, mode: 'create' | 'edit'): FormErrors {
  const errors: FormErrors = {}

  if (!state.username.trim()) errors.username = 'Ulanyjy ady hökmany'
  else if (state.username.length < 3) errors.username = 'Ulanyjy ady iň az 3 harp bolmaly'

  if (!state.name.trim()) errors.name = 'Ady hökmany'

  if (!state.phone.trim()) errors.phone = 'Telefon hökmany'
  else if (!/^\d[\d\s-]{6,}$/.test(state.phone)) errors.phone = 'Nädogry telefon formaty'

  if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.email = 'Nädogry e-poçta formaty'
  }

  if (mode === 'create') {
    if (!state.password) errors.password = 'Açar sözi hökmany'
    else if (state.password.length < 6) errors.password = 'Açar sözi iň az 6 harp bolmaly'
  }

  return errors
}

// ─── UserForm ─────────────────────────────────────────────────────────────────

export function UserForm({ mode, initialData, userId }: UserFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createUser = useCreateUser()
  const updateUser = useUpdateUser(userId ?? 0)

  const isPending = createUser.isPending || updateUser.isPending

  const [form, setForm] = useState<FormState>({
    username: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    phoneVerified: false,
    isActive: true,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Populate form when initialData is available (edit mode)
  useEffect(() => {
    if (initialData) {
      setForm({
        username: initialData.username,
        name: initialData.name,
        phone: initialData.phone.replace(/^\+993[-\s]?/, ''),
        email: initialData.email ?? '',
        password: '',
        phoneVerified: initialData.phoneVerified,
        isActive: initialData.isActive,
      })
    }
  }, [initialData])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const handleSubmit = async () => {
    const validationErrors = validateForm(form, mode)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (mode === 'create') {
      const payload: CreateUserPayload = {
        username: form.username.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        phoneVerified: form.phoneVerified,
        isActive: form.isActive,
      }
      await createUser.mutateAsync(payload)
      navigate('/users')
    } else {
      const payload: UpdateUserPayload = {
        username: form.username.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        phoneVerified: form.phoneVerified,
        isActive: form.isActive,
      }
      await updateUser.mutateAsync(payload)
      navigate(`/users/${userId}`)
    }
  }

  return (
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
  )
}