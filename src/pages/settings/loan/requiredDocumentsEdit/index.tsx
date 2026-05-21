import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { RequiredDocumentForm } from '@/features/requiredDocuments/components/requiredDocumentsForm'
import { useGetRequiredDocumentById } from '@/features/requiredDocuments/hooks/useRequiredDocuments'

export default function RequiredDocumentsEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const { data, isLoading, isError } = useGetRequiredDocumentById(numericId)

  if (isLoading) return <PageSpinner />
  if (isError || !data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <RequiredDocumentForm mode="edit" initialData={data} />
}
