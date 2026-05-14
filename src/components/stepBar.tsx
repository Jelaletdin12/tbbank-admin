
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export type StepStatus = 'idle' | 'active' | 'done' | 'error'

export interface StepBarItem {
  id: string
  label: string
  status: StepStatus
}

interface StepBarProps {
  steps: StepBarItem[]
  onGoTo: (index: number) => void
  showLabels?: boolean
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function DotIcon({ status, index }: { status: StepStatus; index: number }) {
  if (status === 'done')
    return <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden />
  if (status === 'error')
    return <AlertTriangle className="w-3 h-3" aria-hidden />
  return (
    <span className="text-[11px] font-bold tabular-nums leading-none">
      {index + 1}
    </span>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StepBar({ steps, onGoTo, showLabels }: StepBarProps) {
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([])
  const total = steps.length
  const activeIdx = steps.findIndex((s) => s.status === 'active')

  const fillPct = total > 1 ? (Math.max(0, activeIdx) / (total - 1)) * 100 : 0

  useEffect(() => {
    btnRefs.current[activeIdx]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [activeIdx])

  const isReachable = (i: number) => {
    const s = steps[i].status
    if (s === 'done' || s === 'active' || s === 'error') return true
    return i > 0 && steps[i - 1].status === 'done'
  }

  const handleKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = i
    if (e.key === 'ArrowRight') next = Math.min(total - 1, i + 1)
    else if (e.key === 'ArrowLeft') next = Math.max(0, i - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = total - 1
    else return
    e.preventDefault()
    const dir = next > i ? 1 : -1
    while (next !== i && !isReachable(next)) {
      next += dir
      if (next < 0 || next >= total) return
    }
    btnRefs.current[next]?.focus()
  }

  return (
    <nav
      role="tablist"
      aria-label="Form steps"
      className="relative w-full"
    >
      {/*
       * Track layer — z-index: 1 so it sits BELOW the dots (z-index: 2).
       * top: 32px = paddingTop(16px) + dotSize(32px)/2
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: 32,
          left: `calc(${(0.5 / total) * 100}%)`,
          right: `calc(${(0.5 / total) * 100}%)`,
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
      >
        <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-border">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{
              width: `${fillPct}%`,
              transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'width',
            }}
          />
        </div>
      </div>

      {/* Steps row — z-index: 2, establishes stacking context above track */}
      <div className="relative flex w-full" style={{ zIndex: 2 }}>
        {steps.map((step, i) => {
          const isActive = step.status === 'active'
          const isDone   = step.status === 'done'
          const isError  = step.status === 'error'
          const isIdle   = step.status === 'idle'
          const reachable = isReachable(i)
          const displayLabel = showLabels ?? true

          return (
            <button
              key={step.id}
              ref={(el) => { btnRefs.current[i] = el }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`${step.label}${isError ? ' — hata' : ''} (${i + 1} / ${total})`}
              onClick={() => reachable && onGoTo(i)}
              onKeyDown={(e) => handleKey(e, i)}
              disabled={!reachable}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                'group flex flex-1 flex-col items-center',
                'pt-4 pb-3 gap-2',
                'select-none outline-none rounded-xl',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                reachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
              )}
            >
              {/*
               * Dot wrapper — position: relative + z-index: 2
               * This creates a stacking context that sits above the track (z:1).
               * Fixed 32×32 for ALL states so track top:32px never shifts.
               */}
              <span
                className="relative flex h-8 w-8 items-center justify-center"
                style={{ zIndex: 2 }}
              >
                {/* Active pulse ring */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                    aria-hidden
                    style={{ animationDuration: '2s' }}
                  />
                )}

                <span
                  className={cn(
                    'relative flex h-7 w-7 items-center justify-center rounded-full border',
                    'transition-[transform,box-shadow,background-color,border-color] duration-300',

                    // Active — opaque bg
                    isActive && [
                      'scale-[1.14]',
                      'bg-primary border-transparent text-primary-foreground',
                      'shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]',
                    ],

                    // Done — opaque bg (track cannot bleed through)
                    isDone && !isActive && [
                      'bg-emerald-50 border-emerald-400 text-emerald-700',
                      'dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-300',
                    ],

                    // Error — opaque bg, was /50 (semi-transparent) which caused bleed
                    isError && !isActive && [
                      'bg-background border-destructive/60 text-destructive',
                    ],

                    // Idle — bg-background is always opaque
                    isIdle && [
                      'bg-background border-border text-muted-foreground',
                    ],

                    !isActive && reachable && 'group-hover:scale-110 group-hover:shadow-sm',
                  )}
                >
                  <DotIcon status={step.status} index={i} />
                </span>
              </span>

              {/* Label */}
              {displayLabel && (
                <span
                  className={cn(
                    'max-w-full truncate px-0.5 text-center text-[11px] leading-snug tracking-tight',
                    'transition-colors duration-200',
                    total > 4 && 'hidden sm:block',
                    isActive && 'font-semibold text-foreground',
                    isDone  && !isActive && 'text-muted-foreground',
                    isError && !isActive && 'font-medium text-destructive',
                    isIdle  && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}