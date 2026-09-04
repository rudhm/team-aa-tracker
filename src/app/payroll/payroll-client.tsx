"use client"

import * as React from "react"
import { VideoTask } from "@/app/columns"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Lock, Loader2 } from "lucide-react"
import { formatName } from "@/lib/utils"

export function PayrollClient({ data }: { data: VideoTask[] }) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [isLocking, setIsLocking] = React.useState(false)

  // Group data by YYYY-MM
  const months = React.useMemo(() => {
    const map = new Map<string, VideoTask[]>()
    data.forEach(task => {
      if (!task.complete_date) return
      const date = new Date(task.complete_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // e.g. 2026-09
      
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(task)
    })
    
    // Sort descending
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [data])

  React.useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0][0])
    }
  }, [months, selectedMonth])

  const currentMonthData = React.useMemo(() => {
    return months.find(m => m[0] === selectedMonth)?.[1] || []
  }, [months, selectedMonth])

  // Group current month data by Editor
  const editorGroups = React.useMemo(() => {
    const map = new Map<string, VideoTask[]>()
    currentMonthData.forEach(task => {
      const ed = formatName(task.editor) || "Unassigned"
      if (!map.has(ed)) map.set(ed, [])
      map.get(ed)!.push(task)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [currentMonthData])

  const isMonthLocked = currentMonthData.length > 0 && currentMonthData.every(t => t.payroll_locked)

  const handleLockMonth = async () => {
    if (currentMonthData.length === 0) return
    setIsLocking(true)
    
    const ids = currentMonthData.map(t => t.id)
    await supabase.from('video_tasks').update({ payroll_locked: true }).in('id', ids)
    
    setIsLocking(false)
    router.refresh()
  }

  const exportCSV = () => {
    if (currentMonthData.length === 0) return

    const headers = ["Editor", "Client", "Video Title", "Completed At"]
    const rows = currentMonthData.map(t => [
      t.editor, 
      t.client, 
      t.video_title, 
      t.complete_date ? new Date(t.complete_date).toISOString() : ""
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Payroll_${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Format YYYY-MM to readable month (e.g., September 2026)
  const formatMonth = (yyyyMm: string) => {
    const [y, m] = yyyyMm.split('-')
    const date = new Date(parseInt(y), parseInt(m) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <select 
          className="h-11 w-full sm:w-auto appearance-none rounded-full border-none bg-white/50 dark:bg-black/40 backdrop-blur-md pl-5 pr-12 text-[14px] font-bold text-[#11161B] dark:text-[#E6EAE0] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {months.length === 0 && <option value="">No data</option>}
          {months.map(([monthKey]) => (
            <option key={monthKey} value={monthKey}>{formatMonth(monthKey)}</option>
          ))}
        </select>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button 
            onClick={exportCSV}
            variant="outline"
            className="h-11 w-full sm:w-auto rounded-full border-white/20 bg-white/40 dark:bg-black/30 backdrop-blur-md px-5 text-[13px] font-semibold text-[#11161B] dark:text-[#E6EAE0] shadow-sm hover:bg-white/60 dark:bg-black/50"
          >
            <Download className="mr-2 h-4 w-4 text-[#11161B] dark:text-[#E6EAE0]/50" />
            Export CSV
          </Button>

          {/* Only show lock controls between the 1st and 5th of the month */}
          {new Date().getDate() >= 1 && new Date().getDate() <= 5 && (
            isMonthLocked ? (
              <span className="inline-flex h-11 w-full sm:w-auto justify-center items-center rounded-full border border-emerald-200 bg-[#E2F8EB] px-5 text-[13px] font-semibold text-emerald-700">
                <Lock className="mr-2 h-4 w-4" /> Locked
              </span>
            ) : (
              <Button 
                onClick={handleLockMonth}
                disabled={isLocking || currentMonthData.length === 0}
                className="h-11 w-full sm:w-auto rounded-full bg-[#11161B] px-5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[#11161B]/85"
              >
                {isLocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                Lock Month
              </Button>
            )
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {editorGroups.map(([editor, tasks]) => (
          <div key={editor} className="overflow-hidden rounded-[28px] border border-white/40 bg-white/60 dark:bg-black/50 backdrop-blur-md shadow-sm">
            <div className="border-b border-white/40 bg-white/30 px-6 py-4 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#11161B] dark:text-[#E6EAE0]">{editor}</h2>
              <span className="flex h-7 items-center justify-center rounded-full bg-white/50 dark:bg-black/40 px-3 text-[12px] font-semibold text-[#11161B] dark:text-[#E6EAE0]/80 shadow-sm border border-white/30">
                {tasks.length} {tasks.length === 1 ? 'video' : 'videos'}
              </span>
            </div>
            <div className="divide-y divide-white/40">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-[14px] font-bold text-[#11161B] dark:text-[#E6EAE0]">{task.video_title}</p>
                    <p className="text-[12px] font-medium text-[#11161B] dark:text-[#E6EAE0]/50 mt-0.5">{task.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-semibold text-[#11161B] dark:text-[#E6EAE0]/50 tabular-nums">
                      Completed: {new Date(task.complete_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    {task.link && (
                      <a href={task.link} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-blue-500 hover:underline mt-0.5 block">
                        View link
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {months.length === 0 && (
         <div className="text-center py-20 text-[14px] font-medium text-[#11161B] dark:text-[#E6EAE0]/40">
           No completed videos yet.
         </div>
      )}
    </div>
  )
}
