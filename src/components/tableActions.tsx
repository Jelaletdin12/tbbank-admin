import { Eye, Pencil, Trash2, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface TableAction {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  editIcon?: LucideIcon;
  extraActions?: TableAction[];
}

export function TableActions({ onView, onEdit, onDelete, isDeleting, editIcon: EditIcon = Pencil, extraActions }: TableActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {extraActions?.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          disabled={action.disabled}
          className={`p-1.5 cursor-pointer rounded transition-colors disabled:opacity-50 ${
            action.destructive
              ? "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          }`}
          title={action.title}
        >
          <action.icon size={15} />
        </button>
      ))}

      {onView && (
        <button
          className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          title={t("common.view", "View")}
          onClick={onView}
        >
          <Eye size={15} />
        </button>
      )}

      {onEdit && (
        <button
          className="p-1.5 cursor-pointer rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          title={t("common.edit", "Edit")}
          onClick={onEdit}
        >
          <EditIcon size={15} />
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 cursor-pointer rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          title={t("common.delete", "Delete")}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
