"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      console.error("Error signing in:", error)
      setErrorMessage("Unable to sign in with those credentials.")
      setIsSubmitting(false)
      return
    }

    router.replace("/")
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-6 py-12">
      <section className="theme-card w-full max-w-md rounded-2xl p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">
            Team <span className="text-[var(--theme-accent-hover)]">AA</span> Studios
          </p>
          <h1 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">Sign in</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Use your invited team account to access the video tracker.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-semibold text-[var(--text-primary)]">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-sm font-semibold text-[var(--text-primary)]">
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {errorMessage && (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-300">
              {errorMessage}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting} className="btn-primary h-10 w-full">
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </section>
    </main>
  )
}
