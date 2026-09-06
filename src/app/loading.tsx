import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-page)]">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading videos…
      </div>
    </main>
  )
}
