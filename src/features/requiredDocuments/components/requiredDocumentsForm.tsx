import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { FormActions } from '@/components/formActions'
import { useCreateRequiredDocument, useUpdateRequiredDocument } from '../hooks/useRequiredDocuments'
import { createRequiredDocumentFormSchema, DEFAULT_FORM_VALUES, buildPayload, mapInitial } from '../schemas/requiredDocument.schema'
import type { RequiredDocumentFormData } from '../schemas/requiredDocument.schema'
import type { LoanDocument, LoanDocumentTranslation } from '../api/requiredDocumentsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = 'tk' | 'ru' | 'en'

interface RequiredDocumentFormProps {
  mode: 'create' | 'edit'
  initialData?: LoanDocument
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

// ─── Error helpers ──────────────────────────────────────────────────────────

type LegacyErrorKey = `name_${Locale}` | `desc_${Locale}`

const RHF_TO_LEGACY_KEY: Record<string, LegacyErrorKey> = {
  nameTk: 'name_tk',
  nameRu: 'name_ru',
  nameEn: 'name_en',
  descTk: 'desc_tk',
  descRu: 'desc_ru',
  descEn: 'desc_en',
}

function flattenErrors(
  errors: Record<string, { message?: string } | undefined>,
): Partial<Record<LegacyErrorKey, string>> {
  const result: Partial<Record<LegacyErrorKey, string>> = {}
  for (const [key, err] of Object.entries(errors)) {
    const legacyKey = RHF_TO_LEGACY_KEY[key]
    if (legacyKey && err?.message) {
      result[legacyKey] = err.message
    }
  }
  return result
}

// ─── RequiredDocumentForm ─────────────────────────────────────────────────────────

export function RequiredDocumentForm({ mode, initialData }: RequiredDocumentFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  )
  const navigate = useNavigate()

  // Per-field locale tabs (UI only, not form state)
  const [nameLang, setNameLang] = useState<Locale>('tk')
  const [descLang, setDescLang] = useState<Locale>('tk')

  const createMutation = useCreateRequiredDocument()
  const updateMutation = useUpdateRequiredDocument(initialData?.id ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  const schema = useMemo(() => createRequiredDocumentFormSchema(t), [t, i18n.language])

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    trigger,
  } = useForm<RequiredDocumentFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(
    () => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>),
    [rhfErrors],
  )

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

  // Derive LoanDocumentTranslation objects so the JSX stays unchanged
  const name: LoanDocumentTranslation = useMemo(
    () => ({ tk: form.nameTk, ru: form.nameRu, en: form.nameEn }),
    [form.nameTk, form.nameRu, form.nameEn],
  )

  const description: LoanDocumentTranslation = useMemo(
    () => ({ tk: form.descTk, ru: form.descRu, en: form.descEn }),
    [form.descTk, form.descRu, form.descEn],
  )

  // Functional setter that matches React's useState(prev => …) signature
  const setName = useCallback(
    (updater: (prev: LoanDocumentTranslation) => LoanDocumentTranslation) => {
      const current = getValues()
      const prev: LoanDocumentTranslation = { tk: current.nameTk, ru: current.nameRu, en: current.nameEn }
      const next = updater(prev)
      setValue('nameTk', next.tk)
      setValue('nameRu', next.ru)
      setValue('nameEn', next.en)
    },
    [setValue, getValues],
  )

  const setDescription = useCallback(
    (updater: (prev: LoanDocumentTranslation) => LoanDocumentTranslation) => {
      const current = getValues()
      const prev: LoanDocumentTranslation = { tk: current.descTk, ru: current.descRu, en: current.descEn }
      const next = updater(prev)
      setValue('descTk', next.tk)
      setValue('descRu', next.ru)
      setValue('descEn', next.en)
    },
    [setValue, getValues],
  )

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const isValid = await trigger()
    if (!isValid) return

    const payload = buildPayload(getValues())

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
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === 'create'
          ? t('loanDocuments.createTitle', 'Karz gerekli resminama dörediň')
          : t('loanDocuments.editTitle', 'Karz gerekli resminama üýtgetmek')}
      </h1>
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

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/settings/loan/loan-documents')}
        cancelVariant="ghost"
        loadingLabel={t('common.saving', 'Saklanylýar...')}
        submitLabel={submitLabel}
        className="mt-4"
      />
    </form>
    </div>
  )
}