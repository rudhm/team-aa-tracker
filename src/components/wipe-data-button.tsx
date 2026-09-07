"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Trash2 } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function WipeDataButton() {
  const [isWiping, setIsWiping] = useState(false)

  const handleWipe = async () => {
    const confirmed = window.confirm("⚠️ ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete ALL video tasks, feedback, and audit logs. This action cannot be undone.")
    if (!confirmed) return

    setIsWiping(true)
    
    try {
      // Delete all data to start from scratch
      await supabase.from("task_audit_logs").delete().not("id", "is", null)
      await supabase.from("feedback").delete().not("id", "is", null)
      await supabase.from("video_tasks").delete().not("id", "is", null)
      
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
      title="Wipe all data from scratch"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isWiping ? "WIPING..." : "WIPE ALL DATA"}
    </button>
  )
}
