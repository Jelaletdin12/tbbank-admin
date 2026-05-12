// features/loanTypes/components/LoanTypeForm.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateLoanType, useUpdateLoanType } from '../hooks/useLoanTypes'
import type { LoanType, CreateLoanTypePayload } from '../api/loanTypesApi'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormMode = 'create' | 'edit'

interface LoanTypeFormProps {
  mode: FormMode
  initialData?: LoanType
  loanTypeId?: number
}

interface FormErrors {
  nameTk?: string
  nameRu?: string
  nameEn?: string
  tax?: string
  loanTerm?: string
}

// ─── Language Tab ─────────────────────────────────────────────────────────────

type Lang = 'tk' | 'ru' | 'en'

const LANG_TABS: { key: Lang; label: string }[] = [
  { key: 'tk', label: 'Türkmen' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
]

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(
  nameTk: string,
  nameRu: string,
  nameEn: string,
  tax: string,
  loanTerm: string,
  t: (key: string, fallback: string) => string
): FormErrors {
  const errors: FormErrors = {}
  if (!nameTk.trim()) errors.nameTk = t('validation.required', 'Hökmany meýdan')
  if (!nameRu.trim()) errors.nameRu = t('validation.required', 'Hökmany meýdan')
  if (!nameEn.trim()) errors.nameEn = t('validation.required', 'Hökmany meýdan')
  if (!tax || Number(tax) <= 0) errors.tax = t('validation.positiveNumber', 'Oňyn san gerek')
  if (!loanTerm || Number(loanTerm) <= 0) errors.loanTerm = t('validation.positiveNumber', 'Oňyn san gerek')
  return errors
}

// ─── LoanTypeForm ─────────────────────────────────────────────────────────────

export function LoanTypeForm({ mode, initialData, loanTypeId }: LoanTypeFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateLoanType()
  const updateMutation = useUpdateLoanType(loanTypeId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeLang, setActiveLang] = useState<Lang>('tk')
  const [nameTk, setNameTk]         = useState('')
  const [nameRu, setNameRu]         = useState('')
  const [nameEn, setNameEn]         = useState('')
  const [notesTk, setNotesTk]       = useState('')
  const [notesRu, setNotesRu]       = useState('')
  const [notesEn, setNotesEn]       = useState('')
  const [tax, setTax]               = useState('')
  const [loanTerm, setLoanTerm]     = useState('')
  const [isActive, setIsActive]     = useState(true)
  const [errors, setErrors]         = useState<FormErrors>({})

  // ── Populate on edit ───────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setNameTk(initialData.name.tk)
      setNameRu(initialData.name.ru)
      setNameEn(initialData.name.en)
      setNotesTk(initialData.notes?.tk ?? '')
      setNotesRu(initialData.notes?.ru ?? '')
      setNotesEn(initialData.notes?.en ?? '')
      setTax(String(initialData.tax))
      setLoanTerm(String(initialData.loanTerm))
      setIsActive(initialData.isActive)
    }
  }, [mode, initialData])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationErrors = validate(nameTk, nameRu, nameEn, tax, loanTerm, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    const payload: CreateLoanTypePayload = {
      name:     { tk: nameTk.trim(), ru: nameRu.trim(), en: nameEn.trim() },
      tax:      Number(tax),
      loanTerm: Number(loanTerm),
      notes:
        notesTk.trim() || notesRu.trim() || notesEn.trim()
          ? { tk: notesTk.trim(), ru: notesRu.trim(), en: notesEn.trim() }
          : null,
      isActive,
    }

    if (mode === 'create') {
      const result = await createMutation.mutateAsync(payload)
      navigate(`/resources/loan-types/${result.id}`)
    } else {
      await updateMutation.mutateAsync(payload)
      navigate(`/resources/loan-types/${loanTypeId}`)
    }
  }

  const handleCancel = () => navigate('/resources/loan-types')

  // ── Name fields per lang ───────────────────────────────────────────────────
  const nameFields: Record<Lang, { value: string; onChange: (v: string) => void; error?: string }> = {
    tk: { value: nameTk, onChange: setNameTk, error: errors.nameTk },
    ru: { value: nameRu, onChange: setNameRu, error: errors.nameRu },
    en: { value: nameEn, onChange: setNameEn, error: errors.nameEn },
  }

  const notesFields: Record<Lang, { value: string; onChange: (v: string) => void }> = {
    tk: { value: notesTk, onChange: setNotesTk },
    ru: { value: notesRu, onChange: setNotesRu },
    en: { value: notesEn, onChange: setNotesEn },
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0">
      {/* Language tabs row */}
      <div className="flex items-center justify-end gap-1 mb-0 pb-0">
        {LANG_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveLang(tab.key)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeLang === tab.key
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
        {/* Ady */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.name', 'Ady')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="text"
            value={nameFields[activeLang].value}
            onChange={nameFields[activeLang].onChange}
            placeholder={t('loanTypes.fields.name', 'Ady')}
            error={nameFields[activeLang].error}
          />
        </div>

        {/* Salgyt */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.tax', 'Salgyt')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="number"
            value={tax}
            onChange={setTax}
            placeholder={t('loanTypes.fields.tax', 'Salgyt')}
            error={errors.tax}
          />
        </div>

        {/* Karz möhleti */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.loanTerm', 'Karz möhleti')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="number"
            value={loanTerm}
            onChange={setLoanTerm}
            placeholder={t('loanTypes.fields.loanTerm', 'Karz möhleti')}
            error={errors.loanTerm}
          />
        </div>

        {/* Bellikler */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.notes', 'Bellikler')}
          </span>
          <FormInput
            type="text"
            value={notesFields[activeLang].value}
            onChange={notesFields[activeLang].onChange}
            placeholder={t('loanTypes.fields.notes', 'Bellikler')}
          />
        </div>

        {/* Işjeň */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.isActive', 'Işjeň')}
          </span>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={isActive}
            />
            <Label htmlFor="isActive" className="text-sm text-foreground cursor-pointer">
              {isActive
                ? t('common.active', 'Işjeň')
                : t('common.inactive', 'Işjeň däl')}
            </Label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
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
            ? t('common.saving', 'Saklanýar...')
            : mode === 'create'
              ? t('loanTypes.actions.create', 'Karz görnüşi dörediň')
              : t('loanTypes.actions.save', 'Ýatda sakla')}
        </Button>
      </div>
    </div>
  )
}