import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { useCreateRole, useUpdateRole } from '../hooks/useRoles'
import type { Role, RolePayload } from '../api/rolesApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleFormProps {
  mode: 'create' | 'edit'
  initialData?: Role
  roleId?: number
}

interface FormErrors {
  code?: string
  name_tk?: string
  name_ru?: string
  name_en?: string
  guard_name?: string
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

// ─── RoleForm ─────────────────────────────────────────────────────────────────

export function RoleForm({ mode, initialData, roleId }: RoleFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createRole = useCreateRole()
  const updateRole = useUpdateRole(roleId ?? 0)

  const isPending = createRole.isPending || updateRole.isPending

  const [activeLang, setActiveLang] = useState<LangKey>('tk')
  const [errors, setErrors]         = useState<FormErrors>({})

  const [form, setForm] = useState<RolePayload>({
    code:       initialData?.code           ?? '',
    guard_name: initialData?.guard_name     ?? 'web',
    name: {
      tk: initialData?.name?.tk ?? '',
      ru: initialData?.name?.ru ?? '',
      en: initialData?.name?.en ?? '',
    },
  })

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setField = (field: keyof Omit<RolePayload, 'name'>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const setNameField = (lang: LangKey, value: string) => {
    setForm((prev) => ({ ...prev, name: { ...prev.name, [lang]: value } }))
    setErrors((prev) => ({ ...prev, [`name_${lang}`]: undefined }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.code.trim())
      newErrors.code = t('roles.validation.codeRequired', 'Kod hökman!')
    if (!form.name.tk.trim())
      newErrors.name_tk = t('roles.validation.nameTkRequired', 'Türkmençe ady hökman!')
    if (!form.guard_name.trim())
      newErrors.guard_name = t('roles.validation.guardRequired', 'Guard name hökman!')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!validate()) return

    if (mode === 'create') {
      createRole.mutate(form, {
        onSuccess: () => navigate('/settings/users/roles'),
      })
    } else {
      updateRole.mutate(form, {
        onSuccess: () => navigate('/settings/users/roles'),
      })
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
          onChange={(v) => setField('code', v)}
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
          {/* Language tabs */}
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
            value={form.name[activeLang]}
            onChange={(v) => setNameField(activeLang, v)}
            placeholder={t('roles.fields.name', 'Ady')}
            error={errors[`name_${activeLang}` as keyof FormErrors]}
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
          onChange={(v) => setField('guard_name', v)}
          options={GUARD_OPTIONS}
          error={errors.guard_name}
          disabled={isPending}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border bg-muted/20">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/settings/users/roles')}
          disabled={isPending}
        >
          {t('common.cancel', 'Ýatyr')}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending
            ? t('common.saving', 'Ýüklenýär...')
            : mode === 'create'
              ? t('roles.actions.create', 'Rol dörediň')
              : t('roles.actions.save', 'Ýatda sakla')}
        </Button>
      </div>
    </div>
  )
}