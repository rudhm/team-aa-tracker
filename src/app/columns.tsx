"use client"

import { useState, useEffect } from "react"
import { ColumnDef, RowData } from "@tanstack/react-table"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { LinkIcon } from "lucide-react"

export type VideoTask = {
  id: string
  created_at: string
  client: string
  video_title: string
  editor: string
  start_date: string | null
  complete_date: string | null
  status: string
  link: string | null
  delivered_at: string | null
  payroll_locked: boolean
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnIdOrUpdates: string | Record<string, any>, value?: any) => Promise<void>
  }
}

function StatusBadge({ status, isLocked }: { status: string, isLocked: boolean }) {
  const config: Record<string, { bg: string; text: string }> = {
    "Complete":    { bg: "bg-[#E2F8EB]", text: "text-emerald-700" },
    "In progress": { bg: "bg-[#FEF9C3]", text: "text-amber-700" },
    "In review":   { bg: "bg-blue-50",    text: "text-blue-600" },
    "Revision":    { bg: "bg-purple-50",  text: "text-purple-600" },
    "Not started": { bg: "bg-[#F3F5EE]",  text: "text-[#11161B]/50" },
  }
  const style = config[status] || config["Not started"]
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${style.bg} ${style.text} ${isLocked ? 'opacity-60' : ''}`}>
      {status}
    </span>
  )
}

const STATUSES = ['Not started', 'In progress', 'In review', 'Revision', 'Complete']

function InlineDayEdit({ value, locked, onUpdate }: { value: string | null, locked: boolean, onUpdate: (val: string | null) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [day, setDay] = useState("")

  const displayValue = value ? new Date(value).toLocaleDateString("en-US", { timeZone: 'UTC', month: "short", day: "numeric" }) : "—"

  const startEdit = () => {
     if (locked) return
     setIsEditing(true)
     if (value && value.length >= 10) {
        setDay(value.substring(8, 10))
     } else {
        setDay("")
     }
  }

  const saveEdit = () => {
     setIsEditing(false)
     if (!day) {
        if (value !== null) onUpdate(null)
        return
     }
     
     let year = new Date().getFullYear()
     let month = new Date().getMonth() + 1
     
     if (value && value.length >= 10) {
        year = parseInt(value.substring(0, 4))
        month = parseInt(value.substring(5, 7))
     }
     
     const parsedDay = parseInt(day)
     if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
       // Invalid day, silently revert
       return
     }

     const newDate = `${year}-${String(month).padStart(2, '0')}-${String(parsedDay).padStart(2, '0')}`
     
     if (newDate !== value?.substring(0, 10)) {
        onUpdate(newDate)
     }
  }

  if (isEditing) {
     return (
       <input
         autoFocus
         placeholder="DD"
         className="h-7 w-12 rounded-md bg-white border border-[#E6EAE0] px-1 text-center text-[12px] font-semibold text-[#11161B] shadow-sm outline-none focus:ring-2 focus:ring-black/10"
         value={day}
         onChange={e => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
         onBlur={saveEdit}
         onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
       />
     )
  }

  return (
    <span 
      onClick={startEdit} 
      className={`font-medium tabular-nums transition-colors ${!locked ? 'cursor-pointer text-[#11161B]/60 hover:text-[#11161B] hover:underline decoration-[#11161B]/30 underline-offset-4' : 'text-[#11161B]/40'}`}
      title={!locked ? "Click to edit day" : ""}
    >
      {displayValue}
    </span>
  )
}

export const columns: ColumnDef<VideoTask>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="rounded border-[#E6EAE0] text-[#11161B] focus:ring-[#11161B]"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="rounded border-[#E6EAE0] text-[#11161B] focus:ring-[#11161B]"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        disabled={row.original.payroll_locked}
      />
    ),
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => (
      <span className="font-semibold text-[#11161B]">{row.getValue("client")}</span>
    ),
  },
  {
    accessorKey: "video_title",
    header: "Video Title",
    cell: ({ row }) => (
      <span className="font-medium text-[#11161B]/70">{row.getValue("video_title")}</span>
    ),
  },
  {
    accessorKey: "editor",
    header: "Editor",
    cell: ({ row }) => (
      <span className="font-medium text-[#11161B]/50">{row.getValue("editor")}</span>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row, table }) => {
      const task = row.original
      return (
        <InlineDayEdit 
          value={task.start_date} 
          locked={task.payroll_locked} 
          onUpdate={(val) => table.options.meta?.updateData(row.index, 'start_date', val)} 
        />
      )
    }
  },
  {
    accessorKey: "complete_date",
    header: "Complete Date",
    cell: ({ row, table }) => {
      const task = row.original
      return (
        <InlineDayEdit 
          value={task.complete_date} 
          locked={task.payroll_locked} 
          onUpdate={(val) => {
            // If they manually set a complete date, we should also auto-flip status to Complete!
            const updates: any = { complete_date: val }
            if (val && task.status !== 'Complete') updates.status = 'Complete'
            table.options.meta?.updateData(row.index, updates)
          }} 
        />
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const task = row.original
      const status = task.status

      if (task.payroll_locked) {
        return <StatusBadge status={status} isLocked={true} />
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <StatusBadge status={status} isLocked={false} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36 rounded-2xl border-[#E6EAE0] bg-white p-1.5 shadow-lg">
            {STATUSES.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={async () => {
                  if (s !== status) {
                    await table.options.meta?.updateData(row.index, 'status', s)
                  }
                }}
                className="rounded-xl px-2 py-1.5 text-[12px] font-medium text-[#11161B]/70 focus:bg-[#F3F5EE]"
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ row, table }) => {
      const task = row.original
      const [localValue, setLocalValue] = useState(task.link || "")
      const isCompleted = task.status === "Complete"

      // Sync local state if prop changes from outside
      useEffect(() => {
        setLocalValue(task.link || "")
      }, [task.link])

      if (task.payroll_locked) {
        return (
          <a href={task.link || "#"} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">
            {task.link ? "View" : ""}
          </a>
        )
      }

      const handlePaste = async (e: React.ClipboardEvent) => {
        const pastedText = e.clipboardData.getData('text')
        if (pastedText && pastedText.startsWith('http')) {
          e.preventDefault()
          setLocalValue(pastedText)
          
          const updates: any = { link: pastedText }
          if (!isCompleted) {
            updates.status = 'Complete'
          }
          
          await table.options.meta?.updateData(row.index, updates)
        }
      }

      const handleBlur = async () => {
        if (localValue !== task.link) {
          await table.options.meta?.updateData(row.index, 'link', localValue)
        }
      }

      return (
        <div className="relative group">
          {(!isCompleted && !localValue) ? (
             <div className="flex h-7 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Input 
                  placeholder="Paste link..." 
                  className="h-7 w-28 rounded-full border-none bg-white/50 backdrop-blur-md px-3 text-[11px] shadow-none placeholder:text-[#11161B]/50 focus-visible:ring-1 focus-visible:ring-white"
                  onPaste={handlePaste}
                  onChange={(e) => setLocalValue(e.target.value)}
                  onBlur={handleBlur}
                  value={localValue}
                />
             </div>
          ) : (
            <Input 
              placeholder="https://..." 
              className={`h-7 w-32 rounded-full border-none bg-transparent px-3 text-[11px] shadow-none focus-visible:ring-0 ${localValue ? 'text-blue-600 underline' : 'text-[#11161B]/30'}`}
              onPaste={handlePaste}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleBlur}
              value={localValue}
            />
          )}
        </div>
      )
    },
  },
]
