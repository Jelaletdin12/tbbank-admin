import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'

import {
  useCreateLoanRemaining,
  useUpdateLoanRemaining,
} from '../hooks/useLoanRemaining'
import type { LoanRemaining } from '../api/loanRemainingApi'
import {
  loanRemainingFormSchema,
  type LoanRemainingFormData,
  DEFAULT_FORM_VALUES,
  buildPayload,
} from '../schemas/loanRemaining.schema'

interface LoanRemainingFormProps {
  mode: 'create' | 'edit'
  initialData?: LoanRemaining
  loanRemainingId?: string
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

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoanRemainingFormData>({
    resolver: zodResolver(loanRemainingFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onSubmit',
  })

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        passportSeries: initialData.passportSeries,
        passportNumber: initialData.passportNumber,
        loanAccount: initialData.loanAccount,
      })
    }
  }, [mode, initialData, reset])

  const onSubmit = (data: LoanRemainingFormData) => {
    const payload = buildPayload(data)

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

  const onError = () => {
    toast.error(t('common.errors.fillRequired', 'Hökman doldurylmaly öýjükleri dolduryň'))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={t('loanRemaining.columns.passportSeries', 'Pasport seriýasy')}
            required
            value={watch('passportSeries')}
            onChange={(v) => setValue('passportSeries', v)}
            placeholder={t('loanRemaining.placeholders.passportSeries', 'TM')}
            error={errors.passportSeries?.message}
          />

          <FormInput
            label={t('loanRemaining.columns.passportNumber', 'Pasport belgisi')}
            required
            value={watch('passportNumber')}
            onChange={(v) => setValue('passportNumber', v)}
            placeholder="A123456"
            error={errors.passportNumber?.message}
          />

          <div className="md:col-span-2">
            <FormInput
              label={t('loanRemaining.columns.loanAccount', 'Karz hasaby')}
              required
              value={watch('loanAccount')}
              onChange={(v) => setValue('loanAccount', v)}
              placeholder="NOVA-..."
              error={errors.loanAccount?.message}
            />
          </div>
        </div>
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit(onSubmit, onError)}
        onCancel={() => navigate('/loan-remaining')}
        submitLabel={mode === 'create'
          ? t('common.create', 'Döret')
          : t('common.save', 'Ýatda sakla')}
      />
    </form>
  )
}
