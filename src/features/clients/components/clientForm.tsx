import { useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { FormActions } from "@/components/formActions";
import { FormInput } from "@/components/formInput";
import { BentoGrid, BentoCard } from "@/components/bento";
import { useCreateClient, useUpdateClient } from "../hooks/useClients";
import { clientFormSchema, DEFAULT_FORM_VALUES, buildPayload } from "../schemas/client.schema";
import type { ClientFormData } from "../schemas/client.schema";
import type { Client } from "../api/clientsApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientFormProps {
  mode: "create" | "edit";
  initialData?: Client;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof ClientFormData, string>>;

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof ClientFormData] = msg;
  }
  return result;
}

// ─── ClientForm ───────────────────────────────────────────────────────────────

export function ClientForm({ mode, initialData }: ClientFormProps) {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  );
  const navigate = useNavigate();

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient(initialData?.id ?? 0);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const schema = useMemo(() => clientFormSchema(mode, t), [mode, t, i18n.language]);

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
  } = useForm<ClientFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: initialData
      ? {
          ...DEFAULT_FORM_VALUES,
          username: initialData.username,
          name: initialData.name,
          phone: initialData.phone ?? "",
          email: initialData.email ?? "",
          password: "",
          isActive: initialData.isActive,
        }
      : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors]);

  const setField = <K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) => {
    (setValue as (name: K, val: ClientFormData[K]) => void)(key, value);
    clearErrors(key);
  };

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) {
      trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();

    if (mode === "create") {
      const payload = buildPayload(data);
      createMutation.mutate(payload, {
        onSuccess: () => navigate("/clients"),
      });
    } else {
      updateMutation.mutate(
        {
          username: data.username.trim(),
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim() || undefined,
          isActive: data.isActive,
          ...(data.password.trim() ? { password: data.password } : {}),
        },
        {
          onSuccess: () => navigate(`/clients/${initialData!.id}`),
        },
      );
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create" ? t("clients.createTitle", "Müşderi dörediň") : t("clients.editTitle", "Müşderi üýtgetmek")}
      </h1>
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("clients.fields.username", "Ulanyjy ady")}
            value={form.username}
            onChange={(v) => setField("username", v)}
            placeholder={t("clients.fields.username", "Ulanyjy ady")}
            error={errors.username}
            disabled={isPending}
            required
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("clients.fields.name", "Ady")}
            value={form.name}
            onChange={(v) => setField("name", v)}
            placeholder={t("clients.fields.name", "Ady")}
            error={errors.name}
            disabled={isPending}
            required
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="phone"
            label={t("clients.fields.phone", "Telefon")}
            value={form.phone}
            onChange={(v) => setField("phone", v)}
            error={errors.phone}
            disabled={isPending}
            required
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="email"
            label={t("clients.fields.email", "E-poçta")}
            value={form.email}
            onChange={(v) => setField("email", v)}
            placeholder={t("clients.fields.email", "E-poçta")}
            disabled={isPending}
          />
        </BentoCard>
      </BentoGrid>
      <BentoGrid cols={1}>
        <BentoCard>
          <FormInput
            type="password"
            label={t("clients.fields.password", "Açar sözi") + (mode === "create" ? " *" : "")}
            value={form.password}
            onChange={(v) => setField("password", v)}
            placeholder={
              mode === "edit"
                ? t("clients.fields.passwordEditHint", "Üýtgetmek üçin täze açar söz giriziň")
                : t("clients.fields.password", "Açar sözi")
            }
            error={errors.password}
            disabled={isPending}
          />
          {mode === "edit" && (
            <p className="text-xs text-muted-foreground -mt-3">
              {t("clients.fields.passwordEditNote", "Boş goýsaňyz, açar sözi üýtgemez")}
            </p>
          )}
        </BentoCard>
        <BentoCard>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{t("clients.fields.isActive", "Işjeň")}</span>
            <Checkbox
              checked={form.isActive}
              onCheckedChange={(v) => setField("isActive", !!v)}
              disabled={isPending}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
          <FormActions
            isPending={isPending}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            cancelVariant="ghost"
            submitLabel={mode === "create" ? t("clients.createBtn", "Müşderi döredin") : t("clients.updateBtn", "Üýtgetmeleri sakla")}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
