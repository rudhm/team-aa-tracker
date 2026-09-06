"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function AuthControls({ email }: { email: string }) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const handleSignOut = async () => {
    setErrorMessage("")
    setIsSigningOut(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      setErrorMessage("Unable to sign out. Please try again.")
      setIsSigningOut(false)
      return
    }

    router.replace("/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {errorMessage && <span role="alert" className="text-xs text-red-300">{errorMessage}</span>}
      <span className="hidden max-w-[180px] truncate text-[12px] text-[#d8d5cd] sm:block" title={email}>
        {email}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Sign out"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="text-[#d8d5cd] hover:bg-white/10 hover:text-white"
      >
        {isSigningOut ? <Loader2 className="animate-spin" /> : <LogOut />}
      </Button>
    </div>
  )
}
