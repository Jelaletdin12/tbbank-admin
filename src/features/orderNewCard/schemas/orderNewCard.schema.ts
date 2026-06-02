import { z } from "zod";
import i18next from "i18next";
import type { CardOrderStatus } from "../api/orderNewCardApi";

const fileRequired = z.custom<File>((val) => val instanceof File, "validation.requiredFile");
const VALID_PHONE_PREFIXES = ["61", "62", "63", "64", "65", "71"];

export const orderNewCardFormSchema = z.object({
  isPaid: z.boolean(),
  status: z.string().min(1, "validation.required"),
  note: z.string().optional(),
  issuanceReasonId: z.string().min(1, "validation.required"),
  cardTypeId: z.string().min(1, "validation.required"),
  provinceId: z.string().min(1, "validation.required"),
  branchId: z.string().min(1, "validation.required"),
  firstName: z.string().min(1, "validation.required"),
  lastName: z.string().min(1, "validation.required"),
  middleName: z.string().optional(),
  formerLastName: z.string().optional(),
  birthDate: z.string().min(1, "validation.required"),
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
  phoneExtra: z
    .string()
    .refine(
      (val) => {
        if (!val || val.replace(/\D/g, "").length === 0) return true;
        const digits = val.replace(/\D/g, "");
        return digits.length === 8;
      },
      { message: "validation.invalidPhone" },
    )
    .refine(
      (val) => {
        if (!val || val.replace(/\D/g, "").length === 0) return true;
        const digits = val.replace(/\D/g, "");
        return VALID_PHONE_PREFIXES.includes(digits.slice(0, 2));
      },
      { message: "validation.invalidPhonePrefix" },
    )
    .optional(),
  citizenship: z.string().min(1, "validation.required"),
  registeredAddress: z.string().min(1, "validation.required"),
  currentAddress: z.string().min(1, "validation.required"),
  workplace: z.string().min(1, "validation.required"),
  passportSeriesId: z.string().min(1, "validation.required"),
  passportNumber: z.string().min(1, "validation.required"),
  passportIssueDate: z.string().min(1, "validation.required"),
  passportIssuedBy: z.string().min(1, "validation.required"),
  passportBirthPlace: z.string().min(1, "validation.required"),
  passportPage1: z.custom<File | null>().nullable(),
  passportPage23: z.custom<File | null>().nullable(),
  passportPage89: z.custom<File | null>().nullable(),
  passportPage32: z.custom<File | null>().nullable(),
  termsAccepted: z.boolean(),
});

export type OrderNewCardFormData = z.infer<typeof orderNewCardFormSchema>;

export const stepSchemas: Record<number, z.ZodType<Partial<OrderNewCardFormData>>> = {
  0: orderNewCardFormSchema.pick({
    status: true,
    issuanceReasonId: true,
    cardTypeId: true,
    provinceId: true,
    branchId: true,
  }),
  1: orderNewCardFormSchema.pick({
    firstName: true,
    lastName: true,
    birthDate: true,
    phone: true,
    phoneExtra: true,
    citizenship: true,
    registeredAddress: true,
    currentAddress: true,
    workplace: true,
  }),
  2: orderNewCardFormSchema.pick({
    passportSeriesId: true,
    passportNumber: true,
    passportIssueDate: true,
    passportIssuedBy: true,
    passportBirthPlace: true,
  }),
  3: z.object({
    passportPage1: fileRequired,
    passportPage23: fileRequired,
    passportPage89: fileRequired,
    passportPage32: fileRequired,
    termsAccepted: z.literal(true, { message: "validation.requiredTerms" }),
  }),
};

export function validateStep(
  stepIndex: number,
  form: OrderNewCardFormData,
  mode: "create" | "edit",
): Partial<Record<keyof OrderNewCardFormData, string>> {
  if (stepIndex === 3 && mode === "edit") return {};
  const schema = stepSchemas[stepIndex];
  const result = schema.safeParse(form);
  if (result.success) return {};
  const errors: Partial<Record<keyof OrderNewCardFormData, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof OrderNewCardFormData;
    if (!errors[key]) {
      const msg = issue.message;
      errors[key] = msg.startsWith("validation.") ? i18next.t(msg, msg) : msg;
    }
  }
  return errors;
}

export const DEFAULT_FORM_VALUES: OrderNewCardFormData = {
  isPaid: false,
  status: "",
  note: "",
  issuanceReasonId: "",
  cardTypeId: "",
  provinceId: "",
  branchId: "",
  firstName: "",
  lastName: "",
  middleName: "",
  formerLastName: "",
  birthDate: "",
  phone: "",
  phoneExtra: "",
  citizenship: "Turkmenistan",
  registeredAddress: "",
  currentAddress: "",
  workplace: "",
  passportSeriesId: "",
  passportNumber: "",
  passportIssueDate: "",
  passportIssuedBy: "",
  passportBirthPlace: "",
  passportPage1: null,
  passportPage23: null,
  passportPage89: null,
  passportPage32: null,
  termsAccepted: false,
};

export function buildPayload(data: OrderNewCardFormData) {
  return {
    isPaid: data.isPaid,
    status: data.status as CardOrderStatus,
    note: data.note || null,
    issuanceReasonId: Number(data.issuanceReasonId),
    cardTypeId: Number(data.cardTypeId),
    provinceId: Number(data.provinceId),
    branchId: Number(data.branchId),
    firstName: data.firstName,
    lastName: data.lastName,
    middleName: data.middleName || null,
    formerLastName: data.formerLastName || null,
    birthDate: data.birthDate,
    phone: data.phone,
    phoneExtra: data.phoneExtra || null,
    citizenship: data.citizenship,
    registeredAddress: data.registeredAddress,
    currentAddress: data.currentAddress,
    workplace: data.workplace,
    passportSeriesId: Number(data.passportSeriesId),
    passportNumber: data.passportNumber,
    passportIssueDate: data.passportIssueDate,
    passportIssuedBy: data.passportIssuedBy,
    passportBirthPlace: data.passportBirthPlace,
    ...(data.passportPage1 && { passportPage1: data.passportPage1 }),
    ...(data.passportPage23 && { passportPage23: data.passportPage23 }),
    ...(data.passportPage89 && { passportPage89: data.passportPage89 }),
    ...(data.passportPage32 && { passportPage32: data.passportPage32 }),
  };
}
