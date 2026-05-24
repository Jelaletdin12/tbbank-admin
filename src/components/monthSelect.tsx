import { Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

// ─── Month data ───────────────────────────────────────────────────────────────

export const MONTHS = [
  { value: '01', label: 'Ýanwar' },
  { value: '02', label: 'Fewral' },
  { value: '03', label: 'Mart' },
  { value: '04', label: 'Aprel' },
  { value: '05', label: 'Maý' },
  { value: '06', label: 'Iýun' },
  { value: '07', label: 'Iýul' },
  { value: '08', label: 'Awgust' },
  { value: '09', label: 'Sentýabr' },
  { value: '10', label: 'Oktýabr' },
  { value: '11', label: 'Noýabr' },
  { value: '12', label: 'Dekabr' },
]

// ─── MonthSelect ──────────────────────────────────────────────────────────────

interface MonthSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MonthSelect({
  value,
  onChange,
}: MonthSelectProps) {
  const isActive = Boolean(value)

  return (
    <div className="flex items-center gap-1">
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            'h-9 w-[135px] gap-1.5 text-sm cursor-pointer transition-colors',
            isActive
              ? 'border-primary text-primary font-medium [&>svg:last-child]:text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Calendar size={14} className="shrink-0 opacity-80" />
          <span className="flex-1 text-left truncate">
            {isActive ? MONTHS.find(m => m.value === value)?.label : "—"}
          </span>
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className='p-1'>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isActive && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Aý filtri aýyr"
        >
          <X size={11} />
        </button>
      )}
    </div>
  )
}
