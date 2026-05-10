import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClientForm } from '@/features/clients/components/clientForm'
import { useClient } from '@/features/clients/hooks/useClients'

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>()
  const clientId = Number(id)
  const { t } = useTranslation()

  const { data: client, isLoading } = useClient(clientId)

  return (
    <div className="p-6">
     

      {/* Page heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {t('clients.editTitle', 'Müşderi üýtget')}: {client?.name ?? ''}
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ClientForm
          mode="edit"
          initialData={client}
          clientId={clientId}
        />
      )}
    </div>
  )
}
