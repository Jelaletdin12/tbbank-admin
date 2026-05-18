import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, Trash2, Pencil, DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
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
  useCardRequisite,
  useDeleteCardRequisite,
  useDownloadCardRequisite,
} from "@/features/cardRequisites/hooks/useCardRequisites";
import type { CardRequisiteStatus } from "@/features/cardRequisites/api/cardRequisitesApi";
import { InfoRow } from "@/components/viewPageComponents";
// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<CardRequisiteStatus, StatusBadgeVariant> = {
  pending:  "warning",
  approved: "success",
  rejected: "error",
};

const STATUS_ICON: Record<CardRequisiteStatus, React.ElementType> = {
  pending:  AlertCircle,
  approved: CheckCircle2,
  rejected: XCircle,
};

function CardRequisiteStatusBadge({ status }: { status: CardRequisiteStatus }) {
  const { t } = useTranslation();
  const variant = STATUS_VARIANT[status];
  const Icon = STATUS_ICON[status];
  if (!variant)
    return <span className="text-xs text-muted-foreground">{status}</span>;
  return (
    <StatusBadge label={t(`cardRequisite.status.${status}`)} variant={variant} icon={Icon} />
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-foreground mt-6 mb-3">
      {children}
    </h2>
  );
}

// ─── Passport image row ───────────────────────────────────────────────────────

function PassportImageRow({ label, url }: { label: string; url?: string }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-[220px_1fr] border-b border-border/50 last:border-0">
      <div className="px-4 py-3 text-sm text-muted-foreground font-medium bg-muted/10">
        {label}
      </div>
      <div className="px-4 py-4 flex flex-col gap-2">
        {url ? (
          <>
            <img
              src={url}
              alt={label}
              className="max-w-[200px] rounded-md border border-border object-cover"
            />
            <a
              href={url}
              download
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <DownloadCloud size={13} />
              {t("Download", "Göçürip al")}
            </a>
          </>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardRequisiteViewPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useCardRequisite(id ?? "");
  const deleteMutation = useDeleteCardRequisite();
  const downloadMutation = useDownloadCardRequisite();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id ?? "");
    navigate("/card-requisites");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-7 text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        {t("Not found", "Tapylmady")}
      </div>
    );
  }


  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-foreground">
          {t("Card requisite detail", "Kart rekwizit giňişleýin")}: {data.id}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadMutation.mutate(data.id)}
            disabled={downloadMutation.isPending}
          >
            <Download size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={14} />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/card-requisites/${data.id}/edit`}>
              <Pencil size={14} />
            </Link>
          </Button>
        </div>
      </div>

      {/* General info */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <InfoRow label={t("ID", "ID")}>{data.id}</InfoRow>
        <InfoRow label={t("Created at", "Döredilen wagty")}>
          {data.created_at}
        </InfoRow>
        <InfoRow label={t("Status", "Status")}>
          <CardRequisiteStatusBadge status={data.status} />
        </InfoRow>
        <InfoRow label={t("Note", "Bellik")}>{data.note || "—"}</InfoRow>
        <InfoRow label={t("Requested by", "Sargyt eden:")}>
          {data.first_name && data.last_name ? (
            <span className="text-primary font-medium">
              {data.last_name}_{data.first_name} ({data.first_name})
            </span>
          ) : (
            "—"
          )}
        </InfoRow>
      </div>

      {/* Card */}
      <SectionTitle>{t("Card", "Kart")}</SectionTitle>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <InfoRow label={t("Card number", "Kart belgisi")}>
          {data.card_number}
        </InfoRow>
        <InfoRow label={t("Card expiry month", "Kart Möhleti (aý)")}>
          {data.card_expiry_month}
        </InfoRow>
        <InfoRow label={t("Card expiry year", "Kart Möhleti (ýyl)")}>
          {data.card_expiry_year}
        </InfoRow>
      </div>

      {/* Location */}
      <SectionTitle>{t("Location", "Lokasiýa")}</SectionTitle>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <InfoRow label={t("Province", "Welaýat")}>
          {data.province_name ?? "—"}
        </InfoRow>
        <InfoRow label={t("Branch", "Şahamça")}>
          <span className="text-primary font-medium">
            {data.branch_name ?? "—"}
          </span>
        </InfoRow>
      </div>

      {/* Personal */}
      <SectionTitle>
        {t("Personal information", "Şahsy maglumatlar")}
      </SectionTitle>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <InfoRow label={t("Full name", "Doly ady")}>
          {[data.first_name, data.last_name, data.middle_name]
            .filter(Boolean)
            .join(" ")}
        </InfoRow>
        <InfoRow label={t("Birth date", "Doglan güni")}>
          {data.birth_date}
        </InfoRow>
        <InfoRow label={t("Phone", "Telefon")}>{data.phone}</InfoRow>
      </div>

      {/* Passport */}
      <SectionTitle>{t("Passport", "Pasport")}</SectionTitle>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <InfoRow label={t("Passport series", "Pasport seriýasy")}>
          {data.passport_series}
        </InfoRow>
        <InfoRow label={t("Passport number", "Pasport belgisi")}>
          {data.passport_number}
        </InfoRow>
        <PassportImageRow
          label={t("Passport (page 1)", "Pasport (sahypa 1)")}
          url={data.passport_page1_url}
        />
        <PassportImageRow
          label={t("Passport (pages 2-3)", "Pasport (2-3-nji sahypa)")}
          url={data.passport_page2_3_url}
        />
        <PassportImageRow
          label={t("Passport (pages 8-9)", "Pasport (8-9 sahypa)")}
          url={data.passport_page8_9_url}
        />
        <PassportImageRow
          label={t("Passport (page 32)", "Pasport (32-nji sahypa)")}
          url={data.passport_page32_url}
        />
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("Are you sure?", "Eminsiňizmi?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "This action cannot be undone.",
                "Bu amal yzyna gaýtarylmaz. Kart rekwiziti hemişelik öçüriler.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel", "Ýatyr")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? t("Deleting...", "Öçürilýär...")
                : t("Delete", "Öçür")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
