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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 theme-header backdrop-blur-xl bg-[var(--surface-header)]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <a href="/" className="group flex items-center gap-3 outline-none">
              {/* Text block */}
              <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="badge-accent">AA</span>
                <span className="text-[15px] font-bold tracking-tight text-[var(--text-on-header)]">
                  Team AA Studios
                </span>
                <div className="h-3.5 w-px bg-[var(--border)]"></div>
                <span className="text-[11px] font-semibold tracking-wider subtle uppercase">
                  Dashboard
                </span>
              </div>
            </a>
            <div className="ml-2 border-l border-[var(--border)] pl-4 animate-in fade-in duration-500 hidden sm:block">
              <p className="text-[12px] font-semibold subtle whitespace-nowrap">
                {data.length} {data.length === 1 ? "video" : "videos"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a href="/payroll" className="theme-link text-[13px] font-semibold">
              Wrap-up →
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8 flex-1">
        <DataTable columns={columns} data={data} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border)] py-6 mt-auto">
        <div className="mx-auto max-w-6xl px-6 text-center text-[13px] font-medium text-[var(--text-muted)] sm:px-8">
        </div>
      </footer>
    </div>
  )
}
