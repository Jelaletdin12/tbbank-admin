import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ClientForm } from '@/features/clients/components/clientForm'

export default function ClientCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <span
          className="cursor-pointer hover:text-foreground transition-colors"
          onClick={() => navigate('/clients')}
        >
          {t('clients.title', 'Müşderiler')}
        </span>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">
          {t('clients.createTitle', 'Müşderi dörediň')}
        </span>
      </nav>

      {/* Page heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('clients.createTitle', 'Müşderi dörediň')}
      </h1>

      <ClientForm mode="create" />
    </div>
  )
}
