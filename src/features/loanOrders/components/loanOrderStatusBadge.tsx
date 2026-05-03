import { AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/statusBadge'
import type { LoanOrderStatus } from '../api/loanOrdersApi'

interface LoanOrderStatusConfig {
  label: string
  variant: StatusBadgeVariant
  icon: React.ElementType
}

const STATUS_CONFIG: Record<LoanOrderStatus, LoanOrderStatusConfig> = {
  GARAŞYLÝAR:        { label: 'GARAŞYLÝAR',       variant: 'warning', icon: AlertCircle  },
  KANAGATLANDYRYLAN: { label: 'KANAGATLANDYRYLAN', variant: 'success', icon: CheckCircle2 },
  RED_EDILDI:        { label: 'RED EDILDI',         variant: 'error',   icon: XCircle      },
  IŞLENÝÄR:          { label: 'IŞLENÝÄR',           variant: 'info',    icon: Loader2      },
}

interface LoanOrderStatusBadgeProps {
  status: LoanOrderStatus
}

export function LoanOrderStatusBadge({ status }: LoanOrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return <StatusBadge label={config.label} variant={config.variant} icon={config.icon} />
}