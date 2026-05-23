import { Download, Eye, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// ─── BentoGrid ────────────────────────────────────────────────────────────────

export function BentoGrid({ cols = 2, children }: { cols?: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols]
  return <div className={`grid ${colClass} gap-4`}>{children}</div>
}

// ─── BentoCard ────────────────────────────────────────────────────────────────

interface BentoCardProps {
  title?: string;
  span?: "full" | 2 | 3;
  children: React.ReactNode;
  noPadding?: boolean;
}

export function BentoCard({ title, span, children, noPadding }: BentoCardProps) {
  const spanClass =
    span === "full" ? "sm:col-span-full" :
    span === 2      ? "sm:col-span-2"    :
    span === 3      ? "sm:col-span-3"    : ""

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden min-w-0 ${spanClass}`}>
      {title && (
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
            {title}
          </p>
        </div>
      )}
      {noPadding ? <div>{children}</div> : children}
    </div>
  )
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────
// Supports both:
//   <InfoRow label="ID" value={data.id} />
//   <InfoRow label="ID">{data.id}</InfoRow>

export interface InfoRowProps {
  label: string;
  /** Plain string/number value — use this or children, not both */
  value?: string | number | null;
  /** Arbitrary JSX — status badges, links, custom formatting, etc. */
  children?: React.ReactNode;
  isLink?: boolean;
}


// ─── InfoRow ──────────────────────────────────────────────────────────────────
export function InfoRow({ label, value, children, isLink }: InfoRowProps) {
  const content = children ?? (value != null ? String(value) : null);

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,42%)_minmax(0,58%)] items-start sm:items-center py-2.5 px-4 border-b border-border last:border-0 gap-0.5 sm:gap-0">
      <span className="text-xs sm:text-sm text-muted-foreground leading-snug">{label}</span>
      {content != null && content !== "" ? (
        typeof content === "string" ? (
          <span className={`text-sm break-words min-w-0 ${isLink ? "text-primary font-medium" : "text-foreground"}`}>
            {content}
          </span>
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
  if (!value) {
    return <InfoRow label={label} value="—" />;
  }

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
              <span className="text-sm text-foreground break-words flex-1 min-w-0">
                {l.val}
              </span>
            </div>
          ) : null
        )}
        {!hasAny && <span className="text-sm text-muted-foreground/40">—</span>}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
// title is optional — omit or pass empty string to skip the heading

export interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-6">
      {title ? (
        <h2 className="text-base font-semibold text-foreground mb-2">
          {title}
        </h2>
      ) : null}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── PassportImage ────────────────────────────────────────────────────────────
// Accepts both `src` and `url` prop names for compatibility

export interface PassportImageProps {
  label: string;
  src?: string | null;
  url?: string | null;
}

// ─── PassportImage ────────────────────────────────────────────────────────────
export function PassportImage({ label, src, url }: PassportImageProps) {
  const { t } = useTranslation();
  const imageSrc = src ?? url ?? null;

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,42%)_minmax(0,58%)] items-start py-3 px-4 border-b border-border last:border-0 gap-1 sm:gap-0">
      <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-col gap-2">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={label}
            className="w-28 h-20 object-cover rounded-md border border-border"
          />
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

// ─── AuditRow ─────────────────────────────────────────────────────────────────

export interface AuditRowProps {
  id: string;
  action: string;
  by: string;
  target: string;
  status: string;
  date: string;
}

export function AuditRow({
  id,
  action,
  by,
  target,
  status,
  date,
}: AuditRowProps) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-2.5 text-xs font-mono text-primary">{id}</td>
      <td className="px-4 py-2.5 text-sm text-foreground">{action}</td>
      <td className="px-4 py-2.5 text-sm text-foreground">{by}</td>
      <td className="px-4 py-2.5 text-sm text-foreground">{target}</td>
      <td className="px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {status}
        </span>
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
        {date}
      </td>
      <td className="px-4 py-2.5">
        <button className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
          <Eye size={13} />
        </button>
      </td>
    </tr>
  );
}

// ─── AuditLog (full collapsible table) ───────────────────────────────────────

export interface AuditLogProps {
  logs: AuditRowProps[];
  defaultOpen?: boolean;
}

export function AuditLog({ logs, defaultOpen = true }: AuditLogProps) {
  const { t } = useTranslation();

  const columns = [
    "ID",
    t("audit.columns.action", "AMALYŇ ADY"),
    t("audit.columns.by", "KIM TARAPYNDAN"),
    t("audit.columns.target", "AMALYŇ NYŞANY (TARIBESI)"),
    t("audit.columns.status", "AMALYŇ STATUSY"),
    t("audit.columns.date", "SENE"),
    "",
  ];

  return (
    <div className="mb-6">
      <details open={defaultOpen}>
        <summary className="text-base font-semibold text-foreground mb-2 cursor-pointer select-none list-none flex items-center gap-1.5 w-fit">
          {t("loanOrders.sections.audit", "Ammallar")}
          <ChevronRight size={15} className="text-muted-foreground" />
        </summary>
        <div className="bg-card border border-border rounded-xl overflow-hidden mt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-10 text-muted-foreground text-sm"
                    >
                      {t("common.noData", "Maglumat ýok")}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => <AuditRow key={log.id} {...log} />)
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
            <span>{t("common.prev", "Öňki")}</span>
            <span>
              1–{logs.length} / {logs.length}
            </span>
            <span>{t("common.next", "Soňky")}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
