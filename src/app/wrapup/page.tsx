import { createSupabaseServerClient } from "@/lib/supabase-server"
import { WrapupClient } from "./wrapup-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthControls } from "@/components/auth-controls"
import { VideoTask } from "@/app/columns"
import { redirect } from "next/navigation"
import Link from "next/link"

export const revalidate = 0

async function getDeliveredData() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('video_tasks')
    .select('*')
    .eq('status', 'Complete')
    .order('complete_date', { ascending: false })

  if (error) {
    console.error("Error fetching wrapup data:", error)
    throw new Error("Unable to load wrapup data")
  }

  return data as VideoTask[]
}

export default async function WrapupPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const data = await getDeliveredData()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-[#181715]/80 dark:bg-black/80 backdrop-blur-md text-white border-b border-[var(--border)]">
        <div className="mx-auto flex h-[56px] max-w-[1920px] items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-[14px]">
            <Link href="/" className="text-[15px] font-semibold text-white no-underline">
              Team <span className="text-[var(--theme-accent)]">AA</span> Studios
            </Link>
            <div className="w-px h-4 bg-[#3a3936] hidden sm:block"></div>
            <div className="text-[#8f8c86] text-[14px] hidden sm:block">WRAP-UP</div>
          </div>
          
          <div className="flex items-center gap-4">
            <AuthControls email={user.email ?? "Signed in"} />
            <div className="flex items-center justify-center [&_button]:!w-[28px] [&_button]:!h-[28px] [&_button]:!bg-[#2c2b28] [&_button]:!rounded-full [&_svg]:!w-3.5 [&_svg]:!h-3.5 [&_svg]:!text-white [&_button]:!border-0">
              <ThemeToggle />
            </div>
            <Link href="/" className="text-[var(--theme-accent)] font-semibold text-[14px] no-underline">
              ← Back to Videos
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1920px] px-6 py-7 sm:px-8 flex-1 w-full">
        <WrapupClient data={data} />
      </main>

    </div>
  )
}
