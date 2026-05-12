import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  Strikethrough,
  Link2,
  Heading2,
  Quote,
  Code,
  List,
  ListOrdered,
  Minus,
  WrapText,
  Paperclip,
  Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { useCreateRequiredDocument, useUpdateRequiredDocument } from '../hooks/useRequiredDocuments'
import type { LoanDocument, LoanDocumentPayload, LoanDocumentTranslation } from '../api/requiredDocumentsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = 'tk' | 'ru' | 'en'

interface RequiredDocumentFormProps {
  mode: 'create' | 'edit'
  initialData?: LoanDocument
  requiredDocumentId?: number
}

// ─── Lang tabs ────────────────────────────────────────────────────────────────

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'tk', label: 'Türkmen' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

// ─── Tiptap Toolbar ───────────────────────────────────────────────────────────

interface RichTextToolbarProps {
  editor: ReturnType<typeof useEditor>
}

function RichTextToolbar({ editor }: RichTextToolbarProps) {
  if (!editor) return null

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), title: 'Strike' },
    { icon: Link2, action: () => {
      const url = prompt('URL giriziň:')
      if (url) editor.chain().focus().setLink({ href: url }).run()
    }, active: editor.isActive('link'), title: 'Link' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'H2' },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Quote' },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), title: 'Code' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Ordered List' },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: 'Divider' },
    { icon: WrapText, action: () => editor.chain().focus().setHardBreak().run(), active: false, title: 'Hard Break' },
    { icon: Paperclip, action: () => {}, active: false, title: 'Attachment' },
    { icon: Type, action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(), active: false, title: 'Clear format' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/30">
      {tools.map(({ icon: Icon, action, active, title }) => (
        <button
          key={title}
          type="button"
          title={title}
          onMouseDown={(e) => { e.preventDefault(); action() }}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded text-muted-foreground',
            'hover:bg-muted hover:text-foreground transition-colors',
            active && 'bg-primary/10 text-primary'
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}

// ─── RichTextEditor ───────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  error?: string
}

function RichTextEditor({ value, onChange, error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Sync external value changes (e.g. tab switch)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  return (
    <div
      className={cn(
        'rounded-md border bg-background overflow-hidden',
        error ? 'border-destructive' : 'border-input',
        'focus-within:ring-1 focus-within:ring-ring'
      )}
    >
      <RichTextToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="min-h-[120px] px-3 py-2 text-sm text-foreground prose prose-sm dark:prose-invert max-w-none focus:outline-none [&_.ProseMirror]:focus:outline-none"
      />
      {error && (
        <p className="px-3 pb-2 text-xs text-destructive font-medium flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── LangTabs ────────────────────────────────────────────────────────────────

interface LangTabsProps {
  active: Locale
  onChange: (locale: Locale) => void
}

function LangTabs({ active, onChange }: LangTabsProps) {
  return (
    <div className="flex items-center justify-end gap-3 mb-2">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            'text-sm transition-colors',
            active === code
              ? 'text-primary font-semibold underline underline-offset-4'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Empty translation ────────────────────────────────────────────────────────

const emptyTranslation = (): LoanDocumentTranslation => ({ tk: '', ru: '', en: '' })

// ─── RequiredDocumentForm ─────────────────────────────────────────────────────────

export function RequiredDocumentForm({ mode, initialData, requiredDocumentId }: RequiredDocumentFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Per-field locale tabs
  const [nameLang, setNameLang] = useState<Locale>('tk')
  const [descLang, setDescLang] = useState<Locale>('tk')

  // Form state
  const [name, setName] = useState<LoanDocumentTranslation>(
    initialData?.name ?? emptyTranslation()
  )
  const [description, setDescription] = useState<LoanDocumentTranslation>(
    initialData?.description ?? emptyTranslation()
  )

  // Errors
  const [errors, setErrors] = useState<Partial<Record<`name_${Locale}` | `desc_${Locale}`, string>>>({})

  // Sync initial data on edit mode load
  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description)
    }
  }, [initialData])

  const createMutation = useCreateRequiredDocument()
  const updateMutation = useUpdateRequiredDocument(requiredDocumentId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: typeof errors = {}
    LOCALES.forEach(({ code }) => {
      if (!name[code].trim()) {
        errs[`name_${code}`] = t('validation.required', 'Bu meýdan hökmany')
      }
      if (!description[code].replace(/<[^>]*>/g, '').trim()) {
        errs[`desc_${code}`] = t('validation.required', 'Bu meýdan hökmany')
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload: LoanDocumentPayload = { name, description }

    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      navigate('/settings/loan/loan-documents')
    } else {
      await updateMutation.mutateAsync(payload)
      navigate('/settings/loan/loan-documents')
    }
  }

  const submitLabel =
    mode === 'create'
      ? t('loanDocuments.form.create', 'Karz gerekli resminamalary döretiň')
      : t('loanDocuments.form.update', 'Karz gerekli resminamalary täzele')

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">

        {/* ── Name field ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-[220px_1fr] items-start py-4 px-4">
          <label className="text-sm text-muted-foreground pt-1">
            {t('loanDocuments.fields.name', 'Ady')}
            <span className="text-destructive ml-0.5">*</span>
          </label>
          <div>
            <LangTabs active={nameLang} onChange={setNameLang} />
            <FormInput
              type="text"
              value={name[nameLang]}
              onChange={(val) => setName((prev) => ({ ...prev, [nameLang]: val }))}
              placeholder={t('loanDocuments.fields.namePlaceholder', 'Ady')}
              error={errors[`name_${nameLang}`]}
            />
            {/* Show errors for other locales as hints */}
            {LOCALES.filter((l) => l.code !== nameLang && errors[`name_${l.code}`]).map(({ code, label }) => (
              <p key={code} className="mt-1 text-xs text-destructive/70">
                {label}: {errors[`name_${code}`]}
              </p>
            ))}
          </div>
        </div>

        {/* ── Description field ────────────────────────────────────────────── */}
        <div className="grid grid-cols-[220px_1fr] items-start py-4 px-4">
          <label className="text-sm text-muted-foreground pt-1">
            {t('loanDocuments.fields.description', 'Yazgy')}
            <span className="text-destructive ml-0.5">*</span>
          </label>
          <div>
            <LangTabs active={descLang} onChange={setDescLang} />
            <RichTextEditor
              value={description[descLang]}
              onChange={(val) => setDescription((prev) => ({ ...prev, [descLang]: val }))}
              error={errors[`desc_${descLang}`]}
            />
            {LOCALES.filter((l) => l.code !== descLang && errors[`desc_${l.code}`]).map(({ code, label }) => (
              <p key={code} className="mt-1 text-xs text-destructive/70">
                {label}: {errors[`desc_${code}`]}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 mt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/settings/loan/loan-documents')}
          disabled={isPending}
        >
          {t('common.cancel', 'Ýatyr')}
        </Button>
        <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {isPending ? t('common.saving', 'Saklanylýar...') : submitLabel}
        </Button>
      </div>
    </form>
  )
}