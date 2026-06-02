import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { BentoGrid, BentoCard } from "@/components/bento";

import { useCreateLoanPaidOffLetter, useUpdateLoanPaidOffLetter } from "../hooks/useLoanPaidOffLetters";
import type { LoanPaidOffLetter } from "../api/loanPaidOffLettersApi";
import {
  loanPaidOffLetterFormSchema,
  type LoanPaidOffLetterFormData,
  DEFAULT_FORM_VALUES,
  buildPayload,
} from "../schemas/loanPaidOffLetter.schema";

interface LoanPaidOffLetterFormProps {
  mode: "create" | "edit";
  initialData?: LoanPaidOffLetter;
}

export function LoanPaidOffLetterForm({ mode, initialData }: LoanPaidOffLetterFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const createMutation = useCreateLoanPaidOffLetter();
  const updateMutation = useUpdateLoanPaidOffLetter(initialData?.id ?? 0);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoanPaidOffLetterFormData>({
    resolver: zodResolver(loanPaidOffLetterFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        passportSeries: initialData.passportSeries,
        passportNumber: initialData.passportNumber,
        loanAccount: initialData.loanAccount,
        issuedAt: initialData.issuedAt,
      });
    }
  }, [mode, initialData, reset]);

  const onSubmit = (data: LoanPaidOffLetterFormData) => {
    const payload = buildPayload(data);

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("common.success.create", "Üstünlikli döredildi"));
          navigate("/loan-paid-off-letters");
        },
      });
    } else {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("common.success.save", "Üstünlikli ýatda saklandy"));
          navigate("/loan-paid-off-letters");
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
          ? t("loanPaidOffLetters.createTitle", "Karzyň ýapylandygy barada güwanama almak dörediň")
          : t("loanPaidOffLetters.editTitle", "Karzyň ýapylandygy barada güwanama almak üýtgetmek")}
      </h1>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <BentoGrid cols={1}>
          <BentoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={t("loanPaidOffLetters.columns.passportSeries", "Pasport seriýasy")}
                required
                value={watch("passportSeries")}
                onChange={(v) => setValue("passportSeries", v)}
                placeholder={t("loanPaidOffLetters.placeholders.passportSeries", "TM")}
                error={errMsg(errors.passportSeries?.message)}
              />

              <FormInput
                label={t("loanPaidOffLetters.columns.passportNumber", "Pasport belgisi")}
                required
                value={watch("passportNumber")}
                onChange={(v) => setValue("passportNumber", v)}
                placeholder="A123456"
                error={errMsg(errors.passportNumber?.message)}
              />

              <FormInput
                label={t("loanPaidOffLetters.columns.loanAccount", "Karz hasaby")}
                required
                value={watch("loanAccount")}
                onChange={(v) => setValue("loanAccount", v)}
                placeholder="LOAN-..."
                error={errMsg(errors.loanAccount?.message)}
              />

              <FormInput
                label={t("loanPaidOffLetters.columns.issuedAt", "Berlen wagty")}
                required
                type="date"
                value={watch("issuedAt")}
                onChange={(v) => setValue("issuedAt", v)}
                error={errMsg(errors.issuedAt?.message)}
              />
            </div>
          </BentoCard>
        </BentoGrid>

        <FormActions
          isPending={isPending}
          onSubmit={handleSubmit(onSubmit, onError)}
          onCancel={() => navigate("/loan-paid-off-letters")}
          submitLabel={mode === "create" ? t("common.create", "Döret") : t("common.save", "Ýatda sakla")}
        />
      </form>
    </div>
  );
}
