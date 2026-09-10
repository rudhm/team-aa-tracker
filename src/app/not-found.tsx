import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-6">
      <section className="theme-card w-full max-w-md rounded-2xl p-8 text-center shadow-sm">
        <p className="text-6xl font-bold text-[var(--theme-accent)] mb-2">404</p>
        <h1 className="text-lg font-bold text-[var(--text-primary)] mt-4">Page not found</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center justify-center mt-6 px-6 py-2 rounded-lg text-sm font-bold"
        >
          Back to Dashboard
        </Link>
      </section>
    </main>
  )
}
