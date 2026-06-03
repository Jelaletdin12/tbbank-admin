import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface TableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TableSearchInput({ value, onChange, placeholder, className }: TableSearchInputProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("relative min-w-0", className)}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t("table.search", "Search...")}
        className={cn(
          "h-9 w-64 max-w-full rounded-md border border-border bg-background pl-9 pr-3",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent",
          "transition-colors",
        )}
      />
    </div>
  );
}
