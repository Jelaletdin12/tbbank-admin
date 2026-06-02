import { useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormActions } from "@/components/formActions";
import { BentoGrid, BentoCard } from "@/components/bento";
import { MultiLangInput } from "@/components/multiLangInput";
import { useCreatePermission, useUpdatePermission } from "../hooks/usePermissions";
import { createPermissionFormSchema, DEFAULT_FORM_VALUES, buildPayload } from "../schemas/permission.schema";
import type { PermissionFormData } from "../schemas/permission.schema";
import type { Permission } from "../api/permissionsApi";
import { FormInput } from "@/components/formInput";
// ─── Types ────────────────────────────────────────────────────────────────────

interface PermissionFormProps {
  mode: "create" | "edit";
  initialData?: Permission;
}

const GUARD_OPTIONS = [
  { value: "web", label: "web" },
  { value: "api", label: "api" },
  { value: "sanctum", label: "sanctum" },
];

type FlatErrors = Partial<Record<keyof PermissionFormData, string>>;

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof PermissionFormData] = msg;
  }
  return result;
}

// ─── PermissionForm ───────────────────────────────────────────────────────────

export function PermissionForm({ mode, initialData }: PermissionFormProps) {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  );
  const navigate = useNavigate();

  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission(initialData?.id ?? 0);

  const isPending = createPermission.isPending || updatePermission.isPending;

  const schema = useMemo(() => createPermissionFormSchema(t), [t, i18n.language]);

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
  } = useForm<PermissionFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          ...DEFAULT_FORM_VALUES,
          code: initialData.code,
          nameTk: initialData.name.tk,
          nameRu: initialData.name.ru,
          nameEn: initialData.name.en,
          guard_name: initialData.guard_name,
        }
      : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors]);

  const setField = useCallback(
    (key: keyof PermissionFormData) => (value: string) => {
      (setValue as (k: keyof PermissionFormData, v: string) => void)(key, value);
      clearErrors(key);
    },
    [setValue, clearErrors],
  );

  const nameFields = {
    tk: {
      value: form.nameTk,
      onChange: (v: string) => {
        setValue("nameTk", v);
        clearErrors("nameTk");
      },
      error: errors.nameTk,
    },
    ru: {
      value: form.nameRu,
      onChange: (v: string) => {
        setValue("nameRu", v);
        clearErrors("nameRu");
      },
      error: errors.nameRu,
    },
    en: {
      value: form.nameEn,
      onChange: (v: string) => {
        setValue("nameEn", v);
        clearErrors("nameEn");
      },
      error: errors.nameEn,
    },
  };

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const values = getValues();
    const payload = buildPayload(values);

    if (mode === "create") {
      createPermission.mutate(payload, {
        onSuccess: () => navigate("/settings/users/permissions"),
      });
    } else {
      updatePermission.mutate(payload, {
        onSuccess: () => navigate("/settings/users/permissions"),
      });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create" ? t("permissions.createTitle", "Rugsat dörediň") : t("permissions.editTitle", "Rugsat üýtgetmek")}
      </h1>
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("permissions.fields.code", "Kod")}
            value={form.code}
            onChange={setField("code")}
            placeholder={t("permissions.fields.code", "Kod")}
            error={errors.code}
            disabled={isPending}
            required
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="select"
            label={t("permissions.fields.guardName", "Guard name")}
            value={form.guard_name}
            onChange={setField("guard_name")}
            options={GUARD_OPTIONS}
            error={errors.guard_name}
            disabled={isPending}
            required
          />
        </BentoCard>
        <BentoCard span="full">
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            {t("permissions.fields.name", "Ady")}
            <span className="text-destructive ml-0.5">*</span>
          </p>
          <MultiLangInput fields={nameFields} placeholder={t("permissions.fields.name", "Ady")} disabled={isPending} />
        </BentoCard>
      </BentoGrid>
      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/settings/users/permissions")}
        submitLabel={mode === "create" ? t("permissions.actions.create", "Rugsat dörediň") : t("permissions.actions.save", "Ýatda sakla")}
      />
    </div>
  );
}
