"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"
import { Bug, Lightbulb, MessageSquare } from "lucide-react"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Feedback = Database['public']['Tables']['feedback']['Row']

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<'All' | 'Bug report' | 'Feature idea'>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeedback() {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) {
        setFeedbacks(data)
      } else {
        console.error("Error loading feedback:", error)
      }
      setLoading(false)
    }

    loadFeedback()
  }, [])

  const filteredFeedbacks = feedbacks.filter(f => filter === 'All' || f.type === filter)

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl p-6 md:p-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-[var(--theme-accent)]" />
              Feedback Inbox
            </h1>
            <p className="mt-2 text-[var(--text-secondary)]">Review bug reports and feature ideas submitted by the team.</p>
          </div>
          
          <div className="flex rounded-lg bg-[var(--surface-card-2)] p-1 border border-[var(--border-soft)] w-full md:w-auto">
            {['All', 'Bug report', 'Feature idea'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`flex-1 md:flex-none px-4 py-1.5 text-[13px] font-semibold transition-all rounded-md ${
                  filter === type 
                    ? 'bg-white text-black shadow-sm dark:bg-[#2C2C33] dark:text-white' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-faint)] font-medium animate-pulse">Loading feedback...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-page)] p-12 text-center text-[var(--text-secondary)]">
            <MessageSquare className="mx-auto h-12 w-12 text-[var(--text-faint)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">No feedback found</h3>
            <p className="text-[14px] mt-1">Nothing matches the "{filter}" filter yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFeedbacks.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-page)] p-5 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-start"
              >
                <div className="flex items-center gap-3 md:w-48 md:shrink-0 md:flex-col md:items-start md:gap-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    item.type === 'Bug report' 
                      ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20' 
                      : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                  }`}>
                    {item.type === 'Bug report' ? <Bug className="h-3 w-3" /> : <Lightbulb className="h-3 w-3" />}
                    {item.type}
                  </span>
                  
                  <div className="text-[12px] font-medium text-[var(--text-secondary)] mt-1">
                    {new Date(item.created_at).toLocaleString(undefined, { 
                      dateStyle: 'medium', 
                      timeStyle: 'short' 
                    })}
                  </div>
                </div>
                
                <div className="flex-1 space-y-1.5">
                  <div className="text-[13px] font-semibold text-[var(--text-primary)]">
                    {item.name || "Anonymous User"}
                  </div>
                  <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--text-secondary)]">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
