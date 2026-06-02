import { z } from "zod";
import type { CreateSberPaymentPayload, PaymentStatus } from "@/features/sberPayments/api/sberPaymentsApi";

const fileField = z.custom<File | null>((val) => val === null || val instanceof File).nullable();
const VALID_PHONE_PREFIXES = ["61", "62", "63", "64", "65", "71"];

export const sberPaymentFormSchema = z.object({
  welayat: z.string().min(1, "validation.required"),
  sahamca: z.string().min(1, "validation.required"),
  firstName: z.string().min(1, "validation.required"),
  lastName: z.string().min(1, "validation.required"),
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
  email: z.string(),
  address: z.string().min(1, "validation.required"),
  status: z.string().min(1, "validation.required"),
  bellik: z.string(),
  accountNumber: z.string().min(1, "validation.required"),
  passportSeries: z.string().min(1, "validation.required"),
  passportNumber: z.string().min(1, "validation.required"),
  fullName: z.string().min(1, "validation.required"),
  client_id: z.string().optional(),
  acc_sberbank_card: fileField,
  acc_enrollment: fileField,
  acc_summons: fileField,
  acc_passport_tm: fileField,
  acc_zagran_passport: fileField,
  acc_visa_page: fileField,
  acc_entry_stamp: fileField,
  acc_school_letter: fileField,
  snt_passport_tm: fileField,
  snt_zagran_passport: fileField,
  snt_entry_stamp: fileField,
  snt_relation_doc: fileField,
  snt_new_passport_series: fileField,
  snt_old_passport_series: fileField,
});

export type SberPaymentFormData = z.infer<typeof sberPaymentFormSchema>;

export const stepSchemas: Record<number, z.ZodType<Partial<SberPaymentFormData>>> = {
  0: sberPaymentFormSchema.pick({ status: true }),
  1: sberPaymentFormSchema.pick({ welayat: true, sahamca: true }),
  2: sberPaymentFormSchema.pick({ firstName: true, lastName: true, phone: true, address: true }),
  3: sberPaymentFormSchema.pick({ passportSeries: true, passportNumber: true, fullName: true, accountNumber: true }),
};

export function validateStep(
  stepIndex: number,
  form: SberPaymentFormData,
  mode: "create" | "edit",
  t?: (key: string, fallback?: string) => string,
): Partial<Record<keyof SberPaymentFormData, string>> {
  void mode;
  const schema = stepSchemas[stepIndex];
  if (!schema) return {};
  const result = schema.safeParse(form);
  if (result.success) return {};
  const errors: Partial<Record<keyof SberPaymentFormData, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof SberPaymentFormData;
    if (!errors[key]) {
      const msg = issue.message;
      errors[key] = t && msg.startsWith("validation.") ? t(msg, msg) : msg;
    }
  }
  return errors;
}

export const DEFAULT_FORM_VALUES: SberPaymentFormData = {
  client_id: "",
  welayat: "",
  sahamca: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  status: "GARASYLYYAR",
  bellik: "",
  accountNumber: "",
  passportSeries: "",
  passportNumber: "",
  fullName: "",
  acc_sberbank_card: null,
  acc_enrollment: null,
  acc_summons: null,
  acc_passport_tm: null,
  acc_zagran_passport: null,
  acc_visa_page: null,
  acc_entry_stamp: null,
  acc_school_letter: null,
  snt_passport_tm: null,
  snt_zagran_passport: null,
  snt_entry_stamp: null,
  snt_relation_doc: null,
  snt_new_passport_series: null,
  snt_old_passport_series: null,
};

export function buildPayload(data: SberPaymentFormData): CreateSberPaymentPayload {
  return {
    welayat: data.welayat,
    sahamca: data.sahamca,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    address: data.address,
    status: data.status as PaymentStatus,
    bellik: data.bellik,
    accountNumber: data.accountNumber,
    passportSeries: data.passportSeries,
    passportNumber: data.passportNumber,
    fullName: data.fullName,
  };
}
