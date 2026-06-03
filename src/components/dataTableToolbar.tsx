import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, Filter, ChevronDown, X, GripVertical } from "lucide-react";
import type { VisibilityState } from "@tanstack/react-table";
import { useOutsideClick } from "@/lib/hooks/useOutsideClick";
import { cn } from "@/lib/utils";
import { TableSearchInput } from "@/components/tableSearch";
import { CreateButton } from "@/components/createButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnMeta {
  id: string;
  label: string;
}

export interface FilterField {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface ActiveFilter {
  fieldId: string;
  value: string;
}

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  columns: ColumnMeta[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;

  filterFields?: FilterField[];
  activeFilters?: ActiveFilter[];
  onFilterChange?: (fieldId: string, value: string) => void;
  onFilterReset?: () => void;

  perPageOptions?: number[];
  perPage?: number;
  onPerPageChange?: (value: number) => void;

  actionLabel?: string;
  onAction?: () => void;

  hideSearch?: boolean;
  hideAction?: boolean;

  extraActions?: React.ReactNode;
}

// ─── Toggle Columns Dropdown ──────────────────────────────────────────────────

interface ToggleColumnsDropdownProps {
  columns: ColumnMeta[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
}

function ToggleColumnsDropdown({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
}: ToggleColumnsDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragIdRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useOutsideClick(ref, () => setOpen(false));

  const isVisible = (id: string) => (columnVisibility[id] === undefined ? true : columnVisibility[id]);

  const toggle = (id: string) => {
    onColumnVisibilityChange({ ...columnVisibility, [id]: !isVisible(id) });
  };

  const orderedColumns = [...columns].sort((a, b) => {
    const ai = columnOrder.indexOf(a.id);
    const bi = columnOrder.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const handleDragStart = (id: string) => {
    dragIdRef.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragIdRef.current !== id) setDragOverId(id);
  };

  const handleDrop = (targetId: string) => {
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) return;
    const next = [...columnOrder];
    const from = next.indexOf(sourceId);
    const to = next.indexOf(targetId);
    const safeFrom = from === -1 ? next.length : from;
    const safeTo = to === -1 ? next.length : to;
    next.splice(safeFrom, 1);
    next.splice(safeTo, 0, sourceId);
    onColumnOrderChange(next);
    dragIdRef.current = null;
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    dragIdRef.current = null;
    setDragOverId(null);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 h-9 px-3 rounded-md border border-border cursor-pointer",
          "text-sm text-muted-foreground bg-background",
          "hover:bg-muted/50 hover:text-foreground transition-colors",
          open && "bg-muted/50 text-foreground border-ring",
        )}
      >
        <SlidersHorizontal size={14} />
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-52 bg-card border border-border rounded-md shadow-lg z-50 py-2">
          <p className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("table.toggleColumns", "Toggle Columns")}
          </p>
          {orderedColumns.map((col) => (
            <div
              key={col.id}
              draggable
              onDragStart={() => handleDragStart(col.id)}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={() => handleDrop(col.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 transition-colors cursor-default",
                "hover:bg-muted/40",
                dragOverId === col.id && "bg-primary/10 border-l-2 border-primary",
              )}
            >
              <GripVertical size={13} className="text-muted-foreground cursor-grab shrink-0 active:cursor-grabbing" />
              <input
                type="checkbox"
                id={`col-toggle-${col.id}`}
                checked={isVisible(col.id)}
                onChange={() => toggle(col.id)}
                className="w-4 h-4 rounded cursor-pointer accent-[#005f78] dark:accent-primary"
              />
              <label htmlFor={`col-toggle-${col.id}`} className="text-sm text-foreground cursor-pointer flex-1 truncate select-none">
                {col.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

interface FilterDropdownProps {
  filterFields: FilterField[];
  activeFilters: ActiveFilter[];
  onFilterChange: (fieldId: string, value: string) => void;
  onFilterReset: () => void;
  perPageOptions?: number[];
  perPage?: number;
  onPerPageChange?: (value: number) => void;
}

function FilterDropdown({
  filterFields,
  activeFilters,
  onFilterChange,
  onFilterReset,
  perPageOptions = [10, 25, 50, 100],
  perPage = 25,
  onPerPageChange,
}: FilterDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const activeCount = activeFilters.filter((f) => f.value !== "").length;
  const hasActive = activeCount > 0;

  const getActiveValue = (fieldId: string) => activeFilters.find((f) => f.fieldId === fieldId)?.value ?? "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 h-9 px-3 rounded-md border border-border cursor-pointer",
            "text-muted-foreground bg-background",
            "hover:bg-muted/50 hover:text-foreground transition-colors",
            open && "bg-muted/50 text-foreground border-ring",
            hasActive && "border-primary text-primary",
          )}
        >
          <Filter size={14} />
          {hasActive && (
            <span className="text-xs font-semibold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {activeCount}
            </span>
          )}
          <ChevronDown size={12} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={4} className="w-64 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t("table.filters", "Filters")}</p>
        </div>

        {/* Fields */}
        <div className="px-3 py-3 space-y-3">
          {filterFields.map((field) => {
            const current = getActiveValue(field.id);
            const isFieldActive = current !== "";

            return (
              <div key={field.id} className="space-y-1">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</label>

                {/* MonthSelect ile aynı pattern: manuel span + sentinel */}
                <div className="flex items-center gap-1">
                  <Select value={current || "__all__"} onValueChange={(val) => onFilterChange(field.id, val === "__all__" ? "" : val)}>
                    <SelectTrigger
                      className={cn(
                        "h-8 flex-1 text-sm gap-1.5 transition-colors",
                        isFieldActive ? "border-primary text-primary [&>svg:last-child]:text-primary" : "text-muted-foreground",
                      )}
                    >
                      {/* SelectValue kullanmıyoruz — MonthSelect gibi manuel */}
                      <span className="flex-1 text-left truncate">
                        {isFieldActive ? field.options.find((o) => o.value === current)?.label : "—"}
                      </span>
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="p-1">
                      <SelectItem value="__all__">
                        <span className="text-muted-foreground">— Ählisi</span>
                      </SelectItem>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Field bazlı temizle — MonthSelect'teki X butonu ile aynı */}
                  {isFieldActive && (
                    <button
                      type="button"
                      onClick={() => onFilterChange(field.id, "")}
                      className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {onPerPageChange && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t("table.perPage", "Sahypa başyna")}
              </label>
              <Select value={String(perPage)} onValueChange={(val) => onPerPageChange(Number(val))}>
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="p-1">
                  {perPageOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reset — tüm filtreler, sadece aktif filter varsa göster */}
          {hasActive && (
            <button
              type="button"
              onClick={onFilterReset}
              className={cn(
                "w-full cursor-pointer flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-colors",
                "bg-destructive/10 text-destructive border border-destructive/20",
                "hover:bg-destructive/30 hover:text-destructive-foreground",
              )}
            >
              <X size={11} />
              {t("table.reset", "Reset")} ({activeCount})
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── DataTableToolbar ─────────────────────────────────────────────────────────

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
  filterFields = [],
  activeFilters = [],
  onFilterChange,
  onFilterReset,
  perPageOptions,
  perPage,
  onPerPageChange,
  actionLabel,
  onAction,
  hideSearch = false,
  hideAction = false,
  extraActions,
}: DataTableToolbarProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-3", hideSearch ? "justify-end" : "justify-between")}>
      {!hideSearch && <TableSearchInput value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />}

      <div className="flex items-center gap-2">
        <ToggleColumnsDropdown
          columns={columns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          columnOrder={columnOrder}
          onColumnOrderChange={onColumnOrderChange}
        />

        {filterFields.length > 0 && onFilterChange && onFilterReset && (
          <FilterDropdown
            filterFields={filterFields}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            onFilterReset={onFilterReset}
            perPageOptions={perPageOptions}
            perPage={perPage}
            onPerPageChange={onPerPageChange}
          />
        )}

        {extraActions}

        {!hideAction && actionLabel && onAction && <CreateButton label={actionLabel} onClick={onAction} />}
      </div>
    </div>
  );
}
