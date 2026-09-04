"use client"

import { useState, useEffect } from "react"
import { ColumnDef, RowData } from "@tanstack/react-table"
import { supabase } from "@/lib/supabase"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { formatName, getEditorColorClass } from "@/lib/utils"
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
    "Not started": { bg: "bg-[#F3F5EE] dark:bg-white/10",  text: "text-[#11161B] dark:text-[#E6EAE0]/70" },
  }
  const style = config[status] || config["Not started"]
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${style.bg} ${style.text} ${isLocked ? 'opacity-60' : ''}`}>
      {status}
    </span>
  )
}

const STATUSES = ['Not started', 'In progress', 'In review', 'Revision', 'Complete']

export function InlineTextEdit({ 
  value, 
  locked, 
  onUpdate,
  placeholder = "",
  listId,
  className = ""
}: { 
  value: string | null, 
  locked: boolean, 
  onUpdate: (val: string) => void,
  placeholder?: string,
  listId?: string,
  className?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState("")

  const startEdit = () => {
     if (locked) return
     setIsEditing(true)
     setText(value || "")
  }

  const saveEdit = () => {
     setIsEditing(false)
     if (text !== (value || "")) {
        onUpdate(text)
     }
  }

  if (isEditing) {
     return (
       <input
         autoFocus
         list={listId}
         placeholder={placeholder}
         className="h-7 w-full min-w-[120px] max-w-[180px] rounded-md bg-white dark:bg-[#161b22] border border-[#E6EAE0] dark:border-white/10 px-2 text-[13px] font-medium text-[#11161B] dark:text-[#E6EAE0] shadow-sm outline-none focus:ring-2 focus:ring-black/10"
         value={text}
         onChange={e => setText(e.target.value)}
         onBlur={saveEdit}
         onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
       />
     )
  }

  return (
    <span 
      onClick={startEdit} 
      className={`${className} transition-colors ${!locked ? 'cursor-pointer hover:text-[#11161B] dark:hover:text-[#E6EAE0] hover:underline decoration-[#11161B]/30 underline-offset-4' : ''}`}
      title={!locked ? "Click to edit" : ""}
    >
      {value || "—"}
    </span>
  )
}

export function InlineDayEdit({ value, locked, onUpdate }: { value: string | null, locked: boolean, onUpdate: (val: string | null) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [dateStr, setDateStr] = useState("")

  const displayValue = value ? new Date(value).toLocaleDateString("en-US", { timeZone: 'UTC', month: "short", day: "numeric" }) : "—"

  const startEdit = () => {
     if (locked) return
     setIsEditing(true)
     if (value && value.length >= 10) {
        const m = value.substring(5, 7)
        const d = value.substring(8, 10)
        setDateStr(`${m.replace(/^0/, '')}/${d.replace(/^0/, '')}`)
     } else {
        setDateStr("")
     }
  }

  const saveEdit = () => {
     setIsEditing(false)
     if (!dateStr) {
        if (value !== null) onUpdate(null)
        return
     }
     
     let year = new Date().getFullYear()
     let month = new Date().getMonth() + 1
     let day = parseInt(dateStr)
     
     if (value && value.length >= 10) {
        year = parseInt(value.substring(0, 4))
        month = parseInt(value.substring(5, 7))
     }
     
     const parts = dateStr.split('/')
     if (parts.length === 2) {
        month = parseInt(parts[0])
        day = parseInt(parts[1])
     } else {
        day = parseInt(parts[0])
     }
     
     if (isNaN(month) || isNaN(day) || day < 1 || day > 31 || month < 1 || month > 12) {
       return // Invalid, revert
     }

     const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
     
     if (newDate !== value?.substring(0, 10)) {
        onUpdate(newDate)
     }
  }

  if (isEditing) {
     return (
       <input
         autoFocus
         placeholder="MM/DD"
         className="h-7 w-14 rounded-md bg-white dark:bg-[#161b22] border border-[#E6EAE0] dark:border-white/10 px-1 text-center text-[12px] font-semibold text-[#11161B] dark:text-[#E6EAE0] shadow-sm outline-none focus:ring-2 focus:ring-black/10"
         value={dateStr}
         onChange={e => setDateStr(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
         onBlur={saveEdit}
         onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
       />
     )
  }

  return (
    <span 
      onClick={startEdit} 
      className={`font-medium tabular-nums transition-colors ${!locked ? 'cursor-pointer text-[#11161B] dark:text-[#E6EAE0]/70 hover:text-[#11161B] dark:hover:text-[#E6EAE0] hover:underline decoration-[#11161B]/30 underline-offset-4' : 'text-[#11161B] dark:text-[#E6EAE0]/70'}`}
      title={!locked ? "Click to edit date" : ""}
    >
      {displayValue}
    </span>
  )
}

export function InlineLinkEdit({ value, locked, onUpdate, isCompleted }: { value: string | null, locked: boolean, onUpdate: (val: string, newStatus?: string) => void, isCompleted: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState("")

  const startEdit = () => {
    if (locked) return
    setIsEditing(true)
    setText(value || "")
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText && pastedText.startsWith('http')) {
      e.preventDefault()
      setText(pastedText)
      setIsEditing(false)
      onUpdate(pastedText, !isCompleted ? 'Complete' : undefined)
    }
  }

  const saveEdit = () => {
    setIsEditing(false)
    if (text !== (value || "")) {
      onUpdate(text)
    }
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        placeholder="Paste URL..."
        className="h-8 w-full max-w-[180px] rounded-md bg-white dark:bg-[#161b22] border border-[#E6EAE0] dark:border-white/10 px-2 text-[12px] text-[#11161B] dark:text-[#E6EAE0] shadow-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={saveEdit}
        onPaste={handlePaste}
        onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
      />
    )
  }

  if (!value) {
    return (
      <span 
        onClick={startEdit} 
        className={`text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5 ${locked ? 'text-[#11161B] dark:text-[#E6EAE0]/20' : 'text-[#11161B] dark:text-[#E6EAE0]/70 hover:bg-[#F3F5EE] dark:bg-white/10 hover:text-[#11161B] dark:hover:text-[#E6EAE0] cursor-pointer border border-dashed border-[#E6EAE0] dark:border-white/10'}`}
      >
        <LinkIcon className="h-3 w-3" />
        Add Link
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <a 
        href={value} 
        target="_blank" 
        rel="noreferrer" 
        className="text-[12px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
      >
        <LinkIcon className="h-3 w-3" />
        Watch
      </a>
      {!locked && (
        <button 
          onClick={startEdit}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-[#11161B] dark:text-[#E6EAE0]/70 hover:text-[#11161B] dark:hover:text-[#E6EAE0] hover:bg-[#F3F5EE] dark:bg-white/10 rounded-full transition-all"
          title="Edit link"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </button>
      )}
    </div>
  )
}

export const columns: ColumnDef<VideoTask>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="rounded border-[#E6EAE0] dark:border-white/10 text-[#11161B] dark:text-[#E6EAE0] focus:ring-[#11161B]"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => {
      const task = row.original
      if (task.status === 'Complete') {
        return <div className="w-3.5 h-3.5" />
      }
      
      return (
        <input
          type="checkbox"
          className="rounded border-[#E6EAE0] dark:border-white/10 text-[#11161B] dark:text-[#E6EAE0] focus:ring-[#11161B]"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          disabled={task.payroll_locked}
        />
      )
    },
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row, table }) => {
      const task = row.original
      return (
        <InlineTextEdit 
          value={task.client}
          locked={task.payroll_locked}
          listId="client-suggestions"
          className="font-semibold text-[#11161B] dark:text-[#E6EAE0]"
          onUpdate={(val) => table.options.meta?.updateData(row.index, 'client', val)}
        />
      )
    },
  },
  {
    accessorKey: "video_title",
    header: "Video Title",
    cell: ({ row, table }) => {
      const task = row.original
      return (
        <InlineTextEdit 
          value={task.video_title}
          locked={task.payroll_locked}
          className="font-medium text-[#11161B] dark:text-[#E6EAE0]/70"
          onUpdate={(val) => table.options.meta?.updateData(row.index, 'video_title', val)}
        />
      )
    },
  },
  {
    accessorKey: "editor",
    header: "Editor",
    cell: ({ row, table }) => {
      const task = row.original
      const formattedName = formatName(task.editor)
      return (
        <InlineTextEdit 
          value={formattedName}
          locked={task.payroll_locked}
          listId="editor-suggestions"
          className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getEditorColorClass(formattedName)}`}
          onUpdate={(val) => table.options.meta?.updateData(row.index, 'editor', formatName(val))}
        />
      )
    },
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
          <DropdownMenuContent align="start" className="w-36 rounded-2xl border-[#E6EAE0] dark:border-white/10 bg-white dark:bg-[#161b22] p-1.5 shadow-lg">
            {STATUSES.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={async () => {
                  if (s !== status) {
                    await table.options.meta?.updateData(row.index, 'status', s)
                  }
                }}
                className="rounded-xl px-2 py-1.5 text-[12px] font-medium text-[#11161B] dark:text-[#E6EAE0]/70 focus:bg-[#F3F5EE] dark:bg-white/10"
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
      const isCompleted = task.status === "Complete"

      return (
        <InlineLinkEdit 
          value={task.link} 
          locked={task.payroll_locked} 
          isCompleted={isCompleted}
          onUpdate={async (newLink, newStatus) => {
            const updates: any = { link: newLink }
            if (newStatus) updates.status = newStatus
            await table.options.meta?.updateData(row.index, updates)
          }} 
        />
      )
    },
  },
]
