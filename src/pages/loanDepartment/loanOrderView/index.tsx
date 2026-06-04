import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil } from "lucide-react";
import { useLoanOrderById, useDeleteLoanOrder } from "@/features/loanOrders/hooks/useLoanOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { LoanOrderStatus } from "@/features/loanOrders/api/loanOrdersApi";
import { BentoGrid, BentoCard, InfoRow, PassportImage, AuditLog, type AuditRowProps } from "@/components/viewPageComponents";
import { ConfirmDialog } from "@/components/confirmDialog";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<LoanOrderStatus, StatusBadgeVariant> = {
  GARAŞYLÝAR: "warning",
  KANAGATLANDYRYLAN: "success",
  RED_EDILDI: "error",
  IŞLENÝÄR: "warning",
};

const STATUS_ICON: Record<LoanOrderStatus, React.ElementType> = {
  GARAŞYLÝAR: AlertCircle,
  KANAGATLANDYRYLAN: CheckCircle2,
  RED_EDILDI: XCircle,
  IŞLENÝÄR: AlertCircle,
};

function LoanOrderMobileStatusBadge({ status }: { status: LoanOrderStatus }) {
  const { t } = useTranslation();
  const variant = STATUS_VARIANT[status];
  const Icon = STATUS_ICON[status];
  if (!variant) return <span className="text-xs text-muted-foreground">{status}</span>;
  return <StatusBadge label={t(`loanOrderStatus.${status}`)} variant={variant} icon={Icon} />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LoanOrderViewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <Skeleton className="h-3 w-24 mb-1" />
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoanOrderViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const deleteMutation = useDeleteLoanOrder();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: order, isLoading } = useLoanOrderById(id!);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(id!, {
      onSuccess: () => navigate("/loan-orders"),
    });
  };

  if (isLoading) return <LoanOrderViewSkeleton />;

  if (!order) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">{t("common.notFound", "Tapylmady")}</div>;
  }

  const auditLogs: AuditRowProps[] = [
    {
      id: "44548",
      action: t("audit.actions.view", "Görmek"),
      by: order.createdBy ?? "",
      target: `${t("loanOrders.title", "Karz sargyt")}: ${order.id}`,
      status: "FINISHED",
      date: order.createdAt ?? "",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t("loanOrders.view.title", "Karz sargyt giriş")}: {order.id}
        </h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-md cursor-pointer hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            title={t("common.delete", "Poz")}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => navigate(`/loan-orders/${order.id}/edit`)}
            className="p-2 rounded-md cursor-pointer hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t("common.edit", "Redaktirle")}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* ── Row 1: Meta + Loan + Location ───────────────────────────────── */}
      <BentoGrid cols={3}>
        {/* Meta */}
        <BentoCard title={t("loanOrders.sections.meta", "Esasy maglumatlar")}>
          <InfoRow label={t("common.id", "ID")} value={order.id} />
          <InfoRow label={t("loanOrders.columns.createdAt", "Döredilen wagty")} value={order.createdAt} />
          <InfoRow label={t("loanOrders.columns.status", "Status")}>
            <LoanOrderMobileStatusBadge status={order.status} />
          </InfoRow>
          <InfoRow label={t("loanOrders.fields.amount", "Berlik")} value={order.amount ? String(order.amount) : undefined} />
          <InfoRow label={t("loanOrders.fields.createdBy", "Sargyt eden")} value={order.createdBy ?? undefined} isLink />
        </BentoCard>

        {/* Loan */}
        <BentoCard title={t("loanOrders.sections.loan", "Karz")}>
          <InfoRow label={t("loanOrders.columns.loanType", "Karz görnüşi")} value={order.loanType} isLink />
          <InfoRow
            label={t("loanOrders.fields.loanAmount", "Karz mukdary")}
            value={order.loanAmount ? String(order.loanAmount) : undefined}
          />
        </BentoCard>

        {/* Location */}
        <BentoCard title={t("loanOrders.sections.location", "Lokasiýa")}>
          <InfoRow label={t("loanOrders.columns.region", "Welaýat")} value={order.region} />
          <InfoRow label={t("loanOrders.columns.branch", "Şahamça")} value={order.branch} isLink />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 2: Personal + Contacts ──────────────────────────────────── */}
      <BentoGrid cols={2}>
        {/* Personal */}
        <BentoCard title={t("loanOrders.sections.personal", "Şahsy maglumatlar")}>
          <InfoRow label={t("loanOrders.fields.fullName", "Doly ady")} value={order.fullName ?? `${order.firstName} ${order.lastName}`} />
          <InfoRow label={t("loanOrders.fields.education", "Bilimi")} value={order.education ?? undefined} />
          <InfoRow label={t("loanOrders.fields.maritalStatus", "Maşgala ýagdaýy")} value={order.maritalStatus ?? undefined} />
          <InfoRow label={t("loanOrders.fields.birthDate", "Doglan güni")} value={order.birthDate ?? undefined} />
          <InfoRow label={t("loanOrders.fields.registeredAddress", "Ýazgy edilen salgy")} value={order.registeredAddress ?? undefined} />
          <InfoRow label={t("loanOrders.fields.currentAddress", "Häzirki ýaşaýyş ýeri")} value={order.currentAddress ?? undefined} />
        </BentoCard>

        {/* Contacts */}
        <BentoCard title={t("loanOrders.sections.contacts", "Habarlaşmak")}>
          <InfoRow label={t("loanOrders.fields.email", "E-poçta")} value={order.email ?? undefined} />
          <InfoRow label={t("loanOrders.columns.phone", "Telefon")} value={order.phone} />
          <InfoRow label={t("loanOrders.fields.phoneAlt", "Telefon goşmaça")} value={order.phoneAlt ?? undefined} />
          <InfoRow label={t("loanOrders.fields.homePhone", "Öý telefony")} value={order.homePhone ?? undefined} />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 3: Employment + Passport info ───────────────────────────── */}
      <BentoGrid cols={2}>
        {/* Employment */}
        <BentoCard title={t("loanOrders.sections.employment", "Iş")}>
          <InfoRow label={t("loanOrders.fields.employer", "Kärhananyň ady")} value={order.employer ?? undefined} />
          <InfoRow label={t("loanOrders.fields.deptPhone", "Işgärler bölüminiň belgisi")} value={order.deptPhone ?? undefined} />
          <InfoRow label={t("loanOrders.fields.workRegion", "Işleýän welaýaty")} value={order.workRegion ?? undefined} />
          <InfoRow label={t("loanOrders.fields.workCity", "Işleýän etraby")} value={order.workCity ?? undefined} isLink />
          <InfoRow label={t("loanOrders.fields.position", "Wezipe")} value={order.position ?? undefined} />
          <InfoRow label={t("loanOrders.fields.salary", "Zähmet haky")} value={order.salary ? String(order.salary) : undefined} />
          <InfoRow label={t("loanOrders.fields.employedSince", "Işe başlan wagty")} value={order.employedSince ?? undefined} />
        </BentoCard>

        {/* Passport info */}
        <BentoCard title={t("loanOrders.sections.passport", "Pasport")}>
          <InfoRow label={t("loanOrders.fields.passportNumber", "Pasport")} value={order.passportNumber ?? undefined} />
          <InfoRow label={t("loanOrders.fields.passportIssuedBy", "Kim tarapyndan berildi")} value={order.passportIssuedBy ?? undefined} />
          <InfoRow
            label={t("loanOrders.fields.passportBirthPlace", "Doglan ýeri (pasport)")}
            value={order.passportBirthPlace ?? undefined}
          />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 4: Passport images ───────────────────────────────────────── */}
      <BentoGrid cols={4}>
        <BentoCard title={t("loanOrders.fields.passportPage1", "Sahypa 1")}>
          <PassportImage label={t("loanOrders.fields.passportPage1", "Pasport (sahypa 1)")} src={order.passportPage1Url ?? undefined} />
        </BentoCard>
        <BentoCard title={t("loanOrders.fields.passportPage23", "Sahypa 2-3")}>
          <PassportImage
            label={t("loanOrders.fields.passportPage23", "Pasport (2-3-nji sahypa)")}
            src={order.passportPage23Url ?? undefined}
          />
        </BentoCard>
        <BentoCard title={t("loanOrders.fields.passportPage89", "Sahypa 8-9")}>
          <PassportImage label={t("loanOrders.fields.passportPage89", "Pasport (8-9 sahypa)")} src={order.passportPage89Url ?? undefined} />
        </BentoCard>
        <BentoCard title={t("loanOrders.fields.passportPage32", "Sahypa 32")}>
          <PassportImage
            label={t("loanOrders.fields.passportPage32", "Pasport (32-nji sahypa)")}
            src={order.passportPage32Url ?? undefined}
          />
        </BentoCard>
      </BentoGrid>

      {/* ── Audit log ────────────────────────────────────────────────────── */}
      <AuditLog logs={auditLogs} />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t("loanOrders.deleteConfirm", "Bu sargyt pozulsynmy?")}
        confirmLabel={t("common.delete", "Poz")}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
