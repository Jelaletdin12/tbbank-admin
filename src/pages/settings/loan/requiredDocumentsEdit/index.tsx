import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RequiredDocumentForm } from '@/features/requiredDocuments/components/requiredDocumentsForm'
import { useGetRequiredDocumentById } from '@/features/requiredDocuments/hooks/useRequiredDocuments'
import { Skeleton } from '@/components/ui/skeleton'

export default function RequiredDocumentsEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const documentId = Number(id)

  const { data, isLoading, isError } = useGetRequiredDocumentById(documentId)

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-xl font-semibold text-foreground mb-5">
        {isLoading
          ? t('common.loading', 'Ýüklenýär...')
          : `${t('loanDocuments.editTitle', 'Karz gerekli resminamalary redaktirle')}: ${data?.name.tk ?? ''}`}
      </h1>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[220px_1fr] items-start px-4 py-4">
              <Skeleton className="h-4 w-24 mt-2" />
              <div>
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-20 text-destructive text-sm">
          {t('common.error', 'Ýalňyşlyk ýüze çykdy')}
        </div>
      ) : (
        <RequiredDocumentForm
          mode="edit"
          initialData={data}
          requiredDocumentId={documentId}
        />
      )}
    </div>
  )
}
