import { supabase } from "@/lib/supabase"
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { ThemeToggle } from "@/components/theme-toggle"

export const revalidate = 0 // Disable caching to always fetch the latest data

async function getData() {
  // Fetch data from the video_tasks table
  const { data, error } = await supabase
    .from('video_tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching video tasks:", error)
    return []
  }

  return data
}

export default async function Page() {
  const data = await getData()
  
  const now = new Date();
  const currentMonthStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
  
  const filteredData = data.filter(task => {
    const isCreatedThisMonth = task.created_at && task.created_at >= currentMonthStr;
    const isStartedThisMonth = task.start_date && task.start_date >= currentMonthStr;
    const isCompletedThisMonth = task.complete_date && task.complete_date >= currentMonthStr;
    
    return isCreatedThisMonth || isStartedThisMonth || isCompletedThisMonth;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--surface-header)] text-white">
        <div className="mx-auto flex h-[56px] max-w-[1920px] items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-[14px]">
            <a href="/" className="text-[15px] font-semibold text-white no-underline">
              Team <span className="text-[var(--theme-accent)]">AA</span> Studios
            </a>
            <div className="w-px h-4 bg-[#3a3936] hidden sm:block"></div>
            <div className="text-[#8f8c86] text-[14px] hidden sm:block">DASHBOARD</div>
            <div className="w-px h-4 bg-[#3a3936] hidden sm:block"></div>
            <div className="text-[#d8d5cd] text-[14px] hidden sm:block">
              {filteredData.length} {filteredData.length === 1 ? "video" : "videos"}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center [&_button]:!w-[28px] [&_button]:!h-[28px] [&_button]:!bg-[#2c2b28] [&_button]:!rounded-full [&_svg]:!w-3.5 [&_svg]:!h-3.5 [&_svg]:!text-white [&_button]:!border-0">
              <ThemeToggle />
            </div>
            <a href="/payroll" className="text-[var(--theme-accent)] font-semibold text-[14px] no-underline">
              Wrap-up →
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[1920px] px-6 sm:px-8 py-7 w-full flex-1">
        <DataTable columns={columns} data={filteredData} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border)] py-6 mt-auto">
        <div className="mx-auto max-w-[1920px] px-6 sm:px-8 text-center text-[13px] font-medium text-[var(--text-muted)]">
        </div>
      </footer>
    </div>
  )
}
