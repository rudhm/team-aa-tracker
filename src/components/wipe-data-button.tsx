"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Trash2 } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function WipeDataButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isWiping, setIsWiping] = useState(false)

  useEffect(() => {
    // Only show if it hasn't been used yet
    if (!localStorage.getItem("team-aa-data-wiped")) {
      setIsVisible(true)
    }
  }, [])

  if (!isVisible) return null

  const handleWipe = async () => {
    const confirmed = window.confirm("⚠️ ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete all unlocked video tasks and all feedback data. This action cannot be undone.")
    if (!confirmed) return

    setIsWiping(true)
    
    try {
      // Delete all unlocked video tasks
      await supabase.from("video_tasks").delete().eq("payroll_locked", false)
      
      // We don't have delete policies on feedback, but we can try (or just ignore it).
      // Assuming they mostly mean the video tasks dummy data.
      
      localStorage.setItem("team-aa-data-wiped", "true")
      setIsVisible(false)
      window.location.reload()
    } catch (err) {
      console.error("Failed to wipe data:", err)
      alert("Something went wrong while wiping data.")
      setIsWiping(false)
    }
  }

  return (
    <button
      onClick={handleWipe}
      disabled={isWiping}
      className="flex items-center justify-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-md transition-all hover:bg-red-700 disabled:opacity-50"
      title="One-time data wipe"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isWiping ? "WIPING..." : "WIPE DATA"}
    </button>
  )
}
