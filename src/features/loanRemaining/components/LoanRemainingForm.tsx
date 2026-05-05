import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/formInput'

import {
  useCreateLoanRemaining,
  useUpdateLoanRemaining,
} from '../hooks/useLoanRemaining'
import type {
  LoanRemaining,
  LoanRemainingPayload,
} from '../api/loanRemainingApi'

interface LoanRemainingFormProps {
  mode: 'create' | 'edit'
  initialData?: LoanRemaining
  loanRemainingId?: string
}

interface FormState {
  passportSeries: string
  passportNumber: string
  loanAccount: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
  passportSeries: '',
  passportNumber: '',
  loanAccount: '',
}

export function LoanRemainingForm({
  mode,
  initialData,
  loanRemainingId,
}: LoanRemainingFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateLoanRemaining()
  const updateMutation = useUpdateLoanRemaining(Number(loanRemainingId) || 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  const [form, setForm] = useState<FormState>(() =>
    mode === 'edit' && initialData
      ? {
          passportSeries: initialData.passportSeries,
          passportNumber: initialData.passportNumber,
          loanAccount: initialData.loanAccount,
        }
      : INITIAL_STATE
  )

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        passportSeries: initialData.passportSeries,
        passportNumber: initialData.passportNumber,
        loanAccount: initialData.loanAccount,
      })
    }
  }, [mode, initialData])

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      if (submitted) {
        setErrors((prev) => ({ ...prev, [key]: undefined }))
      }
    },
    [submitted]
  )

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.passportSeries.trim()) {
      newErrors.passportSeries = t('common.required', 'Hökman doldurylmaly')
    }
    if (!form.passportNumber.trim()) {
      newErrors.passportNumber = t('common.required', 'Hökman doldurylmaly')
    }
    if (!form.loanAccount.trim()) {
      newErrors.loanAccount = t('common.required', 'Hökman doldurylmaly')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    if (!validate()) {
      toast.error(t('common.errors.fillRequired', 'Hökman doldurylmaly öýjükleri dolduryň'))
      return
    }

    const payload: LoanRemainingPayload = form

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t('common.success.create', 'Üstünlikli döredildi'))
          navigate('/loan-remaining')
        },
        onError: () => {
          toast.error(t('common.errors.somethingWentWrong', 'Näsazlyk ýüze çykdy'))
        },
      })
    } else {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t('common.success.save', 'Üstünlikli ýatda saklandy'))
          navigate('/loan-remaining')
        },
        onError: () => {
          toast.error(t('common.errors.somethingWentWrong', 'Näsazlyk ýüze çykdy'))
        },
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={t('loanRemaining.columns.passportSeries', 'Pasport seriýasy')}
            required
            value={form.passportSeries}
            onChange={(v) => set('passportSeries', v)}
            placeholder={t('loanRemaining.placeholders.passportSeries', 'TM')}
            error={errors.passportSeries}
          />

          <FormInput
            label={t('loanRemaining.columns.passportNumber', 'Pasport belgisi')}
            required
            value={form.passportNumber}
            onChange={(v) => set('passportNumber', v)}
            placeholder="A123456"
            error={errors.passportNumber}
          />

          <div className="md:col-span-2">
            <FormInput
              label={t('loanRemaining.columns.loanAccount', 'Karz hasaby')}
              required
              value={form.loanAccount}
              onChange={(v) => set('loanAccount', v)}
              placeholder="NOVA-..."
              error={errors.loanAccount}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/loan-remaining')}
          disabled={isPending}
        >
          {t('common.cancel', 'Ýatyr')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create'
            ? t('common.create', 'Döret')
            : t('common.save', 'Ýatda sakla')}
        </Button>
      </div>
    </form>
  )
}
