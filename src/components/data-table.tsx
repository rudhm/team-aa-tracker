"use client"

import * as React from "react"
import { createEntityColorMaps, formatName } from "@/lib/utils"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
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
import { ChevronDown, Loader2, Plus, RotateCcw, Search, X } from "lucide-react"
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

export function DataTable({ columns, data }: DataTableProps) {
  const router = useRouter()
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
    const clients = new Set(data.map(d => d.client).filter(Boolean))
    return Array.from(clients)
  }, [data])

  const uniqueSubClients = React.useMemo(() => {
    const subClients = new Set(data.map(d => d.sub_client).filter((subClient): subClient is string => Boolean(subClient)))
    return Array.from(subClients)
  }, [data])

  const colorMaps = React.useMemo(() => {
    return createEntityColorMaps({
      clients: tableData.map(task => task.client),
      subClients: tableData.map(task => task.sub_client),
      editors: tableData.map(task => formatName(task.editor)),
    })
  }, [tableData])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
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
      client,
      sub_client: subClient.trim() || null,
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
        complete_date: new Date().toISOString() 
      })
      .in('id', ids)
      
    // Trigger celebration animation!
    celebrateDelivery(document.getElementById('delivery-stage'))
      
    setRowSelection({})
    router.refresh()
  }

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="space-y-5 relative">
      {/* The invisible stage for the delivery animation to overlay securely */}
      <div id="delivery-stage" className="absolute top-16 left-0 right-0 z-50 pointer-events-none"></div>

      {/* Top Bar: Search & Editor Filter & View Toggle */}
      <div className="theme-toolbar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#11161B] dark:text-[#E6EAE0]/70" />
            <Input
              placeholder="Search video titles…"
              value={(table.getColumn("video_title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("video_title")?.setFilterValue(event.target.value)
              }
              className="h-[34px] w-full sm:w-[280px] rounded-lg border-none bg-[var(--surface-page)] pl-11 pr-4 text-[13px] font-medium text-[var(--text-primary)] shadow-sm placeholder:text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-black/10"
            />
          </div>
          
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              className="flex h-[34px] w-full items-center justify-between gap-3 rounded-lg border-none bg-[var(--surface-page)] pl-4 pr-3 text-left text-[13px] font-medium text-[var(--text-primary)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 sm:w-[190px]"
              onClick={() => setEditorMenuOpen(isOpen => !isOpen)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setEditorMenuOpen(false)
              }}
              onBlur={(event) => {
                if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) {
                  setEditorMenuOpen(false)
                }
              }}
            >
              {editorFilter ? (
                <span
                  className="inline-flex max-w-[135px] items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                  style={colorMaps.editors[editorFilter]}
                >
                  {editorFilter}
                </span>
              ) : (
                <span className="truncate">All Editors</span>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 text-[#11161B] dark:text-[#E6EAE0]/70" />
            </button>

            {editorMenuOpen && (
              <div
                className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-[280px] w-full min-w-[230px] overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-1.5 text-[13px] shadow-lg dark:bg-[#161b22]"
                onBlur={(event) => {
                  if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) {
                    setEditorMenuOpen(false)
                  }
                }}
              >
                <button
                  type="button"
                  className={`flex h-8 w-full items-center rounded-lg px-3 text-left font-semibold transition-colors hover:bg-[#F3F5EE] dark:hover:bg-white/10 ${!editorFilter ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    table.getColumn("editor")?.setFilterValue("")
                    setEditorMenuOpen(false)
                  }}
                >
                  All Editors
                </button>

                {visibleEditors.length ? (
                  visibleEditors.map(editorName => (
                    <div key={editorName} className="group flex items-center rounded-lg hover:bg-[#F3F5EE] dark:hover:bg-white/10">
                      <button
                        type="button"
                        className={`h-8 min-w-0 flex-1 truncate px-3 text-left font-medium ${editorFilter === editorName ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          table.getColumn("editor")?.setFilterValue(editorName)
                          setEditorMenuOpen(false)
                        }}
                      >
                        <span
                          className="inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                          style={colorMaps.editors[editorName]}
                        >
                          {editorName}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-secondary)] opacity-100 transition-colors hover:bg-white hover:text-[var(--text-primary)] dark:hover:bg-[#0d1117] sm:opacity-0 sm:group-hover:opacity-100"
                        title={`Hide ${editorName}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleHideEditor(editorName)
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-[12px] font-medium text-[var(--text-secondary)]">
                    No editors
                  </div>
                )}

                {hiddenEditorCount > 0 && (
                  <button
                    type="button"
                    className="mt-1 flex h-8 w-full items-center gap-2 rounded-lg border-t border-[var(--border)] px-3 text-left text-[12px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[#F3F5EE] hover:text-[var(--text-primary)] dark:hover:bg-white/10"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={handleRestoreHiddenEditors}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore hidden
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-start sm:justify-end w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-[var(--border)] p-[3px] w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setViewMode('table')}
              className={`flex h-7 flex-1 sm:flex-none items-center justify-center px-4 text-[13px] font-semibold transition-colors ${viewMode === 'table' ? 'tab-active' : 'tab-inactive'}`}
            >
              <List className="mr-2 h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex h-7 flex-1 sm:flex-none items-center justify-center px-4 text-[13px] font-semibold transition-colors ${viewMode === 'board' ? 'tab-active' : 'tab-inactive'}`}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Board
            </button>
          </div>
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
        <div className="md:hidden flex flex-col gap-4 pb-24">
          {table.getRowModel().rows?.length ? (
             table.getRowModel().rows.map(row => (
                <div key={row.id} className="rounded-xl theme-card p-5 shadow-sm flex flex-col relative overflow-hidden transition-all duration-200">
                   <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        {row.getVisibleCells().find(c => c.column.id === 'select') && row.original.status !== 'Complete' && (
                          <div className="scale-125 transform-gpu -mt-0.5">
                            {flexRender(row.getVisibleCells().find(c => c.column.id === 'select')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'select')?.getContext()!)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {flexRender(row.getVisibleCells().find(c => c.column.id === 'client')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'client')?.getContext()!)}
                          <div className="mt-1 text-[12px]">
                            {flexRender(row.getVisibleCells().find(c => c.column.id === 'sub_client')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'sub_client')?.getContext()!)}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 scale-90 origin-top-right">
                        {flexRender(row.getVisibleCells().find(c => c.column.id === 'status')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'status')?.getContext()!)}
                      </div>
                   </div>
                   
                   <div className="mb-5 text-[15px]">
                     {flexRender(row.getVisibleCells().find(c => c.column.id === 'video_title')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'video_title')?.getContext()!)}
                   </div>
                   
                   <div className="flex items-end justify-between mt-auto">
                     <div>
                       {flexRender(row.getVisibleCells().find(c => c.column.id === 'editor')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'editor')?.getContext()!)}
                     </div>
                     <div className="flex flex-col gap-1.5 items-end text-[11.5px]">
                       <div className="flex items-center gap-2 bg-[#F3F5EE] dark:bg-white/10 px-2 py-0.5 rounded-md">
                         <span className="text-[#11161B] dark:text-[#E6EAE0]/70 font-bold uppercase tracking-wider text-[9px]">Start</span>
                         {flexRender(row.getVisibleCells().find(c => c.column.id === 'start_date')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'start_date')?.getContext()!)}
                       </div>
                       <div className="flex items-center gap-2 bg-[#F3F5EE] dark:bg-white/10 px-2 py-0.5 rounded-md">
                         <span className="text-[#11161B] dark:text-[#E6EAE0]/70 font-bold uppercase tracking-wider text-[9px]">Done</span>
                         {flexRender(row.getVisibleCells().find(c => c.column.id === 'complete_date')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'complete_date')?.getContext()!)}
                       </div>
                     </div>
                   </div>
                   
                   {/* Mobile Link Rendering */}
                   <div className="mt-4 pt-3 border-t border-[#E6EAE0] dark:border-white/10/50">
                     {flexRender(row.getVisibleCells().find(c => c.column.id === 'link')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'link')?.getContext()!)}
                   </div>
                </div>
             ))
          ) : (
            <div className="text-center py-10 text-[13px] font-medium text-[#11161B] dark:text-[#E6EAE0]/70">No videos found.</div>
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-hidden rounded-xl theme-card shadow-sm overflow-x-auto w-full">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow className="border-b border-[#E6EAE0] dark:border-white/10/60 hover:bg-transparent">
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 px-6 text-[11px] font-semibold uppercase tracking-widest text-[#11161B] dark:text-[#E6EAE0]/70">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Quick-Add Row */}
            <TableRow className="border-b border-[#E6EAE0] dark:border-white/10/80 bg-[#F3F5EE] dark:bg-white/10 hover:bg-[#F3F5EE] dark:bg-white/10">
              <TableCell className="px-6 py-3 w-12"></TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="Client..." 
                  list="client-suggestions"
                  value={client} onChange={e => setClient(e.target.value)}
                  className="h-8 rounded-lg border-transparent bg-transparent px-2 text-[13px] font-semibold text-[#11161B] dark:text-[#E6EAE0] shadow-none focus-visible:bg-white dark:focus-visible:bg-[#161b22] focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input
                  placeholder="Subclient..."
                  list="subclient-suggestions"
                  value={subClient} onChange={e => setSubClient(e.target.value)}
                  className="h-8 rounded-lg border-transparent bg-transparent px-2 text-[13px] shadow-none focus-visible:bg-white dark:bg-[#161b22] focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="Video Title..." 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="h-8 rounded-lg border-transparent bg-transparent px-2 text-[13px] shadow-none focus-visible:bg-white dark:bg-[#161b22] focus-visible:ring-1"
                  onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(e) }}
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="Editor..." 
                  list="editor-suggestions"
                  value={editor} onChange={e => setEditor(e.target.value)}
                  className="h-8 rounded-lg border-transparent bg-transparent px-2 text-[13px] shadow-none focus-visible:bg-white dark:bg-[#161b22] focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="MM/DD"
                  value={startDay} 
                  onChange={e => setStartDay(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                  className="h-8 w-14 text-center rounded-lg border-transparent bg-transparent px-1 text-[13px] shadow-none focus-visible:bg-white dark:bg-[#161b22] focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="MM/DD"
                  value={completeDay} 
                  onChange={e => setCompleteDay(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                  className="h-8 w-14 text-center rounded-lg border-transparent bg-transparent px-1 text-[13px] shadow-none focus-visible:bg-white dark:bg-[#161b22] focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-[#E6EAE0]/50 text-[#11161B] dark:text-[#E6EAE0]/70">
                  Auto
                </span>
              </TableCell>
              <TableCell className="px-6 py-3">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`transition-colors duration-150 hover:bg-[#F3F5EE] dark:bg-white/10 ${
                    i < table.getRowModel().rows.length - 1 ? "border-b border-[#E6EAE0] dark:border-white/10/40" : "border-0"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4 text-[13px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-[13px] font-medium text-[#11161B] dark:text-[#E6EAE0]/70">
                  No videos found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
