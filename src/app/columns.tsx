"use client"

import React, { useState, useEffect } from "react"
import { ColumnDef, RowData } from "@tanstack/react-table"
import { supabase } from "@/lib/supabase"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createEntityColor, type EntityColorMaps, formatName, getEditorDotColor } from "@/lib/utils"
import { LinkIcon } from "lucide-react"

export type VideoTask = {
  id: string
  created_at: string
  client: string
  sub_client: string | null
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
    colorMaps?: EntityColorMaps
  }
}

function StatusBadge({ status, isLocked }: { status: string, isLocked: boolean }) {
  const config: Record<string, { bg: string; text: string; sdot: string }> = {
    "Complete":    { bg: "bg-[#E2F8EB] dark:bg-[#173822]", text: "text-emerald-700 dark:text-[#7ED396]", sdot: "bg-[#3FA75B]" },
    "In progress": { bg: "bg-[#E0E7FF] dark:bg-[#231E47]", text: "text-indigo-700 dark:text-[#A79BF0]", sdot: "bg-[#7C6FF0]" },
    "Revision":    { bg: "bg-[#FFF4E5] dark:bg-[#3A2E12]", text: "text-amber-700 dark:text-[#E8C46A]", sdot: "bg-[#D9A441]" },
  }
  const style = config[status] || config["In progress"]
  
  return (
    <span className={`inline-flex items-center gap-[6px] rounded-full py-[4px] px-[12px] text-[12px] font-bold ${style.bg} ${style.text}`}>
      <span className={`w-[6px] h-[6px] rounded-full ${style.sdot}`}></span>
      {status === 'Complete' ? 'Completed' : status}
    </span>
  )
}

const STATUSES = ['In progress', 'Revision', 'Complete']

export function InlineTextEdit({ 
  value, 
  locked, 
  onUpdate,
  placeholder = "",
  listId,
  className = "",
  emptyContent = "—",
  style,
  prefix,
}: { 
  value: string | null, 
  locked: boolean, 
  onUpdate: (val: string) => void,
  placeholder?: string,
  listId?: string,
  className?: string,
  emptyContent?: React.ReactNode,
  style?: React.CSSProperties,
  prefix?: React.ReactNode,
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
      className={`${className} transition-colors flex items-center gap-1.5 ${!locked ? 'cursor-pointer hover:text-[#11161B] dark:hover:text-[#E6EAE0]' : ''}`}
      style={style}
      title={!locked ? "Click to edit" : ""}
    >
      {prefix}
      <span className={!locked ? 'hover:underline decoration-[#11161B]/30 underline-offset-4' : ''}>
        {value || emptyContent}
      </span>
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
        setDateStr(value.substring(0, 10))
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
     if (dateStr !== value?.substring(0, 10)) {
        onUpdate(dateStr)
     }
  }

  if (isEditing) {
     return (
         <input
         type="text"
         placeholder="Date"
         autoFocus
         className="h-7 w-[110px] rounded-md bg-white dark:bg-[#161b22] border border-[#E6EAE0] dark:border-white/10 px-1 text-center text-[12px] font-semibold text-[#11161B] dark:text-[#E6EAE0] shadow-sm outline-none focus:ring-2 focus:ring-black/10 [&::-webkit-calendar-picker-indicator]:dark:invert"
         value={dateStr}
         onChange={e => setDateStr(e.target.value)}
         onFocus={e => { e.target.type = "date"; e.target.showPicker?.(); }}
         onBlur={e => { if (!e.target.value) e.target.type = "text"; saveEdit(); }}
         onKeyDown={e => { if (e.key === "Enter") saveEdit() }}
       />
     )
  }

  return (
    <span 
      onClick={startEdit} 
      className={`font-medium tabular-nums transition-colors ${!locked ? 'cursor-pointer text-[#11161B]/60 dark:text-[#E6EAE0]/50 hover:text-[#11161B] dark:hover:text-[#E6EAE0] hover:underline decoration-[#11161B]/30 underline-offset-4' : 'text-[#11161B]/60 dark:text-[#E6EAE0]/50'}`}
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
      const isUrl = text.trim().startsWith('http')
      onUpdate(text, (isUrl && !isCompleted) ? 'Complete' : undefined)
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
        className={`text-[12.5px] font-semibold px-[10px] py-[4px] rounded-[6px] transition-colors inline-block ${locked ? 'text-[var(--text-faint)]' : 'text-[var(--text-faint)] cursor-pointer border border-dashed border-[var(--border)]'}`}
      >
        + Add Link
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <a 
        href={value} 
        target="_blank" 
        rel="noreferrer" 
        className="text-[12.5px] font-semibold text-[var(--theme-accent)] hover:underline"
      >
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

function CustomCheckbox({ checked, onChange, disabled }: { checked: boolean, onChange: () => void, disabled?: boolean }) {
  return (
    <div 
      onClick={() => !disabled && onChange()}
      className={`w-[16px] h-[16px] rounded-[5px] border-[1.5px] inline-flex items-center justify-center relative ${checked ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)]' : 'border-[var(--border)]'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#241a05]">✓</span>}
    </div>
  )
}

export const columns: ColumnDef<VideoTask>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <CustomCheckbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={() => table.toggleAllPageRowsSelected()}
      />
    ),
    cell: ({ row }) => {
      const task = row.original
      return (
        <CustomCheckbox
          checked={row.getIsSelected()}
          onChange={() => row.toggleSelected()}
          disabled={task.payroll_locked}
        />
      )
    },
  },
  {
    id: "client",
    accessorKey: "sub_client",
    header: "Client",
    cell: ({ row, table }) => {
      const task = row.original
      if (!task.sub_client) {
        return <span className="text-[13px] text-[var(--text-faint)]">—</span>
      }

      const clientColor = table.options.meta?.colorMaps?.clients[task.sub_client] ?? createEntityColor(task.sub_client, "client")
      const initials = task.sub_client.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || task.sub_client.substring(0, 2).toUpperCase()

      return (
        <div className="flex items-center gap-[10px]">
          <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center text-[12px] font-bold shrink-0" style={clientColor}>
            {initials}
          </div>
          <InlineTextEdit 
            value={task.sub_client}
            locked={task.payroll_locked}
            listId="client-suggestions"
            className="font-bold text-[13.8px] text-[var(--text-primary)]"
            emptyContent="—"
            onUpdate={(val) => table.options.meta?.updateData(row.index, 'sub_client', val.trim() || null)}
          />
        </div>
      )
    },
  },
  {
    id: "sub_client",
    accessorKey: "client",
    header: "Subclient",
    cell: ({ row, table }) => {
      const task = row.original
      const subClientColor = task.client
        ? table.options.meta?.colorMaps?.subClients[task.client] ?? createEntityColor(task.client, "subclient")
        : undefined
      return (
        <InlineTextEdit
          value={task.client}
          locked={task.payroll_locked}
          listId="subclient-suggestions"
          className={task.client
            ? "inline-flex max-w-[180px] items-center justify-center truncate rounded-full px-[12px] py-[5px] text-[12.5px] font-semibold"
            : "text-[13px] text-[var(--text-faint)]"
          }
          style={subClientColor}
          emptyContent="—"
          onUpdate={(val) => table.options.meta?.updateData(row.index, 'client', val.trim() || "")}
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
          className="font-semibold text-[var(--text-primary)] text-[13.5px] block truncate max-w-[230px]"
          onUpdate={(val) => table.options.meta?.updateData(row.index, 'video_title', val)}
        />
      )
    },
  },
  {
    accessorKey: "editor",
    header: "EDITOR",
    cell: ({ row, table }) => {
      const task = row.original
      const formattedName = formatName(task.editor)
      const dotColor = getEditorDotColor(formattedName)
      
      return (
        <InlineTextEdit 
          value={formattedName}
          locked={task.payroll_locked}
          listId="editor-suggestions"
          className="text-[13px] font-semibold text-[var(--text-primary)]"
          emptyContent=""
          prefix={formattedName ? (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          ) : undefined}
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
