import { useRef, useEffect } from "react";
import { type LucideIcon, ChevronRight, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepStatus } from "./stepBar";

export interface StepCardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  status: StepStatus;
}

interface StepBarCardsProps {
  steps: StepCardItem[];
  onGoTo: (index: number) => void;
}

export function StepBarCards({ steps, onGoTo }: StepBarCardsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollX = useRef(0);
  const moved = useRef(false);

  // Auto-scroll active step to center
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const active = wrap.querySelector<HTMLElement>('[aria-current="step"]');
    if (!active) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = active.getBoundingClientRect();
    wrap.scrollTo({
      left: wrap.scrollLeft + (btnRect.left - wrapRect.left) - wrapRect.width / 2 + btnRect.width / 2,
      behavior: "smooth",
    });
  }, [steps]);

  // Mouse drag-to-scroll
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onDown = (e: MouseEvent) => {
      isDragging.current = true;
      moved.current = false;
      startX.current = e.pageX - wrap.offsetLeft;
      scrollX.current = wrap.scrollLeft;
      wrap.style.cursor = "grabbing";
    };

    const onUp = () => {
      isDragging.current = false;
      wrap.style.cursor = "grab";
    };

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const dist = e.pageX - wrap.offsetLeft - startX.current;
      if (Math.abs(dist) > 4) moved.current = true;
      wrap.scrollLeft = scrollX.current - dist;
    };

    // Block click after a real drag so step navigation doesn't fire
    const onClickCapture = (e: MouseEvent) => {
      if (moved.current) {
        e.stopPropagation();
        moved.current = false;
      }
    };

    wrap.addEventListener("mousedown", onDown);
    wrap.addEventListener("mouseup", onUp);
    wrap.addEventListener("mouseleave", onUp);
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("click", onClickCapture, true);

    return () => {
      wrap.removeEventListener("mousedown", onDown);
      wrap.removeEventListener("mouseup", onUp);
      wrap.removeEventListener("mouseleave", onUp);
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{ cursor: "grab" }}
      className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <nav role="tablist" aria-label="Form adımları" className="flex items-center gap-2 w-max">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = step.status === "active";
          const isDone = step.status === "done";
          const isError = step.status === "error";
          const isIdle = step.status === "idle";
          const reachable = !isIdle || (i > 0 && steps[i - 1].status === "done");

          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "step" : undefined}
                disabled={!reachable}
                onClick={() => reachable && onGoTo(i)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  reachable && !isActive && "hover:bg-muted/40 cursor-pointer",
                  isActive && "bg-muted/60",
                )}
              >
                {/* Icon disc */}
                <span
                  className={cn(
                    "relative flex items-center justify-center rounded-full w-11 h-11 shrink-0 transition-all duration-300",
                    isActive &&
                      "bg-[#005f78] text-white ring-4 ring-[#005f78]/15 dark:bg-primary dark:text-primary-foreground dark:ring-primary/15",
                    isDone && "bg-[#005f78]/10 text-[#005f78] dark:bg-muted dark:text-foreground",
                    isError && "bg-destructive/10 text-destructive ring-2 ring-destructive/30",
                    isIdle && "bg-muted text-muted-foreground",
                    reachable && !isActive && "group-hover:scale-105",
                  )}
                >
                  {isDone ? (
                    <Check className="w-5 h-5 animate-scale-in" strokeWidth={2.5} />
                  ) : isError ? (
                    <AlertTriangle className="w-5 h-5 animate-scale-in" />
                  ) : (
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  )}
                </span>

                {/* Texts */}
                <span className="flex flex-col items-start text-left leading-tight">
                  <span
                    className={cn(
                      "text-sm font-semibold tracking-tight",
                      isActive && "text-[#005f78] dark:text-foreground",
                      isDone && "text-[#005f78] dark:text-foreground",
                      !isActive && !isDone && !isError && "text-foreground/90",
                      isError && "text-destructive",
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">{step.subtitle}</span>
                </span>
              </button>

              {/* Chevron separator */}
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 mx-1" aria-hidden />}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
