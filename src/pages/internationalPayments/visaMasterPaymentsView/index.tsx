import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, Download, Search, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/confirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/statusBadge";
import { BentoGrid, BentoCard, InfoRow } from "@/components/viewPageComponents";
import { useIntlPayment, useDeleteIntlPayment } from "@/features/visaMasterPayments/hooks/useVisaMasterPayments";
import type { IntlPaymentStatus } from "@/features/visaMasterPayments/api/visaMasterPaymentsApi";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<IntlPaymentStatus, StatusBadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

const STATUS_ICON: Record<IntlPaymentStatus, React.ElementType> = {
  pending: AlertCircle,
  approved: CheckCircle2,
  rejected: XCircle,
};

function PaymentStatusBadge({ status }: { status: IntlPaymentStatus }) {
  const { t } = useTranslation();
  const variant = STATUS_VARIANT[status] ?? STATUS_VARIANT.pending;
  const Icon = STATUS_ICON[status] ?? STATUS_ICON.pending;
  return <StatusBadge label={t(`intlPayment.status.${status}`)} variant={variant} icon={Icon} />;
}

// ─── DocFile row ──────────────────────────────────────────────────────────────

function DocFileRow({ label, url }: { label: string; url: string | null }) {
  if (!url)
    return (
      <InfoRow label={label}>
        <span className="text-muted-foreground/50">—</span>
      </InfoRow>
    );

  const filename = url.split("/").pop() ?? "faýl";
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <InfoRow label={label}>
      <div className="flex items-center gap-2">
        {isImage && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-xs text-foreground transition-colors"
          >
            <Search size={12} />
            <span className="max-w-[140px] truncate">{filename}</span>
          </a>
        )}
        <a
          href={url}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-xs text-primary transition-colors"
        >
          <Download size={12} />
          <span className="max-w-[140px] truncate">{filename}</span>
        </a>
      </div>
    </InfoRow>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function IntlPaymentViewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
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

export default function IntlPaymentViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [historySearch, setHistorySearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isError } = useIntlPayment(id!);
  const { mutate: deletePayment, isPending: isDeleting } = useDeleteIntlPayment();

  const confirmDelete = () => {
    deletePayment(data!.id, { onSuccess: () => navigate("/intl-payments/visa-master") });
  };

  if (isLoading) return <IntlPaymentViewSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        {t("common.notFound", "Maglumat tapylmady")}
      </div>
    );
  }

  const KABUL_DOCS = [
    { label: 'Talypyň degişli welaýata "SBERBANK" kartyň rekwizitleri', url: data.doc_sberbank_account },
    { label: "Talypyň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy baradaky güwänamasy", url: data.doc_school_enrollment },
    { label: "Talypyň bilendiriň göçürmesi", url: data.doc_summons },
    { label: "Talypyň degişli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi", url: data.doc_passport_tm },
    { label: "Talypyň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň göçürmesi", url: data.doc_foreign_passport },
    {
      label:
        "Talypyň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň daşary ýurtda galan döwründe bakýan döwleti baradaky bellenen sahypasynyň göçürmesi",
      url: data.doc_foreign_passport_copy,
    },
    {
      label:
        "Talypyň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň dowletiniň girmesiz baradaky bellenen sahypasynyň göçürmesi",
      url: data.doc_exit_permission,
    },
    {
      label:
        "Talypyň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy barada maglumatlary daşary ýurt döwletiniň ýokary okuw mekdebinden haty",
      url: data.doc_school_foreign_info,
    },
    {
      label: "Talypyň daşary ýurt döwletinde okaýandygy baradaky güwänamany daşary ýurt döwletiniň ýokary okuw mekdebinden haty",
      url: data.doc_school_departure_info,
    },
  ];

  const UPGRAD_DOCS = [
    { label: "Upgradyý degişli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi", url: data.upd_doc_passport_tm },
    {
      label: "Upgradyý degişli Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň göçürmesi",
      url: data.upd_doc_foreign_passport,
    },
    {
      label:
        "Upgradyý Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň daşary ýurt döwletinde galýandygy baradaky şaýmynyň bellenen sahypasynyň göçürmesi",
      url: data.upd_doc_visa,
    },
    { label: "Upgradyýyň we kabul edijiniň resminamalarynyň göçürmesi", url: data.upd_doc_acceptance_letter },
    {
      label: "Upgradyý we kabul ediji täze 2015-nji ýyldan soňra pasportynyň seriýasy baradaky maglumatlary",
      url: data.upd_doc_passport_biometric,
    },
    { label: "Upgradyý we kabul ediji täze 2015-nji ýyldan soňra pasportynyň seriýasy baradaky göwnamasy", url: data.upd_doc_passport_old },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {t("intlPayment.viewTitle", "Halkara töleg")}: {data.id}
        </h1>
        <div className="flex items-center gap-1.5">
          <button
            className="p-2 rounded-md cursor-pointer hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            title={t("common.delete", "Poz")}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={16} />
          </button>

          <button
            onClick={() => navigate(`/intl-payments/visa-master/${id}/edit`)}
            className="p-2 rounded-md cursor-pointer hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title={t("common.edit", "Redaktirle")}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* ── Row 1: Meta + Ýüztuman + Lokasiýa ───────────────────────────── */}
      <BentoGrid cols={3}>
        <BentoCard title={t("intlPayment.statusSection", "Esasy maglumatlar")}>
          <InfoRow label={t("intlPayment.client", "Ulanyjy")} value={data.client_label} isLink />
          <InfoRow label={t("common.id", "ID")} value={data.id} />
          <InfoRow label={t("intlPayment.status", "Status")}>
            <PaymentStatusBadge status={data.status} />
          </InfoRow>
          <InfoRow label={t("intlPayment.tilowanMonth", "Tölewan (Aý/aý)")} value={data.created_at} />
          <InfoRow label={t("intlPayment.note", "Bellik")} value={data.note} />
        </BentoCard>

        <BentoCard title={t("intlPayment.currencySection", "Ýüztumanyň görnüşi")}>
          <InfoRow label={t("intlPayment.currencyType", "Görnüşi")} value={data.currency_type_label} />
        </BentoCard>

        <BentoCard title={t("intlPayment.locationSection", "Lokasiýa")}>
          <InfoRow label={t("intlPayment.province", "Welaýat")} value={data.province_label} />
          <InfoRow label={t("intlPayment.branch", "Şahamça")} value={data.branch_label} isLink />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 2: Şahsy maglumatlar + Töleg ─────────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title={t("intlPayment.personalSection", "Şahsy maglumatlar")}>
          <InfoRow label={t("intlPayment.passportFirstName", "Pasportdaky ady")} value={data.passport_first_name} />
          <InfoRow label={t("intlPayment.passportLastName", "Pasportdaky familiýa")} value={data.passport_last_name} />
          <InfoRow label={t("intlPayment.phone", "Telefon")} value={`+${data.phone}`} />
          <InfoRow label={t("intlPayment.email", "E-poçta")} value={data.email} />
          <InfoRow label={t("intlPayment.homeAddress", "Häzirki ýaşyş ýeri")} value={data.home_address} />
        </BentoCard>

        <BentoCard title={t("intlPayment.paymentSection", "Töleg")}>
          <InfoRow label={t("intlPayment.payerFullName", "Töleg upgradyjynyň maglumatlary")} value={data.payer_full_name} />
          <InfoRow label={t("intlPayment.payerAccount", "Töleg upgradyjynyň goşun hasaby")} value={data.payer_account_number} />
          <InfoRow label={t("intlPayment.passportSeries", "Pasport seriýasy")} value={data.passport_series} />
          <InfoRow label={t("intlPayment.passportNumber", "Pasport nomeri")} value={data.passport_number} />
        </BentoCard>
      </BentoGrid>

      {/* ── Row 3: Kabul ediji resminamalar ──────────────────────────────── */}
      <BentoGrid cols={1}>
        <BentoCard title={t("intlPayment.kabulDocsSection", "Kabul ediji talyp boyunca resminamalar")}>
          {KABUL_DOCS.map((doc, i) => (
            <DocFileRow key={i} label={doc.label} url={doc.url} />
          ))}
        </BentoCard>
      </BentoGrid>

      {/* ── Row 4: Upgradyý resminamalar ─────────────────────────────────── */}
      <BentoGrid cols={1}>
        <BentoCard title={t("intlPayment.upgradDocsSection", "Upgradyý boyunca resminamalar")}>
          {UPGRAD_DOCS.map((doc, i) => (
            <DocFileRow key={i} label={doc.label} url={doc.url} />
          ))}
        </BentoCard>
      </BentoGrid>

      {/* ── Row 5: Töleg taryhy ───────────────────────────────────────────── */}
      <BentoGrid cols={1}>
        <BentoCard title={t("intlPayment.paymentHistory", "Töleg taryhy")}>
          <div className="p-4">
            <div className="relative max-w-xs mb-4">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder={t("intlPayment.search", "Gözlemek")}
                className="h-9 w-full pl-9 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/50">
              <div className="w-12 h-12 mb-3 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="9" x2="9" y2="21" />
                </svg>
              </div>
              <p className="text-sm">{t("intlPayment.noHistory", "Beriilen kriteriýalara Töleg gabat gelmedi")}</p>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("intlPayment.deleteTitle", "Pozmak isleýärsiňizmi?")}
        description={`${t("intlPayment.deleteDesc", "Bu amal yzyna dolanyp bolmaz.")} ${data?.id}`}
        confirmLabel={t("common.delete", "Poz")}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
