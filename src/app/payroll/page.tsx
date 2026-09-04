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
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/20 dark:bg-white/5 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <a href="/" className="group flex items-center gap-3 outline-none">
              {/* Text block */}
              <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-[15px] font-bold tracking-tight text-[#11161B] dark:text-[#E6EAE0]">
                  Team AA Studios
                </span>
                <div className="h-3.5 w-px bg-[#11161B]/20"></div>
                <span className="text-[11px] font-semibold tracking-wider text-[#11161B] dark:text-[#E6EAE0]/40 uppercase">
                  Wrap-up
                </span>
              </div>
            </a>
          </div>
          
          <div className="flex items-center gap-4"><ThemeToggle /><a href="/" className="text-[13px] font-semibold text-[#11161B] dark:text-[#E6EAE0]/50 hover:text-[#11161B] dark:text-[#E6EAE0] dark:text-white/60 dark:hover:text-white transition-colors">← Back to Videos</a></div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8 flex-1">
        <PayrollClient data={data} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/20 py-6 mt-auto bg-transparent">
        <div className="mx-auto max-w-6xl px-6 text-center text-[13px] font-medium text-[#11161B] dark:text-[#E6EAE0]/50 sm:px-8">
          // yeah we defo cooking sth tgt
        </div>
      </footer>
    </div>
  )
}
