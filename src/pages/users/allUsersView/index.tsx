import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, CheckCircle2, XCircle, ChevronDown, Plus, Search, SlidersHorizontal, ChevronUp } from "lucide-react";
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
import { Section, InfoRow } from "@/components/viewPageComponents";
import { useUser, useDeleteUser } from "@/features/allUsers/hooks/useAllUsers";

// ─── Collapsible Section ──────────────────────────────────────────────────────

interface CollapsibleBlockProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
  emptyMessage: string;
  searchPlaceholder?: string;
  showFilter?: boolean;
}

function CollapsibleBlock({ title, actionLabel, onAction, emptyMessage, searchPlaceholder, showFilter = false }: CollapsibleBlockProps) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-base font-semibold text-foreground mb-2 hover:opacity-80 transition-opacity select-none"
      >
        {title}
        {open ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </button>

      {open && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Sub-toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-8 pr-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              {showFilter && (
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <SlidersHorizontal size={13} />
                </Button>
              )}
              <Button size="sm" className="h-8 gap-1.5" onClick={onAction}>
                <Plus size={13} />
                {actionLabel}
              </Button>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-muted-foreground/40">
                <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 13h24" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M23 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="22" cy="22" r="5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M22 20v4M20 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            <Button variant="outline" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── UserViewPage ─────────────────────────────────────────────────────────────

export default function UserViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data: user, isLoading, isError } = useUser(userId);
  const deleteUser = useDeleteUser();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
            <div key={i} className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 border-b border-border last:border-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return <div className="p-6 text-center text-muted-foreground">{t("common.notFound", "Maglumat tapylmady")}</div>;
  }

  return (
    <div className="space-y-0">
      {/* Title + actions */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground leading-tight">
          {t("users.viewTitle", "Ulanyjy giňişleýin")}: {user.name} ({user.username})
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/users/${userId}/edit`)}>
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* Main info */}
      <Section>
        <InfoRow label={t("common.id", "ID")} value={user.id} />
        <InfoRow label={t("users.fields.username", "Ulanyjy ady")} value={user.username} />
        <InfoRow label={t("users.fields.name", "Ady")} value={user.name} />
        <InfoRow label={t("users.fields.phone", "Telefon")} value={user.phone} />
        <InfoRow label={t("users.fields.email", "E-poçta")} value={user.email} />
        <InfoRow label={t("users.fields.isActive", "Işjeň")}>
          {user.isActive ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <XCircle size={18} className="text-muted-foreground/40" />
          )}
        </InfoRow>
      </Section>

      {/* Rollar */}
      <CollapsibleBlock
        title={t("users.sections.roles", "Rollar")}
        actionLabel={t("users.actions.addRole", "Rol birikdiriň")}
        onAction={() => {}}
        emptyMessage={t("users.empty.roles", "Berlen kriteriýalara Rol gabat gelmedi.")}
        searchPlaceholder={t("common.search", "Gözlemek")}
      />

      {/* Rugsatlar */}
      <CollapsibleBlock
        title={t("users.sections.permissions", "Rugsatlar")}
        actionLabel={t("users.actions.addPermission", "Rugsat birikdiriň")}
        onAction={() => {}}
        emptyMessage={t("users.empty.permissions", "Berlen kriteriýalara Rugsat gabat gelmedi.")}
        searchPlaceholder={t("common.search", "Gözlemek")}
      />

      {/* Şahamçalar */}
      <CollapsibleBlock
        title={t("users.sections.branches", "Şahamçalar")}
        actionLabel={t("users.actions.addBranch", "Şahamça birikdiriň")}
        onAction={() => {}}
        emptyMessage={t("users.empty.branches", "Berlen kriteriýalara Şahamça gabat gelmedi.")}
        searchPlaceholder={t("common.search", "Gözlemek")}
        showFilter
      />

      {/* Ammallar */}
      <CollapsibleBlock
        title={t("users.sections.audit", "Ammallar")}
        actionLabel={t("users.actions.addAction", "Hereket")}
        onAction={() => {}}
        emptyMessage={t("users.empty.audit", "Berlen kriteriýalara Hereket gabat gelmedi.")}
        searchPlaceholder={t("common.search", "Gözlemek")}
      />

      {/* Delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteDialog.title", "Ulanyjyny öçürmek")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.deleteDialog.description", 'Siz "{name}" ulanyjysyny öçürjekmi? Bu amal yzyna gaýtarylyp bilinmez.').replace(
                "{name}",
                user.username,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Ýok")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete", "Öçür")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
