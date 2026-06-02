import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { BentoGrid, BentoCard } from "@/components/bento";

import { useCreateLoanRemaining, useUpdateLoanRemaining } from "../hooks/useLoanRemaining";
import type { LoanRemaining } from "../api/loanRemainingApi";
import { loanRemainingFormSchema, type LoanRemainingFormData, DEFAULT_FORM_VALUES, buildPayload } from "../schemas/loanRemaining.schema";

interface LoanRemainingFormProps {
  mode: "create" | "edit";
  initialData?: LoanRemaining;
}

export function LoanRemainingForm({ mode, initialData }: LoanRemainingFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const createMutation = useCreateLoanRemaining();
  const updateMutation = useUpdateLoanRemaining(initialData?.id ?? 0);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoanRemainingFormData>({
    resolver: zodResolver(loanRemainingFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        passportSeries: initialData.passportSeries,
        passportNumber: initialData.passportNumber,
        loanAccount: initialData.loanAccount,
      });
    }
  }, [mode, initialData, reset]);

  const onSubmit = (data: LoanRemainingFormData) => {
    const payload = buildPayload(data);

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("common.success.create", "Üstünlikli döredildi"));
          navigate("/loan-remaining");
        },
      });
    } else {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("common.success.save", "Üstünlikli ýatda saklandy"));
          navigate("/loan-remaining");
        },
      });
    }
  };

  const errMsg = (msg: string | undefined) => (msg?.startsWith("validation.") ? t(msg, msg) : msg);

  const onError = () => {
    toast.error(t("common.errors.fillRequired", "Hökman doldurylmaly öýjükleri dolduryň"));
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create"
          ? t("loanRemaining.createTitle", "Karzyň galyndysy dörediň")
          : t("loanRemaining.editTitle", "Karzyň galyndysy üýtgetmek")}
      </h1>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <BentoGrid cols={1}>
          <BentoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={t("loanRemaining.columns.passportSeries", "Pasport seriýasy")}
                required
                value={watch("passportSeries")}
                onChange={(v) => setValue("passportSeries", v)}
                placeholder={t("loanRemaining.placeholders.passportSeries", "TM")}
                error={errMsg(errors.passportSeries?.message)}
              />

              <FormInput
                label={t("loanRemaining.columns.passportNumber", "Pasport belgisi")}
                required
                value={watch("passportNumber")}
                onChange={(v) => setValue("passportNumber", v)}
                placeholder="A123456"
                error={errMsg(errors.passportNumber?.message)}
              />

              <div className="md:col-span-2">
                <FormInput
                  label={t("loanRemaining.columns.loanAccount", "Karz hasaby")}
                  required
                  value={watch("loanAccount")}
                  onChange={(v) => setValue("loanAccount", v)}
                  placeholder="NOVA-..."
                  error={errMsg(errors.loanAccount?.message)}
                />
              </div>
            </div>
          </BentoCard>
        </BentoGrid>

        <FormActions
          isPending={isPending}
          onSubmit={handleSubmit(onSubmit, onError)}
          onCancel={() => navigate("/loan-remaining")}
          submitLabel={mode === "create" ? t("common.create", "Döret") : t("common.save", "Ýatda sakla")}
        />
      </form>
    </div>
  );
}
