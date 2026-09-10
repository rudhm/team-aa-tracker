import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import ClientsPageClient from "./clients-client"

export const revalidate = 0

export default async function ClientsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from('predefined_clients')
    .select('*')
    .order('name')

  return <ClientsPageClient initialEntries={data || []} />
}
