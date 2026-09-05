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
      <header className="sticky top-0 z-40 bg-[var(--surface-header)] text-white border-b border-[var(--border)]">
        <div className="mx-auto flex h-[56px] max-w-[1920px] items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-[14px]">
            <a href="/" className="text-[15px] font-semibold text-white no-underline">
              Team <span className="text-[var(--theme-accent)]">AA</span> Studios
            </a>
            <div className="w-px h-4 bg-[#3a3936] hidden sm:block"></div>
            <div className="text-[#8f8c86] text-[14px] hidden sm:block">WRAP-UP</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center [&_button]:!w-[28px] [&_button]:!h-[28px] [&_button]:!bg-[#2c2b28] [&_button]:!rounded-full [&_svg]:!w-3.5 [&_svg]:!h-3.5 [&_svg]:!text-white [&_button]:!border-0">
              <ThemeToggle />
            </div>
            <a href="/" className="text-[var(--theme-accent)] font-semibold text-[14px] no-underline">
              ← Back to Videos
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1920px] px-6 py-7 sm:px-8 flex-1 w-full">
        <PayrollClient data={data} />
      </main>

      <footer className="w-full border-t border-[var(--border)] py-6 mt-auto">
        <div className="mx-auto max-w-[1920px] px-6 sm:px-8 text-center text-[13px] font-medium text-[var(--text-muted)]">
        </div>
      </footer>
    </div>
  )
}
