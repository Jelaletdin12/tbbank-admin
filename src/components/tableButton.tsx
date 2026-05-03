import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TableActionButtonProps {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
  variant?: 'primary' | 'destructive' | 'secondary'
}

export function TableActionButton({
  label,
  onClick,
  icon,
  disabled = false,
  className,
  variant = 'primary',
}: TableActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant === 'destructive' ? 'destructive' : variant === 'secondary' ? 'secondary' : 'default'}
      className={cn(
        'font-medium text-sm h-9 px-4 transition-colors shadow-sm',
        className
      )}
    >
      {icon ?? <Plus size={15} className="mr-1.5" />}
      {label}
    </Button>
  )
}