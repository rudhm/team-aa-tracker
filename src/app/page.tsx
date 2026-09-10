import { createSupabaseServerClient } from "@/lib/supabase-server"
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthControls } from "@/components/auth-controls"
import { redirect } from "next/navigation"
import Link from "next/link"

export const revalidate = 0 // Disable caching to always fetch the latest data

async function getData() {
  const supabase = await createSupabaseServerClient()
  // Fetch data from the video_tasks table
  const { data, error } = await supabase
    .from('video_tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching video tasks:", error)
    throw new Error("Unable to load video tasks")
  }

  return data
}

export default async function Page() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const data = await getData()
  
  // Fetch predefined clients
  const { data: predefinedClientsData } = await supabase.from('predefined_clients').select('*')
  const predefinedClients = predefinedClientsData || []
  
  // Get current date in IST (Asia/Kolkata)
  const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const now = new Date(nowStr);
  
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
  
  const filteredData = data.filter(task => {
    if (task.status === 'Complete') {
      // Strictly completed within the current month
      return task.complete_date && task.complete_date >= currentMonthStr && task.complete_date < nextMonthStr;
    } else {
      // Incomplete tasks: show if started this month or have no start date
      return !task.start_date || (task.start_date >= currentMonthStr && task.start_date < nextMonthStr);
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#181715]/80 dark:bg-black/80 backdrop-blur-md text-white border-b border-[var(--border)]">
        <div className="mx-auto flex h-[56px] max-w-[1920px] items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-[14px]">
            <Link href="/" className="text-[15px] font-semibold text-white no-underline">
              Team <span className="text-[var(--theme-accent)]">AA</span> Studios
            </Link>
            <div className="w-px h-4 bg-[#3a3936] hidden sm:block"></div>
            <div className="text-[#8f8c86] text-[14px] hidden sm:block">DASHBOARD</div>
            <div className="w-px h-4 bg-[#3a3936] hidden sm:block"></div>
            <div className="text-[#d8d5cd] text-[14px] hidden sm:block">
              {filteredData.length} {filteredData.length === 1 ? "video" : "videos"}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AuthControls email={user.email ?? "Signed in"} />
            <div className="flex items-center justify-center [&_button]:!w-[28px] [&_button]:!h-[28px] [&_button]:!bg-[#2c2b28] [&_button]:!rounded-full [&_svg]:!w-3.5 [&_svg]:!h-3.5 [&_svg]:!text-white [&_button]:!border-0">
              <ThemeToggle />
            </div>
            <Link href="/clients" className="text-[var(--theme-accent)] font-semibold text-[14px] no-underline">
              Manage
            </Link>
            <Link href="/wrapup" className="text-[var(--theme-accent)] font-semibold text-[14px] no-underline">
              Wrap-up →
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[1920px] px-6 sm:px-8 py-7 w-full flex-1">
        <DataTable columns={columns} data={filteredData} predefinedClients={predefinedClients} />
      </main>

    </div>
  )
}
