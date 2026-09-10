"use client"

import React, { useState } from "react"
import { ColumnDef, RowData } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createEntityColor, type EntityColorMaps, formatName, getEditorDotColor } from "@/lib/utils"
import type { Database } from "@/types/database"

export type VideoTask = Database["public"]["Tables"]["video_tasks"]["Row"]

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData: (rowId: string, columnIdOrUpdates: string | Record<string, unknown>, value?: unknown) => Promise<void>
    colorMaps?: EntityColorMaps
  }
}
function normalizeUrl(value: string) {
  let url = value.trim()
  if (url && !/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }
  return url
}

function isValidVideoUrl(value: string) {
  try {
    const url = new URL(normalizeUrl(value))
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; sdot: string }> = {
    "Complete":    { bg: "bg-[#E2F8EB] dark:bg-[#173822]", text: "text-emerald-800 dark:text-emerald-200", sdot: "bg-[#3FA75B]" },
    "In progress": { bg: "bg-[#FEE2E2] dark:bg-[#451A1A]", text: "text-red-800 dark:text-red-200", sdot: "bg-[#EF4444]" },
    "Revision":    { bg: "bg-[#FEF3C7] dark:bg-[#423114]", text: "text-yellow-800 dark:text-yellow-200", sdot: "bg-[#F59E0B]" },
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
  emptyContent = <span className="text-3xl font-bold opacity-40">—</span>,
  style,
  prefix,
  truncate = false,
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
  truncate?: boolean,
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
         className="h-7 w-full min-w-[120px] max-w-[180px] rounded-md bg-[var(--surface-page)] border border-[var(--border-soft)] px-2 text-[13px] font-medium text-[var(--text-primary)] shadow-sm outline-none focus:ring-2 focus:ring-black/10"
         value={text}
         onChange={e => setText(e.target.value)}
         onBlur={saveEdit}
         onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
       />
     )
  }

  const tooltipText = value 
    ? (locked ? value : `${value} (Click to edit)`) 
    : (!locked ? "Click to edit" : undefined);

  return (
    <button
      type="button"
      onClick={startEdit}
      disabled={locked}
      className={`${className} text-left transition-colors ${prefix ? 'flex items-center gap-1.5' : ''} ${!locked ? 'cursor-pointer hover:text-[var(--text-primary)]' : ''} disabled:cursor-default`}
      style={style}
      title={tooltipText}
    >
      {prefix}
      <span className={`${!locked ? 'hover:underline decoration-[#11161B]/30 underline-offset-4' : ''} ${truncate ? 'block truncate' : ''}`}>
        {value || emptyContent}
      </span>
    </button>
  )
}

export function InlineDayEdit({ value, locked, onUpdate, otherDate, isStartDate = false }: { value: string | null, locked: boolean, onUpdate: (val: string | null) => void, otherDate?: string | null, isStartDate?: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [dateStr, setDateStr] = useState("")
  const [validationError, setValidationError] = useState("")

  const displayValue = value ? new Date(value).toLocaleDateString("en-US", { timeZone: 'UTC', month: "short", day: "numeric" }) : <span className="text-3xl font-bold opacity-40">—</span>

  const startEdit = () => {
     if (locked) return
     setIsEditing(true)
     setValidationError("")
     if (value && value.length >= 10) {
        setDateStr(value.substring(0, 10))
     } else {
        setDateStr("")
     }
  }

  const saveEdit = () => {
     if (dateStr && otherDate) {
       const d1 = new Date(dateStr)
       const d2 = new Date(otherDate)
       if ((isStartDate && d1 > d2) || (!isStartDate && d1 < d2)) {
         setValidationError(isStartDate ? "Start Date cannot be later than Complete Date." : "Complete Date cannot be earlier than Start Date.")
         return
       }
       if (d1.getUTCMonth() !== d2.getUTCMonth() || d1.getUTCFullYear() !== d2.getUTCFullYear()) {
         setValidationError("Start Date and Complete Date must be in the same month.")
         return
       }
     }
     setIsEditing(false)
     setValidationError("")
     if (dateStr) {
       onUpdate(dateStr)
     } else {
       onUpdate(null)
     }
  }

  if (isEditing) {
     return (
       <div className="flex flex-col gap-1">
         <input
           type="date"
           autoFocus
           className={`h-7 w-full max-w-[130px] rounded-md bg-[var(--surface-page)] border px-2 text-[12px] text-[var(--text-primary)] shadow-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 [&::-webkit-calendar-picker-indicator]:dark:invert ${validationError ? 'border-red-400' : 'border-[var(--border-soft)]'}`}
           value={dateStr}
           onChange={e => { setDateStr(e.target.value); setValidationError("") }}
           onBlur={saveEdit}
           onKeyDown={e => {
             if (e.key === 'Enter') saveEdit()
             if (e.key === 'Escape') { setIsEditing(false); setValidationError("") }
           }}
         />
         {validationError && (
           <span role="alert" className="text-[11px] text-red-500 font-medium max-w-[200px] leading-tight">{validationError}</span>
         )}
       </div>
     )
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      disabled={locked}
      className={`text-left text-[12.5px] transition-colors ${!locked ? 'cursor-pointer hover:text-[var(--text-primary)]' : ''} ${!value ? 'text-[var(--text-faint)] italic' : 'font-medium text-[var(--text-secondary)]'} disabled:cursor-default`}
      title={!locked ? "Click to edit" : ""}
    >
      <span className={!locked ? 'hover:underline decoration-[#11161B]/30 underline-offset-4' : ''}>
        {displayValue}
      </span>
    </button>
  )
}

export function InlineLinkEdit({ value, locked, onUpdate, isCompleted }: { value: string | null, locked: boolean, onUpdate: (val: string | null, updateStatus?: 'Complete') => void, isCompleted: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState("")

  const startEdit = () => {
    if (locked) return
    setIsEditing(true)
    setText(value || "")
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text').trim()
    if (isValidVideoUrl(pastedText)) {
      e.preventDefault()
      const normalized = normalizeUrl(pastedText)
      setText(normalized)
      setIsEditing(false)
      onUpdate(normalized, !isCompleted ? 'Complete' : undefined)
    }
  }

  const saveEdit = () => {
    setIsEditing(false)
    if (text !== (value || "")) {
      const trimmedText = text.trim()
      if (trimmedText) {
        if (!isValidVideoUrl(trimmedText)) {
          setText(value || "")
          return
        }
        const normalized = normalizeUrl(trimmedText)
        onUpdate(normalized, !isCompleted ? 'Complete' : undefined)
      } else {
        onUpdate(null)
      }
    }
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        placeholder="Paste URL..."
        className="h-8 w-full max-w-[180px] rounded-md bg-[var(--surface-page)] border border-[var(--border-soft)] px-2 text-[12px] text-[var(--text-primary)] shadow-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
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
      <button
        type="button"
        onClick={startEdit}
        disabled={locked}
        className={`text-left text-[12.5px] font-semibold px-[10px] py-[4px] rounded-[6px] transition-colors inline-block ${locked ? 'text-[var(--text-faint)]' : 'text-[var(--text-faint)] cursor-pointer border border-dashed border-[var(--border)]'}`}
      >
        + Add Link
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 group">
      <a 
        href={value} 
        target="_blank" 
        rel="noreferrer" 
        className="text-[12.5px] font-semibold text-[var(--theme-accent)] hover:underline px-2 py-2"
      >
        Watch
      </a>
      {!locked && (
        <button 
          onClick={startEdit}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 w-[36px] h-[36px] flex items-center justify-center text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)] rounded-full transition-all shrink-0"
          title="Edit link"
          aria-label="Edit link"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </button>
      )}
    </div>
  )
}

function CustomCheckbox({ checked, onChange, disabled, ariaLabel }: { checked: boolean, onChange: () => void, disabled?: boolean, ariaLabel?: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? (checked ? "Deselect row" : "Select row")}
      aria-pressed={checked}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      className={`h-[18px] w-[18px] rounded-[4px] border-[1.5px] inline-flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A441] ${checked ? 'bg-[#D9A441] border-[#D9A441]' : 'bg-[var(--surface-page)] border-[var(--border-strong)] hover:border-[var(--text-secondary)]'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#241a05" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </button>
  )
}

export const columns: ColumnDef<VideoTask>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <CustomCheckbox
        checked={table.getIsAllPageRowsSelected()}
        ariaLabel="Select all rows"
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
      const clientColor = task.sub_client ? (table.options.meta?.colorMaps?.clients[task.sub_client] ?? createEntityColor(task.sub_client, "client")) : { backgroundColor: 'transparent' }
      const initials = task.sub_client ? (task.sub_client.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || task.sub_client.substring(0, 2).toUpperCase()) : ""

      return (
        <div className="flex items-center gap-[10px]">
          {!!task.sub_client && (
            <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center text-[12px] font-bold shrink-0" style={clientColor}>
              {initials}
            </div>
          )}
          <InlineTextEdit 
            value={task.sub_client}
            locked={task.payroll_locked}
            listId="client-suggestions"
            className={`font-bold text-[13.8px] ${task.sub_client ? 'text-[var(--text-primary)]' : 'text-[var(--text-faint)]'}`}
            onUpdate={(val) => table.options.meta?.updateData(row.original.id, 'sub_client', val.trim() || null)}
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
          onUpdate={(val) => table.options.meta?.updateData(row.original.id, 'client', val.trim() || "")}
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
          className="font-semibold text-[var(--text-primary)] text-[13.5px] max-w-[230px]"
          truncate={true}
          onUpdate={(val) => table.options.meta?.updateData(row.original.id, 'video_title', val)}
        />
      )
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row, table }) => {
      const task = row.original
      return (
        <InlineTextEdit 
          value={task.duration}
          locked={task.payroll_locked}
          placeholder="duration"
          className="text-[12.5px] text-[var(--text-secondary)] font-medium tabular-nums"
          onUpdate={(val) => table.options.meta?.updateData(row.original.id, 'duration', val)}
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
          className={`text-[13px] font-semibold ${formattedName ? 'text-[var(--text-primary)]' : 'text-[var(--text-faint)]'}`}
          prefix={formattedName ? (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          ) : undefined}
          onUpdate={(val) => table.options.meta?.updateData(row.original.id, 'editor', formatName(val))}
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
          otherDate={task.complete_date}
          isStartDate
          onUpdate={(val) => table.options.meta?.updateData(row.original.id, 'start_date', val)} 
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
          otherDate={task.start_date}
          onUpdate={(val) => {
            // If they manually set a complete date, we should also auto-flip status to Complete!
            const updates: Record<string, unknown> = { complete_date: val }
            if (val && task.status !== 'Complete') updates.status = 'Complete'
            if (!val && task.status === 'Complete') updates.status = 'In progress'
            table.options.meta?.updateData(row.original.id, updates)
          }} 
        />
      )
    }
  },
  {
    accessorKey: "is_urgent",
    header: "Priority",
    cell: ({ row, table }) => {
      const task = row.original
      const isDisabled = task.payroll_locked || task.status === 'Complete'

      return (
        <button
          type="button"
          onClick={() => {
            if (!isDisabled) {
              table.options.meta?.updateData(row.original.id, 'is_urgent', !task.is_urgent)
            }
          }}
          disabled={isDisabled}
          title={task.status === 'Complete' ? "Completed videos cannot be urgent" : task.is_urgent ? "Mark as normal" : "Mark as urgent"}
          className={`flex items-center justify-center transition-all ${
            task.is_urgent 
              ? 'gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-red-600' 
              : 'h-6 w-6 rounded-md text-[var(--text-faint)] hover:bg-[var(--surface-card-2)] hover:text-[var(--text-secondary)]'
          } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {task.is_urgent ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              Urgent
            </>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          )}
        </button>
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
        return <StatusBadge status={status} />
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <StatusBadge status={status} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36 rounded-2xl border-[var(--border-soft)] bg-[#F5EFDD]/85 dark:bg-[#0E0E11]/85 backdrop-blur-xl p-1.5 shadow-lg">
            {STATUSES.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={async () => {
                  if (s !== status) {
                    await table.options.meta?.updateData(row.original.id, 'status', s)
                  }
                }}
                className="rounded-xl px-2 py-1.5 text-[12px] font-medium text-[var(--text-primary)]/70 focus:bg-[var(--row-hover)]"
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
            const updates: Record<string, unknown> = { link: newLink }
            if (newStatus) updates.status = newStatus
            await table.options.meta?.updateData(row.original.id, updates)
          }} 
        />
      )
    },
  },
]
