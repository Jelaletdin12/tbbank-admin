import { z } from "zod";
import type { CreateClientPayload } from "../api/clientsApi";

const VALID_PHONE_PREFIXES = ["61", "62", "63", "64", "65", "71"];

export function clientFormSchema(mode: "create" | "edit", t: (key: string, fallback?: string) => string) {
  const baseSchema = z.object({
    username: z.string().min(1, t("validation.required", "validation.required")),
    name: z.string().min(1, t("validation.required", "validation.required")),
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

export type ClientFormData = z.infer<ReturnType<typeof clientFormSchema>>;

export const DEFAULT_FORM_VALUES: ClientFormData = {
  username: "",
  name: "",
  phone: "",
  email: "",
  password: "",
  isActive: true,
};

export function buildPayload(data: ClientFormData): CreateClientPayload {
  return {
    username: data.username.trim(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim() || undefined,
    password: data.password,
    isActive: data.isActive,
  };
}
