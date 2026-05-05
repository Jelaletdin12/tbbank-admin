import { useState, useRef, useEffect } from 'react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { Check, ChevronsUpDown, Search, X, Eye, EyeOff, Upload, Hash } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, parse, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

// ─── Collapsible aliases ──────────────────────────────────────────────────────

const Collapsible        = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.Trigger
const CollapsibleContent = CollapsiblePrimitive.Content

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormInputType =
  | 'text'
  | 'number'
  | 'phone'
  | 'email'
  | 'password'
  | 'date'
  | 'select'
  | 'searchable-select'
  | 'file'
  | 'textarea'

export interface SelectOption {
  value: string
  label: string
}

export interface FormInputProps {
  type?:         FormInputType
  label?:        string
  value?:        string
  onChange?:     (value: string) => void
  placeholder?:  string
  error?:        string
  required?:     boolean
  disabled?:     boolean
  options?:      SelectOption[]
  accept?:       string
  onFileChange?: (file: File | null) => void
  fileValue?:    File | null
  className?:    string
  phonePrefix?:  string
  rows?:         number
  name?:         string
  readOnly?:     boolean
}

// ─── FieldLabel ───────────────────────────────────────────────────────────────

function FieldLabel({ label, required }: { label?: string; required?: boolean }) {
  if (!label) return null
  return (
    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 select-none">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  )
}

// ─── ErrorMsg ─────────────────────────────────────────────────────────────────

function ErrorMsg({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="mt-1.5 text-xs text-destructive font-medium flex items-center gap-1.5">
      <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
      {error}
    </p>
  )
}

// ─── error border helper ──────────────────────────────────────────────────────

const withError = (error?: string) =>
  error ? 'border-destructive focus-visible:ring-destructive/30' : ''

// ─── TextInput ────────────────────────────────────────────────────────────────

function TextInput({
  type = 'text',
  value = '',
  onChange,
  placeholder,
  error,
  disabled,
  required,
  label,
  className,
  name,
  readOnly,
  rows = 3,
}: FormInputProps) {
  const [showPass, setShowPass] = useState(false)

  const isPassword = type === 'password'
  const isTextarea = type === 'textarea'
  const isNumber   = type === 'number'

  return (
    <div className={className}>
      <FieldLabel label={label} required={required} />

      <div className="relative">
        {isTextarea ? (
          <Textarea
            name={name}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            className={cn('resize-none', withError(error))}
          />
        ) : (
          <Input
            name={name}
            type={
              isPassword ? (showPass ? 'text' : 'password')
              : isNumber  ? 'number'
              : type === 'email' ? 'email'
              : 'text'
            }
            min={isNumber ? 0 : undefined}
            value={value}
            onChange={(e) => {
              if (isNumber) {
                const num = e.target.value
                if (num === '' || Number(num) >= 0) onChange?.(num)
              } else {
                onChange?.(e.target.value)
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              isPassword && 'pr-10',
              isNumber   && 'pr-10',
              withError(error),
            )}
          />
        )}

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}

        {isNumber && (
          <Hash
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        )}
      </div>

      <ErrorMsg error={error} />
    </div>
  )
}

// ─── PhoneInput ───────────────────────────────────────────────────────────────

function PhoneInput({
  value = '',
  onChange,
  placeholder = '61 097 651',
  error,
  disabled,
  required,
  label,
  className,
  phonePrefix = '+993',
}: FormInputProps) {
  return (
    <div className={className}>
      <FieldLabel label={label} required={required} />

      <div
        className={cn(
          'flex h-8 w-full rounded-md border bg-background overflow-hidden',
          'ring-offset-background transition-colors duration-150',
          'focus-within:outline-none focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0',
          error    ? 'border-destructive focus-within:ring-destructive/30' : 'border-input',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <div className="flex items-center px-3 bg-muted/50 border-r border-input text-sm font-medium text-muted-foreground shrink-0 select-none">
          {phonePrefix}
        </div>
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange?.(e.target.value.replace(/[^\d\s-]/g, ''))}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 h-full px-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      <ErrorMsg error={error} />
    </div>
  )
}

// ─── DateInput (shadcn Popover + Calendar) ───────────────────────────────────

function DateInput({
  value = '',
  onChange,
  error,
  disabled,
  required,
  label,
  className,
  placeholder = 'Sene saýlaň',
}: FormInputProps) {
  const [open, setOpen] = useState(false)

  // value is stored as 'yyyy-MM-dd' string
  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  const handleSelect = (day: Date | undefined) => {
    onChange?.(day ? format(day, 'yyyy-MM-dd') : '')
    setOpen(false)
  }

  return (
    <div className={className}>
      <FieldLabel label={label} required={required} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-8 w-full items-center justify-between rounded-md border bg-background px-3 py-2',
              'text-sm ring-offset-background transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-destructive' : 'border-input',
              !selected && 'text-muted-foreground/60',
            )}
          >
            <span>{selected ? format(selected, 'dd.MM.yyyy') : placeholder}</span>
            <CalendarIcon size={15} className="text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            initialFocus
            captionLayout="dropdown"
            fromYear={1940}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>

      <ErrorMsg error={error} />
    </div>
  )
}

// ─── SelectInput ──────────────────────────────────────────────────────────────

// ─── SelectInput ──────────────────────────────────────────────────────────────
// Artık Collapsible tabanlı — SearchableSelect ile aynı mekanizma

function SelectInput({
  value = '',
  onChange,
  options = [],
  placeholder = '—',
  error,
  disabled,
  required,
  label,
  className,
}: FormInputProps) {
  const [open, setOpen] = useState(false)

  const selected = options.find((o) => o.value === value)

  const handleSelect = (val: string) => {
    onChange?.(val)
    setOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <FieldLabel label={label} required={required} />

      <Collapsible
        open={open}
        onOpenChange={(next) => {
          if (!disabled) setOpen(next)
        }}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-8 w-full items-center justify-between rounded-md border bg-background px-3 py-2',
              'text-sm ring-offset-background transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-destructive' : 'border-input',
              open && !error && 'ring-2 ring-ring ring-offset-0 border-transparent',
            )}
          >
            <span className={cn('truncate text-left', !selected && 'text-muted-foreground/60')}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronsUpDown
              size={14}
              className={cn(
                'text-muted-foreground transition-transform duration-200 shrink-0',
                open && 'text-foreground',
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-1 rounded-md border border-border bg-card shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value) }}
                  className={cn(
                    'flex items-center justify-between w-full text-left px-3 py-2 text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'text-primary font-medium bg-primary/10',
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={13} className="text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <ErrorMsg error={error} />
    </div>
  )
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────
// Uses Radix Collapsible — no portal, no z-index issues, natural document flow.
// onMouseDown (not onClick) on options prevents the trigger's onBlur from
// firing before the selection is registered.

function SearchableSelect({
  value = '',
  onChange,
  options = [],
  placeholder = 'Saýlamak üçin basyň',
  error,
  disabled,
  required,
  label,
  className,
}: FormInputProps) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const searchRef         = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const openDropdown = () => {
    setOpen(true)
    // Focus search after Collapsible animation frame
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const closeDropdown = () => {
    setOpen(false)
    setQuery('')
  }

  const handleSelect = (val: string) => {
    onChange?.(val)
    closeDropdown()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange?.('')
  }

  return (
    <div className={cn('relative', className)}>
      <FieldLabel label={label} required={required} />

      <Collapsible open={open} onOpenChange={(next) => { if (!disabled) { if (next) { openDropdown() } else { closeDropdown() } } }}>
        {/* Trigger */}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-8 w-full items-center justify-between rounded-md border bg-background px-3 py-2',
              'text-sm ring-offset-background transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-destructive' : 'border-input',
              open && !error && 'ring-2 ring-ring ring-offset-0 border-transparent',
            )}
          >
            <span className={cn('truncate text-left', !selected && 'text-muted-foreground/60')}>
              {selected ? selected.label : placeholder}
            </span>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              {selected && !disabled && (
                <span
                  role="button"
                  tabIndex={-1}
                  onMouseDown={handleClear}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={12} />
                </span>
              )}
              <ChevronsUpDown
                size={14}
                className={cn(
                  'text-muted-foreground transition-transform duration-200 shrink-0',
                  open && 'text-foreground',
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Panel */}
        <CollapsibleContent className="mt-1 rounded-md border border-border bg-card shadow-lg overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20">
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Gözle..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                Netije tapylmady
              </p>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value) }}
                    className={cn(
                      'flex items-center justify-between w-full text-left px-3 py-2 text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'text-primary font-medium bg-primary/10',
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={13} className="text-primary shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <ErrorMsg error={error} />
    </div>
  )
}

// ─── FileInput ────────────────────────────────────────────────────────────────

// ─── FileInput ────────────────────────────────────────────────────────────────

function FileInput({
  label,
  required,
  error,
  disabled,
  accept = 'image/*',
  onFileChange,
  fileValue,
  className,
  placeholder = 'Faýl saýlaň ýa-da salmak üçin basyň',
}: FormInputProps) {
  const inputRef                = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview]   = useState<string | null>(null)

  // fileValue prop'u değişince preview'i güncelle + memory leak önle
  useEffect(() => {
    if (fileValue?.type.startsWith('image/')) {
      const url = URL.createObjectURL(fileValue)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreview(null)
  }, [fileValue])

  // handleFile sadece onFileChange'i çağırıyor — preview useEffect hallediyor
  const handleFile = (file: File | null) => {
    onFileChange?.(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  const isImage = fileValue?.type.startsWith('image/')

  return (
    <div className={className}>
      <FieldLabel label={label} required={required} />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'min-h-[88px] rounded-md border-2 border-dashed cursor-pointer select-none',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2',
          dragOver         && 'border-primary bg-primary/5 scale-[1.01]',
          error            ? 'border-destructive/60' : 'border-border',
          !dragOver && !error && 'hover:border-primary/50 hover:bg-muted/20',
          disabled         && 'opacity-50 cursor-not-allowed pointer-events-none',
          fileValue && isImage && '!border-solid !border-border overflow-hidden',
        )}
      >
        {fileValue && isImage && preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="w-full max-h-56 object-contain bg-muted/30 p-2"
            />
            <div className="w-full flex items-center justify-between px-3 py-2 bg-muted/40 border-t border-border">
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {fileValue.name}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); handleFile(null) }}
                className="h-6 w-6 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X size={13} />
              </Button>
            </div>
          </>
        ) : fileValue ? (
          <div className="flex flex-col items-center gap-1.5 p-4">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Upload size={14} className="text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground text-center truncate max-w-[180px]">
              {fileValue.name}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleFile(null) }}
              className="text-xs text-destructive hover:text-destructive/80 transition-colors"
            >
              Aýyr
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-4">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
              <Upload size={14} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {placeholder}
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      <ErrorMsg error={error} />
    </div>
  )
}

// ─── FormInput (router) ───────────────────────────────────────────────────────

export function FormInput(props: FormInputProps) {
  const { type = 'text' } = props

  if (type === 'phone')             return <PhoneInput       {...props} />
  if (type === 'date')              return <DateInput         {...props} />
  if (type === 'select')            return <SelectInput       {...props} />
  if (type === 'searchable-select') return <SearchableSelect  {...props} />
  if (type === 'file')              return <FileInput         {...props} />
  if (type === 'textarea')          return <TextInput         {...props} type="textarea" />
  return                                   <TextInput         {...props} />
}