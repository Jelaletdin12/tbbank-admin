import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
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
  X,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { BentoGrid, BentoCard } from "@/components/bento";
import { useCreateRequiredDocument, useUpdateRequiredDocument } from "../hooks/useRequiredDocuments";
import { createRequiredDocumentFormSchema, DEFAULT_FORM_VALUES, buildPayload, mapInitial } from "../schemas/requiredDocument.schema";
import type { RequiredDocumentFormData } from "../schemas/requiredDocument.schema";
import type { LoanDocument, LoanDocumentTranslation } from "../api/requiredDocumentsApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "tk" | "ru" | "en";

interface RequiredDocumentFormProps {
  mode: "create" | "edit";
  initialData?: LoanDocument;
}

// ─── Lang tabs ────────────────────────────────────────────────────────────────

const LOCALES: Locale[] = ["tk", "ru", "en"];

// ─── Tiptap Toolbar ───────────────────────────────────────────────────────────

interface RichTextToolbarProps {
  editor: ReturnType<typeof useEditor>;
  onFileAttach?: (file: File) => void;
}

// ─── RichTextToolbar ─────────────────────────────────────────────────────────

function RichTextToolbar({ editor, onFileAttach }: RichTextToolbarProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleLinkConfirm = (url: string) => {
    if (url) {
      const href = url.startsWith("http") ? url : `https://${url}`;
      editor.chain().focus().setLink({ href }).run();
    }
    setShowLinkModal(false);
  };

  const handleAttachmentClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileAttach?.(file);

    editor.chain().focus().insertContent(`<span>📎 ${file.name}</span> `).run();

    e.target.value = "";
  };

  const tools = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      title: "Italic",
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
      title: "Strike",
    },
    {
      icon: Link2,
      action: () => setShowLinkModal(true),
      active: editor.isActive("link"),
      title: "Link",
    },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
      title: "H2",
    },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
      title: "Quote",
    },
    {
      icon: Code,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
      title: "Code Block",
    },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
      title: "Ordered List",
    },
    {
      icon: Minus,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      active: false,
      title: "Divider",
    },
    {
      icon: WrapText,
      action: () => editor.chain().focus().setHardBreak().run(),
      active: false,
      title: "Hard Break",
    },
    {
      icon: Paperclip,
      action: handleAttachmentClick,
      active: false,
      title: "Attachment",
    },
    {
      icon: Type,
      action: () => editor.chain().focus().selectAll().clearNodes().unsetAllMarks().run(),
      active: false,
      title: "Clear format",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/30">
        {
          // eslint-disable-next-line react-hooks/refs
          tools.map(({ icon: Icon, action, active, title }) => (
            <button
              key={title}
              type="button"
              title={title}
              onMouseDown={(e) => {
                e.preventDefault();
                action();
              }}
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded text-muted-foreground",
                "hover:bg-muted hover:text-foreground transition-colors",
                active && "bg-primary/10 text-primary",
              )}
            >
              <Icon size={14} />
            </button>
          ))
        }
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Link modal */}
      {showLinkModal && <LinkModal onConfirm={handleLinkConfirm} onClose={() => setShowLinkModal(false)} />}
    </>
  );
}

// ─── Link Modal ───────────────────────────────────────────────────────────────

function LinkModal({ onConfirm, onClose }: { onConfirm: (url: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 w-80 flex flex-col gap-3">
        <p className="text-sm font-medium">URL giriziň</p>
        <input
          autoFocus
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm(url);
            if (e.key === "Escape") onClose();
          }}
          placeholder="https://..."
          className="border border-input rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-3 py-1 rounded hover:bg-muted text-muted-foreground">
            Ýatyr
          </button>
          <button
            type="button"
            onClick={() => onConfirm(url)}
            className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Goş
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RichTextEditor ───────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  error?: string;
  onFileAttach?: (file: File) => void;
}

function RichTextEditor({ value, onChange, error, onFileAttach }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        code: {},
        blockquote: {},
        bulletList: {},
        orderedList: {},
        horizontalRule: {},
        hardBreak: {},
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value changes (e.g. tab switch)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div
      className={cn(
        "rounded-md border bg-background overflow-hidden",
        error ? "border-destructive" : "border-input",
        "focus-within:ring-1 focus-within:ring-ring",
      )}
    >
      <RichTextToolbar editor={editor} onFileAttach={onFileAttach} />
      <EditorContent
        editor={editor}
        className="min-h-[120px] px-3 py-2 text-sm text-foreground prose prose-sm dark:prose-invert max-w-none focus:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:cursor-pointer"
      />
      {error && (
        <p className="px-3 pb-2 text-xs text-destructive font-medium flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── AttachedFilesList ────────────────────────────────────────────────────────

interface AttachedFilesListProps {
  files: File[];
  onRemove: (index: number) => void;
}

function AttachedFilesList({ files, onRemove }: AttachedFilesListProps) {
  if (files.length === 0) return null;
  return (
    <div className="mt-2 flex flex-col gap-1">
      {files.map((file, i) => (
        <div key={`${file.name}-${i}`} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1.5">
          <FileText size={12} className="shrink-0 text-primary" />
          <span className="flex-1 truncate">{file.name}</span>
          <span className="shrink-0 text-muted-foreground/60">{(file.size / 1024).toFixed(1)} KB</span>
          <button type="button" onClick={() => onRemove(i)} className="shrink-0 hover:text-destructive transition-colors ml-1">
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── LangTabs ────────────────────────────────────────────────────────────────

interface LangTabsProps {
  active: Locale;
  onChange: (locale: Locale) => void;
}

function LangTabs({ active, onChange }: LangTabsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-end gap-3 mb-2">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            "text-sm transition-colors",
            active === code ? "text-primary font-semibold underline underline-offset-4" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("languages." + code, code === "tk" ? "Türkmen" : code === "ru" ? "Русский" : "English")}
        </button>
      ))}
    </div>
  );
}

// ─── Error helpers ──────────────────────────────────────────────────────────

type LegacyErrorKey = `name_${Locale}` | `desc_${Locale}`;

const RHF_TO_LEGACY_KEY: Record<string, LegacyErrorKey> = {
  nameTk: "name_tk",
  nameRu: "name_ru",
  nameEn: "name_en",
  descTk: "desc_tk",
  descRu: "desc_ru",
  descEn: "desc_en",
};

function flattenErrors(errors: Record<string, { message?: string } | undefined>): Partial<Record<LegacyErrorKey, string>> {
  const result: Partial<Record<LegacyErrorKey, string>> = {};
  for (const [key, err] of Object.entries(errors)) {
    const legacyKey = RHF_TO_LEGACY_KEY[key];
    if (legacyKey && err?.message) {
      result[legacyKey] = err.message;
    }
  }
  return result;
}

// ─── RequiredDocumentForm ─────────────────────────────────────────────────────

export function RequiredDocumentForm({ mode, initialData }: RequiredDocumentFormProps) {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  );
  const navigate = useNavigate();

  // Per-field locale tabs (UI only, not form state)
  const [nameLang, setNameLang] = useState<Locale>("tk");
  const [descLang, setDescLang] = useState<Locale>("tk");

  // ── Attached files — stored as File[] for FormData submission ──────────────
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleFileAttach = useCallback((file: File) => {
    setAttachedFiles((prev) => [...prev, file]);
  }, []);

  const handleFileRemove = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const createMutation = useCreateRequiredDocument();
  const updateMutation = useUpdateRequiredDocument(initialData?.id ?? 0);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const schema = useMemo(() => createRequiredDocumentFormSchema(t), [t, i18n.language]);

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    trigger,
  } = useForm<RequiredDocumentFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors]);

  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) trigger();
  }, [i18n.language]);

  const name: LoanDocumentTranslation = useMemo(
    () => ({ tk: form.nameTk, ru: form.nameRu, en: form.nameEn }),
    [form.nameTk, form.nameRu, form.nameEn],
  );

  const description: LoanDocumentTranslation = useMemo(
    () => ({ tk: form.descTk, ru: form.descRu, en: form.descEn }),
    [form.descTk, form.descRu, form.descEn],
  );

  const setName = useCallback(
    (updater: (prev: LoanDocumentTranslation) => LoanDocumentTranslation) => {
      const current = getValues();
      const prev: LoanDocumentTranslation = {
        tk: current.nameTk,
        ru: current.nameRu,
        en: current.nameEn,
      };
      const next = updater(prev);
      setValue("nameTk", next.tk);
      setValue("nameRu", next.ru);
      setValue("nameEn", next.en);
    },
    [setValue, getValues],
  );

  const setDescription = useCallback(
    (updater: (prev: LoanDocumentTranslation) => LoanDocumentTranslation) => {
      const current = getValues();
      const prev: LoanDocumentTranslation = {
        tk: current.descTk,
        ru: current.descRu,
        en: current.descEn,
      };
      const next = updater(prev);
      setValue("descTk", next.tk);
      setValue("descRu", next.ru);
      setValue("descEn", next.en);
    },
    [setValue, getValues],
  );

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const isValid = await trigger();
    if (!isValid) return;

    const payload = buildPayload(getValues());

    // Build FormData — JSON fields + all attached File objects
    const formData = new FormData();
    formData.append("name[tk]", payload.name.tk);
    formData.append("name[ru]", payload.name.ru);
    formData.append("name[en]", payload.name.en);
    formData.append("description[tk]", payload.description.tk);
    formData.append("description[ru]", payload.description.ru);
    formData.append("description[en]", payload.description.en);
    attachedFiles.forEach((file) => {
      formData.append("files", file, file.name);
    });

    if (mode === "create") {
      await createMutation.mutateAsync(payload);
      navigate("/settings/loan/loan-documents");
    } else {
      await updateMutation.mutateAsync(payload);
      navigate("/settings/loan/loan-documents");
    }
  };

  const submitLabel =
    mode === "create"
      ? t("loanDocuments.form.create", "Karz gerekli resminamalary döretiň")
      : t("loanDocuments.form.update", "Karz gerekli resminamalary täzele");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create"
          ? t("loanDocuments.createTitle", "Karz gerekli resminama dörediň")
          : t("loanDocuments.editTitle", "Karz gerekli resminama üýtgetmek")}
      </h1>
      <form onSubmit={handleSubmit} noValidate>
        <BentoGrid cols={2}>
          <BentoCard span="full">
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              {t("loanDocuments.fields.name", "Ady")}
              <span className="text-destructive ml-0.5">*</span>
            </p>
            <LangTabs active={nameLang} onChange={setNameLang} />
            <FormInput
              type="text"
              value={name[nameLang]}
              onChange={(val) => setName((prev) => ({ ...prev, [nameLang]: val }))}
              placeholder={t("loanDocuments.fields.namePlaceholder", "Ady")}
              error={errors[`name_${nameLang}`]}
            />
            {LOCALES.filter((l) => l !== nameLang && errors[`name_${l}`]).map((code) => (
              <p key={code} className="text-xs text-destructive/70">
                {t("languages." + code, code === "tk" ? "Türkmen" : code === "ru" ? "Русский" : "English")}: {errors[`name_${code}`]}
              </p>
            ))}
          </BentoCard>
          <BentoCard span="full">
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              {t("loanDocuments.fields.description", "Yazgy")}
              <span className="text-destructive ml-0.5">*</span>
            </p>
            <LangTabs active={descLang} onChange={setDescLang} />
            <RichTextEditor
              value={description[descLang]}
              onChange={(val) => setDescription((prev) => ({ ...prev, [descLang]: val }))}
              error={errors[`desc_${descLang}`]}
              onFileAttach={handleFileAttach}
            />
            <AttachedFilesList files={attachedFiles} onRemove={handleFileRemove} />
            {LOCALES.filter((l) => l !== descLang && errors[`desc_${l}`]).map((code) => (
              <p key={code} className="text-xs text-destructive/70">
                {t("languages." + code, code === "tk" ? "Türkmen" : code === "ru" ? "Русский" : "English")}: {errors[`desc_${code}`]}
              </p>
            ))}
          </BentoCard>
        </BentoGrid>

        <FormActions
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/settings/loan/loan-documents")}
          cancelVariant="ghost"
          loadingLabel={t("common.saving", "Saklanylýar...")}
          submitLabel={submitLabel}
          className="mt-4"
        />
      </form>
    </div>
  );
}
