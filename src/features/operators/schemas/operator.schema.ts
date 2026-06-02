import { z } from "zod";
import type { CreateOperatorPayload } from "../api/operatorsApi";

const VALID_PHONE_PREFIXES = ["61", "62", "63", "64", "65", "71"];

export function operatorFormSchema(mode: "create" | "edit", t: (key: string, fallback?: string) => string) {
  const baseSchema = z.object({
    username: z.string().min(1, t("validation.required", "validation.required")),
    name: z.string().min(1, t("validation.required", "validation.required")),
    phone: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          const digits = val.replace(/\D/g, "");
          return digits.length === 8;
        },
        { message: "validation.invalidPhone" },
      )
      .refine(
        (val) => {
          if (!val) return true;
          const digits = val.replace(/\D/g, "");
          return VALID_PHONE_PREFIXES.includes(digits.slice(0, 2));
        },
        { message: "validation.invalidPhonePrefix" },
      )
      .default(""),
    email: z.string().default(""),
    password: z.string(),
    isActive: z.boolean(),
  });

  return mode === "create"
    ? baseSchema.extend({
        password: z.string().min(1, t("validation.required", "validation.required")),
      })
    : baseSchema;
}

export type OperatorFormData = z.infer<ReturnType<typeof operatorFormSchema>>;

export const DEFAULT_FORM_VALUES: OperatorFormData = {
  username: "",
  name: "",
  phone: "",
  email: "",
  password: "",
  isActive: true,
};

export function buildPayload(data: OperatorFormData): CreateOperatorPayload {
  return {
    username: data.username.trim(),
    name: data.name.trim(),
    phone: data.phone.trim() || undefined,
    email: data.email.trim() || undefined,
    password: data.password,
    isActive: data.isActive,
  };
}
