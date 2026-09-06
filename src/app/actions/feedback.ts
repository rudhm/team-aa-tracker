"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { Resend } from "resend"

export async function submitFeedback(data: { type: string, name: string | null, description: string }) {
  const resendApiKey = process.env.RESEND_API_KEY
  const notifyEmail = process.env.FEEDBACK_NOTIFY_EMAIL

  const supabase = await createSupabaseServerClient()
  
  // 1. Save to Supabase
  const { error } = await supabase.from('feedback').insert({
    type: data.type,
    name: data.name,
    description: data.description
  })

  if (error) {
    console.error("Database error:", error)
    return { success: false, error: error.message }
  }

  // 2. Send Email if Resend is configured
  if (resendApiKey && notifyEmail) {
    try {
      const resend = new Resend(resendApiKey)
      await resend.emails.send({
        from: 'Team AA Tracker <onboarding@resend.dev>',
        to: notifyEmail,
        subject: `[Team AA] New ${data.type}: ${data.name || 'Anonymous'}`,
        text: `You have received a new ${data.type.toLowerCase()}.\n\nName: ${data.name || 'Anonymous'}\nDescription:\n${data.description}\n\nSubmitted at: ${new Date().toLocaleString()}`,
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
