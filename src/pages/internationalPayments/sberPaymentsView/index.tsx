import { format } from "date-fns";
import {
  Trash2,
  Edit,
  Search,
  Download,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  useSberPaymentOrder,
  useDeleteSberPayment,
} from "@/features/sberPayments/hooks/useSberPayments";
import type {
  PaymentPaidStatus,
  PaymentStatus,
} from "@/features/sberPayments/api/sberPaymentsApi";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/ui/statusBadge";
import { InfoRow, Section } from "@/components/viewPageComponents";

const STATUS_CONFIG = {
  GARASYLYYAR: {
    label: "Garaşylýar",
    variant: "warning" as StatusBadgeVariant,
    icon: AlertCircle,
  },
  KANAGATLANDYRYLAN: {
    label: "Tassyklandy",
    variant: "success" as StatusBadgeVariant,
    icon: CheckCircle2,
  },
  RET_EDILEN: {
    label: "Ýatyryldy",
    variant: "error" as StatusBadgeVariant,
    icon: XCircle,
  },
} satisfies Record<
  PaymentStatus,
  { label: string; variant: StatusBadgeVariant; icon: React.ElementType }
>;

const PAID_STATUS_CONFIG = {
  Tolenmedik: {
    label: "Tölmedi",
    variant: "error" as StatusBadgeVariant,
    icon: XCircle,
  },
  Tolendi: {
    label: "Tölendi",
    variant: "success" as StatusBadgeVariant,
    icon: CheckCircle2,
  },
} satisfies Record<
  PaymentPaidStatus,
  { label: string; variant: StatusBadgeVariant; icon: React.ElementType }
>;

function PaymentPaidStatusBadge({ status }: { status: PaymentPaidStatus }) {
  const cfg = PAID_STATUS_CONFIG[status];
  if (!cfg)
    return (
      <span className="text-xs text-muted-foreground">{String(status)}</span>
    );
  return (
    <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg)
    return (
      <span className="text-xs text-muted-foreground">{String(status)}</span>
    );
  return (
    <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
  );
}
// ─── Info Row Component ───────────────────────────────────────────────────────



// ─── Document Item Component ──────────────────────────────────────────────────

function DocumentItem({
  label,
  fileName,
  fileUrl,
}: {
  label: string;
  fileName: string | null;
  fileUrl: string | null;
}) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-b-0 px-4">
      <span className="w-80 shrink-0 text-sm text-muted-foreground leading-relaxed">
        {label}
      </span>
      <div className="flex-1">
        {fileUrl ? (
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded bg-muted hover:bg-accent transition-colors">
              <Search size={14} className="text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded bg-muted hover:bg-accent transition-colors">
              <Download size={14} className="text-muted-foreground" />
            </button>
            <span className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-medium rounded">
              {fileName}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

// ─── View Page Component ──────────────────────────────────────────────────────

export default function SberPaymentViewPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;

  const { data: order, isLoading } = useSberPaymentOrder(id);
  const deleteMutation = useDeleteSberPayment();

  const handleDelete = async () => {
    if (confirm("Bu tolegi pozmak isleyanizmi?")) {
      await deleteMutation.mutateAsync(id);
      navigate("/sber-payments");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Toleg tapylmady</p>
        <Button
          variant="outline"
          onClick={() => navigate("/sber-payments")}
          className="mt-4"
        >
          Yza
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/sber-payments/${id}/edit`)}
        >
          <Edit size={18} />
        </Button>
      </div>

      {/* Status Section */}
      <Section title="Status">
        <div className="px-4">
          <InfoRow label="ID" value={order.id} />
          <InfoRow label="Status">
            <PaymentStatusBadge status={order.status} />
          </InfoRow>
          <InfoRow label="Tolenen (Sul ay)">
            <PaymentPaidStatusBadge status={order.paidStatus} />
          </InfoRow>
          <InfoRow label="Bellik" value={order.bellik} />
        </div>
      </Section>

      {/* Location Section */}
      <Section title="Lokasiya">
        <div className="px-4">
          <InfoRow label="Welayat" value={order.welayat} />
          <InfoRow label="Sahamca" value={order.sahamca} isLink />
        </div>
      </Section>

      {/* Personal Info Section */}
      <Section title="Sahsy maglumatlar">
        <div className="px-4">
          <InfoRow label="Pasportdaky ady" value={order.firstName} />
          <InfoRow label="Pasportdaky familiya" value={order.lastName} />
          <InfoRow label="Telefon" value={order.phone} />
          <InfoRow label="E-pocta" value={order.email} />
          <InfoRow label="Hazirki yasayys yeri" value={order.address} />
        </div>
      </Section>

      {/* Payment Info Section */}
      <Section title="Toleg">
        <div className="px-4">
          <InfoRow
            label="Tolegi ugradyjynyn maglumatlary"
            value={`I-M${order.passportNumber?.slice(0, 2) ?? "XX"}-${order.passportNumber ?? ""} ${order.fullName}`}
          />
          <InfoRow
            label="Toleg ugradyjynyn goyum hasaby"
            value={order.accountNumber}
          />
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Tolegi kabul edijinin maglumatlary
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Pasport seriyasy</span>
              <p className="font-medium">{order.passportSeries}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pasport nomeri</span>
              <p className="font-medium">{order.passportNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Ady Familiyasy Atasynyn ady
              </span>
              <p className="font-medium">{order.fullName}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Documents - Accepted */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Kabul ediji talyp boyunca resminamalary
        </h2>
        <div className="bg-card rounded-lg border border-border">
          {order.documents?.slice(0, 6).map((doc) => (
            <DocumentItem
              key={doc.id}
              label={doc.label}
              fileName={doc.name}
              fileUrl={doc.fileUrl}
            />
          ))}
        </div>
      </div>

      {/* Documents - Sent */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Ugradyjy boyunca resminamalary
        </h2>
        <div className="bg-card rounded-lg border border-border">
          {order.documents
            ?.slice(6)
            .map((doc) => (
              <DocumentItem
                key={doc.id}
                label={doc.label}
                fileName={doc.name}
                fileUrl={doc.fileUrl}
              />
            )) || (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              Resminamalar yok
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">
            Toleg taryhy
          </h2>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" />
            </svg>
          </button>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Gozlemek"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-muted/50 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <p className="text-sm">
                Berlen kriteriyalara Toleg gabat gelmedi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <Clock size={16} />
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">Ammallar</h2>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" />
            </svg>
          </button>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>ID</span>
            <span>Analys ady</span>
            <span>Kim tarapyndan</span>
            <span>Analys nysany (Targets)</span>
            <span>Analys statusy</span>
            <span>Sene</span>
          </div>

          {/* Table Body */}
          {order.activityLog?.length ? (
            order.activityLog.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-6 gap-4 px-4 py-3 border-t border-border text-sm"
              >
                <span className="text-primary font-medium">
                  {log.id.split("-")[1] ?? "45384"}
                </span>
                <span>{log.analysisName}</span>
                <span className="text-muted-foreground">{log.createdBy}</span>
                <span className="text-muted-foreground">{log.target}</span>
                <span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
                      log.status === "FINISHED"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {log.status}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {format(new Date(log.createdAt), "dd/MM/yyyy, HH:mm:ss")}{" "}
                  GMT+5
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm border-t border-border">
              Ammallar yok
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
