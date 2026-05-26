// pages/OnlinePaymentDetailPage.tsx

import {  useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, InfoRow } from "@/components/viewPageComponents";
import { useGetOnlinePaymentById } from "@/features/onlinePaymentHistory/hooks/useOnlinePaymentsHistory";
import { PaymentStatusBadge } from "../../features/onlinePaymentHistory/components/PaymentStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

// ─── OnlinePaymentDetailPage ──────────────────────────────────────────────────

export default function OnlinePaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { t } = useTranslation();

  const { data: payment, isLoading } = useGetOnlinePaymentById(numericId);

  // ─── Loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-[560px] w-full rounded-xl" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          {t("onlinePayments.notFound", "Töleg tapylmady")}
        </p>
      </div>
    );
  }

  const title = `${t("onlinePayments.detail.title", "Onlaýn töleg taryhy giňişleýin")}: ${payment.orderId}`;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6 break-all">
        {title}
      </h1>

      {/* Detail Card */}
      <Section>
        <InfoRow label={t("common.id", "ID")} value={payment.id} />
        <InfoRow
          label={t("onlinePayments.fields.amount", "amount")}
          value={payment.amount}
        />
        <InfoRow
          label={t("onlinePayments.fields.orderNumber", "orderNumber")}
          value={payment.orderNumber}
        />
        <InfoRow
          label={t("onlinePayments.fields.apiClient", "Api Client")}
          value={payment.apiClient}
        />
        <InfoRow
          label={t("onlinePayments.fields.description", "description")}
          value={payment.description}
        />
        <InfoRow
          label={t("onlinePayments.fields.orderId", "orderId")}
          value={payment.orderId}
        />
        <InfoRow
          label={t("onlinePayments.fields.formUrl", "formUrl")}
          isLink
          value={payment.formUrl}
        />
        <InfoRow
          label={t("onlinePayments.fields.successUrl", "successUrl")}
          isLink
          value={payment.successUrl}
        />
        <InfoRow label={t("onlinePayments.fields.status", "Status")}>
          <PaymentStatusBadge status={payment.status} />
        </InfoRow>
        <InfoRow
          label={t("onlinePayments.fields.callbackStatus", "callbackStatus")}
          value={payment.callbackStatus ?? "—"}
        />
        <InfoRow
          label={t("onlinePayments.fields.username", "username")}
          value={payment.username}
        />
        <InfoRow
          label={t(
            "onlinePayments.fields.onlinePaymantableId",
            "online_paymantable_id",
          )}
          value={payment.onlinePaymantableId}
        />
        <InfoRow
          label={t(
            "onlinePayments.fields.onlinePaymantableType",
            "online_paymantable_type",
          )}
          value={payment.onlinePaymantableType}
        />
        <InfoRow
          label={t("onlinePayments.fields.createdAt", "Döredilen wagty")}
          value={formatDateTime(payment.createdAt)}
        />
        <InfoRow
          label={t("onlinePayments.fields.updatedAt", "Updated at")}
          value={formatDateTime(payment.updatedAt)}
        />
      </Section>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${hh}:${mm}, ${dd}.${mo}.${yy}`;
}
