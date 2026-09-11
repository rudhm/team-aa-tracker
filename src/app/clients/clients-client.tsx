"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import Link from "next/link"

type Entry = Database['public']['Tables']['predefined_clients']['Row']

function Section({
  title,
  entries,
  type,
  onAdd,
  onDelete,
  isAdding,
}: {
  title: string
  entries: Entry[]
  type: 'client' | 'sub_client' | 'editor'
  onAdd: (name: string, type: 'client' | 'sub_client' | 'editor', email?: string) => void
  onDelete: (id: string) => void
  isAdding: boolean
}) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [localError, setLocalError] = React.useState("")

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setLocalError("")
    onAdd(trimmed, type, type === 'editor' ? email : undefined)
    setName("")
    setEmail("")
  }

  return (
    <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl shadow-sm border border-[var(--border)]">
      <h2 className="text-[15px] font-bold mb-4 text-[var(--text-primary)]">{title}</h2>
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setLocalError("") }}
            placeholder={`Add ${title.toLowerCase()}…`}
            className="flex-1 h-9 rounded-md border border-[var(--border)] px-3 text-sm focus:ring-1 focus:ring-[var(--theme-accent)] outline-none bg-[var(--surface-page)]"
            onKeyDown={e => {
              if (e.key === 'Enter' && name.trim()) {
                handleAdd()
              }
            }}
          />
          <button
            onClick={handleAdd}
            disabled={isAdding || !name.trim()}
            className="bg-[var(--theme-accent)] text-[#241a05] px-4 h-9 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-[#F2CD60] transition-colors"
          >
            Add
          </button>
        </div>
        {type === 'editor' && (
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="w-full h-9 rounded-md border border-[var(--border)] px-3 text-sm focus:ring-1 focus:ring-[var(--theme-accent)] outline-none bg-[var(--surface-page)] mt-1"
            onKeyDown={e => {
              if (e.key === 'Enter' && name.trim()) {
                handleAdd()
              }
            }}
          />
        )}
      </div>
      {localError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-2">{localError}</p>
      )}
      <ul className="space-y-2 max-h-[300px] overflow-y-auto">
        {entries.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] italic">None added yet.</p>
        )}
        {entries.map(c => (
          <li key={c.id} className="flex justify-between items-center bg-[var(--surface-card-2)] px-3 py-2.5 rounded-lg border border-[var(--border-soft)]">
            <span className="font-medium text-sm text-[var(--text-primary)]">{c.name}</span>
            <button
              onClick={() => onDelete(c.id)}
              className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ClientsPageClient({ initialEntries }: { initialEntries: Entry[] }) {
  const router = useRouter()
  const [entries, setEntries] = React.useState<Entry[]>(initialEntries)
  const [isAdding, setIsAdding] = React.useState(false)
  const [globalError, setGlobalError] = React.useState("")

  const handleAdd = async (name: string, type: 'client' | 'sub_client' | 'editor', email?: string) => {
    setIsAdding(true)
    setGlobalError("")
    const { data, error } = await supabase
      .from('predefined_clients')
      .insert([{ name: name.trim(), type, email: email?.trim() || null }])
      .select()
    if (error) {
      setGlobalError("Failed to add entry: " + error.message)
    } else if (data) {
      setEntries(prev => [...prev, ...data].sort((a, b) => a.name.localeCompare(b.name)))
      router.refresh()
    }
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    setGlobalError("")
    const { error } = await supabase
      .from('predefined_clients')
      .delete()
      .eq('id', id)
    if (error) {
      setGlobalError("Failed to delete entry: " + error.message)
    } else {
      setEntries(prev => prev.filter(e => e.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)]">
      <header className="sticky top-0 z-40 bg-[#181715]/80 dark:bg-black/80 backdrop-blur-md text-white border-b border-[var(--border)]">
        <div className="mx-auto flex h-[56px] max-w-[1920px] items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-[14px]">
            <Link href="/" className="text-[15px] font-semibold text-[var(--theme-accent)] no-underline hover:text-white transition-colors">
              ← Dashboard
            </Link>
            <div className="w-px h-4 bg-[#3a3936] hidden sm:block" />
            <div className="text-[#d8d5cd] text-[14px] font-semibold hidden sm:block">Manage</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-8 py-10 w-full flex-1">
        <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Manage</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Names added here will appear in Quick Add suggestions on the dashboard, even before any videos are created.
        </p>

        {globalError && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {globalError}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Section
            title="Clients"
            entries={entries.filter(e => e.type === 'sub_client')}
            type="sub_client"
            onAdd={handleAdd}
            onDelete={handleDelete}
            isAdding={isAdding}
          />
          <Section
            title="Sub-clients"
            entries={entries.filter(e => e.type === 'client')}
            type="client"
            onAdd={handleAdd}
            onDelete={handleDelete}
            isAdding={isAdding}
          />
          <Section
            title="Editors"
            entries={entries.filter(e => e.type === 'editor')}
            type="editor"
            onAdd={handleAdd}
            onDelete={handleDelete}
            isAdding={isAdding}
          />
        </div>
      </main>
    </div>
  )
}
