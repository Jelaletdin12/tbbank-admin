import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirmDialog'
import { InfoRow, AuditLog } from '@/components/viewPageComponents'
import { DataTable, type ColumnDef } from '@/components/dataTable'
import { DataTableToolbar } from '@/components/dataTableToolbar'
import { useClient, useDeleteClient } from '@/features/clients/hooks/useClients'
import type { ClientRole, ClientBranch, ClientAuditLog } from '@/features/clients/api/clientsApi'

// ─── Bento primitives ─────────────────────────────────────────────────────────

function BentoGrid({ cols = 2, children }: { cols?: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols]
  return <div className={`grid ${colClass} gap-4`}>{children}</div>
}

function BentoCard({
  title,
  span,
  children,
}: {
  title?: string
  span?: 'full' | 2 | 3
  children: React.ReactNode
}) {
  const spanClass =
    span === 'full' ? 'sm:col-span-full' :
    span === 2      ? 'sm:col-span-2'    :
    span === 3      ? 'sm:col-span-3'    : ''

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${spanClass}`}>
      {title && (
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
        </div>
      )}
      {children}
    </div>
  )
}

// ─── ActiveIndicator ──────────────────────────────────────────────────────────

function ActiveIndicator({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary text-primary">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-destructive text-destructive">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  )
}

// ─── CollapsibleSection ───────────────────────────────────────────────────────

interface CollapsibleSectionProps {
  title: string
  actionLabel: string
  onAction: () => void
  children: React.ReactNode
}

function CollapsibleSection({ title, actionLabel, onAction, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div
        className="flex items-center gap-2 mb-2 cursor-pointer select-none w-fit"
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <ChevronDown
          size={15}
          className={`text-muted-foreground transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
        />
      </div>
      {open && (
        <div className="bg-card border border-border rounded-xl overflow-hidden p-4 space-y-3">
          <div className="flex justify-end">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          </div>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  label: string
  actionLabel: string
  onAction: () => void
}

function EmptyState({ label, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-muted-foreground">
          <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 13h24" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 8V6M22 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M19 23l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground text-center">{label}</p>
      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const clientId   = Number(id)
  const { t }      = useTranslation()
  const navigate   = useNavigate()
  const deleteMutation = useDeleteClient()

  const { data: client, isLoading } = useClient(clientId)

  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [roleSearch,   setRoleSearch]   = useState('')
  const [permSearch,   setPermSearch]   = useState('')
  const [branchSearch, setBranchSearch] = useState('')
  const [loanSearch,   setLoanSearch]   = useState('')
  const [cardSearch,   setCardSearch]   = useState('')

  // ── Role columns ──────────────────────────────────────────────────────────

  const roleColumns: ColumnDef<ClientRole>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="text-primary font-semibold text-sm">{row.original.id}</span>,
      size: 80,
    },
    {
      accessorKey: 'code',
      header: t('roles.fields.code', 'KOD'),
      cell: ({ row }) => <span className="text-sm">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: t('roles.fields.name', 'ADY'),
      cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: 'guardName',
      header: t('roles.fields.guardName', 'GUARD NAME'),
      cell: ({ row }) => <span className="text-sm">{row.original.guardName}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 size={13} />
          </Button>
        </div>
      ),
      size: 60,
    },
  ]

  // ── Branch columns ────────────────────────────────────────────────────────

  const branchColumns: ColumnDef<ClientBranch>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="text-primary font-semibold text-sm">{row.original.id}</span>,
      size: 60,
    },
    {
      accessorKey: 'name',
      header: t('branches.fields.name', 'ADY'),
      cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: 'region',
      header: t('branches.fields.region', 'WELAÝAT'),
      cell: ({ row }) => <span className="text-sm">{row.original.region}</span>,
    },
    {
      accessorKey: 'district',
      header: t('branches.fields.district', 'ETRAP'),
      cell: ({ row }) => <span className="text-sm">{row.original.district}</span>,
    },
    {
      accessorKey: 'uniqueCode',
      header: t('branches.fields.uniqueCode', 'UNIKAL BELGI'),
      cell: ({ row }) => <span className="text-sm">{row.original.uniqueCode}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 size={13} />
          </Button>
        </div>
      ),
      size: 60,
    },
  ]

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!client) return null

  const auditLogs = (client.auditLogs ?? []).map((log: ClientAuditLog) => ({
    id:     String(log.id),
    action: log.actionName,
    by:     log.performedBy,
    target: log.target,
    status: log.status,
    date:   log.createdAt,
  }))

  const filteredRoles    = (client.roles ?? []).filter((r) =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
    r.code.toLowerCase().includes(roleSearch.toLowerCase()),
  )
  const filteredBranches = (client.branches ?? []).filter((b) =>
    b.name.toLowerCase().includes(branchSearch.toLowerCase()),
  )

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {t('clients.detailTitle', 'Müşderi giňişleýin')}: {client.name}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon" variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={15} />
          </Button>
          <Button
            size="icon" variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/clients/${clientId}/edit`)}
          >
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* ── Row 1: Esasy maglumatlar + Kontakt ──────────────────────────── */}
      <BentoGrid cols={2}>
        <BentoCard title={t('clients.sections.basic', 'Esasy maglumatlar')}>
          <InfoRow label="ID" value={client.id} />
          <InfoRow
            label={t('clients.fields.username', 'Ulanyjy ady')}
            value={client.username}
          />
          <InfoRow
            label={t('clients.fields.name', 'Ady')}
            value={client.name}
          />
          <InfoRow label={t('clients.fields.isActive', 'Işjeň')}>
            <ActiveIndicator active={client.isActive} />
          </InfoRow>
        </BentoCard>

        <BentoCard title={t('clients.sections.contact', 'Kontakt')}>
          <InfoRow
            label={t('clients.fields.phone', 'Telefon')}
            value={client.phone ?? '—'}
          />
          <InfoRow
            label={t('clients.fields.email', 'E-poçta')}
            value={client.email ?? '—'}
          />
        </BentoCard>
      </BentoGrid>

      {/* ── Rollar ───────────────────────────────────────────────────────── */}
      <CollapsibleSection
        title={t('clients.sections.roles', 'Rollar')}
        actionLabel={t('clients.addRole', 'Rol birikdiriň')}
        onAction={() => {}}
      >
        <DataTableToolbar
          searchValue={roleSearch}
          onSearchChange={setRoleSearch}
          searchPlaceholder={t('common.search', 'Gözlemek')}
          columns={[]} columnVisibility={{}} onColumnVisibilityChange={() => {}}
          columnOrder={[]} onColumnOrderChange={() => {}} hideAction
        />
        {filteredRoles.length > 0 ? (
          <DataTable columns={roleColumns} data={filteredRoles} getRowId={(r) => String(r.id)} enableRowSelection />
        ) : (
          <EmptyState
            label={t('clients.noRoles', 'Berlen kriterýalara Rol gabat gelmedi.')}
            actionLabel={t('clients.addRole', 'Rol birikdiriň')}
            onAction={() => {}}
          />
        )}
      </CollapsibleSection>

      {/* ── Rugsatlar ────────────────────────────────────────────────────── */}
      <CollapsibleSection
        title={t('clients.sections.permissions', 'Rugsatlar')}
        actionLabel={t('clients.addPermission', 'Rugsat birikdiriň')}
        onAction={() => {}}
      >
        <DataTableToolbar
          searchValue={permSearch}
          onSearchChange={setPermSearch}
          searchPlaceholder={t('common.search', 'Gözlemek')}
          columns={[]} columnVisibility={{}} onColumnVisibilityChange={() => {}}
          columnOrder={[]} onColumnOrderChange={() => {}} hideAction
        />
        {(client.permissions ?? []).length === 0 && (
          <EmptyState
            label={t('clients.noPermissions', 'Berlen kriterýalara Rugsat gabat gelmedi.')}
            actionLabel={t('clients.addPermission', 'Rugsat birikdiriň')}
            onAction={() => {}}
          />
        )}
      </CollapsibleSection>

      {/* ── Şahamçalar ───────────────────────────────────────────────────── */}
      <CollapsibleSection
        title={t('clients.sections.branches', 'Şahamçalar')}
        actionLabel={t('clients.addBranch', 'Şahamça birikdiriň')}
        onAction={() => {}}
      >
        <DataTableToolbar
          searchValue={branchSearch}
          onSearchChange={setBranchSearch}
          searchPlaceholder={t('common.search', 'Gözlemek')}
          columns={[]} columnVisibility={{}} onColumnVisibilityChange={() => {}}
          columnOrder={[]} onColumnOrderChange={() => {}} hideAction
        />
        {filteredBranches.length > 0 ? (
          <DataTable columns={branchColumns} data={filteredBranches} getRowId={(r) => String(r.id)} enableRowSelection />
        ) : (
          <EmptyState
            label={t('clients.noBranches', 'Berlen kriterýalara Şahamça gabat gelmedi.')}
            actionLabel={t('clients.addBranch', 'Şahamça birikdiriň')}
            onAction={() => {}}
          />
        )}
      </CollapsibleSection>

      {/* ── Karz sargyt ──────────────────────────────────────────────────── */}
      <CollapsibleSection
        title={t('clients.sections.loanOrders', 'Karz sargyt')}
        actionLabel={t('clients.addLoanOrder', 'Karz sargyt dörediň')}
        onAction={() => {}}
      >
        <DataTableToolbar
          searchValue={loanSearch}
          onSearchChange={setLoanSearch}
          searchPlaceholder={t('common.search', 'Gözlemek')}
          columns={[]} columnVisibility={{}} onColumnVisibilityChange={() => {}}
          columnOrder={[]} onColumnOrderChange={() => {}} hideAction
        />
        {(client.loanOrders ?? []).length === 0 && (
          <EmptyState
            label={t('clients.noLoanOrders', 'Berlen kriterýalara Karz sargyt gabat gelmedi.')}
            actionLabel={t('clients.addLoanOrder', 'Karz sargyt dörediň')}
            onAction={() => {}}
          />
        )}
      </CollapsibleSection>

      {/* ── Kart sargyt ──────────────────────────────────────────────────── */}
      <CollapsibleSection
        title={t('clients.sections.cardOrders', 'Kart sargyt')}
        actionLabel={t('clients.addCardOrder', 'Kart sargyt dörediň')}
        onAction={() => {}}
      >
        <DataTableToolbar
          searchValue={cardSearch}
          onSearchChange={setCardSearch}
          searchPlaceholder={t('common.search', 'Gözlemek')}
          columns={[]} columnVisibility={{}} onColumnVisibilityChange={() => {}}
          columnOrder={[]} onColumnOrderChange={() => {}} hideAction
        />
        {(client.cardOrders ?? []).length === 0 && (
          <EmptyState
            label={t('clients.noCardOrders', 'Berlen kriterýalara Kart sargyt gabat gelmedi.')}
            actionLabel={t('clients.addCardOrder', 'Kart sargyt dörediň')}
            onAction={() => {}}
          />
        )}
      </CollapsibleSection>

      {/* ── Audit log ────────────────────────────────────────────────────── */}
      <AuditLog logs={auditLogs} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('clients.deleteTitle', 'Müşderini pozmak')}
        description={t('clients.deleteConfirm', '{{name}} müşderisini pozmak isleýärsiňizmi?', { name: client.name })}
        confirmLabel={t('common.delete', 'Poz')}
        onConfirm={() => deleteMutation.mutate(clientId, { onSuccess: () => navigate('/clients') })}
        isLoading={deleteMutation.isPending}
      />

    </div>
  )
}