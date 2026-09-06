"use client"

import * as React from "react"
import { MessageSquare, Bug, Lightbulb, X, Check, Loader2 } from "lucide-react"
import { submitFeedback } from "@/app/actions/feedback"

export function FeedbackModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [type, setType] = React.useState<'Bug report' | 'Feature idea'>('Bug report')
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  
  // Track last used type in local storage
  React.useEffect(() => {
    const savedType = localStorage.getItem("team-aa-feedback-type")
    if (savedType === 'Bug report' || savedType === 'Feature idea') {
      setType(savedType)
    }
  }, [])
  
  const handleTypeChange = (newType: 'Bug report' | 'Feature idea') => {
    setType(newType)
    localStorage.setItem("team-aa-feedback-type", newType)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsSubmitting(true)
    
    const result = await submitFeedback({
      type,
      name: name.trim() || null,
      description: description.trim()
    })

    setIsSubmitting(false)

    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setShowSuccess(false)
        setDescription("")
      }, 1500)
    } else {
      console.error("Error submitting feedback:", result.error)
      alert("Something went wrong. Please try again.")
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 md:left-10 z-40 flex items-center justify-center gap-2 rounded-full bg-white/70 dark:bg-[#18181C]/70 backdrop-blur-md border border-[var(--border-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--text-primary)] shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.5)] transition-all hover:bg-white/90 dark:hover:bg-[#1E1E23]/90 hover:scale-105"
        aria-label="Send Feedback"
      >
        <MessageSquare className="h-5 w-5 text-[var(--theme-accent)]" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#F5EFDD]/85 dark:bg-[#0E0E11]/85 backdrop-blur-2xl p-6 shadow-2xl border border-[var(--border)]">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-[var(--text-faint)] hover:bg-[var(--surface-card-2)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-500 mb-4">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Thanks, got it!</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Send Feedback</h2>
                
                {/* Segmented Toggle */}
                <div className="flex rounded-lg bg-[var(--surface-card-2)] p-1 border border-[var(--border-soft)]">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('Bug report')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-[13px] font-semibold transition-all ${
                      type === 'Bug report' 
                        ? 'bg-white text-black shadow-sm dark:bg-[#2C2C33] dark:text-white' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Bug className="h-4 w-4" />
                    Bug report
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('Feature idea')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-[13px] font-semibold transition-all ${
                      type === 'Feature idea' 
                        ? 'bg-white text-black shadow-sm dark:bg-[#2C2C33] dark:text-white' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Lightbulb className="h-4 w-4" />
                    Feature idea
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={type === 'Bug report' ? "The status dropdown resets after I refresh the page..." : "It'd help if..."}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!description.trim() || isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--text-primary)] py-2.5 text-[14px] font-bold text-[var(--surface-page)] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit {type}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
