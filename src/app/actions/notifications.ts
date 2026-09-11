"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { Resend } from "resend"

export async function processTaskNotification(taskId: string) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return // Graceful skip if Resend is not configured

  const supabase = await createSupabaseServerClient()

  // 1. Fetch the task
  const { data: task, error: taskError } = await supabase
    .from("video_tasks")
    .select("*")
    .eq("id", taskId)
    .single()

  if (taskError || !task || !task.editor) return

  // 2. Fetch the editor's email
  const { data: editorData } = await supabase
    .from("predefined_clients")
    .select("email")
    .eq("type", "editor")
    .eq("name", task.editor)
    .single()

  const editorEmail = editorData?.email
  if (!editorEmail) return // No email for this editor, graceful skip

  const resend = new Resend(resendApiKey)
  let emailSent = false
  const updates: { notified_editor?: string, notified_urgent?: boolean } = {}

  let emailError: string | undefined;

  // Resolve base URL for links
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // 3. Check for New Assignment
  if (task.notified_editor !== task.editor) {
    try {
      const { error } = await resend.emails.send({
        from: 'Team AA Tracker <onboarding@resend.dev>',
        to: editorEmail,
        subject: `[Team AA] New Task Assigned: ${task.video_title}`,
        text: `You have been assigned to a new task.\n\nVideo: ${task.video_title}\nClient: ${task.client || 'N/A'}${task.sub_client ? ` / ${task.sub_client}` : ''}\nDeadline: ${task.complete_date || 'None set'}\n\nView Tracker: ${baseUrl}`,
      })
      if (error) {
        console.error("Resend API error:", error)
        emailError = "Failed to send assignment email."
      } else {
        updates.notified_editor = task.editor
        updates.notified_urgent = false 
        emailSent = true
      }
    } catch (err) {
      console.error("Exception sending assignment email", err)
      emailError = "Failed to send assignment email."
    }
  }

  // 4. Check for Urgent Status
  const isNewlyUrgent = task.is_urgent && (!task.notified_urgent || updates.notified_urgent === false)
  if (isNewlyUrgent && (task.notified_editor === task.editor || emailSent)) {
    try {
      const { error } = await resend.emails.send({
        from: 'Team AA Tracker <onboarding@resend.dev>',
        to: editorEmail,
        subject: `[URGENT] Team AA Task: ${task.video_title}`,
        text: `A task assigned to you has been marked as URGENT.\n\nVideo: ${task.video_title}\nClient: ${task.client || 'N/A'}\nDeadline: ${task.complete_date || 'None set'}\n\nPlease check the tracker immediately: ${baseUrl}`,
      })
      if (error) {
        console.error("Resend API error:", error)
        emailError = emailError ? "Failed to send both emails." : "Failed to send urgent email."
      } else {
        updates.notified_urgent = true
        emailSent = true
      }
    } catch (err) {
      console.error("Exception sending urgent email", err)
      emailError = emailError ? "Failed to send both emails." : "Failed to send urgent email."
    }
  }

  // 5. Save tracking fields if we sent anything
  if (Object.keys(updates).length > 0) {
    await supabase
      .from("video_tasks")
      .update(updates)
      .eq("id", taskId)
  }

  return { emailError }
}
