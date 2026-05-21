import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { DistrictForm } from '@/features/districts/components/districtsForm'
import { useDistrictById } from '@/features/districts/hooks/useDistricts'

export default function DistrictEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const numericId = Number(id)
  const { data, isLoading, isError } = useDistrictById(numericId)

  if (isLoading) return <PageSpinner />
  if (isError || !data) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <DistrictForm mode="edit" initialData={data} />
}
