"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { Resend } from "resend"

const VALID_FEEDBACK_TYPES = ["Bug report", "Feature idea"] as const
type FeedbackType = (typeof VALID_FEEDBACK_TYPES)[number]

function isValidFeedbackType(type: string): type is FeedbackType {
  return VALID_FEEDBACK_TYPES.includes(type as FeedbackType)
}

export async function submitFeedback(data: { type: string, name: string | null, description: string }) {
  const resendApiKey = process.env.RESEND_API_KEY
  const notifyEmail = process.env.FEEDBACK_NOTIFY_EMAIL

  // Server-side input validation
  if (!isValidFeedbackType(data.type)) {
    return { success: false, error: "Invalid feedback type." }
  }
  const description = data.description.trim()
  if (!description) {
    return { success: false, error: "Description is required." }
  }
  if (description.length > 5000) {
    return { success: false, error: "Description is too long (max 5000 characters)." }
  }
  const name = data.name?.trim().substring(0, 200) || null

  const supabase = await createSupabaseServerClient()
  
  // 1. Save to Supabase
  const { error } = await supabase.from('feedback').insert({
    type: data.type,
    name,
    description,
  })

  if (error) {
    console.error("Database error:", error)
    return { success: false, error: "Unable to save feedback. Please try again." }
  }

  // 2. Send Email if Resend is configured
  if (resendApiKey && notifyEmail) {
    try {
      const resend = new Resend(resendApiKey)
      await resend.emails.send({
        from: 'Team AA Tracker <onboarding@resend.dev>',
        to: notifyEmail,
        subject: `[Team AA] New ${data.type}: ${name || 'Anonymous'}`,
        text: `You have received a new ${data.type.toLowerCase()}.\n\nName: ${name || 'Anonymous'}\nDescription:\n${description}\n\nSubmitted at: ${new Date().toLocaleString()}`,
      })
    } catch (err) {
      console.error("Failed to send email notification", err)
      // We don't fail the feedback submission if the email fails
    }
  } else {
    console.warn("Feedback saved, but no email sent. Configure RESEND_API_KEY and FEEDBACK_NOTIFY_EMAIL to enable emails.")
  }

  return { success: true }
}
