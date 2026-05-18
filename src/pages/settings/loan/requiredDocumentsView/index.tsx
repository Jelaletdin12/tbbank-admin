import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section, InfoRow } from '@/components/viewPageComponents'
import { useGetRequiredDocumentById, useDeleteRequiredDocument } from '@/features/requiredDocuments/hooks/useRequiredDocuments'
import { ConfirmDialog } from '@/components/confirmDialog'

export default function RequiredDocumentsViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const docId = Number(id)
  const { data, isLoading } = useGetRequiredDocumentById(docId)
  const deleteMutation = useDeleteRequiredDocument()

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(docId)
    navigate('/settings/loan/loan-documents')
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {t('common.notFound', 'Maglumat tapylmady')}
      </div>
    )
  }

  return (
    <div>
      {/* Page heading */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <h1 className="text-xl font-semibold text-foreground leading-snug line-clamp-2">
          {t('loanDocuments.viewTitle', 'Karz gerekli resminamalary giňişleýin')}: {data.name.tk}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteMutation.isPending}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/settings/loan/loan-documents/${docId}/edit`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>

      {/* Main info */}
      <Section>
        <InfoRow label={t('common.id', 'ID')} value={data.id} />

        {/* Name — multilingual */}
        <div className="grid grid-cols-[220px_1fr] items-start py-2.5 px-4 border-b border-border">
          <span className="text-sm text-muted-foreground pt-1">
            {t('loanDocuments.fields.name', 'Ady')}
          </span>
          <div className="space-y-3">
            {(['tk', 'ru', 'en'] as const).map((lang) => (
              <div key={lang}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
                  {t(lang === 'tk' ? 'languages.tk' : lang === 'ru' ? 'languages.ru' : 'languages.en', lang === 'tk' ? 'Türkmen' : lang === 'ru' ? 'Русский' : 'English')}
                </span>
                <span className="text-sm text-foreground">{data.name[lang] || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description — multilingual */}
        <div className="grid grid-cols-[220px_1fr] items-start py-2.5 px-4">
          <span className="text-sm text-muted-foreground pt-1">
            {t('loanDocuments.fields.description', 'Yazgy')}
          </span>
          <div className="space-y-4">
            {(['tk', 'ru', 'en'] as const).map((lang) => (
              <div key={lang}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {t(lang === 'tk' ? 'languages.tk' : lang === 'ru' ? 'languages.ru' : 'languages.en', lang === 'tk' ? 'Türkmen' : lang === 'ru' ? 'Русский' : 'English')}
                </span>
                {data.description[lang] ? (
                  <div
                    className="text-sm text-foreground prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: data.description[lang] }}
                  />
                ) : (
                  <span className="text-muted-foreground/40 text-sm">—</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('loanDocuments.deleteConfirm', 'Bu resminamany öçürmek isleýärsiňizmi?')}
        confirmLabel={t('common.delete', 'Poz')}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}