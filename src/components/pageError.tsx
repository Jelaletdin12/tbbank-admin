import { useTranslation } from 'react-i18next'

interface PageErrorProps {
  message?: string
}

export function PageError({ message }: PageErrorProps) {
  const { t } = useTranslation()
  const text = message ?? t('common.notFound', 'Maglumat ýüklenilmedi. Sahypany täzeleläň.')
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-destructive">{text}</p>
    </div>
  )
}
