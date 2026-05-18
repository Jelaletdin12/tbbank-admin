import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil } from "lucide-react";
import {
  useLoanOrderMobileById,
  useDeleteLoanOrderMobile,
} from "@/features/loanOrderMobiles/hooks/useLoanOrderMobiles";
import { CreditCardVisual } from "@/components/creditCardVisual";
import { Skeleton } from "@/components/ui/skeleton";
import type { LoanOrderMobileStatus } from "@/features/loanOrderMobiles/api/loanOrderMobilesApi";
import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/ui/statusBadge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  InfoRow,
  PassportImage,
  AuditLog,
  type AuditRowProps,
} from "@/components/viewPageComponents";
import { ConfirmDialog } from "@/components/confirmDialog";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<LoanOrderMobileStatus, StatusBadgeVariant> = {
  GARAŞYLÝAR:        "warning",
  KANAGATLANDYRYLAN: "success",
  RED_EDILDI:        "error",
  IŞLENÝÄR:          "warning",
}

const STATUS_ICON: Record<LoanOrderMobileStatus, React.ElementType> = {
  GARAŞYLÝAR:        AlertCircle,
  KANAGATLANDYRYLAN: CheckCircle2,
  RED_EDILDI:        XCircle,
  IŞLENÝÄR:          AlertCircle,
}

function LoanOrderMobileStatusBadge({ status }: { status: LoanOrderMobileStatus }) {
  const { t } = useTranslation()
  const variant = STATUS_VARIANT[status]
  const Icon = STATUS_ICON[status]
  if (!variant) return <span className="text-xs text-muted-foreground">{status}</span>
  return <StatusBadge label={t(`loanOrderStatus.${status}`)} variant={variant} icon={Icon} />
}

// ─── Bento primitives ─────────────────────────────────────────────────────────

function BentoGrid({ cols = 2, children }: { cols?: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols]
  return <div className={`grid ${colClass} gap-4`}>{children}</div>
}

function BentoCard({
  title,
  span,
  children,
  noPadding,
}: {
  title?: string
  span?: "full" | 2 | 3
  children: React.ReactNode
  noPadding?: boolean
}) {
  const spanClass =
    span === "full" ? "sm:col-span-full" :
    span === 2      ? "sm:col-span-2"    :
    span === 3      ? "sm:col-span-3"    : ""

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${spanClass}`}>
      {title && (
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
        </div>
      )}
      <div className={noPadding ? "" : undefined}>{children}</div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LoanOrderMobilesViewSkeleton() {
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
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoanOrderMobilesViewPage() {
  const { t }    = useTranslation()
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const deleteMutation = useDeleteLoanOrderMobile()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: order, isLoading } = useLoanOrderMobileById(id!)

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    deleteMutation.mutate(id!, {
      onSuccess: () => navigate("/loan-order-mobiles"),
    })
  }

  if (isLoading) return <LoanOrderMobilesViewSkeleton />

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        {t("common.notFound", "Tapylmady")}
      </div>
    )
  }

  const auditLogs: AuditRowProps[] = [
    {
      id:     "44548",
      action: t("audit.actions.view", "Görmek"),
      by:     order.createdBy ?? "",
      target: `${t("loanOrderMobiles.title", "Karz sargyt")}: ${order.id}`,
      status: "FINISHED",
      date:   order.createdAt ?? "",
    },
  ]

  const hasCard      = !!(order.cardNumber || order.cardName)
  const hasGuarantor = !!(order.guarantor1Name || order.guarantor1CardNumber)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t("loanOrderMobiles.view.title", "Karz sargyt giriş")}: {order.id}
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
            onClick={() => navigate(`/loan-order-mobiles/${order.id}/edit`)}
            className="p-2 rounded-md cursor-pointer hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t("common.edit", "Redaktirle")}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* ── Row 1: Meta + Loan + Location ───────────────────────────────── */}
      <BentoGrid cols={3}>
        <BentoCard title={t("loanOrders.sections.meta", "Esasy maglumatlar")}>
          <InfoRow label={t("common.id", "ID")} value={order.id} />
          <InfoRow
            label={t("loanOrders.columns.status", "Status")}
          >
            <LoanOrderMobileStatusBadge status={order.status} />
          </InfoRow>
          <InfoRow
            label={t("loanOrders.columns.createdAt", "Döredilen wagty")}
            value={order.createdAt}
          />
          <InfoRow
            label={t("loanOrders.columns.branch", "Şahamça")}
            value={order.branch}
            isLink
          />
          <InfoRow
            label={t("loanOrders.fields.note", "Bellik")}
            value={order.note || undefined}
          />
        </BentoCard>

        <BentoCard title={t("loanOrders.sections.loan", "Karz")}>
          <InfoRow
            label={t("loanOrders.columns.loanType", "Karz görnüşi")}
            value={order.loanType}
            isLink
          />
          <InfoRow
            label={t("loanOrders.fields.loanAmount", "Karz möçberi")}
            value={order.loanAmount ? String(order.loanAmount) : undefined}
          />
        </BentoCard>

        <BentoCard title={t("loanOrders.sections.location", "Lokasiýa")}>
          <InfoRow
            label={t("loanOrders.columns.region", "Welaýat")}
            value={order.region}
          />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 2: Card visual (conditional) ────────────────────────────── */}
      {hasCard && (
        <BentoGrid cols={2}>
          <BentoCard title={t("loanOrders.sections.card", "Kart")} noPadding>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-border flex items-center justify-center">
              <CreditCardVisual
                cardNumber={order.cardNumber}
                cardName={order.cardName}
                expMonth={order.cardExpMonth}
                expYear={order.cardExpYear}
                variant="primary"
              />
            </div>
            <InfoRow
              label={t("loanOrders.fields.cardNumber", "Kart belgisi")}
              value={order.cardNumber}
            />
            <InfoRow
              label={t("loanOrders.fields.cardName", "Kartdaky ady")}
              value={order.cardName}
            />
          </BentoCard>

          {/* Guarantor card — shown side-by-side with main card when both exist */}
          {hasGuarantor && (
            <BentoCard title={t("loanOrders.sections.guarantor", "1. Zamun")} noPadding>
              <InfoRow
                label={t("loanOrders.fields.guarantorName", "Zamunyň doly ady")}
                value={`${order.guarantor1Name || ""} ${order.guarantor1Surname || ""} ${order.guarantor1Patronic || ""}`.trim()}
              />
              <InfoRow
                label={t("loanOrders.fields.guarantorPassport", "Pasport")}
                value={`${order.guarantor1PassportSerie || ""} ${order.guarantor1PassportNumber || ""}`.trim()}
              />
              <InfoRow
                label={t("loanOrders.fields.guarantorSalary", "Ortaca zähmet haky")}
                value={order.guarantor1Salary ? String(order.guarantor1Salary) : undefined}
              />
              {order.guarantor1CardNumber && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-border flex items-center justify-center">
                  <CreditCardVisual
                    cardNumber={order.guarantor1CardNumber}
                    cardName={order.guarantor1CardName}
                    expMonth={order.guarantor1CardExpMonth}
                    expYear={order.guarantor1CardExpYear}
                    variant="secondary"
                  />
                </div>
              )}
            </BentoCard>
          )}
        </BentoGrid>
      )}

      {/* ── Row 3: Personal + Contacts ──────────────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title={t("loanOrders.sections.personal", "Şahsy maglumatlar")}>
          <InfoRow
            label={t("loanOrders.fields.fullName", "Doly ady")}
            value={`${order.firstName} ${order.lastName} ${order.patronicName || ""}`.trim()}
          />
          <InfoRow
            label={t("loanOrders.fields.education", "Bilimi")}
            value={order.education ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.maritalStatus", "Maşgala ýagdaýy")}
            value={order.marriageStatus ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.birthDate", "Doglan güni")}
            value={order.dateOfBirth ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.registeredAddress", "Ýazgy edilen salgy")}
            value={order.residence ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.currentAddress", "Häzirki ýaşaýyş ýeri")}
            value={order.currentResidence ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.loanHistory", "Karz taryhy")}
            value={order.loanHistory ?? undefined}
            isLink
          />
        </BentoCard>

        <BentoCard title={t("loanOrders.sections.contacts", "Habarlaşmak")}>
          <InfoRow
            label={t("loanOrders.fields.email", "E-poçta")}
            value={order.email ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.columns.phone", "Telefon")}
            value={order.phone}
          />
          <InfoRow
            label={t("loanOrders.fields.phoneAlt", "Telefon goşmaça")}
            value={order.phoneAdditional ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.homePhone", "Öý telefony")}
            value={order.homePhone ?? undefined}
          />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 4: Employment + Passport info ───────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title={t("loanOrders.sections.employment", "Iş")}>
          <InfoRow
            label={t("loanOrders.fields.employer", "Kärhananyň ady")}
            value={order.workCompany ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.deptPhone", "Işgärler bölüminiň belgisi")}
            value={order.workHrPhone ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.workRegion", "Işleýän welaýaty")}
            value={order.workRegion ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.workCity", "Işleýän etraby")}
            value={order.workProvince ?? undefined}
            isLink
          />
          <InfoRow
            label={t("loanOrders.fields.position", "Wezipe")}
            value={order.position ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.salary", "Zähmet haky")}
            value={order.salary ? String(order.salary) : undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.employedSince", "Işe başlan wagty")}
            value={order.workStartedAt ?? undefined}
          />
        </BentoCard>

        <BentoCard title={t("loanOrders.sections.passport", "Pasport")}>
          <InfoRow
            label={t("loanOrders.fields.passportNumber", "Pasport")}
            value={order.passportNumber ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.passportIssuedBy", "Kim tarapyndan berildi")}
            value={order.passportGivenBy ?? undefined}
          />
          <InfoRow
            label={t("loanOrders.fields.passportBirthPlace", "Doglan ýeri (pasport)")}
            value={order.bornPlace ?? undefined}
          />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 5: Passport images ───────────────────────────────────────── */}
      <BentoGrid cols={4}>
        <BentoCard title={t("loanOrders.fields.passportPage1", "Sahypa 1")}>
          <PassportImage
            label={t("loanOrders.fields.passportPage1", "Pasport (sahypa 1)")}
            src={order.passportPage1Url ?? undefined}
          />
        </BentoCard>
        <BentoCard title={t("loanOrders.fields.passportPage23", "Sahypa 2-3")}>
          <PassportImage
            label={t("loanOrders.fields.passportPage23", "Pasport (2-3-nji sahypa)")}
            src={order.passportPage23Url ?? undefined}
          />
        </BentoCard>
        <BentoCard title={t("loanOrders.fields.passportPage89", "Sahypa 8-9")}>
          <PassportImage
            label={t("loanOrders.fields.passportPage89", "Pasport (8-9 sahypa)")}
            src={order.passportPage89Url ?? undefined}
          />
        </BentoCard>
        <BentoCard title={t("loanOrders.fields.passportPage32", "Sahypa 32")}>
          <PassportImage
            label={t("loanOrders.fields.passportPage32", "Pasport (32-nji sahypa)")}
            src={order.passportPage32Url ?? undefined}
          />
        </BentoCard>
      </BentoGrid>

      {/* ── Guarantor (standalone — only when no card to pair with) ─────── */}
      {hasGuarantor && !hasCard && (
        <BentoGrid cols={2}>
          <BentoCard title={t("loanOrders.sections.guarantor", "1. Zamun")}>
            <InfoRow
              label={t("loanOrders.fields.guarantorName", "Zamunyň doly ady")}
              value={`${order.guarantor1Name || ""} ${order.guarantor1Surname || ""} ${order.guarantor1Patronic || ""}`.trim()}
            />
            <InfoRow
              label={t("loanOrders.fields.guarantorPassport", "Pasport")}
              value={`${order.guarantor1PassportSerie || ""} ${order.guarantor1PassportNumber || ""}`.trim()}
            />
            <InfoRow
              label={t("loanOrders.fields.guarantorSalary", "Ortaca zähmet haky")}
              value={order.guarantor1Salary ? String(order.guarantor1Salary) : undefined}
            />
            {order.guarantor1CardNumber && (
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-border flex items-center justify-center">
                <CreditCardVisual
                  cardNumber={order.guarantor1CardNumber}
                  cardName={order.guarantor1CardName}
                  expMonth={order.guarantor1CardExpMonth}
                  expYear={order.guarantor1CardExpYear}
                  variant="secondary"
                />
              </div>
            )}
          </BentoCard>
        </BentoGrid>
      )}

      {/* ── Audit log ────────────────────────────────────────────────────── */}
      <AuditLog logs={auditLogs} />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t("loanOrderMobiles.deleteConfirm", "Bu sargyt pozulsynmy?")}
        confirmLabel={t("common.delete", "Poz")}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}