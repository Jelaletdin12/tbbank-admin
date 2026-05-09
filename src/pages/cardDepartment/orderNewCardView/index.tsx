import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Printer, Download, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCardOrderById,
  useDeleteCardOrder,
} from "@/features/orderNewCard/hooks/useOrderNewCard";
import type { CardOrderStatus } from "@/features/orderNewCard/api/orderNewCardApi";
import {
  InfoRow,
  Section,
  PassportImage,
} from "@/components/viewPageComponents";
// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  CardOrderStatus,
  { label: string; className: string; icon: string }
> = {
  PENDING: {
    label: "Garaşylýar",
    icon: "⏳",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  APPROVED: {
    label: "Tassyklandy",
    icon: "✓",
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  REJECTED: {
    label: "Ýatyryldy",
    icon: "✕",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

function StatusBadge({ status }: { status: CardOrderStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${cfg.className}`}
    >
      <span className="text-[10px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

// ─── CardOrderDetailPage ──────────────────────────────────────────────────────

export default function CardOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: order, isLoading } = useCardOrderById(id ?? "");
  const deleteMutation = useDeleteCardOrder();

  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    navigate("/order-new-card");
  };

  if (isLoading) return <DetailSkeleton />;
  if (!order)
    return (
      <p className="text-muted-foreground text-sm">
        {t("common.notFound", "Tapylmady")}
      </p>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("cardOrder.detailTitle", "Kart sargyt giriş üçin")}:{" "}
            <span className="text-primary font-mono">{order.id}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            title={t("common.print", "Çap etmek")}
          >
            <Printer size={15} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title={t("common.export", "Eksport")}
          >
            <Download size={15} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            title={t("common.delete", "Pozmak")}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={15} />
          </Button>
          <Button size="sm" asChild>
            <Link to={`/order-new-card/${order.id}/edit`}>
              <Pencil size={14} className="mr-1.5" />
              {t("common.edit", "Düzetmek")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main info */}
      <Section title="">
        <InfoRow label="ID">{order.id}</InfoRow>
        <InfoRow label={t("cardOrder.field.createdAt", "Döredilen wagty")}>
          {order.createdAt}
        </InfoRow>
        <InfoRow label={t("cardOrder.field.isPaid", "Tölenen")}>
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold
            ${
              order.isPaid
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {order.isPaid ? "✓" : "✕"}
          </span>
        </InfoRow>
        <InfoRow label={t("cardOrder.field.status", "Status")}>
          <StatusBadge status={order.status} />
        </InfoRow>
        <InfoRow label={t("cardOrder.field.note", "Bellik")}>
          {order.note ?? "—"}
        </InfoRow>
        <InfoRow label={t("cardOrder.field.createdBy", "Sargyt eden")}>
          <span className="text-primary font-medium">{order.createdBy}</span>
        </InfoRow>
      </Section>

      {/* Kart */}
      <Section title={t("cardOrder.section.card", "Kart")}>
        <InfoRow
          label={t(
            "cardOrder.field.issuanceReason",
            "Kartyň çykarylmagynyň sebäbi",
          )}
        >
          <span className="text-primary font-medium">
            {order.issuanceReasonName}
          </span>
        </InfoRow>
        <InfoRow label={t("cardOrder.field.cardType", "Kart görnüşi")}>
          <span className="text-cyan-400 font-medium">
            {order.cardTypeName}
          </span>
        </InfoRow>
      </Section>

      {/* Lokasiýa */}
      <Section title={t("cardOrder.section.location", "Lokasiýa")}>
        <InfoRow label={t("cardOrder.field.province", "Welaýat")}>
          {order.provinceName}
        </InfoRow>
        <InfoRow label={t("cardOrder.field.branch", "Şahamça")}>
          <span className="text-cyan-400 font-medium">{order.branchName}</span>
        </InfoRow>
      </Section>

      {/* Şahsy maglumatlar */}
      <Section title={t("cardOrder.section.personal", "Şahsy maglumatlar")}>
        <InfoRow label={t("cardOrder.field.fullName", "Doly ady")}>
          {[order.lastName, order.firstName, order.middleName]
            .filter(Boolean)
            .join(" ")}
        </InfoRow>
        <InfoRow label={t("cardOrder.field.birthDate", "Doglan güni")}>
          {order.birthDate}
        </InfoRow>
        <InfoRow label={t("cardOrder.field.phone", "Telefon")}>
          {order.phone}
        </InfoRow>
        <InfoRow label={t("cardOrder.field.phoneExtra", "Telefon goşmaça")}>
          {order.phoneExtra ?? "—"}
        </InfoRow>
        <InfoRow label={t("cardOrder.field.citizenship", "Raýatlyk")}>
          {order.citizenship}
        </InfoRow>
        <InfoRow
          label={t(
            "cardOrder.field.registeredAddress",
            "Ýazgy edilen salgyňyz",
          )}
        >
          {order.registeredAddress}
        </InfoRow>
        <InfoRow
          label={t("cardOrder.field.currentAddress", "Häzirki ýaşaýyş ýeri")}
        >
          {order.currentAddress}
        </InfoRow>
        <InfoRow
          label={t("cardOrder.field.workplace", "Işleýän ýeriňiz we wezipäňiz")}
        >
          {order.workplace}
        </InfoRow>
      </Section>

      {/* Pasport faýýlar */}
      <Section title={t("cardOrder.section.passportFiles", "Pasport faýýlar")}>
        <PassportImage
          label={t("cardOrder.field.passportPage1", "Pasport (sahypa 1)")}
          url={order.passportFiles.page1}
        />
        <PassportImage
          label={t(
            "cardOrder.field.passportPage23",
            "Pasport (2-3-nji sahypa)",
          )}
          url={order.passportFiles.page23}
        />
        <PassportImage
          label={t("cardOrder.field.passportPage89", "Pasport (8-9 sahypa)")}
          url={order.passportFiles.page89}
        />
        <PassportImage
          label={t("cardOrder.field.passportPage32", "Pasport (32-nji sahypa)")}
          url={order.passportFiles.page32}
        />
      </Section>

      {/* Delete confirm dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("cardOrder.deleteTitle", "Pozmak isleýärsiňizmi?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "cardOrder.deleteDescription",
                "Bu kart sargyt hemişelik pozular. Bu işi yzyna gaýtaryp bolmaz.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Ýatyr")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? t("common.deleting", "Pozulýar...")
                : t("common.delete", "Pozmak")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
