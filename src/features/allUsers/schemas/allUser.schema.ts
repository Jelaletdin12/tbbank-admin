import { z } from "zod";
import type { CreateUserPayload } from "../api/allUsersApi";

const VALID_PHONE_PREFIXES = ["61", "62", "63", "64", "65", "71"];

export function allUserFormSchema(mode: "create" | "edit", t: (key: string, fallback?: string) => string) {
  const baseSchema = z.object({
    username: z.string().min(1, t("validation.required", "validation.required")).min(3, t("validation.minLength", "validation.minLength")),
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
    email: z
      .string()
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), t("validation.invalidEmail", "validation.invalidEmail"))
      .default(""),
    password: z.string(),
    phoneVerified: z.boolean(),
    isActive: z.boolean(),
  });

  return mode === "create"
    ? baseSchema.extend({
        password: z
          .string()
          .min(1, t("validation.required", "validation.required"))
          .min(6, t("validation.minLength", "validation.minLength")),
      })
    : baseSchema;
}

export type AllUserFormData = z.infer<ReturnType<typeof allUserFormSchema>>;

export const DEFAULT_FORM_VALUES: AllUserFormData = {
  username: "",
  name: "",
  phone: "",
  email: "",
  password: "",
  phoneVerified: false,
  isActive: true,
};

export function buildPayload(data: AllUserFormData): CreateUserPayload {
  return {
    username: data.username.trim(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim() || undefined,
    password: data.password,
    phoneVerified: data.phoneVerified,
    isActive: data.isActive,
  };
}
