import { createSupabaseServerClient } from "@/lib/supabase-server"
import FeedbackPageClient from "./feedback-client"
import { redirect } from "next/navigation"

export const revalidate = 0

export default async function FeedbackPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error loading feedback:", error)
  }

  return <FeedbackPageClient initialFeedbacks={data || []} />
}
