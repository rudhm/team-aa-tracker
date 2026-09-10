"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const VALID_CLIENT_TYPES = ["client", "sub_client", "editor"] as const
type ClientType = (typeof VALID_CLIENT_TYPES)[number]

function isValidClientType(type: string): type is ClientType {
  return VALID_CLIENT_TYPES.includes(type as ClientType)
}

async function requireAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return supabase
}

export async function addPredefinedClient(name: string, type: 'client' | 'sub_client' | 'editor') {
  const supabase = await requireAuth()

  // Server-side input validation
  if (!isValidClientType(type)) {
    return { success: false, error: "Invalid client type." }
  }
  const trimmedName = name.trim()
  if (!trimmedName) {
    return { success: false, error: "Name cannot be empty." }
  }
  if (trimmedName.length > 200) {
    return { success: false, error: "Name is too long (max 200 characters)." }
  }

  const { data, error } = await supabase
    .from('predefined_clients')
    .insert([{ name: trimmedName, type }])
    .select()

  if (error) {
    // Surface a user-friendly duplicate error
    if (error.code === '23505') {
      return { success: false, error: "This entry already exists." }
    }
    return { success: false, error: "Unable to add entry. Please try again." }
  }

  revalidatePath("/")
  revalidatePath("/clients")
  return { success: true, data }
}

export async function deletePredefinedClient(id: string) {
  const supabase = await requireAuth()

  // Basic ID format validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidPattern.test(id)) {
    return { success: false, error: "Invalid entry ID." }
  }

  const { error } = await supabase
    .from('predefined_clients')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: "Unable to delete entry. Please try again." }
  }

  revalidatePath("/")
  revalidatePath("/clients")
  return { success: true }
}
