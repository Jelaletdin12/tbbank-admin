import { z } from "zod";
import type { CreateBranchPayload } from "@/features/branches/api/branchesApi";

const VALID_PHONE_PREFIXES = ["61", "62", "63", "64", "65", "71"];

export function createBranchFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    nameTk: z.string().min(1, t("validation.required", "validation.required")),
    nameRu: z.string().min(1, t("validation.required", "validation.required")),
    nameEn: z.string().min(1, t("validation.required", "validation.required")),
    code: z.string().min(1, t("validation.required", "validation.required")),
    districtId: z.string().min(1, t("validation.required", "validation.required")),
    addressTk: z.string().min(1, t("validation.required", "validation.required")),
    addressRu: z.string().min(1, t("validation.required", "validation.required")),
    addressEn: z.string().min(1, t("validation.required", "validation.required")),
    phone: z
      .string()
      .min(1, t("validation.required", "validation.required"))
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, "");
          return digits.length === 8;
        },
        { message: t("validation.invalidPhone", "validation.invalidPhone") },
      )
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, "");
          const prefix = digits.slice(0, 2);
          return VALID_PHONE_PREFIXES.includes(prefix);
        },
        { message: t("validation.invalidPhonePrefix", "validation.invalidPhonePrefix") },
      ),
    email: z.string().min(1, t("validation.required", "validation.required")),
    workingHours: z.string().min(1, t("validation.required", "validation.required")),
    description: z.string().optional(),
    isActive: z.boolean(),
  });
}

export type BranchFormData = z.infer<ReturnType<typeof createBranchFormSchema>>;

type StepSchemas = Record<number, z.ZodType<Partial<BranchFormData>>>;

function createStepSchemas(t: (key: string, fallback?: string) => string): StepSchemas {
  const schema = createBranchFormSchema(t);
  return {
    0: schema.pick({ nameTk: true, nameRu: true, nameEn: true, code: true, districtId: true }),
    1: schema.pick({ addressTk: true, addressRu: true, addressEn: true, phone: true, email: true }),
    2: schema.pick({ workingHours: true }),
  };
}

export function validateStep(
  stepIndex: number,
  form: BranchFormData,
  mode: "create" | "edit",
  t: (key: string, fallback?: string) => string,
): Partial<Record<keyof BranchFormData, string>> {
  void mode;
  const stepSchemas = createStepSchemas(t);
  const schema = stepSchemas[stepIndex];
  if (!schema) return {};
  const result = schema.safeParse(form);
  if (result.success) return {};
  const errors: Partial<Record<keyof BranchFormData, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof BranchFormData;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export const DEFAULT_FORM_VALUES: BranchFormData = {
  nameTk: "",
  nameRu: "",
  nameEn: "",
  code: "",
  districtId: "",
  addressTk: "",
  addressRu: "",
  addressEn: "",
  phone: "",
  email: "",
  workingHours: "",
  description: "",
  isActive: true,
};

export function buildPayload(data: BranchFormData): CreateBranchPayload {
  return {
    name: { tk: data.nameTk, ru: data.nameRu, en: data.nameEn },
    code: data.code,
    districtId: Number(data.districtId),
    address: { tk: data.addressTk, ru: data.addressRu, en: data.addressEn },
    phone: data.phone,
    email: data.email,
    workingHours: data.workingHours,
    description: (data.description ?? "").trim() || null,
    isActive: data.isActive,
  };
}
