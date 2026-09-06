import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

function getRequiredEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  value: string | undefined
) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    throw new Error(
      `Missing ${name}. Add it to your environment before starting or building the application.`
    )
  }

  return trimmedValue
}

const supabaseUrl = getRequiredEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
)
const supabaseKey = getRequiredEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey)
