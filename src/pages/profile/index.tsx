import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, CheckCircle2, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Section, InfoRow, CollapsibleSection, EmptyState, AuditLog, type AuditRowProps } from "@/components/viewPageComponents";
import { DataTableToolbar, type ColumnMeta } from "@/components/dataTableToolbar";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { useAuthStore } from "@/app/store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleRow {
  id: number;
  code: string;
  name: string;
  guardName: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ROLES: RoleRow[] = [{ id: 2, code: "superadmin", name: "Superadmin", guardName: "web" }];

const MOCK_AUDIT: AuditRowProps[] = [
  {
    id: "9043",
    action: "Üýtgetmek",
    by: "Nurmuhammet Allanov",
    target: "Ulanyç: Nurmuhammet Allanov (nurmuhammet)",
    status: "success",
    date: "2026-06-04 10:23",
  },
  {
    id: "5869",
    action: "Üýtgetmek",
    by: "Nurmuhammet Allanov",
    target: "Ulanyç: Nurmuhammet Allanov (nurmuhammet)",
    status: "success",
    date: "2026-06-03 14:11",
  },
];

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [roleSearch, setRoleSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [roleColVisibility, setRoleColVisibility] = useState({});
  const [roleColOrder, setRoleColOrder] = useState<string[]>([]);

  // ── Role table columns (ColumnDef for DataTable) ───────────────────────────

  const roleColumns: ColumnDef<RoleRow>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: t("common.id", "ID"),
        cell: ({ row }) => <span className="text-sm font-semibold text-primary">{row.original.id}</span>,
        size: 60,
      },
      {
        accessorKey: "code",
        header: t("roles.fields.code", "KOD"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.code}</span>,
      },
      {
        accessorKey: "name",
        header: t("roles.fields.name", "ADY"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.name}</span>,
      },
      {
        accessorKey: "guardName",
        header: t("roles.fields.guardName", "GUARD NAME"),
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.guardName}</span>,
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        size: 90,
        cell: () => (
          <div className="flex items-center justify-end gap-0.5">
            <button className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
              <Eye size={14} />
            </button>
            <button className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
              <Pencil size={14} />
            </button>
            <button className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-destructive/70 hover:text-destructive transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    [t],
  );

  // ── ColumnMeta for DataTableToolbar ───────────────────────────────────────

  const roleColumnMeta: ColumnMeta[] = useMemo(
    () => [
      { id: "id", label: t("common.id", "ID") },
      { id: "code", label: t("roles.fields.code", "KOD") },
      { id: "name", label: t("roles.fields.name", "ADY") },
      { id: "guardName", label: t("roles.fields.guardName", "GUARD NAME") },
    ],
    [t],
  );

  // ── Filtered roles ────────────────────────────────────────────────────────

  const filteredRoles = useMemo(() => {
    const q = roleSearch.toLowerCase().trim();
    if (!q) return MOCK_ROLES;
    return MOCK_ROLES.filter(
      (r) => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.guardName.toLowerCase().includes(q),
    );
  }, [roleSearch]);

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-7 w-64" />
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border last:border-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Title + actions ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-bold text-foreground leading-tight">
          {t("users.viewTitle", "Ulanyjy giňişleýin")}: {user.name}
        </h1>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/profile/edit")}
            title={t("common.edit", "Üýtgetmek")}
          >
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* ── Main info ────────────────────────────────────────────────────── */}
      <Section>
        <InfoRow label={t("common.id", "ID")} value={user.id} />
        <InfoRow label={t("users.fields.username", "Ulanyjy ady")} value={user.name} />
        <InfoRow label={t("users.fields.name", "Ady")} value={user.name} />
        <InfoRow label={t("users.fields.phone", "Telefon")} value={null} />
        <InfoRow label={t("users.fields.email", "E-poçta")} value={user.email} />
        <InfoRow label={t("users.fields.isActive", "İşjeň")}>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </InfoRow>
      </Section>

      {/* ── Rollar ───────────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("users.sections.roles", "Rollar")}>
        <DataTableToolbar
          searchValue={roleSearch}
          onSearchChange={setRoleSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={roleColumnMeta}
          columnVisibility={roleColVisibility}
          onColumnVisibilityChange={setRoleColVisibility}
          columnOrder={roleColOrder}
          onColumnOrderChange={setRoleColOrder}
          actionLabel={t("users.actions.addRole", "Rol birikdiriň")}
          onAction={() => {}}
        />
        <DataTable
          columns={roleColumns}
          data={filteredRoles}
          getRowId={(row) => String(row.id)}
          currentPage={1}
          totalPages={1}
          totalCount={filteredRoles.length}
        />
      </CollapsibleSection>

      {/* ── Rugsatlar ────────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("users.sections.permissions", "Rugsatlar")}>
        <DataTableToolbar
          searchValue={permSearch}
          onSearchChange={setPermSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("users.actions.addPermission", "Rugsat birikdiriň")}
          onAction={() => {}}
        />
        <EmptyState label={t("users.empty.permissions", "Berlen kriteriýalara Rugsat gabat gelmedi.")} />
      </CollapsibleSection>

      {/* ── Şahamçalar ───────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("users.sections.branches", "Şahamçalar")}>
        <DataTableToolbar
          searchValue={branchSearch}
          onSearchChange={setBranchSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("users.actions.addBranch", "Şahamça birikdiriň")}
          onAction={() => {}}
        />
        <EmptyState label={t("users.empty.branches", "Berlen kriteriýalara Şahamça gabat gelmedi.")} />
      </CollapsibleSection>

      {/* ── Ammallar ─────────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("users.sections.audit", "Ammallar")}>
        <AuditLog logs={MOCK_AUDIT} currentPage={1} totalPages={1} totalCount={MOCK_AUDIT.length} />
      </CollapsibleSection>
    </div>
  );
}
