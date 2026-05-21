import { Loader2 } from 'lucide-react'

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-muted-foreground" size={32} />
    </div>
  )
}
