import { z } from "zod";
import i18next from "i18next";

const fileRequired = z.custom<File>((val) => val instanceof File, "validation.requiredFile");
const VALID_PHONE_PREFIXES = ["61", "62", "63", "64", "65", "71"];

export const cardPinFormSchema = z.object({
  status: z.string().min(1, "validation.required"),
  note: z.string().optional(),
  card_type: z.string().min(1, "validation.required"),
  card_number: z.string().min(1, "validation.required"),
  province: z.string().min(1, "validation.required"),
  branch: z.string().min(1, "validation.required"),
  first_name: z.string().min(1, "validation.required"),
  last_name: z.string().min(1, "validation.required"),
  father_name: z.string().optional(),
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
  passport_file_1: z.custom<File | null>().nullable(),
  passport_file_2: z.custom<File | null>().nullable(),
  passport_file_3: z.custom<File | null>().nullable(),
  passport_file_4: z.custom<File | null>().nullable(),
});

export type CardPinFormData = z.infer<typeof cardPinFormSchema>;

export const DEFAULT_FORM_VALUES: CardPinFormData = {
  status: "pending",
  note: "",
  card_type: "",
  card_number: "",
  province: "",
  branch: "",
  first_name: "",
  last_name: "",
  father_name: "",
  birth_date: "",
  phone: "",
  passport_series: "",
  passport_number: "",
  passport_file_1: null,
  passport_file_2: null,
  passport_file_3: null,
  passport_file_4: null,
};

export const stepSchemas: Record<number, z.ZodType<Partial<CardPinFormData>>> = {
  0: cardPinFormSchema.pick({
    status: true,
    card_type: true,
    card_number: true,
    province: true,
    branch: true,
  }),
  1: cardPinFormSchema.pick({
    first_name: true,
    last_name: true,
    birth_date: true,
    phone: true,
  }),
  2: z.object({
    passport_series: z.string().min(1, "validation.required"),
    passport_number: z.string().min(1, "validation.required"),
    passport_file_1: fileRequired,
    passport_file_2: fileRequired,
    passport_file_3: fileRequired,
    passport_file_4: fileRequired,
  }),
};

function translateMsg(msg: string): string {
  return msg.startsWith("validation.") ? i18next.t(msg, msg) : msg;
}

export function validateStep(
  stepIndex: number,
  form: CardPinFormData,
  mode: "create" | "edit",
): Partial<Record<keyof CardPinFormData, string>> {
  if (stepIndex === 2 && mode === "edit") {
    const schema = cardPinFormSchema.pick({ passport_series: true, passport_number: true });
    const result = schema.safeParse(form);
    if (result.success) return {};
    const errors: Partial<Record<keyof CardPinFormData, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof CardPinFormData;
      if (!errors[key]) errors[key] = translateMsg(issue.message);
    }
    return errors;
  }

  const schema = stepSchemas[stepIndex];
  const result = schema.safeParse(form);
  if (result.success) return {};

  const errors: Partial<Record<keyof CardPinFormData, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof CardPinFormData;
    if (!errors[key]) errors[key] = translateMsg(issue.message);
  }
  return errors;
}
