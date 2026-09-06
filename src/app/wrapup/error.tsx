"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-6">
      <section className="theme-card w-full max-w-md rounded-2xl p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Unable to load wrapup</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Something went wrong while loading the wrapup view.</p>
        <Button type="button" className="btn-primary mt-5" onClick={reset}>Try again</Button>
      </section>
    </main>
  )
}
