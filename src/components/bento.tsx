import type { ReactNode } from "react";

interface BentoGridProps {
  cols?: 1 | 2 | 3 | 4;
  children: ReactNode;
}

export function BentoGrid({ cols = 2, children }: BentoGridProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];
  return <div className={`grid ${colClass} gap-4`}>{children}</div>;
}

interface BentoCardProps {
  title?: string;
  span?: "full" | 2 | 3;
  children: ReactNode;
}

export function BentoCard({ title, span, children }: BentoCardProps) {
  const spanClass = span === "full" ? "sm:col-span-full" : span === 2 ? "sm:col-span-2" : span === 3 ? "sm:col-span-3" : "";

  return (
    <div className={`bg-card border border-border rounded-lg p-6 space-y-4 ${spanClass}`}>
      {title && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>}
      {children}
    </div>
  );
}
