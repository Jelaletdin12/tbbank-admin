import { cn } from '@/lib/utils'
import type { PaymentStatus, PaymentPaidStatus } from '@/features/sberPayments/api/sberPaymentsApi'

interface StatusBadgeProps {
  status: PaymentStatus
  className?: string
}

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  GARASYLYYAR: {
    label: 'Garasylyyar',
    className: 'bg-[oklch(0.75_0.18_85)] text-[oklch(0.20_0_0)]',
  },
  KANAGATLANDYRYLAN: {
    label: 'Kanagatlandyrylan',
    className: 'bg-[oklch(0.72_0.19_160)] text-[oklch(0.15_0_0)]',
  },
  RET_EDILEN: {
    label: 'Ret edilen',
    className: 'bg-destructive text-destructive-foreground',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

interface PaidStatusBadgeProps {
  status: PaymentPaidStatus
  className?: string
}

export function PaidStatusBadge({ status, className }: PaidStatusBadgeProps) {
  const isPaid = status === 'Tolendi'
  
  return (
    <span
      className={cn(
        'inline-flex items-center text-sm',
        isPaid ? 'text-primary' : 'text-muted-foreground',
        className
      )}
    >
      {status}
    </span>
  )
}
