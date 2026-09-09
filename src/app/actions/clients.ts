"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function addPredefinedClient(name: string, type: 'client' | 'sub_client' | 'editor') {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('predefined_clients')
    .insert([{ name: name.trim(), type }])
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/clients")
  return { success: true, data }
}

export async function deletePredefinedClient(id: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('predefined_clients')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/clients")
  return { success: true }
}
