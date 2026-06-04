import { useMemo, useState } from "react";
import { Download, Eye, ChevronDown, Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { Link } from "react-router-dom";

// ─── BentoGrid ────────────────────────────────────────────────────────────────

export function BentoGrid({ cols = 2, children }: { cols?: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];
  return <div className={`grid ${colClass} gap-4`}>{children}</div>;
}

// ─── BentoCard ────────────────────────────────────────────────────────────────

interface BentoCardProps {
  title?: string;
  span?: "full" | 2 | 3;
  children: React.ReactNode;
  noPadding?: boolean;
}

export function BentoCard({ title, span, children, noPadding }: BentoCardProps) {
  const spanClass = span === "full" ? "sm:col-span-full" : span === 2 ? "sm:col-span-2" : span === 3 ? "sm:col-span-3" : "";

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden min-w-0 ${spanClass}`}>
      {title && (
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">{title}</p>
        </div>
      )}
      {noPadding ? <div>{children}</div> : children}
    </div>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

export interface InfoRowProps {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
  isLink?: boolean;
  href?: string;
}

export function InfoRow({ label, value, children, isLink, href }: InfoRowProps) {
  const content = children ?? (value != null ? String(value) : null);

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,42%)_minmax(0,58%)] items-start sm:items-center py-2.5 px-4 border-b border-border last:border-0 gap-0.5 sm:gap-0">
      <span className="text-xs sm:text-sm text-muted-foreground leading-snug">{label}</span>
      {content != null && content !== "" ? (
        typeof content === "string" ? (
          isLink && href ? (
            <Link to={href} className="text-sm break-words min-w-0 text-[#2bbae6] font-medium cursor-pointer hover:underline">
              {content}
            </Link>
          ) : (
            <span className={`text-sm break-words min-w-0 ${isLink ? "text-primary font-medium" : "text-foreground"}`}>{content}</span>
          )
        ) : (
          <div className="text-sm min-w-0">{content}</div>
        )
      ) : (
        <span className="text-muted-foreground/40 text-sm">—</span>
      )}
    </div>
  );
}

// ─── MultiLangRow ─────────────────────────────────────────────────────────────

export interface MultiLangRowProps {
  label: string;
  value?: { tk?: string; ru?: string; en?: string } | null;
}

export function MultiLangRow({ label, value }: MultiLangRowProps) {
  if (!value) return <InfoRow label={label} value="—" />;

  const langs = [
    { code: "TK", val: value.tk },
    { code: "RU", val: value.ru },
    { code: "EN", val: value.en },
  ];

  const hasAny = langs.some((l) => l.val);

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,42%)_minmax(0,58%)] items-start py-2.5 px-4 border-b border-border last:border-0 gap-1 sm:gap-0">
      <span className="text-xs sm:text-sm text-muted-foreground leading-snug pt-1">{label}</span>
      <div className="w-full min-w-0 flex flex-col gap-1.5 py-0.5">
        {langs.map((l) =>
          l.val ? (
            <div key={l.code} className="flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center border border-border bg-muted/50 text-muted-foreground text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[22px] mt-0.5 select-none">
                {l.code}
              </span>
              <span className="text-sm text-foreground break-words flex-1 min-w-0">{l.val}</span>
            </div>
          ) : null,
        )}
        {!hasAny && <span className="text-sm text-muted-foreground/40">—</span>}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-6">
      {title ? <h2 className="text-base font-semibold text-foreground mb-2">{title}</h2> : null}
      <div className="bg-card border border-border rounded-xl overflow-hidden">{children}</div>
    </div>
  );
}

// ─── CollapsibleSection ────────────────────────────────────────────────────────

export interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 cursor-pointer select-none w-fit" onClick={() => setOpen((v) => !v)}>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <ChevronDown size={15} className={`text-muted-foreground transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </div>
      {open && <div className="bg-card border border-border rounded-xl overflow-hidden p-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── PassportImage ────────────────────────────────────────────────────────────

export interface PassportImageProps {
  label: string;
  src?: string | null;
  url?: string | null;
}

export function PassportImage({ label, src, url }: PassportImageProps) {
  const { t } = useTranslation();
  const imageSrc = src ?? url ?? null;

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,42%)_minmax(0,58%)] items-start py-3 px-4 border-b border-border last:border-0 gap-1 sm:gap-0">
      <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-col gap-2">
        {imageSrc ? (
          <img src={imageSrc} alt={label} className="w-28 h-20 object-cover rounded-md border border-border" />
        ) : (
          <div className="w-28 h-20 bg-muted rounded-md border border-border flex items-center justify-center">
            <span className="text-xs text-muted-foreground">—</span>
          </div>
        )}
        {imageSrc && (
          <a
            href={imageSrc}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <Download size={12} />
            {t("common.download", "Göçürip al")}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── AuditRowProps ────────────────────────────────────────────────────────────

export interface AuditRowProps {
  id: string;
  action: string;
  by: string;
  target: string;
  status: string;
  date: string;
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variant =
    normalized === "success" || normalized === "completed"
      ? "default"
      : normalized === "failed" || normalized === "error"
        ? "destructive"
        : normalized === "pending"
          ? "secondary"
          : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}

// ─── useAuditColumns ──────────────────────────────────────────────────────────

export function useAuditColumns(onView?: (log: AuditRowProps) => void): ColumnDef<AuditRowProps>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        accessorKey: "id",
        header: t("audit.columns.id", "ID"),
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.id}</span>,
        size: 130,
      },
      {
        accessorKey: "action",
        header: t("audit.columns.action", "AMALYŇ ADY"),
        cell: ({ row }) => <span className="text-sm font-medium text-primary">{row.original.action}</span>,
      },
      {
        accessorKey: "by",
        header: t("audit.columns.by", "KIM TARAPYNDAN"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.by}</span>,
      },
      {
        accessorKey: "target",
        header: t("audit.columns.target", "AMALYŇ NYŞANY"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.target}</span>,
      },
      {
        accessorKey: "status",
        header: t("audit.columns.status", "AMALYŇ STATUSY"),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        size: 160,
      },
      {
        accessorKey: "date",
        header: t("audit.columns.date", "SENE"),
        cell: ({ row }) => <span className="text-sm text-foreground whitespace-nowrap">{row.original.date}</span>,
        size: 160,
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        size: 60,
        cell: ({ row }) =>
          onView ? (
            <div className="flex items-center justify-end">
              <button
                onClick={() => onView(row.original)}
                className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                title={t("common.view", "Görmek")}
              >
                <Eye size={15} />
              </button>
            </div>
          ) : null,
      },
    ],
    [t, onView],
  );
}

// ─── AuditLog ─────────────────────────────────────────────────────────────────

export interface AuditLogProps {
  logs: AuditRowProps[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  onView?: (log: AuditRowProps) => void;
}

// ─── EmptyState ────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  label: string;
}

export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Inbox size={32} className="text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground text-center">{label}</p>
    </div>
  );
}

// ─── AuditLog ─────────────────────────────────────────────────────────────────

export function AuditLog({ logs, currentPage, totalPages, totalCount, onPageChange, isLoading, onView }: AuditLogProps) {
  const columns = useAuditColumns(onView);

  return (
    <div className="bg-card rounded-md">
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
