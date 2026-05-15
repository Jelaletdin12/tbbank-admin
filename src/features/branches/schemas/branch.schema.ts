import { z } from 'zod'
import i18next from 'i18next'
import type { CreateBranchPayload } from '@/features/branches/api/branchesApi'

const t = i18next.t.bind(i18next)

export const branchFormSchema = z.object({
  nameTk: z.string().min(1, t('validation.required', '')),
  nameRu: z.string().min(1, t('validation.required', '')),
  nameEn: z.string().min(1, t('validation.required', '')),
  code: z.string().min(1, t('validation.required', '')),
  districtId: z.string().min(1, t('validation.required', '')),
  addressTk: z.string().min(1, t('validation.required', '')),
  addressRu: z.string().min(1, t('validation.required', '')),
  addressEn: z.string().min(1, t('validation.required', '')),
  phone: z.string().min(1, t('validation.required', '')),
  email: z.string().min(1, t('validation.required', '')),
  workingHours: z.string().min(1, t('validation.required', '')),
  description: z.string().optional(),
  isActive: z.boolean(),
})

export type BranchFormData = z.infer<typeof branchFormSchema>

export const stepSchemas: Record<number, z.ZodType<Partial<BranchFormData>>> = {
  0: branchFormSchema.pick({ nameTk: true, nameRu: true, nameEn: true, code: true, districtId: true }),
  1: branchFormSchema.pick({ addressTk: true, addressRu: true, addressEn: true, phone: true, email: true }),
  2: branchFormSchema.pick({ workingHours: true }),
}

export function validateStep(
  stepIndex: number,
  form: BranchFormData,
  mode: 'create' | 'edit',
): Partial<Record<keyof BranchFormData, string>> {
  void mode
  const schema = stepSchemas[stepIndex]
  const result = schema.safeParse(form)
  if (result.success) return {}
  const errors: Partial<Record<keyof BranchFormData, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof BranchFormData
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

export const DEFAULT_FORM_VALUES: BranchFormData = {
  nameTk: '', nameRu: '', nameEn: '',
  code: '',
  districtId: '',
  addressTk: '', addressRu: '', addressEn: '',
  phone: '', email: '',
  workingHours: '',
  description: '',
  isActive: true,
}

export function buildPayload(data: BranchFormData): CreateBranchPayload {
  return {
    name: { tk: data.nameTk, ru: data.nameRu, en: data.nameEn },
    code: data.code,
    districtId: Number(data.districtId),
    address: { tk: data.addressTk, ru: data.addressRu, en: data.addressEn },
    phone: data.phone,
    email: data.email,
    workingHours: data.workingHours,
    description: (data.description ?? '').trim() || null,
    isActive: data.isActive,
  }
}
