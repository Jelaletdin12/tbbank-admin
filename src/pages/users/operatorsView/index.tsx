import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TableActions } from "@/components/tableActions";
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirmDialog";
import { BentoGrid, BentoCard, InfoRow, AuditLog, CollapsibleSection, EmptyState } from "@/components/viewPageComponents";
import { DataTable, type ColumnDef } from "@/components/dataTable";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { useOperator, useDeleteOperator } from "@/features/operators/hooks/useOperators";
import type { OperatorRole, OperatorBranch, OperatorAuditLog, OperatorPermission } from "@/features/operators/api/operatorsApi";

// ─── ActiveIndicator ──────────────────────────────────────────────────────────

function ActiveIndicator({ active }: { active: boolean }) {
  return active ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-destructive" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OperatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const operatorId = Number(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteMutation = useDeleteOperator();

  const { data: operator, isLoading } = useOperator(operatorId);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");

  // ── Role columns ──────────────────────────────────────────────────────────

  const roleColumns: ColumnDef<OperatorRole>[] = [
    {
      accessorKey: "id",
      header: t("common.id", "ID"),
      cell: ({ row }) => <span className="text-primary font-semibold text-sm">{row.original.id}</span>,
      size: 80,
    },
    {
      accessorKey: "code",
      header: t("roles.fields.code", "KOD"),
      cell: ({ row }) => <span className="text-sm">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: t("roles.fields.name", "ADY"),
      cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: "guardName",
      header: t("roles.fields.guardName", "GUARD NAME"),
      cell: ({ row }) => <span className="text-sm">{row.original.guardName}</span>,
    },
    {
      id: "actions",
      header: "",
      size: 120,
      cell: ({ row }) => <TableActions onView={() => navigate(`/roles/${row.original.id}`)} />,
    },
  ];

  // ── Permission columns ────────────────────────────────────────────────────

  const permissionColumns: ColumnDef<OperatorPermission>[] = [
    {
      accessorKey: "id",
      header: t("common.id", "ID"),
      cell: ({ row }) => <span className="text-primary font-semibold text-sm">{row.original.id}</span>,
      size: 80,
    },
    {
      accessorKey: "name",
      header: t("permissions.fields.name", "ADY"),
      cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: "guardName",
      header: t("permissions.fields.guardName", "GUARD NAME"),
      cell: ({ row }) => <span className="text-sm">{row.original.guardName}</span>,
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: () => (
        <div className="flex items-center justify-end">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  // ── Branch columns ────────────────────────────────────────────────────────

  const branchColumns: ColumnDef<OperatorBranch>[] = [
    {
      accessorKey: "id",
      header: t("common.id", "ID"),
      cell: ({ row }) => <span className="text-primary font-semibold text-sm">{row.original.id}</span>,
      size: 60,
    },
    {
      accessorKey: "name",
      header: t("branches.fields.name", "ADY"),
      cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: "region",
      header: t("branches.fields.region", "WELAÝAT"),
      cell: ({ row }) => <span className="text-sm">{row.original.region}</span>,
    },
    {
      accessorKey: "district",
      header: t("branches.fields.district", "ETRAP"),
      cell: ({ row }) => <span className="text-sm">{row.original.district}</span>,
    },
    {
      accessorKey: "uniqueCode",
      header: t("branches.fields.uniqueCode", "UNIKAL BELGI"),
      cell: ({ row }) => <span className="text-sm">{row.original.uniqueCode}</span>,
    },
    {
      accessorKey: "isActive",
      header: t("branches.fields.isActive", "IŞJEŇ"),
      cell: ({ row }) => <ActiveIndicator active={row.original.isActive} />,
      size: 80,
    },
    {
      accessorKey: "billingUsernameIbr",
      header: t("branches.fields.billingIbr", "BILLING ULANYJY ADY"),
      cell: ({ row }) => <span className="text-sm font-mono">{row.original.billingUsernameIbr}</span>,
    },
    {
      accessorKey: "billingUsernameSber",
      header: t("branches.fields.billingSber", "BILLING USERNAME (SBER)"),
      cell: ({ row }) => <span className="text-sm font-mono ">{row.original.billingUsernameSber}</span>,
    },
    {
      accessorKey: "billingUsernameVisa",
      header: t("branches.fields.billingVisa", "BILLING USERNAME (VISA)"),
      cell: ({ row }) => <span className="text-sm font-mono ">{row.original.billingUsernameVisa}</span>,
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: () => (
        <div className="flex items-center justify-end">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
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
    );
  }

  if (!operator) return null;

  const auditLogs = (operator.auditLogs ?? []).map((log: OperatorAuditLog) => ({
    id: String(log.id),
    action: log.actionName,
    by: log.performedBy,
    target: log.target,
    status: log.status,
    date: log.createdAt,
  }));

  const filteredRoles = (operator.roles ?? []).filter(
    (r) => r.name.toLowerCase().includes(roleSearch.toLowerCase()) || r.code.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  const filteredPermissions = (operator.permissions ?? []).filter((p) => p.name.toLowerCase().includes(permSearch.toLowerCase()));

  const filteredBranches = (operator.branches ?? []).filter((b) => b.name.toLowerCase().includes(branchSearch.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("operators.detailTitle", "Operator giňişleýin")}: {operator.name}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={15} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/operators/${operatorId}/edit`)}
          >
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* ── Esasy maglumatlar + Kontakt ──────────────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title={t("operators.sections.basic", "Esasy maglumatlar")}>
          <InfoRow label={t("common.id", "ID")} value={operator.id} />
          <InfoRow label={t("operators.fields.username", "Ulanyjy ady")} value={operator.username} />
          <InfoRow label={t("operators.fields.name", "Ady")} value={operator.name} />
          <InfoRow label={t("operators.fields.isActive", "Işjeň")}>
            <ActiveIndicator active={operator.isActive} />
          </InfoRow>
        </BentoCard>

        <BentoCard title={t("operators.sections.contact", "Kontakt")}>
          <InfoRow label={t("operators.fields.phone", "Telefon")} value={operator.phone ?? "—"} />
          <InfoRow label={t("operators.fields.email", "E-poçta")} value={operator.email ?? "—"} />
        </BentoCard>
      </BentoGrid>

      {/* ── Rollar ───────────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("operators.sections.roles", "Rollar")}>
        <DataTableToolbar
          searchValue={roleSearch}
          onSearchChange={setRoleSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("operators.addRole", "Rol birikdiriň")}
          onAction={() => {
            /* modal aç ya da navigate */
          }}
        />
        <DataTable columns={roleColumns} data={filteredRoles} getRowId={(r) => String(r.id)} enableRowSelection />
      </CollapsibleSection>

      {/* ── Rugsatlar ────────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("operators.sections.permissions", "Rugsatlar")}>
        <DataTableToolbar
          searchValue={permSearch}
          onSearchChange={setPermSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("operators.addPermission", "Rugsat birikdiriň")}
          onAction={() => {}}
        />
        {filteredPermissions.length === 0 ? (
          <EmptyState label={t("operators.noPermissions", "Berlen kriterýalara Rugsat gabat gelmedi.")} />
        ) : (
          <DataTable columns={permissionColumns} data={filteredPermissions} getRowId={(p) => String(p.id)} enableRowSelection />
        )}
      </CollapsibleSection>

      {/* ── Şahamçalar ───────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("operators.sections.branches", "Şahamçalar")}>
        <DataTableToolbar
          searchValue={branchSearch}
          onSearchChange={setBranchSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("operators.addBranch", "Şahamça birikdiriň")}
          onAction={() => {}}
        />
        <DataTable columns={branchColumns} data={filteredBranches} getRowId={(r) => String(r.id)} enableRowSelection />
      </CollapsibleSection>

      {/* ── Karz sargyt ──────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("operators.sections.loanLimits", "Karz sargyt")}>
        <DataTableToolbar
          searchValue=""
          onSearchChange={() => {}}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("operators.addLoanLimit", "Karz sargyt döredin")}
          onAction={() => {}}
          hideSearch
        />
        {(operator.loanLimits ?? []).length === 0 && (
          <EmptyState label={t("operators.noLoanLimits", "Berlen kriterýalara Karz sargyt gabat gelmedi.")} />
        )}
      </CollapsibleSection>

      {/* ── Kart sargyt ──────────────────────────────────────────────────── */}
      <CollapsibleSection title={t("operators.sections.cardLimits", "Kart sargyt")}>
        <DataTableToolbar
          searchValue=""
          onSearchChange={() => {}}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("operators.addCardLimit", "Kart sargyt döredin")}
          onAction={() => {}}
          hideSearch
        />
        {(operator.cardLimits ?? []).length === 0 && (
          <EmptyState label={t("operators.noCardLimits", "Berlen kriterýalara Kart sargyt gabat gelmedi.")} />
        )}
      </CollapsibleSection>

      {/* ── Audit log ────────────────────────────────────────────────────── */}
      <AuditLog logs={auditLogs} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("operators.deleteTitle", "Operatory pozmak")}
        description={t("operators.deleteConfirm", "{{name}} operatoryny pozmak isleýärsiňizmi?", { name: operator.name })}
        confirmLabel={t("common.delete", "Poz")}
        onConfirm={() =>
          deleteMutation.mutate(operatorId, {
            onSuccess: () => navigate("/operators"),
          })
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
