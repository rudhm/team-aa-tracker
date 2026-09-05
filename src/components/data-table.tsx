"use client"

import * as React from "react"
import { createEntityColorMaps, formatName } from "@/lib/utils"
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

  // Unique fields for datalist autocomplete
  const uniqueEditors = React.useMemo(() => {
    const editors = new Set(data.map(d => formatName(d.editor)).filter(Boolean))
    return Array.from(editors)
  }, [data])

  const availableEditors = React.useMemo(() => {
    const busyEditors = new Set(
      data.filter(d => d.status === "In progress").map(d => formatName(d.editor)).filter(Boolean)
    )
    return uniqueEditors.filter(editor => !busyEditors.has(editor)).sort()
  }, [data, uniqueEditors])

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

  return (
    <div className="relative">
      {/* The invisible stage for the delivery animation to overlay securely */}
      <div id="delivery-stage" className="absolute top-16 left-0 right-0 z-50 pointer-events-none"></div>

      {/* Top Bar: Title & Actions */}
      <div className="flex items-center justify-between mb-[16px] flex-wrap gap-[12px]">
        <div className="text-[20px] font-bold text-[var(--text-primary)]">All Videos</div>
        <div className="flex items-center gap-[10px] flex-wrap">
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
          <button className="bg-[var(--surface-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-[14px] py-[8px] rounded-[8px] text-[13px] font-semibold flex items-center gap-[6px] cursor-pointer hidden sm:flex">
            Sort ↕
          </button>
          <button className="bg-[var(--surface-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-[14px] py-[8px] rounded-[8px] text-[13px] font-semibold flex items-center gap-[6px] cursor-pointer hidden sm:flex">
            More filters ≡
          </button>
          <button className="bg-[var(--theme-accent)] border border-[var(--theme-accent)] text-[var(--theme-on-accent)] px-[14px] py-[8px] rounded-[8px] text-[13px] font-semibold flex items-center gap-[6px] cursor-pointer hidden sm:flex">
            Send Feedback
          </button>
          <div className="bg-[var(--surface-card-2)] border border-[var(--border)] text-[var(--text-muted)] w-[36px] h-[36px] rounded-[8px] flex items-center justify-center font-bold pb-1 hidden sm:flex cursor-pointer">
            ...
          </div>
        </div>
      </div>

      {/* Chip Row */}
      <div className="flex items-center gap-[10px] mb-[16px] flex-wrap">
        <div className="flex items-center gap-[8px] bg-[var(--surface-card-2)] border border-[var(--border)] rounded-[8px] px-[12px] py-[8px] text-[13px] color-[var(--text-muted)] min-w-[220px]">
          <Search className="h-[14px] w-[14px] text-[var(--text-muted)]" />
          <Input
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
                <button
                  key={editorName}
                  type="button"
                  className={`flex h-8 w-full items-center rounded-lg px-3 text-left font-medium transition-colors hover:bg-[#F3F5EE] dark:hover:bg-white/10 ${editorFilter === editorName ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                  onClick={() => { table.getColumn("editor")?.setFilterValue(editorName); setEditorMenuOpen(false); }}
                >
                  <span className="inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold" style={colorMaps.editors[editorName]}>
                    {editorName}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Idle Editors Panel */}
      <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-[12px] px-[18px] py-[14px] flex flex-wrap items-center gap-4 mb-[18px]">
        <div className="text-[13px] font-bold text-[var(--text-primary)] whitespace-nowrap flex items-center gap-[6px]">
          <span className="w-[7px] h-[7px] rounded-full bg-[#3FA75B] inline-block"></span>
          Idle Editors ({availableEditors.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {availableEditors.length > 0 ? (
            availableEditors.map(editor => (
              <span
                key={editor}
                className="inline-flex items-center px-[12px] py-[5px] rounded-full text-[12.5px] font-semibold whitespace-nowrap"
                style={colorMaps.editors[editor]}
              >
                {editor}
              </span>
            ))
          ) : (
            <span className="text-[12.5px] font-semibold text-[var(--text-secondary)] italic">None</span>
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
          <div ref={scrollRef} className="md:hidden flex flex-col gap-4 pb-24" style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
            {virtualItems.length ? (
               virtualItems.map((virtualRow: any) => {
                 const row = rows[virtualRow.index];
                 return (
                   <MemoizedMobileRow 
                     key={row.id} 
                     row={row} 
                     measureRef={virtualizer.measureElement}
                     dataIndex={virtualRow.index}
                     style={{
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       width: '100%',
                       transform: `translateY(${virtualRow.start}px)`,
                     }}
                   />
                 )
               })
            ) : (
              <div className="text-center py-10 text-[13px] font-medium text-[#11161B] dark:text-[#E6EAE0]/70">No videos found.</div>
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
            <TableRow className="border-b border-[var(--border)] bg-[var(--surface-card)] hover:bg-[var(--surface-card)]">
              <TableCell className="px-[16px] py-[8px] w-12"></TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  placeholder="Client..." 
                  list="client-suggestions"
                  value={client} onChange={e => setClient(e.target.value)}
                  className="h-[30px] rounded-[6px] border border-[var(--border-soft)] bg-[var(--surface-page)] px-[10px] text-[12.5px] text-[var(--text-faint)] shadow-none focus-visible:ring-1 focus-visible:text-[var(--text-primary)]"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input
                  placeholder="Subclient..."
                  list="subclient-suggestions"
                  value={subClient} onChange={e => setSubClient(e.target.value)}
                  className="h-[30px] rounded-[6px] border border-[var(--border-soft)] bg-[var(--surface-page)] px-[10px] text-[12.5px] text-[var(--text-faint)] shadow-none focus-visible:ring-1 focus-visible:text-[var(--text-primary)]"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  placeholder="Video Title..." 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="h-[30px] rounded-[6px] border border-[var(--border-soft)] bg-[var(--surface-page)] px-[10px] text-[12.5px] text-[var(--text-faint)] shadow-none focus-visible:ring-1 focus-visible:text-[var(--text-primary)]"
                  onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(e) }}
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  placeholder="Editor..." 
                  list="editor-suggestions"
                  value={editor} onChange={e => setEditor(e.target.value)}
                  className="h-[30px] rounded-[6px] border border-[var(--border-soft)] bg-[var(--surface-page)] px-[10px] text-[12.5px] text-[var(--text-faint)] shadow-none focus-visible:ring-1 focus-visible:text-[var(--text-primary)]"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  type="date"
                  value={startDay} 
                  onChange={e => setStartDay(e.target.value)}
                  className="h-[30px] w-[110px] rounded-[6px] border border-[var(--border-soft)] bg-[var(--surface-page)] px-[10px] text-[12.5px] text-[var(--text-faint)] shadow-none focus-visible:ring-1 focus-visible:text-[var(--text-primary)] [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Input 
                  type="date"
                  value={completeDay} 
                  onChange={e => setCompleteDay(e.target.value)}
                  className="h-[30px] w-[110px] rounded-[6px] border border-[var(--border-soft)] bg-[var(--surface-page)] px-[10px] text-[12.5px] text-[var(--text-faint)] shadow-none focus-visible:ring-1 focus-visible:text-[var(--text-primary)] [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-[var(--surface-page)] text-[var(--text-muted)]">
                  Auto
                </span>
              </TableCell>
              <TableCell className="px-[16px] py-[8px]">
                <Button 
                  onClick={handleQuickAdd} 
                  disabled={!title || !editor || isAdding}
                  className="btn-primary h-7 w-16 text-[11px] disabled:opacity-30"
                >
                  {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
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
      
      <div className="flex items-center justify-between px-[16px] py-[14px] border-t border-[var(--border)]">
        <button 
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-[var(--surface-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-[16px] py-[7px] rounded-[8px] text-[13px] font-semibold cursor-pointer disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-[var(--text-muted)] text-[13px]">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <button 
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-[var(--surface-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-[16px] py-[7px] rounded-[8px] text-[13px] font-semibold cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
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
