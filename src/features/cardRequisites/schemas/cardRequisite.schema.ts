import { z } from "zod";
import i18next from "i18next";
import type { CardRequisiteStatus, CreateCardRequisitePayload } from "../api/cardRequisitesApi";

const fileRequired = z.custom<File>((val) => val instanceof File, "validation.requiredFile");
const VALID_PHONE_PREFIXES = ["61", "62", "63", "64", "65", "71"];

export const cardRequisiteFormSchema = z.object({
  status: z.string().min(1, "validation.required"),
  note: z.string().optional(),
  card_type: z.string().min(1, "validation.required"),
  card_number: z.string().min(1, "validation.required"),
  card_expiry_month: z.string().min(1, "validation.required"),
  card_expiry_year: z.string().min(1, "validation.required"),
  province_id: z.string().min(1, "validation.required"),
  branch_id: z.string().min(1, "validation.required"),
  first_name: z.string().min(1, "validation.required"),
  last_name: z.string().min(1, "validation.required"),
  middle_name: z.string().optional(),
  birth_date: z.string().min(1, "validation.required"),
  phone: z
    .string()
    .min(1, "validation.required")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length === 8;
      },
      { message: "validation.invalidPhone" },
    )
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        const prefix = digits.slice(0, 2);
        return VALID_PHONE_PREFIXES.includes(prefix);
      },
      { message: "validation.invalidPhonePrefix" },
    ),
  passport_series: z.string().min(1, "validation.required"),
  passport_number: z.string().min(1, "validation.required"),
  passport_page1: z.custom<File | null>().nullable(),
  passport_page2_3: z.custom<File | null>().nullable(),
  passport_page8_9: z.custom<File | null>().nullable(),
  passport_page32: z.custom<File | null>().nullable(),
});

export type CardRequisiteFormData = z.infer<typeof cardRequisiteFormSchema>;

export const stepSchemas: Record<number, z.ZodType<Partial<CardRequisiteFormData>>> = {
  0: cardRequisiteFormSchema.pick({
    status: true,
    card_type: true,
    card_number: true,
    card_expiry_month: true,
    card_expiry_year: true,
    province_id: true,
    branch_id: true,
  }),
  1: cardRequisiteFormSchema.pick({
    first_name: true,
    last_name: true,
    birth_date: true,
    phone: true,
  }),
  2: z.object({
    passport_series: z.string().min(1, "validation.required"),
    passport_number: z.string().min(1, "validation.required"),
    passport_page1: fileRequired,
    passport_page2_3: fileRequired,
    passport_page8_9: fileRequired,
    passport_page32: fileRequired,
  }),
};

function translateMsg(msg: string): string {
  return msg.startsWith("validation.") ? i18next.t(msg, msg) : msg;
}

export function validateStep(
  stepIndex: number,
  form: CardRequisiteFormData,
  mode: "create" | "edit",
): Partial<Record<keyof CardRequisiteFormData, string>> {
  if (stepIndex === 2 && mode === "edit") {
    const schema = z.object({
      passport_series: z.string().min(1, "validation.required"),
      passport_number: z.string().min(1, "validation.required"),
    });
    const result = schema.safeParse(form);
    if (result.success) return {};
    const errors: Partial<Record<keyof CardRequisiteFormData, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof CardRequisiteFormData;
      if (!errors[key]) errors[key] = translateMsg(issue.message);
    }
    return errors;
  }

  const schema = stepSchemas[stepIndex];
  if (!schema) return {};
  const result = schema.safeParse(form);
  if (result.success) return {};
  const errors: Partial<Record<keyof CardRequisiteFormData, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof CardRequisiteFormData;
    if (!errors[key]) errors[key] = translateMsg(issue.message);
  }
  return errors;
}

export const DEFAULT_FORM_VALUES: CardRequisiteFormData = {
  status: "pending",
  note: "",
  card_type: "",
  card_number: "",
  card_expiry_month: "",
  card_expiry_year: "",
  province_id: "",
  branch_id: "",
  first_name: "",
  last_name: "",
  middle_name: "",
  birth_date: "",
  phone: "",
  passport_series: "",
  passport_number: "",
  passport_page1: null,
  passport_page2_3: null,
  passport_page8_9: null,
  passport_page32: null,
};

export function buildPayload(data: CardRequisiteFormData): CreateCardRequisitePayload {
  return {
    status: data.status as CardRequisiteStatus,
    note: data.note || undefined,
    card_type: data.card_type,
    card_number: data.card_number,
    card_expiry_month: data.card_expiry_month,
    card_expiry_year: data.card_expiry_year,
    province_id: data.province_id,
    branch_id: data.branch_id,
    first_name: data.first_name,
    last_name: data.last_name,
    middle_name: data.middle_name || undefined,
    birth_date: data.birth_date,
    phone: data.phone,
    passport_series: data.passport_series,
    passport_number: data.passport_number,
    ...(data.passport_page1 && { passport_page1: data.passport_page1 }),
    ...(data.passport_page2_3 && { passport_page2_3: data.passport_page2_3 }),
    ...(data.passport_page8_9 && { passport_page8_9: data.passport_page8_9 }),
    ...(data.passport_page32 && { passport_page32: data.passport_page32 }),
  };
}
