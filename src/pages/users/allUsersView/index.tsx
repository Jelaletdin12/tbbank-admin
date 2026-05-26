import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  Section,
  InfoRow,
  CollapsibleSection,
  EmptyState,
} from "@/components/viewPageComponents";
import { DataTableToolbar } from "@/components/dataTableToolbar";
import { useUser, useDeleteUser } from "@/features/allUsers/hooks/useAllUsers";

// ─── UserViewPage ─────────────────────────────────────────────────────────────

export default function UserViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data: user, isLoading, isError } = useUser(userId);
  const deleteUser = useDeleteUser();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  const handleDeleteConfirm = async () => {
    await deleteUser.mutateAsync(userId);
    navigate("/users");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-7 w-64" />
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border last:border-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {t("common.notFound", "Maglumat tapylmady")}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Title + actions */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground leading-tight">
          {t("users.viewTitle", "Ulanyjy giňişleýin")}: {user.name} (
          {user.username})
        </h1>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/users/${userId}/edit`)}
          >
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* Main info */}
      <Section>
        <InfoRow label={t("common.id", "ID")} value={user.id} />
        <InfoRow
          label={t("users.fields.username", "Ulanyjy ady")}
          value={user.username}
        />
        <InfoRow label={t("users.fields.name", "Ady")} value={user.name} />
        <InfoRow
          label={t("users.fields.phone", "Telefon")}
          value={user.phone}
        />
        <InfoRow
          label={t("users.fields.email", "E-poçta")}
          value={user.email}
        />
        <InfoRow label={t("users.fields.isActive", "Işjeň")}>
          {user.isActive ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <XCircle size={18} className="text-muted-foreground/40" />
          )}
        </InfoRow>
      </Section>

      {/* Rollar */}
      <CollapsibleSection title={t("users.sections.roles", "Rollar")}>
        <DataTableToolbar
          searchValue={roleSearch}
          onSearchChange={setRoleSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("users.actions.addRole", "Rol birikdiriň")}
          onAction={() => {}}
        />
        <EmptyState
          label={t(
            "users.empty.roles",
            "Berlen kriteriýalara Rol gabat gelmedi.",
          )}
        />
      </CollapsibleSection>

      {/* Rugsatlar */}
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
        <EmptyState
          label={t(
            "users.empty.permissions",
            "Berlen kriteriýalara Rugsat gabat gelmedi.",
          )}
        />
      </CollapsibleSection>

      {/* Şahamçalar */}
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
        <EmptyState
          label={t(
            "users.empty.branches",
            "Berlen kriteriýalara Şahamça gabat gelmedi.",
          )}
        />
      </CollapsibleSection>

      {/* Ammallar */}
      <CollapsibleSection title={t("users.sections.audit", "Ammallar")}>
        <DataTableToolbar
          searchValue={auditSearch}
          onSearchChange={setAuditSearch}
          searchPlaceholder={t("common.search", "Gözlemek")}
          columns={[]}
          columnVisibility={{}}
          onColumnVisibilityChange={() => {}}
          columnOrder={[]}
          onColumnOrderChange={() => {}}
          actionLabel={t("users.actions.addAction", "Hereket")}
          onAction={() => {}}
        />
        <EmptyState
          label={t(
            "users.empty.audit",
            "Berlen kriteriýalara Hereket gabat gelmedi.",
          )}
        />
      </CollapsibleSection>

      {/* Delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("users.deleteDialog.title", "Ulanyjyny öçürmek")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "users.deleteDialog.description",
                'Siz "{name}" ulanyjysyny öçürjekmi? Bu amal yzyna gaýtarylyp bilinmez.',
              ).replace("{name}", user.username)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Ýok")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete", "Öçür")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
