"use client"

import * as React from "react"
import { VideoTask } from "@/app/columns"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Lock, Loader2, Copy, Check, ChevronDown, ChevronRight, History } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createEntityColor, createEntityColorMaps, formatName } from "@/lib/utils"

const renderChanges = (oldData: any, newData: any) => {
  if (!oldData && newData) return <div className="text-[12px] text-emerald-600 font-medium">Task created</div>
  if (oldData && !newData) return <div className="text-[12px] text-red-600 font-medium">Task deleted</div>
  
  const changes = []
  const ignoreKeys = ['id', 'created_at', 'updated_at', 'payroll_locked']
  
  for (const key in newData) {
    if (ignoreKeys.includes(key)) continue
    const oldVal = oldData[key]
    const newVal = newData[key]
    
    if (oldVal !== newVal) {
      changes.push(
        <div key={key} className="text-[12px]">
          <span className="font-semibold text-[var(--text-secondary)]">{key}: </span>
          <span className="line-through opacity-60 mr-1">{oldVal || 'none'}</span>
          <span className="text-[var(--text-primary)] font-medium">➝ {newVal || 'none'}</span>
        </div>
      )
    }
  }
  
  if (changes.length === 0) return <div className="text-[12px] text-[var(--text-secondary)] italic">No visible changes</div>
  return <div className="space-y-1">{changes}</div>
}

export function WrapupClient({ data }: { data: VideoTask[] }) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [isLocking, setIsLocking] = React.useState(false)
  const [lockError, setLockError] = React.useState("")

  const [clientFilter, setClientFilter] = React.useState("All")
  const [subClientFilter, setSubClientFilter] = React.useState("All")
  const [editorFilter, setEditorFilter] = React.useState("All")
  const [copied, setCopied] = React.useState(false)
  const [copyError, setCopyError] = React.useState("")
  const [collapsedEditors, setCollapsedEditors] = React.useState<Record<string, boolean>>({})
  
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [auditLogs, setAuditLogs] = React.useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)

  const toggleEditor = (ed: string) => {
    setCollapsedEditors(prev => ({ ...prev, [ed]: !prev[ed] }))
  }
  React.useEffect(() => {
    setClientFilter("All")
    setSubClientFilter("All")
    setEditorFilter("All")
  }, [selectedMonth])

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

  const uniqueClients = React.useMemo(() => Array.from(new Set(currentMonthData.map(t => t.sub_client).filter(Boolean))).sort() as string[], [currentMonthData])
  const uniqueSubClients = React.useMemo(() => Array.from(new Set(currentMonthData.map(t => t.client).filter(Boolean))).sort(), [currentMonthData])
  const uniqueEditors = React.useMemo(() => Array.from(new Set(currentMonthData.map(t => formatName(t.editor)).filter(Boolean))).sort(), [currentMonthData])

  const loadHistory = React.useCallback(async () => {
    if (currentMonthData.length === 0) {
      setAuditLogs([])
      return
    }
    setIsLoadingHistory(true)
    const ids = currentMonthData.map(t => t.id)
    // Fetch logs up to 100 for this month's tasks
    const { data, error } = await supabase
      .from('task_audit_logs')
      .select('*')
      .in('task_id', ids)
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (!error && data) {
      setAuditLogs(data)
    }
    setIsLoadingHistory(false)
  }, [currentMonthData])

  React.useEffect(() => {
    if (isHistoryOpen) {
      loadHistory()
    }
  }, [isHistoryOpen, loadHistory])

  const filteredMonthData = React.useMemo(() => {
    return currentMonthData.filter(t => {
      const matchClient = clientFilter === "All" || t.sub_client === clientFilter
      const matchSub = subClientFilter === "All" || t.client === subClientFilter
      const matchEditor = editorFilter === "All" || formatName(t.editor) === editorFilter
      return matchClient && matchSub && matchEditor
    })
  }, [currentMonthData, clientFilter, subClientFilter, editorFilter])

  const editorGroups = React.useMemo(() => {
    const map = new Map<string, VideoTask[]>()
    filteredMonthData.forEach(task => {
      const ed = formatName(task.editor) || "Unassigned"
      if (!map.has(ed)) map.set(ed, [])
      map.get(ed)!.push(task)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredMonthData])

  const colorMaps = React.useMemo(() => {
    return createEntityColorMaps({
      clients: currentMonthData.map(task => task.sub_client).filter(Boolean) as string[],
      subClients: currentMonthData.map(task => task.client),
      editors: currentMonthData.map(task => formatName(task.editor)),
    })
  }, [currentMonthData])

  const isMonthLocked = currentMonthData.length > 0 && currentMonthData.every(t => t.payroll_locked)

  const handleLockMonth = async () => {
    if (currentMonthData.length === 0) return
    setLockError("")
    setIsLocking(true)
    
    const ids = currentMonthData.map(t => t.id)
    const { error } = await supabase
      .from('video_tasks')
      .update({ payroll_locked: true })
      .in('id', ids)
      .eq('payroll_locked', false)
    if (error) {
      console.error("Error locking wrapup month:", error)
      setLockError("This wrapup period could not be locked. Please try again.")
      setIsLocking(false)
      return
    }
    setIsLocking(false)
    router.refresh()
  }

  const exportCSV = () => {
    if (filteredMonthData.length === 0) return

    const headers = ["Editor", "Client", "Subclient", "Video Title", "Completed At"]
    const rows = filteredMonthData.map(t => [
      t.editor, 
      t.sub_client || "", 
      t.client || "",
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
    link.setAttribute("download", `Wrap-up_${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    if (filteredMonthData.length === 0) return
    
    let text = `*Monthly Wrap - ${formatMonth(selectedMonth)}*\nTotal Videos: ${filteredMonthData.length}\n\n`
    
    const byEditor = filteredMonthData.reduce((acc, task) => {
      const ed = formatName(task.editor) || "Unassigned"
      if (!acc[ed]) acc[ed] = []
      acc[ed].push(task)
      return acc
    }, {} as Record<string, typeof filteredMonthData>)

    Object.entries(byEditor)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([editor, tasks]) => {
        if (editorFilter === "All") {
          text += `*${editor}* (${tasks.length})\n`
        }
        
        tasks.forEach(t => {
          let clientParts = []
          if (clientFilter === "All" && t.sub_client) clientParts.push(t.sub_client)
          if (subClientFilter === "All" && t.client) clientParts.push(t.client)
          
          const clientStr = clientParts.join(" - ")
          const titleStr = t.duration ? `${t.video_title} (${t.duration})` : t.video_title
          if (clientStr) {
            text += `• ${clientStr}: ${titleStr}\n`
          } else {
            text += `• ${titleStr}\n`
          }
        })
        text += `\n`
      })

    setCopyError("")
    navigator.clipboard.writeText(text.trim())
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(error => {
        console.error("Error copying wrapup summary:", error)
        setCopyError("Unable to copy the summary. Check browser permissions and try again.")
      })
  }

  const formatMonth = (yyyyMm: string) => {
    const [y, m] = yyyyMm.split('-')
    const date = new Date(parseInt(y), parseInt(m) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {lockError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {lockError}
        </div>
      )}
      {copyError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {copyError}
        </div>
      )}
      <div className="theme-toolbar flex flex-col items-stretch justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-auto">
            <select 
              className="h-[34px] w-full appearance-none rounded-lg bg-[var(--surface-page)] border border-[var(--border)] pl-4 pr-10 text-[13px] font-bold text-[var(--text-primary)] focus-visible:outline-none"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {months.length === 0 && <option value="">No data</option>}
              {months.map(([monthKey]) => (
                <option key={monthKey} value={monthKey}>{formatMonth(monthKey)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="h-[34px] w-full appearance-none rounded-lg bg-[var(--surface-page)] border border-[var(--border)] pl-3 pr-8 text-[12px] font-medium text-[var(--text-primary)] focus-visible:outline-none">
               <option value="All">All Clients</option>
               {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-50 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select value={subClientFilter} onChange={e => setSubClientFilter(e.target.value)} className="h-[34px] w-full appearance-none rounded-lg bg-[var(--surface-page)] border border-[var(--border)] pl-3 pr-8 text-[12px] font-medium text-[var(--text-primary)] focus-visible:outline-none">
               <option value="All">All Subclients</option>
               {uniqueSubClients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-50 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select value={editorFilter} onChange={e => setEditorFilter(e.target.value)} className="h-[34px] w-full appearance-none rounded-lg bg-[var(--surface-page)] border border-[var(--border)] pl-3 pr-8 text-[12px] font-medium text-[var(--text-primary)] focus-visible:outline-none">
               <option value="All">All Editors</option>
               {uniqueEditors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-50 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetTrigger
              render={
                <Button 
                  variant="outline"
                  className="h-[34px] w-full sm:w-auto rounded-lg border-[var(--border-strong)] bg-transparent px-4 text-[12px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-page)]"
                >
                  <History className="mr-2 h-4 w-4 text-[var(--text-secondary)]" />
                  History
                </Button>
              }
            />
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Version History</SheetTitle>
                <div className="text-sm text-[var(--text-secondary)]">
                  Tracking changes for {formatMonth(selectedMonth)}
                </div>
              </SheetHeader>
              
              <div className="space-y-6">
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--text-secondary)]" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                    No history found for this month's tasks.
                  </div>
                ) : (
                  auditLogs.map((log) => {
                    const task = currentMonthData.find(t => t.id === log.task_id)
                    const title = task?.video_title || "Unknown Task"
                    
                    return (
                      <div key={log.id} className="relative pl-6 pb-6 border-l border-[var(--border)] last:border-0 last:pb-0">
                        <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-[var(--theme-accent)] shadow-sm"></div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-[var(--text-primary)]">{title}</span>
                            <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface-page)] px-2 py-0.5 rounded-md border border-[var(--border-soft)]">
                              {log.operation}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)] mb-2 flex justify-between">
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                            <span>{log.changed_by_email || 'Unknown User'}</span>
                          </div>
                          <div className="bg-[var(--surface-page)] border border-[var(--border-soft)] rounded-lg p-3">
                            {renderChanges(log.old_data, log.new_data)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            onClick={copyToClipboard}
            variant="outline"
            className="h-[34px] w-full sm:w-auto rounded-lg border-[var(--border-strong)] bg-transparent px-4 text-[12px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-page)]"
          >
            {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4 text-[var(--text-secondary)]" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button 
            onClick={exportCSV}
            variant="outline"
            className="h-[34px] w-full sm:w-auto rounded-lg border-[var(--border-strong)] bg-transparent px-4 text-[12px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-page)]"
          >
            <Download className="mr-2 h-4 w-4 text-[var(--text-secondary)]" />
            CSV
          </Button>

          {new Date().getDate() >= 1 && new Date().getDate() <= 5 && selectedMonth < `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}` && (
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

      {/* Summary Table */}
      {editorGroups.length > 0 && (
        <div className="theme-card rounded-xl overflow-hidden shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--surface-page)] px-6 py-4">
            <h2 className="text-[14px] font-bold text-[var(--text-primary)]">Monthly Summary</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {editorGroups.map(([editor, tasks]) => (
              <div key={editor} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-page)]">
                <span className="text-[13px] font-bold text-[var(--text-primary)] truncate pr-2">{editor}</span>
                <span className="text-[12px] font-semibold text-[var(--theme-accent-hover)] bg-[var(--theme-accent-tint)] px-2 py-0.5 rounded-full shrink-0">{tasks.length}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {editorGroups.map(([editor, tasks]) => {
          const isCollapsed = collapsedEditors[editor] || false
          return (
          <div key={editor} className="overflow-hidden rounded-xl theme-card shadow-sm">
            <div 
              className="border-b border-[var(--border)] bg-[var(--surface-page)] px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[var(--row-hover)] transition-colors select-none"
              onClick={() => toggleEditor(editor)}
            >
              <div className="flex items-center gap-3">
                <ChevronRight className={`h-4 w-4 text-[var(--text-secondary)] transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
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
              </div>
              <span className="inline-flex items-center rounded-lg py-[3px] px-[10px] text-[12px] font-semibold bg-[var(--theme-accent-tint)] text-[var(--theme-accent-hover)]">
                {tasks.length} {tasks.length === 1 ? 'video' : 'videos'}
              </span>
            </div>
            
            {!isCollapsed && (
            <div className="divide-y divide-[var(--border)]">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--surface-page)] transition-colors">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--text-primary)]">{task.video_title}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {task.sub_client && (
                        <span
                          className="inline-flex max-w-[220px] items-center truncate rounded-full border px-2 py-0.5 text-[10px] font-bold"
                          style={colorMaps.clients[task.sub_client] ?? createEntityColor(task.sub_client, "client")}
                        >
                          {task.sub_client}
                        </span>
                      )}
                      {task.client && task.sub_client && (
                        <span className="text-[var(--text-muted)] text-[10px] font-bold">›</span>
                      )}
                      {task.client && (
                        <span
                          className="inline-flex max-w-[220px] items-center truncate rounded-full border px-2 py-0.5 text-[10px] font-bold opacity-75"
                          style={colorMaps.subClients[task.client] ?? createEntityColor(task.client, "subclient")}
                        >
                          {task.client}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-semibold text-[var(--text-secondary)] tabular-nums mb-1">
                      Completed: {new Date(task.complete_date!.length === 10 ? task.complete_date + "T12:00:00Z" : task.complete_date!).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })}
                    </p>
                    {task.link ? (
                      <a href={task.link} target="_blank" rel="noreferrer" className="theme-link text-[12px] font-medium block hover:underline">
                        View link
                      </a>
                    ) : (
                      <span className="text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                        No link yet
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )})}
      </div>
      
      {months.length === 0 && (
         <div className="text-center py-20 text-[13px] font-medium text-[var(--text-secondary)]">
           No completed videos yet.
         </div>
      )}
    </div>
  )
}
