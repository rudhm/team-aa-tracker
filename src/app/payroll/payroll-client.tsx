"use client"

import * as React from "react"
import { VideoTask } from "@/app/columns"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Lock, Loader2 } from "lucide-react"
import { createEntityColor, createEntityColorMaps, formatName } from "@/lib/utils"

export function PayrollClient({ data }: { data: VideoTask[] }) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [isLocking, setIsLocking] = React.useState(false)

  // Group data by YYYY-MM
  const months = React.useMemo(() => {
    const map = new Map<string, VideoTask[]>()
    data.forEach(task => {
      if (!task.complete_date) return
      let dateStr = task.complete_date
      if (dateStr.length === 10) dateStr += "T12:00:00Z"
      const date = new Date(dateStr)
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
      
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(task)
    })
    
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

  const editorGroups = React.useMemo(() => {
    const map = new Map<string, VideoTask[]>()
    currentMonthData.forEach(task => {
      const ed = formatName(task.editor) || "Unassigned"
      if (!map.has(ed)) map.set(ed, [])
      map.get(ed)!.push(task)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [currentMonthData])

  const colorMaps = React.useMemo(() => {
    return createEntityColorMaps({
      clients: currentMonthData.map(task => task.client),
      subClients: currentMonthData.map(task => task.sub_client),
      editors: currentMonthData.map(task => formatName(task.editor)),
    })
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

    const headers = ["Editor", "Client", "Subclient", "Video Title", "Completed At"]
    const rows = currentMonthData.map(t => [
      t.editor, 
      t.client, 
      t.sub_client,
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

  const formatMonth = (yyyyMm: string) => {
    const [y, m] = yyyyMm.split('-')
    const date = new Date(parseInt(y), parseInt(m) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="theme-toolbar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <select 
          className="h-[34px] w-full sm:w-auto appearance-none rounded-lg bg-[var(--surface-page)] border border-[var(--border)] pl-4 pr-10 text-[13px] font-bold text-[var(--text-primary)] focus-visible:outline-none"
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
            className="h-[34px] w-full sm:w-auto rounded-lg border-[var(--border-strong)] bg-transparent px-4 text-[12px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-page)]"
          >
            <Download className="mr-2 h-4 w-4 text-[var(--text-secondary)]" />
            Export CSV
          </Button>

          {new Date().getDate() >= 1 && new Date().getDate() <= 5 && (
            isMonthLocked ? (
              <span className="inline-flex h-[34px] w-full sm:w-auto justify-center items-center rounded-lg py-[3px] px-[10px] text-[12px] font-semibold bg-[#E2F8EB] text-emerald-700">
                <Lock className="mr-2 h-4 w-4" /> Locked
              </span>
            ) : (
              <Button 
                onClick={handleLockMonth}
                disabled={isLocking || currentMonthData.length === 0}
                className="btn-primary h-[34px] w-full sm:w-auto rounded-lg px-4 text-[12px]"
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
          <div key={editor} className="overflow-hidden rounded-xl theme-card">
            <div className="border-b border-[var(--border)] bg-[var(--surface-page)] px-6 py-4 flex items-center justify-between">
              {editor === "Unassigned" ? (
                <h2 className="text-[13px] font-bold text-[var(--text-primary)]">{editor}</h2>
              ) : (
                <h2
                  className="inline-flex max-w-[220px] items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                  style={colorMaps.editors[editor] ?? createEntityColor(editor, "editor")}
                >
                  {editor}
                </h2>
              )}
              <span className="inline-flex items-center rounded-lg py-[3px] px-[10px] text-[12px] font-semibold bg-[var(--theme-accent-tint)] text-[var(--theme-accent-hover)]">
                {tasks.length} {tasks.length === 1 ? 'video' : 'videos'}
              </span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--surface-page)] transition-colors">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--text-primary)]">{task.video_title}</p>
                    <p
                      className="mt-1 inline-flex max-w-[220px] items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                      style={colorMaps.clients[task.client] ?? createEntityColor(task.client, "client")}
                    >
                      {task.client}
                    </p>
                    {task.sub_client && (
                      <p
                        className="mt-1 inline-flex max-w-[220px] items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                        style={colorMaps.subClients[task.sub_client] ?? createEntityColor(task.sub_client, "subclient")}
                      >
                        {task.sub_client}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-semibold text-[var(--text-secondary)] tabular-nums">
                      Completed: {new Date(task.complete_date!.length === 10 ? task.complete_date + "T12:00:00Z" : task.complete_date!).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })}
                    </p>
                    {task.link && (
                      <a href={task.link} target="_blank" rel="noreferrer" className="theme-link text-[12px] font-medium mt-0.5 block">
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
         <div className="text-center py-20 text-[13px] font-medium text-[var(--text-secondary)]">
           No completed videos yet.
         </div>
      )}
    </div>
  )
}
