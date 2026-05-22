import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useCardRequisite,
  useDeleteCardRequisite,
  useDownloadCardRequisite,
} from "@/features/cardRequisites/hooks/useCardRequisites";
import type { CardRequisiteStatus } from "@/features/cardRequisites/api/cardRequisitesApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/ui/statusBadge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { InfoRow, PassportImage } from "@/components/viewPageComponents";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<CardRequisiteStatus, StatusBadgeVariant> = {
  pending:  "warning",
  approved: "success",
  rejected: "error",
}

const STATUS_ICON: Record<CardRequisiteStatus, React.ElementType> = {
  pending:  AlertCircle,
  approved: CheckCircle2,
  rejected: XCircle,
}

function CardRequisiteStatusBadge({ status }: { status: CardRequisiteStatus }) {
  const { t } = useTranslation()
  const variant = STATUS_VARIANT[status]
  const Icon = STATUS_ICON[status]
  if (!variant) return <span className="text-xs text-muted-foreground">{status}</span>
  return <StatusBadge label={t(`cardRequisite.status.${status}`)} variant={variant} icon={Icon} />
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
}: {
  title?: string
  span?: "full" | 2 | 3
  children: React.ReactNode
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
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardRequisiteViewPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const { t }      = useTranslation()

  const { data, isLoading, isError } = useCardRequisite(id ?? "")
  const deleteMutation = useDeleteCardRequisite()
  const downloadMutation = useDownloadCardRequisite()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        {t("common.notFound", "Maglumat tapylmady")}
      </div>
    )
  }

  return (
    <div className="mx-auto flex flex-col gap-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-bold text-foreground">
          {t("cardRequisite.viewTitle", "Kart rekwizit giňişleýin")}: {data.id}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon" variant="ghost"
            className="h-8 w-8"
            onClick={() => downloadMutation.mutate(data.id)}
            disabled={downloadMutation.isPending}
          >
            <Download size={15} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={15} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("cardRequisite.deleteTitle", "Pozmak isleýärsiňizmi?")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("cardRequisite.deleteDesc", "Bu amal yzyna dolanyp bolmaz.")} {data.id}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>
                  {t("common.cancel", "Ýatyr")}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteMutation.isPending}
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => deleteMutation.mutate(data.id, { onSuccess: () => navigate("/card-requisites") })}
                >
                  {t("common.delete", "Poz")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            size="icon" variant="ghost" className="h-8 w-8"
            onClick={() => navigate(`/card-requisites/${id}/edit`)}
          >
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* ── Row 1: Meta + Kart + Lokasiýa ────────────────────────────────── */}
      <BentoGrid cols={3}>
        <BentoCard title={t("cardRequisite.metaSection", "Esasy maglumatlar")}>
          <InfoRow label={t("common.id", "ID")}>
            <span className="font-mono">{data.id}</span>
          </InfoRow>
          <InfoRow label={t("cardRequisite.createdAt", "Döredilen wagty")}>
            {data.created_at}
          </InfoRow>
          <InfoRow label={t("cardRequisite.status", "Status")}>
            <CardRequisiteStatusBadge status={data.status} />
          </InfoRow>
          <InfoRow label={t("cardRequisite.note", "Bellik")}>
            {data.note || "—"}
          </InfoRow>
          <InfoRow label={t("cardRequisite.createdBy", "Sargyt eden")}>
            {data.first_name && data.last_name ? (
              <span className="text-primary font-medium">
                {data.last_name}_{data.first_name}
              </span>
            ) : "—"}
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("cardRequisite.cardSection", "Kart")}>
          <InfoRow label={t("cardRequisite.cardNumber", "Kart belgisi")}>
            <span className="font-mono tracking-wider">{data.card_number}</span>
          </InfoRow>
          <InfoRow label={t("cardRequisite.cardExpireMonth", "Kart Möhleti (aý)")}>
            {data.card_expiry_month}
          </InfoRow>
          <InfoRow label={t("cardRequisite.cardExpireYear", "Kart Möhleti (ýyl)")}>
            {data.card_expiry_year}
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("cardRequisite.locationSection", "Lokasiýa")}>
          <InfoRow label={t("cardRequisite.province", "Welaýat")}>
            {data.province_name ?? "—"}
          </InfoRow>
          <InfoRow label={t("cardRequisite.branch", "Şahamça")}>
            <span className="text-primary font-medium">{data.branch_name ?? "—"}</span>
          </InfoRow>
        </BentoCard>
      </BentoGrid>

      {/* ── Row 2: Şahsy + Pasport maglumatlary ──────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title={t("cardRequisite.personalSection", "Şahsy maglumatlar")}>
          <InfoRow label={t("cardRequisite.fullName", "Doly ady")}>
            {[data.first_name, data.last_name, data.middle_name].filter(Boolean).join(" ")}
          </InfoRow>
          <InfoRow label={t("cardRequisite.birthDate", "Doglan güni")}>
            {data.birth_date}
          </InfoRow>
          <InfoRow label={t("cardRequisite.phone", "Telefon")}>
            {data.phone}
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("cardRequisite.passportSection", "Pasport")}>
          <InfoRow label={t("cardRequisite.passportSeries", "Pasport seriýasy")}>
            {data.passport_series}
          </InfoRow>
          <InfoRow label={t("cardRequisite.passportNumber", "Pasport belgisi")}>
            {data.passport_number}
          </InfoRow>
        </BentoCard>
      </BentoGrid>

      {/* ── Row 3: Passport images ────────────────────────────────────────── */}
      <BentoGrid cols={4}>
        <BentoCard title={t("cardRequisite.passportFile1", "Sahypa 1")}>
          <PassportImage
            label={t("cardRequisite.passportFile1", "Pasport (sahypa 1)")}
            src={data.passport_page1_url}
          />
        </BentoCard>
        <BentoCard title={t("cardRequisite.passportFile2", "Sahypa 2-3")}>
          <PassportImage
            label={t("cardRequisite.passportFile2", "Pasport (2-3-nji sahypa)")}
            src={data.passport_page2_3_url}
          />
        </BentoCard>
        <BentoCard title={t("cardRequisite.passportFile3", "Sahypa 8-9")}>
          <PassportImage
            label={t("cardRequisite.passportFile3", "Pasport (8-9 sahypa)")}
            src={data.passport_page8_9_url}
          />
        </BentoCard>
        <BentoCard title={t("cardRequisite.passportFile4", "Sahypa 32")}>
          <PassportImage
            label={t("cardRequisite.passportFile4", "Pasport (32-nji sahypa)")}
            src={data.passport_page32_url}
          />
        </BentoCard>
      </BentoGrid>

    </div>
  )
}
