import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageSpinner } from '@/components/pageSpinner'
import { PageError } from '@/components/pageError'
import { VisaMasterSettingForm } from '@/features/visaMasterSberSettings/components/visaMasterSberSettingsForm'
import { useGetVisaMasterSettingById } from '@/features/visaMasterSberSettings/hooks/useVisaMasterSettings'

export default function VisaMasterSettingEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const numericId = Number(id)
  const { data: setting, isLoading } = useGetVisaMasterSettingById(numericId)

  if (isLoading) return <PageSpinner />
  if (!setting) return <PageError message={t('common.notFound', 'Tapylmady')} />

  return <VisaMasterSettingForm mode="edit" initialData={setting} />
}
