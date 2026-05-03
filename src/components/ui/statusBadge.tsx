import { cn } from '@/lib/utils'

export type StatusBadgeVariant = 'warning' | 'success' | 'error' | 'info' | 'default'

interface StatusBadgeProps {
  label: string
  variant: StatusBadgeVariant
  icon?: React.ElementType
  className?: string
}

const VARIANT_STYLES: Record<StatusBadgeVariant, string> = {
  warning: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  success: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  error:   'bg-red-500/15 text-red-500 border-red-500/30',
  info:    'bg-blue-500/15 text-blue-500 border-blue-500/30',
  default: 'bg-muted/50 text-muted-foreground border-border',
}

export function StatusBadge({ label, variant, icon: Icon, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border whitespace-nowrap',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {Icon && <Icon size={11} />}
      {label}
    </span>
  )
}