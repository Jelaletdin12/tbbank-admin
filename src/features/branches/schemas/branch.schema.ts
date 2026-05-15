import { z } from 'zod'
import type { CreateBranchPayload } from '@/features/branches/api/branchesApi'

export const branchFormSchema = z.object({
  nameTk: z.string().min(1, 'Türkmen ady — hökmany'),
  nameRu: z.string().min(1, 'Rus ady — hökmany'),
  nameEn: z.string().min(1, 'Iňlis ady — hökmany'),
  code: z.string().min(1, 'Kod — hökmany'),
  districtId: z.string().min(1, 'Etrap — hökmany'),
  addressTk: z.string().min(1, 'Türkmen salgysy — hökmany'),
  addressRu: z.string().min(1, 'Rus salgysy — hökmany'),
  addressEn: z.string().min(1, 'Iňlis salgysy — hökmany'),
  phone: z.string().min(1, 'Telefon — hökmany'),
  email: z.string().min(1, 'E-poçta — hökmany'),
  workingHours: z.string().min(1, 'Iş wagty — hökmany'),
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
