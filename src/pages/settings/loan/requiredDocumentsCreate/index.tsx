import { useTranslation } from 'react-i18next'
import { RequiredDocumentForm } from '@/features/requiredDocuments/components/requiredDocumentsForm'

export default function RequiredDocumentsCreatePage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-5">
        {t('loanDocuments.createBtn', 'Karz gerekli resminamalary dörediň')}
      </h1>

      <RequiredDocumentForm mode="create" />
    </div>
  )
}
