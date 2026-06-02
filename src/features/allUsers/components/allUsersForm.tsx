import { useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/formInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/formActions";
import { BentoGrid, BentoCard } from "@/components/bento";
import { useCreateUser, useUpdateUser } from "../hooks/useAllUsers";
import type { User } from "../api/allUsersApi";
import { allUserFormSchema, DEFAULT_FORM_VALUES, buildPayload } from "../schemas/allUser.schema";
import type { AllUserFormData } from "../schemas/allUser.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: User;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof AllUserFormData, string>>;

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof AllUserFormData] = msg;
  }
  return result;
}

// ─── UserForm ─────────────────────────────────────────────────────────────────

export function UserForm({ mode, initialData }: UserFormProps) {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  );
  const navigate = useNavigate();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser(initialData?.id ?? 0);

  const isPending = createUser.isPending || updateUser.isPending;

  const schema = useMemo(() => allUserFormSchema(mode, t), [mode, t, i18n.language]);

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
  } = useForm<AllUserFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: initialData
      ? {
          ...DEFAULT_FORM_VALUES,
          username: initialData.username,
          name: initialData.name,
          phone: initialData.phone.replace(/^\+993[-\s]?/, ""),
          email: initialData.email ?? "",
          password: "",
          phoneVerified: initialData.phoneVerified,
          isActive: initialData.isActive,
        }
      : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors]);

  const setField = <K extends keyof AllUserFormData>(key: K, value: AllUserFormData[K]) => {
    (setValue as (name: K, val: AllUserFormData[K]) => void)(key, value);
    clearErrors(key);
  };

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) {
      trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();

    if (mode === "create") {
      const payload = buildPayload(data);
      await createUser.mutateAsync(payload);
      navigate("/users");
    } else {
      await updateUser.mutateAsync({
        username: data.username.trim(),
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim() || undefined,
        phoneVerified: data.phoneVerified,
        isActive: data.isActive,
      });
      navigate(`/users/${initialData!.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create" ? t("users.createTitle", "Ulanyjy dörediň") : t("users.editTitle", "Ulanyjy üýtgetmek")}
      </h1>
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("users.fields.username", "Ulanyjy ady")}
            value={form.username}
            onChange={(v) => setField("username", v)}
            placeholder={t("users.fields.username", "Ulanyjy ady")}
            error={errors.username}
            disabled={isPending}
            required
          />
          <p className="text-xs text-muted-foreground -mt-3">{t("users.fields.usernameHint", "Unikal login ady")}</p>
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("users.fields.name", "Ady")}
            value={form.name}
            onChange={(v) => setField("name", v)}
            placeholder={t("users.fields.name", "Ady")}
            error={errors.name}
            disabled={isPending}
            required
          />
          <p className="text-xs text-muted-foreground -mt-3">{t("users.fields.nameHint", "Doly ady we familiýasy")}</p>
        </BentoCard>
        <BentoCard>
          <FormInput
            type="phone"
            label={t("users.fields.phone", "Telefon")}
            value={form.phone}
            onChange={(v) => setField("phone", v)}
            placeholder="62-38-49-56"
            error={errors.phone}
            disabled={isPending}
            required
          />
          <p className="text-xs text-muted-foreground -mt-3">{t("users.fields.phoneHint", "+993 bilen başlanýar")}</p>
        </BentoCard>
        <BentoCard>
          <FormInput
            type="email"
            label={t("users.fields.email", "E-poçta")}
            value={form.email}
            onChange={(v) => setField("email", v)}
            placeholder={t("users.fields.email", "E-poçta")}
            error={errors.email}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground -mt-3">{t("users.fields.emailHint", "Islege görä")}</p>
        </BentoCard>
        {mode === "create" && (
          <BentoCard>
            <FormInput
              type="password"
              label={t("users.fields.password", "Açar sözi")}
              value={form.password}
              onChange={(v) => setField("password", v)}
              placeholder={t("users.fields.password", "Açar sözi")}
              error={errors.password}
              disabled={isPending}
              required
            />
            <p className="text-xs text-muted-foreground -mt-3">{t("users.fields.passwordHint", "Iň az 6 harp")}</p>
          </BentoCard>
        )}
        <BentoCard>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">{t("users.fields.phoneVerified", "Telefon tassyklanan")}</p>
            <p className="text-xs text-muted-foreground">{t("users.fields.phoneVerifiedHint", "SMS arkaly tassyklandy")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="phoneVerified"
              checked={form.phoneVerified}
              onCheckedChange={(v) => setField("phoneVerified", !!v)}
              disabled={isPending}
            />
            <Label htmlFor="phoneVerified" className="text-sm text-muted-foreground cursor-pointer">
              {form.phoneVerified ? t("common.yes", "Hawa") : t("common.no", "Ýok")}
            </Label>
          </div>
        </BentoCard>
        <BentoCard>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">{t("users.fields.isActive", "Işjeň")}</p>
            <p className="text-xs text-muted-foreground">{t("users.fields.isActiveHint", "Ulanyjynyň ulgama girip-bilmezligi")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="isActive" checked={form.isActive} onCheckedChange={(v) => setField("isActive", !!v)} disabled={isPending} />
            <Label htmlFor="isActive" className="text-sm text-muted-foreground cursor-pointer">
              {form.isActive ? t("common.active", "Işjeň") : t("common.inactive", "Işjeň däl")}
            </Label>
          </div>
        </BentoCard>
      </BentoGrid>
      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel={mode === "create" ? t("users.actions.create", "Ulanyjy dörediň") : t("users.actions.save", "Ýatda sakla")}
      />
    </div>
  );
}
