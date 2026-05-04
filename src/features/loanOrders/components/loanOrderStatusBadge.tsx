import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/statusBadge'
import type { LoanOrderStatus } from '../api/loanOrdersApi'

interface LoanOrderStatusConfig {
  labelKey: string
  variant: StatusBadgeVariant
  icon: React.ElementType
}

const STATUS_CONFIG: Record<LoanOrderStatus, LoanOrderStatusConfig> = {
  GARAŞYLÝAR:        { labelKey: 'loanOrderStatus.GARAŞYLÝAR',        variant: 'warning', icon: AlertCircle  },
  KANAGATLANDYRYLAN: { labelKey: 'loanOrderStatus.KANAGATLANDYRYLAN', variant: 'success', icon: CheckCircle2 },
  RED_EDILDI:        { labelKey: 'loanOrderStatus.RED_EDILDI',        variant: 'error',   icon: XCircle      },
  IŞLENÝÄR:          { labelKey: 'loanOrderStatus.IŞLENÝÄR',          variant: 'info',    icon: Loader2      },
}

interface LoanOrderStatusBadgeProps {
  status: LoanOrderStatus
}

export function LoanOrderStatusBadge({ status }: LoanOrderStatusBadgeProps) {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[status]

  if (!config) {
    console.warn(`[LoanOrderStatusBadge] Unknown status: ${status}`);
    return (
      <StatusBadge
        label={status ? String(status) : t('common.unknown', 'Näbelli')}
        variant="default"
        icon={AlertCircle}
      />
    )
  }

  return <StatusBadge label={t(config.labelKey)} variant={config.variant} icon={config.icon} />
}