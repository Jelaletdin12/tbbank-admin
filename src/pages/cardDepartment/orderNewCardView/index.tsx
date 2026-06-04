import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Printer, Download, Trash2, Pencil, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
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
import { useCardOrderById, useDeleteCardOrder } from "@/features/orderNewCard/hooks/useOrderNewCard";
import type { CardOrderStatus } from "@/features/orderNewCard/api/orderNewCardApi";
import { BentoGrid, BentoCard, InfoRow, PassportImage } from "@/components/viewPageComponents";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CardOrderStatus, { label: string; variant: StatusBadgeVariant; icon: React.ElementType }> = {
  PENDING: { label: "Garaşylýar", variant: "warning", icon: AlertCircle },
  APPROVED: { label: "Tassyklandy", variant: "success", icon: CheckCircle2 },
  REJECTED: { label: "Ýatyryldy", variant: "error", icon: XCircle },
};

function CardOrderStatusBadge({ status }: { status: CardOrderStatus }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-muted-foreground">{status}</span>;
  return <StatusBadge label={t(`cardOrder.status.${status.toLowerCase()}`)} variant={cfg.variant} icon={cfg.icon} />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
  if (!order) return <p className="text-muted-foreground text-sm">{t("common.notFound", "Tapylmady")}</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          {t("cardOrder.detailTitle", "Kart sargyt giriş üçin")}: <span className="text-primary font-mono">{order.id}</span>
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" title={t("common.print", "Çap etmek")}>
            <Printer size={15} />
          </Button>
          <Button variant="outline" size="icon" title={t("common.export", "Eksport")}>
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

      {/* ── Row 1: Meta + Kart + Lokasiýa ───────────────────────────────── */}
      <BentoGrid cols={3}>
        <BentoCard title={t("cardOrder.section.meta", "Esasy maglumatlar")}>
          <InfoRow label={t("common.id", "ID")}>{order.id}</InfoRow>
          <InfoRow label={t("cardOrder.field.createdAt", "Döredilen wagty")}>{order.createdAt}</InfoRow>
          <InfoRow label={t("cardOrder.field.status", "Status")}>
            <CardOrderStatusBadge status={order.status} />
          </InfoRow>
          <InfoRow label={t("cardOrder.field.isPaid", "Tölenen")}>
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${order.isPaid ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
            >
              {order.isPaid ? "✓" : "✕"}
            </span>
          </InfoRow>
          <InfoRow label={t("cardOrder.field.note", "Bellik")}>{order.note ?? "—"}</InfoRow>
          <InfoRow label={t("cardOrder.field.createdBy", "Sargyt eden")}>
            <span className="text-primary font-medium">{order.createdBy}</span>
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("cardOrder.section.card", "Kart")}>
          <InfoRow label={t("cardOrder.field.issuanceReason", "Kartyň çykarylmagynyň sebäbi")}>
            <span className="text-primary font-medium">{order.issuanceReasonName}</span>
          </InfoRow>
          <InfoRow label={t("cardOrder.field.cardType", "Kart görnüşi")}>
            <span className="text-cyan-400 font-medium">{order.cardTypeName}</span>
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("cardOrder.section.location", "Lokasiýa")}>
          <InfoRow label={t("cardOrder.field.province", "Welaýat")}>{order.provinceName}</InfoRow>
          <InfoRow label={t("cardOrder.field.branch", "Şahamça")}>
            <span className="text-cyan-400 font-medium">{order.branchName}</span>
          </InfoRow>
        </BentoCard>
      </BentoGrid>

      {/* ── Row 2: Şahsy maglumatlar (full width — many fields) ─────────── */}
      <BentoGrid cols={2}>
        <BentoCard title={t("cardOrder.section.personal", "Şahsy maglumatlar")}>
          <InfoRow label={t("cardOrder.field.fullName", "Doly ady")}>
            {[order.lastName, order.firstName, order.middleName].filter(Boolean).join(" ")}
          </InfoRow>
          <InfoRow label={t("cardOrder.field.birthDate", "Doglan güni")}>{order.birthDate}</InfoRow>
          <InfoRow label={t("cardOrder.field.citizenship", "Raýatlyk")}>{order.citizenship}</InfoRow>
          <InfoRow label={t("cardOrder.field.registeredAddress", "Ýazgy edilen salgy")}>{order.registeredAddress}</InfoRow>
          <InfoRow label={t("cardOrder.field.currentAddress", "Häzirki ýaşaýyş ýeri")}>{order.currentAddress}</InfoRow>
          <InfoRow label={t("cardOrder.field.workplace", "Işleýän ýeri we wezipesi")}>{order.workplace}</InfoRow>
        </BentoCard>

        <BentoCard title={t("cardOrder.section.contacts", "Kontakt")}>
          <InfoRow label={t("cardOrder.field.phone", "Telefon")}>{order.phone}</InfoRow>
          <InfoRow label={t("cardOrder.field.phoneExtra", "Telefon goşmaça")}>{order.phoneExtra ?? "—"}</InfoRow>
        </BentoCard>
      </BentoGrid>

      {/* ── Row 3: Passport images ───────────────────────────────────────── */}
      <BentoGrid cols={4}>
        <BentoCard title={t("cardOrder.field.passportPage1", "Sahypa 1")}>
          <PassportImage label={t("cardOrder.field.passportPage1", "Pasport (sahypa 1)")} url={order.passportFiles.page1} />
        </BentoCard>
        <BentoCard title={t("cardOrder.field.passportPage23", "Sahypa 2-3")}>
          <PassportImage label={t("cardOrder.field.passportPage23", "Pasport (2-3-nji sahypa)")} url={order.passportFiles.page23} />
        </BentoCard>
        <BentoCard title={t("cardOrder.field.passportPage89", "Sahypa 8-9")}>
          <PassportImage label={t("cardOrder.field.passportPage89", "Pasport (8-9 sahypa)")} url={order.passportFiles.page89} />
        </BentoCard>
        <BentoCard title={t("cardOrder.field.passportPage32", "Sahypa 32")}>
          <PassportImage label={t("cardOrder.field.passportPage32", "Pasport (32-nji sahypa)")} url={order.passportFiles.page32} />
        </BentoCard>
      </BentoGrid>

      {/* ── Delete confirm dialog ─────────────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cardOrder.deleteTitle", "Pozmak isleýärsiňizmi?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cardOrder.deleteDescription", "Bu kart sargyt hemişelik pozular. Bu işi yzyna gaýtaryp bolmaz.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Ýatyr")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? t("common.deleting", "Pozulýar...") : t("common.delete", "Pozmak")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
