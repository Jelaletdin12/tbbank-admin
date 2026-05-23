import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useCardPin,
  useDeleteCardPin,
} from "@/features/cardPins/hooks/useCardPins";
import type { CardPinStatus } from "@/features/cardPins/api/cardPinApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/ui/statusBadge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { BentoGrid, BentoCard, InfoRow, PassportImage } from "@/components/viewPageComponents";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<CardPinStatus, StatusBadgeVariant> = {
  pending:  "warning",
  approved: "success",
  rejected: "error",
}

const STATUS_ICON: Record<CardPinStatus, React.ElementType> = {
  pending:  AlertCircle,
  approved: CheckCircle2,
  rejected: XCircle,
}

function CardPinStatusBadge({ status }: { status: CardPinStatus }) {
  const { t } = useTranslation()
  const variant = STATUS_VARIANT[status]
  const Icon = STATUS_ICON[status]
  if (!variant) return <span className="text-xs text-muted-foreground">{status}</span>
  return <StatusBadge label={t(`cardPin.status.${status}`)} variant={variant} icon={Icon} />
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardPinViewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <Skeleton className="h-3 w-24 mb-1" />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardPinViewPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const { t }      = useTranslation()

  const { data, isLoading, isError } = useCardPin(id!)
  const { mutate: deletePin, isPending: isDeleting } = useDeleteCardPin()

  if (isLoading) {
    return <CardPinViewSkeleton />
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
          {t("cardPin.viewTitle", "Kart pin bukja giňişleýin")}: {data.id}
        </h1>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTitle asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={15} />
              </Button>
            </AlertDialogTitle>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("cardPin.deleteTitle", "Pozmak isleýärsiňizmi?")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("cardPin.deleteDesc", "Bu amal yzyna dolanyp bolmaz.")}{" "}
                  {data.id}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  {t("common.cancel", "Ýatyr")}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => deletePin(data.id, { onSuccess: () => navigate("/card-pins") })}
                >
                  {t("common.delete", "Poz")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => navigate(`/card-pins/${id}/edit`)}
          >
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* ── Row 1: Meta + Kart + Lokasiýa ───────────────────────────────── */}
      <BentoGrid cols={3}>
        <BentoCard title={t("cardPin.metaSection", "Esasy maglumatlar")}>
          <InfoRow label={t("common.id", "ID")}>
            <span className="font-mono">{data.id}</span>
          </InfoRow>
          <InfoRow label={t("cardPin.createdAt", "Döredilen wagty")}>
            {data.created_at}
          </InfoRow>
          <InfoRow label={t("cardPin.status", "Status")}>
            <CardPinStatusBadge status={data.status} />
          </InfoRow>
          <InfoRow label={t("cardPin.note", "Bellik")}>
            {data.note || "—"}
          </InfoRow>
          <InfoRow label={t("cardPin.createdBy", "Sargyt eden")}>
            <span className="text-primary font-medium">{data.created_by_label}</span>
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("cardPin.cardSection", "Kart")}>
          <InfoRow label={t("cardPin.cardNumber", "Kart belgisi")}>
            <span className="font-mono tracking-wider">{data.card_number}</span>
          </InfoRow>
          <InfoRow label={t("cardPin.cardExpireMonth", "Kart Möhleti (aý)")}>
            —
          </InfoRow>
          <InfoRow label={t("cardPin.cardExpireYear", "Kart Möhleti (ýyl)")}>
            —
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("cardPin.locationSection", "Lokasiýa")}>
          <InfoRow label={t("cardPin.province", "Welaýat")}>
            {data.province_label}
          </InfoRow>
          <InfoRow label={t("cardPin.branch", "Şahamça")}>
            <span className="text-primary font-medium">{data.branch_label}</span>
          </InfoRow>
        </BentoCard>
      </BentoGrid>

      {/* ── Row 2: Şahsy + Pasport maglumatlary ─────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title={t("cardPin.personalSection", "Şahsy maglumatlar")}>
          <InfoRow label={t("cardPin.fullName", "Doly ady")}>
            {`${data.last_name} ${data.first_name} ${data.father_name}`}
          </InfoRow>
          <InfoRow label={t("cardPin.birthDate", "Doglan güni")}>
            {data.birth_date}
          </InfoRow>
          <InfoRow label={t("cardPin.phone", "Telefon")}>
            +{data.phone}
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("cardPin.passportSection", "Pasport")}>
          <InfoRow label={t("cardPin.passportSeries", "Pasport seriýasy")}>
            {data.passport_series}
          </InfoRow>
          <InfoRow label={t("cardPin.passportNumber", "Pasport belgisi")}>
            {data.passport_number}
          </InfoRow>
        </BentoCard>
      </BentoGrid>

      {/* ── Row 3: Passport images ───────────────────────────────────────── */}
      <BentoGrid cols={4}>
        <BentoCard title={t("cardPin.passportFile1", "Sahypa 1")}>
          <PassportImage
            label={t("cardPin.passportFile1", "Pasport (sahypa 1)")}
            url={data.passport_file_1}
          />
        </BentoCard>
        <BentoCard title={t("cardPin.passportFile2", "Sahypa 2-3")}>
          <PassportImage
            label={t("cardPin.passportFile2", "Pasport (2-3-nji sahypa)")}
            url={data.passport_file_2}
          />
        </BentoCard>
        <BentoCard title={t("cardPin.passportFile3", "Sahypa 8-9")}>
          <PassportImage
            label={t("cardPin.passportFile3", "Pasport (8-9 sahypa)")}
            url={data.passport_file_3}
          />
        </BentoCard>
        <BentoCard title={t("cardPin.passportFile4", "Sahypa 32")}>
          <PassportImage
            label={t("cardPin.passportFile4", "Pasport (32-nji sahypa)")}
            url={data.passport_file_4}
          />
        </BentoCard>
      </BentoGrid>

    </div>
  )
}