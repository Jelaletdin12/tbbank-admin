import {
  StatusBadge,
  type StatusBadgeVariant,
} from '@/components/ui/statusBadge'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import type { PaymentStatus } from '@/features/onlinePaymentHistory/api/onlinePaymentsHistoryApi'

const STATUS_CONFIG = {
  GARAŞYLÝAR: {
    label: 'Garaşylýar',
    variant: 'warning' as StatusBadgeVariant,
    icon: AlertCircle,
  },
  TÖLENEN: {
    label: 'Tölenen',
    variant: 'success' as StatusBadgeVariant,
    icon: CheckCircle2,
  },
  YATYRYLAN: {
    label: 'Ýatyrylan',
    variant: 'error' as StatusBadgeVariant,
    icon: XCircle,
  },
} satisfies Record<
  PaymentStatus,
  { label: string; variant: StatusBadgeVariant; icon: React.ElementType }
>

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return <span className="text-xs text-muted-foreground">{String(status)}</span>
  return <StatusBadge label={cfg.label} variant={cfg.variant} icon={cfg.icon} />
}
