"use client"

import * as React from "react"
import { createEntityColorMaps, formatName, getEditorDotColor } from "@/lib/utils"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])
  return isMobile
}
import { supabase } from "@/lib/supabase"
import { VideoTask } from "@/app/columns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ChevronDown, Loader2, Plus, RotateCcw, Search, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { BoardView } from "@/components/board-view"
import { LayoutGrid, List } from "lucide-react"

import { celebrateDelivery } from "@/lib/delivery-celebration"

const HIDDEN_EDITORS_STORAGE_KEY = "team-aa-hidden-editors"

interface DataTableProps {
  columns: ColumnDef<VideoTask, any>[]
  data: VideoTask[]
}


const MemoizedMobileRow = React.memo(({ row, style, measureRef, dataIndex }: { row: any, style?: React.CSSProperties, measureRef?: React.Ref<HTMLDivElement>, dataIndex?: number }) => {
  const selectCell = row.getVisibleCells().find((c: any) => c.column.id === 'select');
  const clientCell = row.getVisibleCells().find((c: any) => c.column.id === 'client');
  const subClientCell = row.getVisibleCells().find((c: any) => c.column.id === 'sub_client');
  const statusCell = row.getVisibleCells().find((c: any) => c.column.id === 'status');
  const videoTitleCell = row.getVisibleCells().find((c: any) => c.column.id === 'video_title');
  const editorCell = row.getVisibleCells().find((c: any) => c.column.id === 'editor');
  const startDateCell = row.getVisibleCells().find((c: any) => c.column.id === 'start_date');
  const completeDateCell = row.getVisibleCells().find((c: any) => c.column.id === 'complete_date');
  const linkCell = row.getVisibleCells().find((c: any) => c.column.id === 'link');

  return (
    <div ref={measureRef} data-index={dataIndex} style={style} className="rounded-xl theme-card p-4 shadow-sm relative overflow-hidden transition-all duration-200">
      {/* Title & Client tags */}
      <div className="flex items-start gap-3">
        {selectCell && row.original.status !== 'Complete' && (
          <div className="scale-125 transform-gpu mt-1 flex-shrink-0">
            {flexRender(selectCell.column.columnDef.cell, selectCell.getContext())}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-bold text-[#11161B] dark:text-[#E6EAE0] leading-snug">
            {videoTitleCell && flexRender(videoTitleCell.column.columnDef.cell, videoTitleCell.getContext())}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <div className="scale-90 origin-left">
              {clientCell && flexRender(clientCell.column.columnDef.cell, clientCell.getContext())}
            </div>
            {row.original.client && subClientCell && (
              <div className="scale-90 origin-left">
                {flexRender(subClientCell.column.columnDef.cell, subClientCell.getContext())}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Editor & Status */}
      <div className="flex items-center gap-2 mt-3">
        {editorCell && flexRender(editorCell.column.columnDef.cell, editorCell.getContext())}
        <div className="scale-90 origin-left">
          {statusCell && flexRender(statusCell.column.columnDef.cell, statusCell.getContext())}
        </div>
      </div>
      
      {/* Dates */}
      <div className="flex items-center gap-2 mt-3 bg-[#F3F5EE] dark:bg-white/10 px-2.5 py-1.5 rounded-md w-max">
        <Calendar className="h-3.5 w-3.5 text-[#11161B]/60 dark:text-[#E6EAE0]/60" />
        <div className="flex items-center gap-1.5 text-[11.5px]">
          {startDateCell && flexRender(startDateCell.column.columnDef.cell, startDateCell.getContext())}
          <span className="text-[#11161B]/40 dark:text-[#E6EAE0]/40 font-medium">→</span>
          {completeDateCell && flexRender(completeDateCell.column.columnDef.cell, completeDateCell.getContext())}
        </div>
      </div>
      
      {/* Link */}
      <div className="mt-3 pt-3 border-t border-[#E6EAE0] dark:border-white/10/50">
        {linkCell && flexRender(linkCell.column.columnDef.cell, linkCell.getContext())}
      </div>
    </div>
  )
})

const MemoizedDesktopRow = React.memo(({ row, isLast, index }: { row: any, isLast: boolean, index: number }) => (
  <TableRow
    data-state={row.getIsSelected() && "selected"}
    className={`transition-colors duration-150 hover:bg-[var(--row-hover)] dark:hover:bg-white/10 ${
      index % 2 === 0 ? "bg-[var(--surface-card)]" : "bg-[var(--row-alt)]"
    } ${
      !isLast ? "border-b border-[var(--border-soft)]" : "border-0"
    }`}
  >
    {row.getVisibleCells().map((cell: any) => (
      <TableCell key={cell.id} className="px-[16px] py-[13px] text-[13.5px]">
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </TableCell>
    ))}
  </TableRow>
))

export function DataTable({ columns, data }: DataTableProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [tableData, setTableData] = React.useState(data)

  React.useEffect(() => {
    setTableData(data)
  }, [data])

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [viewMode, setViewMode] = React.useState<'table' | 'board'>('table')
  const [editorMenuOpen, setEditorMenuOpen] = React.useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false)
  const [clientMenuOpen, setClientMenuOpen] = React.useState(false)
  const [hiddenEditors, setHiddenEditors] = React.useState<string[]>([])
  const [hiddenEditorsLoaded, setHiddenEditorsLoaded] = React.useState(false)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const checkScroll = () => {
      const canScroll = el.scrollWidth > el.clientWidth + 4
      const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 4
      setCanScrollRight(canScroll && !atEnd)
    }
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    checkScroll()
    
    // Also check on mount/data change
    const timeoutId = setTimeout(checkScroll, 100)
    
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
      clearTimeout(timeoutId)
    }
  }, [tableData, viewMode, isMobile])
  
  // Quick-Add State
  const [client, setClient] = React.useState("")
  const [subClient, setSubClient] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [editor, setEditor] = React.useState("")
  const [startDay, setStartDay] = React.useState("")
  const [completeDay, setCompleteDay] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)
  const [isIdleExpanded, setIsIdleExpanded] = React.useState(false)

  // Unique fields for datalist autocomplete
  const uniqueEditors = React.useMemo(() => {
    const editors = new Set(data.map(d => formatName(d.editor)).filter(Boolean))
    return Array.from(editors)
  }, [data])

  React.useEffect(() => {
    try {
      const storedHiddenEditors = window.localStorage.getItem(HIDDEN_EDITORS_STORAGE_KEY)
      if (storedHiddenEditors) {
        const parsedHiddenEditors = JSON.parse(storedHiddenEditors)
        if (Array.isArray(parsedHiddenEditors)) {
          setHiddenEditors(parsedHiddenEditors.filter((editorName): editorName is string => typeof editorName === "string"))
        }
      }
    } catch {
      setHiddenEditors([])
    } finally {
      setHiddenEditorsLoaded(true)
    }
  }, [])

  React.useEffect(() => {
    if (!hiddenEditorsLoaded) return
    window.localStorage.setItem(HIDDEN_EDITORS_STORAGE_KEY, JSON.stringify(hiddenEditors))
  }, [hiddenEditors, hiddenEditorsLoaded])

  const visibleEditors = React.useMemo(() => {
    const hiddenEditorSet = new Set(hiddenEditors)
    return uniqueEditors.filter(editorName => !hiddenEditorSet.has(editorName))
  }, [hiddenEditors, uniqueEditors])

  const availableEditors = React.useMemo(() => {
    const busyEditors = new Set(
      data.filter(d => d.status === "In progress").map(d => formatName(d.editor)).filter(Boolean)
    )
    return visibleEditors.filter(editor => !busyEditors.has(editor)).sort()
  }, [data, visibleEditors])

  const hiddenEditorCount = React.useMemo(() => {
    return hiddenEditors.filter(editorName => uniqueEditors.includes(editorName)).length
  }, [hiddenEditors, uniqueEditors])

  const uniqueClients = React.useMemo(() => {
    const clients = new Set(data.map(d => d.sub_client).filter(Boolean))
    return Array.from(clients) as string[]
  }, [data])

  const uniqueSubClients = React.useMemo(() => {
    const subClients = new Set(data.map(d => d.client).filter((subClient): subClient is string => Boolean(subClient)))
    return Array.from(subClients)
  }, [data])

  const colorMaps = React.useMemo(() => {
    return createEntityColorMaps({
      clients: tableData.map(task => task.sub_client).filter(Boolean) as string[],
      subClients: tableData.map(task => task.client),
      editors: tableData.map(task => formatName(task.editor)),
    })
  }, [tableData])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      rowSelection,
    },
    meta: {
      colorMaps,
            updateData: async (rowIndex: number, columnIdOrUpdates: string | Record<string, any>, value?: any) => {
        const row = tableData[rowIndex]
        
        let updates: any = {}
        if (typeof columnIdOrUpdates === 'string') {
          updates[columnIdOrUpdates] = value
        } else {
          updates = columnIdOrUpdates
        }
        
        // Auto-set complete_date when status flips to Complete
        if (updates.status) {
          if (updates.status === 'Complete' && row.status !== 'Complete') {
            updates.complete_date = new Date().toLocaleDateString("en-CA") // format as YYYY-MM-DD in local time
            
            // Trigger celebration animation!
            setTimeout(() => {
              celebrateDelivery(document.getElementById('delivery-stage'))
            }, 100)
          } else if (updates.status !== 'Complete' && row.status === 'Complete') {
            updates.complete_date = null
          }
        }
        
        // Optimistic UI Update
        setTableData(old => {
          const newData = [...old]
          newData[rowIndex] = { ...newData[rowIndex], ...updates }
          return newData
        })
        
        await supabase.from('video_tasks').update(updates).eq('id', row.id)
        router.refresh()
      }
    }
  })

  const STATUS_FILTERS = ['In progress', 'Revision', 'Complete']

  const statusFilter = (table.getColumn("status")?.getFilterValue() as string) ?? ""
  const clientFilter = (table.getColumn("client")?.getFilterValue() as string) ?? ""
  const editorFilter = (table.getColumn("editor")?.getFilterValue() as string) ?? ""

  const handleHideEditor = (editorName: string) => {
    if (editorFilter === editorName) {
      table.getColumn("editor")?.setFilterValue("")
    }

    setHiddenEditors(oldHiddenEditors => {
      if (oldHiddenEditors.includes(editorName)) return oldHiddenEditors
      return [...oldHiddenEditors, editorName]
    })
  }

  const handleRestoreHiddenEditors = () => {
    setHiddenEditors([])
  }

  const [isResetting, setIsResetting] = React.useState(false)

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to delete all data and seed random tasks?")) return
    setIsResetting(true)
    try {
      const { data: allIds } = await supabase.from('video_tasks').select('id')
      if (allIds?.length) {
        await supabase.from('video_tasks').delete().in('id', allIds.map(d => d.id))
      }
      
      const sampleClients = ['TechCorp', 'MediaCo', 'Innovate LLC', 'Studio X', 'Designify', 'Streamline'];
      const sampleSubClients = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Project Y', 'Campaign Z', 'Launch 2026'];
      const sampleEditors = ['Abhishek', 'Pranjya', 'Aakash', 'Vighnesh', 'Harshit', 'Ekta', 'Anjali'];
      const sampleStatuses = ['In progress', 'Revision', 'Complete'];

      const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      const randomDate = () => {
          const d = new Date(new Date().getFullYear(), new Date().getMonth(), Math.floor(Math.random() * 28) + 1);
          return d.toISOString().split('T')[0];
      };

      const rows = [];
      for (let i = 0; i < 20; i++) {
          const status = randomItem(sampleStatuses);
          const start_date = randomDate();
          let complete_date = null;
          if (status === 'Complete') {
              complete_date = randomDate();
              if (complete_date < start_date) {
                  complete_date = start_date;
              }
          }
          
          rows.push({
              client: randomItem(sampleSubClients),
              sub_client: randomItem(sampleClients),
              video_title: `Video Project ${Math.floor(Math.random() * 1000)}`,
              editor: randomItem(sampleEditors),
              start_date: start_date,
              complete_date: complete_date,
              status: status,
              payroll_locked: Math.random() > 0.8
          });
      }
      const { data: newTasks, error } = await supabase.from('video_tasks').insert(rows).select()
      if (!error && newTasks) {
         setTableData(newTasks)
         window.location.reload()
      }
    } finally {
      setIsResetting(false)
    }
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !editor) return
    setIsAdding(true)

    const parsedComplete = completeDay || null
    const localToday = new Date().toLocaleDateString("en-CA")

    const payload = {
      client: subClient.trim() || "",
      sub_client: client.trim() || null,
      video_title: title,
      editor: formatName(editor),
      start_date: startDay || null,
      complete_date: parsedComplete,
      status: parsedComplete ? 'Complete' : 'In progress',
    }

    await supabase.from('video_tasks').insert([payload])
    
    setClient("")
    setSubClient("")
    setTitle("")
    setStartDay("")
    setCompleteDay("")
    setIsAdding(false)
    router.refresh()
  }

  const handleBulkComplete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const ids = selectedRows.map(r => r.original.id)
    
    if (ids.length === 0) return
    
    await supabase
      .from('video_tasks')
      .update({ 
        status: 'Complete', 
        complete_date: new Date().toLocaleDateString("en-CA") 
      })
      .in('id', ids)
      
    // Trigger celebration animation!
    celebrateDelivery(document.getElementById('delivery-stage'))
      
    setRowSelection({})
    router.refresh()
  }

  const rows = table.getRowModel().rows
  const selectedCount = Object.keys(rowSelection).length

  const completedCount = tableData.filter(d => d.status === 'Complete').length
  const inProgressCount = tableData.filter(d => d.status === 'In progress').length
  const revisionCount = tableData.filter(d => d.status === 'Revision').length

  return (
    <div className="relative">
      {/* The invisible stage for the delivery animation to overlay securely */}
      <div id="delivery-stage" className="absolute top-16 left-0 right-0 z-50 pointer-events-none"></div>

      {/* Top Bar: Title & Actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="text-xl font-bold text-[var(--text-primary)]">All Videos</div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-card-2)] p-[3px] gap-[2px]">
            <button
              onClick={() => setViewMode('table')}
              className={`flex h-[30px] items-center justify-center px-[10px] rounded-[6px] text-[13px] font-semibold transition-colors ${viewMode === 'table' ? 'bg-[var(--theme-accent)] text-[#241a05]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <List className="mr-[6px] h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex h-[30px] items-center justify-center px-[10px] rounded-[6px] text-[13px] font-semibold transition-colors ${viewMode === 'board' ? 'bg-[var(--theme-accent)] text-[#241a05]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <LayoutGrid className="mr-[6px] h-4 w-4" />
              Board
            </button>
          </div>
          <Button
            onClick={handleResetData}
            disabled={isResetting}
            variant="outline"
            className="h-[36px] px-3 text-[13px] hidden sm:flex items-center gap-2 font-bold shadow-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
          >
            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Reset Data
          </Button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="flex items-center gap-6 mb-3 text-[13px] text-[var(--text-secondary)] font-medium bg-[var(--surface-card-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-sm w-max">
        <div className="flex items-center gap-6 flex-shrink-0">
          <span className="text-[var(--text-primary)] font-bold">{tableData.length} <span className="font-medium text-[var(--text-secondary)]">Videos</span></span>
          <span className="text-[var(--text-primary)] font-bold">{completedCount} <span className="font-medium text-[var(--text-secondary)]">Completed</span></span>
          <span className="text-[var(--text-primary)] font-bold">{inProgressCount} <span className="font-medium text-[var(--text-secondary)]">In Progress</span></span>
          <span className="text-[var(--text-primary)] font-bold">{revisionCount} <span className="font-medium text-[var(--text-secondary)]">Pending</span></span>
        </div>
      </div>

      {/* Idle Editors Roster */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-bold text-[var(--text-primary)] ml-1">Available now:</span>
        <div className="flex items-center gap-[6px] flex-wrap">
          {availableEditors.length > 0 ? (
            <>
              {availableEditors.slice(0, isIdleExpanded ? undefined : 5).map(editor => (
                <div
                  key={editor}
                  className="flex items-center gap-1.5 bg-[var(--surface-card-2)] border border-[var(--border)] rounded-full px-2.5 py-1 text-[12px] font-semibold text-[var(--text-primary)] shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getEditorDotColor(editor) }} />
                  {editor}
                </div>
              ))}
              {availableEditors.length > 5 && (
                <button
                  type="button"
                  onClick={() => setIsIdleExpanded(!isIdleExpanded)}
                  className="flex items-center bg-[var(--surface-card-2)] border border-[var(--border)] rounded-full px-2.5 py-1 text-[12px] font-bold text-[var(--theme-accent)] shadow-sm hover:bg-[var(--border)] transition-colors cursor-pointer"
                >
                  {isIdleExpanded ? "Show less" : `+${availableEditors.length - 5}`}
                </button>
              )}
            </>
          ) : (
            <span className="text-[12.5px] text-[var(--text-muted)] italic">None</span>
          )}
        </div>
      </div>

      {/* Chip Row */}
      <div className="flex items-center gap-[10px] mb-[16px] flex-wrap">
        <div className="flex items-center gap-[8px] bg-[var(--surface-card-2)] border border-[var(--border)] rounded-full px-[14px] py-[7px] text-[13px] text-[var(--text-muted)] min-w-[220px] focus-within:ring-2 focus-within:ring-[var(--theme-accent)] transition-all">
          <Search className="h-[14px] w-[14px] text-[var(--text-muted)]" />
          <Input
            aria-label="Search video titles"
            placeholder="Search video titles…"
            value={(table.getColumn("video_title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("video_title")?.setFilterValue(event.target.value)}
            className="h-auto p-0 border-none bg-transparent shadow-none focus-visible:ring-0 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-[8px] bg-[var(--surface-card-2)] border border-[var(--border)] rounded-full py-[7px] pl-[14px] pr-[8px] text-[13px] text-[var(--text-primary)]"
            onClick={() => setEditorMenuOpen(isOpen => !isOpen)}
          >
            Editor : {editorFilter || "All"}
            {editorFilter && (
              <span 
                className="w-[18px] h-[18px] rounded-full bg-[#2C2C33] text-[var(--text-muted)] flex items-center justify-center text-[11px] cursor-pointer ml-1 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  table.getColumn("editor")?.setFilterValue("")
                }}
              >
                ✕
              </span>
            )}
            {!editorFilter && <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />}
          </button>

          {editorMenuOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-[280px] w-full min-w-[230px] overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-1.5 text-[13px] shadow-lg dark:bg-[#161b22]">
              <button
                type="button"
                className={`flex h-8 w-full items-center rounded-lg px-3 text-left font-semibold transition-colors hover:bg-[#F3F5EE] dark:hover:bg-white/10 ${!editorFilter ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                onClick={() => { table.getColumn("editor")?.setFilterValue(""); setEditorMenuOpen(false); }}
              >
                All Editors
              </button>
              {visibleEditors.map(editorName => (
                <div key={editorName} className="flex items-center group w-full">
                  <button
                    type="button"
                    className={`flex-1 flex h-8 items-center gap-2 rounded-l-lg px-3 text-left font-medium transition-colors hover:bg-[#F3F5EE] dark:hover:bg-white/10 ${editorFilter === editorName ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                    onClick={() => { table.getColumn("editor")?.setFilterValue(editorName); setEditorMenuOpen(false); }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getEditorDotColor(editorName) }} />
                    {editorName}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHideEditor(editorName);
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-r-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all"
                    title="Hide Editor"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {hiddenEditorCount > 0 && (
                <button
                  type="button"
                  onClick={handleRestoreHiddenEditors}
                  className="mt-2 w-full flex items-center justify-center h-7 rounded-md text-[11px] font-semibold text-[var(--theme-accent)] hover:bg-[var(--surface-card-2)] transition-colors"
                >
                  Restore {hiddenEditorCount} hidden editor{hiddenEditorCount !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-[8px] bg-[var(--surface-card-2)] border border-[var(--border)] rounded-full py-[7px] pl-[14px] pr-[8px] text-[13px] text-[var(--text-primary)]"
            onClick={() => setStatusMenuOpen(isOpen => !isOpen)}
          >
            Status : {statusFilter || "All"}
            {statusFilter && (
              <span
                className="w-[18px] h-[18px] rounded-full bg-[#2C2C33] text-[var(--text-muted)] flex items-center justify-center text-[11px] cursor-pointer ml-1 hover:text-white"
                onClick={(e) => { e.stopPropagation(); table.getColumn("status")?.setFilterValue("") }}
              >
                ✕
              </span>
            )}
            {!statusFilter && <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />}
          </button>

          {statusMenuOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[180px] rounded-xl border border-[var(--border)] bg-white p-1.5 text-[13px] shadow-lg dark:bg-[#161b22]">
              <button
                type="button"
                className="flex h-8 w-full items-center rounded-lg px-3 text-left font-semibold hover:bg-[#F3F5EE] dark:hover:bg-white/10"
                onClick={() => { table.getColumn("status")?.setFilterValue(""); setStatusMenuOpen(false) }}
              >
                All Statuses
              </button>
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  type="button"
                  className="flex h-8 w-full items-center rounded-lg px-3 text-left font-medium hover:bg-[#F3F5EE] dark:hover:bg-white/10"
                  onClick={() => { table.getColumn("status")?.setFilterValue(s); setStatusMenuOpen(false) }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-[8px] bg-[var(--surface-card-2)] border border-[var(--border)] rounded-full py-[7px] pl-[14px] pr-[8px] text-[13px] text-[var(--text-primary)]"
            onClick={() => setClientMenuOpen(isOpen => !isOpen)}
          >
            Client : {clientFilter || "All"}
            {clientFilter && (
              <span
                className="w-[18px] h-[18px] rounded-full bg-[#2C2C33] text-[var(--text-muted)] flex items-center justify-center text-[11px] cursor-pointer ml-1 hover:text-white"
                onClick={(e) => { e.stopPropagation(); table.getColumn("client")?.setFilterValue("") }}
              >
                ✕
              </span>
            )}
            {!clientFilter && <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />}
          </button>

          {clientMenuOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-[280px] w-full min-w-[200px] overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-1.5 text-[13px] shadow-lg dark:bg-[#161b22]">
              <button
                type="button"
                className="flex h-8 w-full items-center rounded-lg px-3 text-left font-semibold hover:bg-[#F3F5EE] dark:hover:bg-white/10"
                onClick={() => { table.getColumn("client")?.setFilterValue(""); setClientMenuOpen(false) }}
              >
                All Clients
              </button>
              {uniqueClients.map(c => (
                <button
                  key={c}
                  type="button"
                  className="flex h-8 w-full items-center rounded-lg px-3 text-left font-medium hover:bg-[#F3F5EE] dark:hover:bg-white/10"
                  onClick={() => { table.getColumn("client")?.setFilterValue(c); setClientMenuOpen(false) }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <datalist id="editor-suggestions">
        {visibleEditors.map(ed => <option key={ed} value={ed} />)}
      </datalist>
      <datalist id="client-suggestions">
        {uniqueClients.map(c => <option key={c} value={c} />)}
      </datalist>
      <datalist id="subclient-suggestions">
        {uniqueSubClients.map(c => <option key={c} value={c} />)}
      </datalist>

      {viewMode === 'board' ? (
        <BoardView data={table.getCoreRowModel().rows.map(r => r.original)} colorMaps={colorMaps} />
      ) : (
      <>
        {/* Mobile View (Cards) */}
        {!isMobile ? null : (
          <div ref={scrollRef} className="md:hidden flex flex-col gap-4 pb-24 relative w-full">
            {rows.length ? (
               rows.map((row, index) => (
                 <MemoizedMobileRow 
                   key={row.id} 
                   row={row} 
                   dataIndex={index}
                 />
               ))
            ) : (
              <div className="text-center py-10 text-[13px] font-medium text-[var(--text-muted)]">No videos found.</div>
            )}
          </div>
        )}

        {/* Desktop View (Table) */}
        {isMobile ? null : (
          <div className="relative w-full group">
            <div ref={scrollRef} className="hidden md:block overflow-hidden rounded-xl theme-card shadow-sm overflow-x-auto w-full peer relative">
              <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow className="border-b border-[var(--border)] hover:bg-transparent">
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-[12px] px-[16px] text-[11.5px] font-bold uppercase tracking-[.03em] text-[var(--text-muted)] sticky top-0 z-10 bg-[var(--surface-card)]">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Quick-Add Row */}
            <TableRow className="border-b-2 border-dashed border-[var(--border)] bg-[#FAFBFC] dark:bg-black/20 hover:bg-[#F3F5EE] dark:hover:bg-black/40 transition-colors group">
              <TableCell className="px-[16px] py-[8px] w-12 text-center">
                <div className="w-[16px] h-[16px] mx-auto rounded-[5px] bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] flex items-center justify-center font-bold text-[14px]">
                  +
                </div>
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  placeholder="Client..." 
                  list="client-suggestions"
                  value={client} onChange={e => setClient(e.target.value)}
                  className="h-[30px] rounded-[6px] border border-[var(--border-soft)] bg-white dark:bg-[#161b22] px-[10px] text-[12.5px] shadow-sm focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] focus-visible:border-transparent transition-all placeholder:text-[var(--text-faint)]"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input
                  placeholder="Subclient..."
                  list="subclient-suggestions"
                  value={subClient} onChange={e => setSubClient(e.target.value)}
                  className="h-[30px] rounded-[6px] border border-[var(--border-soft)] bg-white dark:bg-[#161b22] px-[10px] text-[12.5px] shadow-sm focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] focus-visible:border-transparent transition-all placeholder:text-[var(--text-faint)]"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  placeholder="Video Title..." 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="h-[30px] rounded-[6px] border border-[var(--border-soft)] bg-white dark:bg-[#161b22] px-[10px] text-[12.5px] shadow-sm focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] focus-visible:border-transparent transition-all placeholder:text-[var(--text-faint)] font-semibold"
                  onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(e) }}
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  placeholder="Editor..." 
                  list="editor-suggestions"
                  value={editor} onChange={e => setEditor(e.target.value)}
                  className="h-[30px] rounded-[6px] border border-[var(--border-soft)] bg-white dark:bg-[#161b22] px-[10px] text-[12.5px] shadow-sm focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] focus-visible:border-transparent transition-all placeholder:text-[var(--text-faint)]"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  type="date"
                  value={startDay} 
                  onChange={e => setStartDay(e.target.value)}
                  className="h-[30px] w-[110px] rounded-[6px] border border-[var(--border-soft)] bg-white dark:bg-[#161b22] px-[10px] text-[12.5px] shadow-sm focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] focus-visible:border-transparent transition-all text-[var(--text-secondary)] [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  type="date"
                  value={completeDay} 
                  onChange={e => setCompleteDay(e.target.value)}
                  className="h-[30px] w-[110px] rounded-[6px] border border-[var(--border-soft)] bg-white dark:bg-[#161b22] px-[10px] text-[12.5px] shadow-sm focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] focus-visible:border-transparent transition-all text-[var(--text-secondary)] [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <span className="inline-flex items-center gap-[6px] rounded-full py-[4px] px-[10px] text-[11px] font-bold bg-[#E0E7FF]/50 dark:bg-[#231E47]/50 text-indigo-700/50 dark:text-[#A79BF0]/50 border border-indigo-700/10">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#7C6FF0]/50"></span>
                  New
                </span>
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Button 
                  onClick={handleQuickAdd} 
                  disabled={!title || !editor || isAdding}
                  className="bg-[var(--theme-accent)] text-[#241a05] hover:bg-[#F2CD60] h-7 w-16 text-[12px] font-bold shadow-sm disabled:opacity-40 disabled:hover:bg-[var(--theme-accent)] transition-all"
                >
                  {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                </Button>
              </TableCell>
            </TableRow>

            {/* Data Rows */}
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <MemoizedDesktopRow
                  key={row.id}
                  row={row}
                  index={index}
                  isLast={index === rows.length - 1}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-[13px] font-medium text-[var(--text-muted)]">
                  No videos found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div 
        className={`pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[var(--surface-card)] dark:from-[#161b22] to-transparent z-10 hidden md:block rounded-r-xl transition-opacity duration-150 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} 
      />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-[16px] py-[14px] border-t border-[var(--border)]">
        <div className="text-[12.5px] font-medium text-[var(--text-muted)] w-full sm:w-[150px] text-center sm:text-left">
          Showing {table.getFilteredRowModel().rows.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length}
        </div>
        
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <button 
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-[6px] text-[13px] font-semibold cursor-pointer disabled:opacity-30 disabled:hover:text-[var(--text-secondary)] transition-colors"
          >
            ‹ Previous
          </button>
          
          <div className="flex items-center gap-1 mx-2">
            {table.getPageCount() > 0 && Array.from({ length: table.getPageCount() }).map((_, i) => {
              const currentPage = table.getState().pagination.pageIndex;
              const isCurrent = i === currentPage;
              
              if (i === 0 || i === table.getPageCount() - 1 || Math.abs(i - currentPage) <= 1) {
                return (
                  <button 
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={`w-7 h-7 rounded-[6px] text-[13px] font-semibold flex items-center justify-center transition-colors ${isCurrent ? 'bg-[var(--theme-accent)] text-[#241a05]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-card-2)] hover:text-[var(--text-primary)]'}`}
                  >
                    {i + 1}
                  </button>
                )
              } else if (i === 1 && currentPage > 2) {
                return <span key={i} className="text-[var(--text-faint)] text-[11px] font-bold mx-1">...</span>
              } else if (i === table.getPageCount() - 2 && currentPage < table.getPageCount() - 3) {
                return <span key={i} className="text-[var(--text-faint)] text-[11px] font-bold mx-1">...</span>
              }
              return null;
            })}
          </div>

          <button 
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-[6px] text-[13px] font-semibold cursor-pointer disabled:opacity-30 disabled:hover:text-[var(--text-secondary)] transition-colors"
          >
            Next ›
          </button>
        </div>
        
        <div className="w-full sm:w-[150px] flex justify-center sm:justify-end">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="bg-[var(--surface-card-2)] border border-[var(--border-soft)] rounded-[8px] text-[12.5px] font-medium text-[var(--text-primary)] px-2 py-1.5 outline-none cursor-pointer hover:border-[var(--border)] transition-colors appearance-none pr-6 relative"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'gray\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.35rem center', backgroundSize: '1em' }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} / page
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>
      )}
      </>
      )}

      {/* Mobile Add Task FAB & Sheet */}
      <div className="md:hidden fixed bottom-6 right-4 z-40">
        <Sheet>
          <SheetTrigger className="btn-primary flex items-center justify-center h-14 w-14 rounded-full shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all p-0">
            <Plus className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[32px] p-6 pb-12 outline-none">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-left text-[18px] font-bold text-[#11161B] dark:text-[#E6EAE0]">Add new video</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#11161B] dark:text-[#E6EAE0]/70 uppercase tracking-wider ml-1">Client</label>
                <Input 
                  placeholder="Client..." 
                  list="client-suggestions"
                  value={client} onChange={e => setClient(e.target.value)}
                  className="h-[34px] rounded-lg bg-[#F3F5EE] dark:bg-white/10 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] font-semibold shadow-sm focus-visible:bg-white dark:bg-[#161b22]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#11161B] dark:text-[#E6EAE0]/70 uppercase tracking-wider ml-1">Subclient</label>
                <Input
                  placeholder="Subclient..."
                  list="subclient-suggestions"
                  value={subClient} onChange={e => setSubClient(e.target.value)}
                  className="h-[34px] rounded-lg bg-[#F3F5EE] dark:bg-white/10 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] shadow-sm focus-visible:bg-white dark:bg-[#161b22]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#11161B] dark:text-[#E6EAE0]/70 uppercase tracking-wider ml-1">Title</label>
                <Input 
                  placeholder="Video Title..." 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="h-[34px] rounded-lg bg-[#F3F5EE] dark:bg-white/10 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] shadow-sm focus-visible:bg-white dark:bg-[#161b22]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#11161B] dark:text-[#E6EAE0]/70 uppercase tracking-wider ml-1">Editor</label>
                <Input 
                  placeholder="Editor..." 
                  list="editor-suggestions"
                  value={editor} onChange={e => setEditor(e.target.value)}
                  className="h-[34px] rounded-lg bg-[#F3F5EE] dark:bg-white/10 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] shadow-sm focus-visible:bg-white dark:bg-[#161b22]"
                />
              </div>
              <div className="flex gap-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[11px] font-bold text-[#11161B] dark:text-[#E6EAE0]/70 uppercase tracking-wider ml-1">Start Date</label>
                  <Input 
                    type="text"
                    placeholder="Date"
                    onFocus={e => { e.target.type = "date"; e.target.showPicker?.(); }}
                    onBlur={e => { if (!e.target.value) e.target.type = "text"; }}
                    value={startDay} 
                    onChange={e => setStartDay(e.target.value)}
                    className="h-[34px] rounded-lg bg-[#F3F5EE] dark:bg-white/10 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] shadow-sm focus-visible:bg-white dark:bg-[#161b22] text-center [&::-webkit-calendar-picker-indicator]:dark:invert"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-[11px] font-bold text-[#11161B] dark:text-[#E6EAE0]/70 uppercase tracking-wider ml-1">Complete Date</label>
                  <Input 
                    type="text"
                    placeholder="Date"
                    onFocus={e => { e.target.type = "date"; e.target.showPicker?.(); }}
                    onBlur={e => { if (!e.target.value) e.target.type = "text"; }}
                    value={completeDay} 
                    onChange={e => setCompleteDay(e.target.value)}
                    className="h-[34px] rounded-lg bg-[#F3F5EE] dark:bg-white/10 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] shadow-sm focus-visible:bg-white dark:bg-[#161b22] text-center [&::-webkit-calendar-picker-indicator]:dark:invert"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={(e) => {
                     handleQuickAdd(e)
                     document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
                  }}
                  disabled={!title || !editor || isAdding}
                  className="btn-primary h-[34px] w-full text-[13px] disabled:opacity-30"
                >
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Video"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedCount > 0 && viewMode === 'table' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200 w-[90vw] md:w-auto flex justify-center">
          <div className="flex items-center gap-4 rounded-full theme-header px-6 py-3 shadow-2xl border border-[var(--border)]">
            <span className="text-[13px] font-medium text-white/80">
              {selectedCount} {selectedCount === 1 ? 'video' : 'videos'} selected
            </span>
            <div className="w-px h-4 bg-white/20 dark:bg-white/5"></div>
            <button 
              onClick={handleBulkComplete}
              className="text-[13px] font-bold text-[#ffdf59] hover:text-[#fffdf2] transition-colors"
            >
              Mark Complete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
