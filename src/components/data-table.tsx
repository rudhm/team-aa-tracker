"use client"

import * as React from "react"
import { formatName } from "@/lib/utils"
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
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { BoardView } from "@/components/board-view"
import { LayoutGrid, List } from "lucide-react"

import { celebrateDelivery } from "@/lib/delivery-celebration"

interface DataTableProps {
  columns: ColumnDef<VideoTask, any>[]
  data: VideoTask[]
}

export function DataTable({ columns, data }: DataTableProps) {
  const router = useRouter()
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [viewMode, setViewMode] = React.useState<'table' | 'board'>('table')
  
  // Quick-Add State
  const [client, setClient] = React.useState("")
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

  const uniqueClients = React.useMemo(() => {
    const clients = new Set(data.map(d => d.client).filter(Boolean))
    return Array.from(clients)
  }, [data])

  const table = useReactTable({
    data,
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
      updateData: async (rowIndex: number, columnIdOrUpdates: string | Record<string, any>, value?: any) => {
        const row = data[rowIndex]
        
        let updates: any = {}
        if (typeof columnIdOrUpdates === 'string') {
          updates[columnIdOrUpdates] = value
        } else {
          updates = columnIdOrUpdates
        }
        
        // Auto-set complete_date when status flips to Complete
        if (updates.status) {
          if (updates.status === 'Complete' && row.status !== 'Complete') {
            updates.complete_date = new Date().toISOString()
            
            // Trigger celebration animation!
            setTimeout(() => {
              celebrateDelivery(document.getElementById('delivery-stage'))
            }, 100)
          } else if (updates.status !== 'Complete' && row.status === 'Complete') {
            updates.complete_date = null
          }
        }
        
        await supabase.from('video_tasks').update(updates).eq('id', row.id)
        router.refresh()
      }
    }
  })

  const createDateFromInput = (str: string) => {
    if (!str) return null
    const parts = str.split('/')
    let y = new Date().getFullYear()
    let m = new Date().getMonth() + 1
    let d = parseInt(str)
    
    if (parts.length === 2) {
       m = parseInt(parts[0])
       d = parseInt(parts[1])
    } else {
       d = parseInt(parts[0])
    }
    
    if (isNaN(m) || isNaN(d) || d < 1 || d > 31 || m < 1 || m > 12) return null
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client || !title || !editor) return
    setIsAdding(true)

    const parsedComplete = createDateFromInput(completeDay)

    const payload = {
      client,
      video_title: title,
      editor: formatName(editor),
      start_date: createDateFromInput(startDay),
      complete_date: parsedComplete,
      status: parsedComplete ? 'Complete' : 'In progress',
    }

    await supabase.from('video_tasks').insert([payload])
    
    setClient("")
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#11161B]/30" />
            <Input
              placeholder="Search video titles…"
              value={(table.getColumn("video_title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("video_title")?.setFilterValue(event.target.value)
              }
              className="h-11 w-full sm:w-[280px] rounded-full border-none bg-white/50 backdrop-blur-md pl-11 pr-4 text-[13px] font-medium text-[#11161B] shadow-sm placeholder:text-[#11161B]/50 focus-visible:ring-2 focus-visible:ring-white"
            />
          </div>
          
          <div className="relative w-full sm:w-auto">
            <select 
              className="h-11 w-full sm:w-auto appearance-none rounded-full border-none bg-white/50 backdrop-blur-md pl-4 pr-10 text-[13px] font-medium text-[#11161B] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              value={(table.getColumn("editor")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("editor")?.setFilterValue(e.target.value)}
            >
              <option value="">All Editors</option>
              {uniqueEditors.map(ed => (
                <option key={ed} value={ed}>{ed}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#11161B]/60">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
            </div>
          </div>
        </div>

        <div className="flex justify-start sm:justify-end w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex items-center rounded-full border border-white/20 bg-white/40 backdrop-blur-md p-1 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setViewMode('table')}
              className={`flex h-9 flex-1 sm:flex-none items-center justify-center rounded-full px-4 text-[13px] font-semibold transition-colors ${viewMode === 'table' ? 'bg-[#F3F5EE] text-[#11161B]' : 'text-[#11161B]/40 hover:text-[#11161B]/70'}`}
            >
              <List className="mr-2 h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex h-9 flex-1 sm:flex-none items-center justify-center rounded-full px-4 text-[13px] font-semibold transition-colors ${viewMode === 'board' ? 'bg-[#F3F5EE] text-[#11161B]' : 'text-[#11161B]/40 hover:text-[#11161B]/70'}`}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Board
            </button>
          </div>
        </div>
      </div>

      <datalist id="editor-suggestions">
        {uniqueEditors.map(ed => <option key={ed} value={ed} />)}
      </datalist>
      <datalist id="client-suggestions">
        {uniqueClients.map(c => <option key={c} value={c} />)}
      </datalist>

      {viewMode === 'board' ? (
        <BoardView data={table.getCoreRowModel().rows.map(r => r.original)} />
      ) : (
      <div className="overflow-hidden rounded-[28px] border border-[#E6EAE0] bg-white shadow-sm overflow-x-auto w-full">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="border-b border-[#E6EAE0]/60 hover:bg-transparent">
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 px-6 text-[11px] font-semibold uppercase tracking-widest text-[#11161B]/35">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Quick-Add Row */}
            <TableRow className="border-b border-[#E6EAE0]/80 bg-[#F3F5EE]/30 hover:bg-[#F3F5EE]/50">
              <TableCell className="px-6 py-3 w-12"></TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="Client..." 
                  list="client-suggestions"
                  value={client} onChange={e => setClient(e.target.value)}
                  className="h-8 rounded-lg border-transparent bg-transparent px-2 text-[13px] font-semibold shadow-none focus-visible:bg-white focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="Video Title..." 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="h-8 rounded-lg border-transparent bg-transparent px-2 text-[13px] shadow-none focus-visible:bg-white focus-visible:ring-1"
                  onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(e) }}
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="Editor..." 
                  list="editor-suggestions"
                  value={editor} onChange={e => setEditor(e.target.value)}
                  className="h-8 rounded-lg border-transparent bg-transparent px-2 text-[13px] shadow-none focus-visible:bg-white focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="MM/DD"
                  value={startDay} 
                  onChange={e => setStartDay(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                  className="h-8 w-14 text-center rounded-lg border-transparent bg-transparent px-1 text-[13px] shadow-none focus-visible:bg-white focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <Input 
                  placeholder="MM/DD"
                  value={completeDay} 
                  onChange={e => setCompleteDay(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                  className="h-8 w-14 text-center rounded-lg border-transparent bg-transparent px-1 text-[13px] shadow-none focus-visible:bg-white focus-visible:ring-1"
                />
              </TableCell>
              <TableCell className="px-6 py-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-[#E6EAE0]/50 text-[#11161B]/40">
                  Auto
                </span>
              </TableCell>
              <TableCell className="px-6 py-3">
                <Button 
                  onClick={handleQuickAdd} 
                  disabled={!client || !title || !editor || isAdding}
                  className="h-7 w-16 rounded-full bg-[#11161B] text-[11px] font-semibold text-white transition-all hover:bg-[#11161B]/80 disabled:opacity-30"
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
                  className={`transition-colors duration-150 hover:bg-[#F3F5EE]/50 ${
                    i < table.getRowModel().rows.length - 1 ? "border-b border-[#E6EAE0]/40" : "border-0"
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
                <TableCell colSpan={columns.length} className="h-40 text-center text-[13px] font-medium text-[#11161B]/30">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedCount > 0 && viewMode === 'table' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4 rounded-full bg-[#11161B]/95 backdrop-blur-xl px-6 py-3 shadow-2xl border border-white/10">
            <span className="text-[13px] font-medium text-white/80">
              {selectedCount} {selectedCount === 1 ? 'video' : 'videos'} selected
            </span>
            <div className="w-px h-4 bg-white/20"></div>
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
