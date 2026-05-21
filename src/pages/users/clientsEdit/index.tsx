import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { ClientForm } from '@/features/clients/components/clientForm'
import { useClient } from '@/features/clients/hooks/useClients'

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const numericId = Number(id)
  const { data: client, isLoading } = useClient(numericId)

  if (isLoading) return <PageSpinner />
  if (!client) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <ClientForm mode="edit" initialData={client} />
}
