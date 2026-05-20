import { useTranslation } from 'react-i18next'
import { ClientForm } from '@/features/clients/components/clientForm'

export default function ClientCreatePage() {
  const { t } = useTranslation()

  return (
    <div >
    

      {/* Page heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('clients.createTitle', 'Müşderi dörediň')}
      </h1>

      <ClientForm mode="create" />
    </div>
  )
}
