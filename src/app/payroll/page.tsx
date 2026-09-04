import { supabase } from "@/lib/supabase"
import { PayrollClient } from "./payroll-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { VideoTask } from "@/app/columns"

export const revalidate = 0

async function getDeliveredData() {
  const { data, error } = await supabase
    .from('video_tasks')
    .select('*')
    .eq('status', 'Complete')
    .order('complete_date', { ascending: false })

  if (error) {
    console.error("Error fetching payroll data:", error)
    return []
  }

  return data as VideoTask[]
}

export default async function PayrollPage() {
  const data = await getDeliveredData()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 theme-header backdrop-blur-xl bg-[var(--surface-header)]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <a href="/" className="group flex items-center gap-3 outline-none">
              <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-[15px] font-bold tracking-tight text-[var(--text-on-header)]">
                  Team AA Studios
                </span>
                <div className="h-3.5 w-px bg-[var(--border)]"></div>
                <span className="text-[11px] font-semibold tracking-wider subtle uppercase">
                  Wrap-up
                </span>
              </div>
            </a>
          </div>
          
          <div className="flex items-center gap-4"><ThemeToggle /><a href="/" className="theme-link text-[13px] font-semibold">← Back to Videos</a></div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8 flex-1">
        <PayrollClient data={data} />
      </main>

      <footer className="w-full border-t border-[var(--border)] py-6 mt-auto">
        <div className="mx-auto max-w-6xl px-6 text-center text-[13px] font-medium text-[var(--text-muted)] sm:px-8">
        </div>
      </footer>
    </div>
  )
}
