import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatName(name: string | null | undefined) {
  if (!name) return ""
  return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

export function getEditorColorClass(name: string | null | undefined) {
  if (!name) return 'bg-[#F3F5EE] text-[#11161B]/50 border-transparent'
  
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
