import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { useCreateRole, useUpdateRole } from '../hooks/useRoles'
import { createRoleFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/role.schema'
import type { RoleFormData } from '../schemas/role.schema'
import type { Role } from '../api/rolesApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleFormProps {
  mode: 'create' | 'edit'
  initialData?: Role
  roleId?: number
}

type LangKey = 'tk' | 'ru' | 'en'

const LANG_TABS: { key: LangKey; label: string }[] = [
  { key: 'tk', label: 'Türkmen' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
]

const GUARD_OPTIONS = [
  { value: 'web',     label: 'web' },
  { value: 'api',     label: 'api' },
  { value: 'sanctum', label: 'sanctum' },
]

type FlatErrors = Partial<Record<keyof RoleFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof RoleFormData] = msg
  }
  return result
}

// ─── RoleForm ─────────────────────────────────────────────────────────────────

export function RoleForm({ mode, initialData, roleId }: RoleFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t],
  )
  const navigate = useNavigate()

  const createRole = useCreateRole()
  const updateRole = useUpdateRole(roleId ?? 0)

  const isPending = createRole.isPending || updateRole.isPending

  const [activeLang, setActiveLang] = useState<LangKey>('tk')

  const schema = useMemo(() => createRoleFormSchema(t), [t, i18n.language])

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, trigger,
  } = useForm<RoleFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          ...DEFAULT_FORM_VALUES,
          code: initialData.code,
          nameTk: initialData.name.tk,
          nameRu: initialData.name.ru,
          nameEn: initialData.name.en,
          guard_name: initialData.guard_name,
        }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const setField = useCallback(
    (key: keyof RoleFormData) => (value: string) => {
      (setValue as (k: keyof RoleFormData, v: string) => void)(key, value)
      clearErrors(key)
    },
    [setValue, clearErrors],
  )

  const setNameField = (lang: LangKey, value: string) => {
    const key = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as 'nameTk' | 'nameRu' | 'nameEn'
    setValue(key, value)
    clearErrors(key)
  }

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    const values = getValues()
    const payload = buildPayload(values)

    if (mode === 'create') {
      createRole.mutate(payload, {
        onSuccess: () => navigate('/settings/users/roles'),
      })
    } else {
      updateRole.mutate(payload, {
        onSuccess: () => navigate('/settings/users/roles'),
      })
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const activeNameKey = `name${activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}` as 'nameTk' | 'nameRu' | 'nameEn'
  const nameError = activeLang === 'tk' ? errors[activeNameKey] : undefined

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">

      {/* Code */}
      <div className="grid grid-cols-[220px_1fr] items-start p-5 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('roles.fields.code', 'Kod')}
          <span className="text-destructive ml-0.5">*</span>
        </span>
        <FormInput
          type="text"
          value={form.code}
          onChange={setField('code')}
          placeholder={t('roles.fields.code', 'Kod')}
          error={errors.code}
          disabled={isPending}
        />
      </div>

      {/* Name (multilingual) */}
      <div className="grid grid-cols-[220px_1fr] items-start p-5 border-b border-border">
        <span className="text-sm text-muted-foreground pt-2">
          {t('roles.fields.name', 'Ady')}
          <span className="text-destructive ml-0.5">*</span>
        </span>
        <div className="space-y-2">
          <div className="flex gap-1 justify-end">
            {LANG_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveLang(tab.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeLang === tab.key
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <FormInput
            type="text"
            value={form[activeNameKey]}
            onChange={(v) => setNameField(activeLang, v)}
            placeholder={t('roles.fields.name', 'Ady')}
            error={nameError}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Guard name */}
      <div className="grid grid-cols-[220px_1fr] items-start p-5">
        <span className="text-sm text-muted-foreground pt-2">
          {t('roles.fields.guardName', 'Guard name')}
          <span className="text-destructive ml-0.5">*</span>
        </span>
        <FormInput
          type="select"
          value={form.guard_name}
          onChange={setField('guard_name')}
          options={GUARD_OPTIONS}
          error={errors.guard_name}
          disabled={isPending}
        />
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/settings/users/roles')}
        loadingLabel={t('common.saving', 'Ýüklenýär...')}
        submitLabel={mode === 'create'
          ? t('roles.actions.create', 'Rol dörediň')
          : t('roles.actions.save', 'Ýatda sakla')}
        className="px-5 py-4 border-t border-border bg-muted/20"
      />
    </div>
  )
}