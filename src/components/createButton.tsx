import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "destructive" | "secondary";
}

export function CreateButton({ label, onClick, icon, disabled = false, className, variant = "primary" }: CreateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant === "destructive" ? "destructive" : variant === "secondary" ? "secondary" : "default"}
      className={cn("font-medium text-sm h-9 px-4 max-[680px]:px-2.5 transition-colors shadow-sm cursor-pointer min-w-0 shrink", className)}
    >
      {icon ?? <Plus size={15} className="mr-1.5 max-[680px]:mr-0 shrink-0" />}
      <span className="truncate max-[680px]:hidden">{label}</span>
    </Button>
  );
}
