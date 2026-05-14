import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FormActionsProps {
  isPending?: boolean
  onSubmit?: () => void
  onCancel?: () => void
  submitLabel?: ReactNode
  cancelLabel?: ReactNode
  loadingLabel?: ReactNode
  cancelVariant?: 'outline' | 'ghost'
  className?: string
  onNext?: () => void
  onPrev?: () => void
  nextLabel?: ReactNode
  prevLabel?: ReactNode
  showSubmit?: boolean
}

export function FormActions({
  isPending = false,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  loadingLabel,
  cancelVariant = 'outline',
  className,
  onNext,
  onPrev,
  nextLabel,
  prevLabel,
  showSubmit = true,
}: FormActionsProps) {
  const { t } = useTranslation()

  const cancelText = cancelLabel ?? t('common.cancel', 'Ýatyr')
  const loadingText = loadingLabel ?? t('common.saving', 'Saklanýar...')
  const prevText = prevLabel ?? t('common.prev', 'Yza')
  const nextText = nextLabel ?? t('common.next', 'Indiki')

  return (
    <div className={cn('flex items-center justify-end gap-3', className)}>
      {onCancel && (
        <Button type="button" variant={cancelVariant} onClick={onCancel} disabled={isPending}>
          {cancelText}
        </Button>
      )}
      {onPrev && (
        <Button type="button" variant="outline" onClick={onPrev} disabled={isPending}>
          {prevText}
        </Button>
      )}
      {onNext && (
        <Button type="button" onClick={onNext} disabled={isPending}>
          {nextText}
        </Button>
      )}
      {showSubmit && onSubmit && (
        <Button type="button" onClick={onSubmit} disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {loadingText}
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      )}
    </div>
  )
}
