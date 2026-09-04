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

export type EntityColorStyle = {
  backgroundColor: string
  borderColor: string
  color: string
}

export type EntityColorMaps = {
  clients: Record<string, EntityColorStyle>
  subClients: Record<string, EntityColorStyle>
  editors: Record<string, EntityColorStyle>
}

function getStableHash(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function getDefaultEntityColor(): EntityColorStyle {
  return {
    backgroundColor: '#F3F5EE',
    borderColor: 'transparent',
    color: 'rgba(17, 22, 27, 0.5)',
  }
}

function createEntityColorFromHash(hash: number, attempt: number): EntityColorStyle {
  const hue = (hash + attempt * 137) % 360
  const saturation = 62 + ((hash + attempt * 7) % 18)
  const tintLightness = 90 + ((hash + attempt * 5) % 5)
  const borderLightness = 72 + ((hash + attempt * 3) % 8)
  const textLightness = 22 + ((hash + attempt * 11) % 8)

  return {
    backgroundColor: `hsl(${hue} ${saturation}% ${tintLightness}%)`,
    borderColor: `hsl(${hue} ${Math.max(saturation - 12, 48)}% ${borderLightness}%)`,
    color: `hsl(${hue} ${Math.min(saturation + 8, 86)}% ${textLightness}%)`,
  }
}

function getColorIdentity(color: EntityColorStyle) {
  return `${color.backgroundColor}|${color.borderColor}|${color.color}`
}

function normalizeEntityLabel(value: string | null | undefined) {
  return value?.trim() || ""
}

export function createEntityColor(
  value: string | null | undefined,
  namespace = "entity",
  usedColors?: Set<string>
) {
  const label = normalizeEntityLabel(value)
  if (!label) return getDefaultEntityColor()

  const hash = getStableHash(`${namespace}:${label.toLowerCase()}`)

  for (let attempt = 0; attempt < 720; attempt++) {
    const hue = (hash + attempt * 137) % 360
    const color = createEntityColorFromHash(hash, attempt)
    const hueIdentity = `hue:${hue}`
    const colorIdentity = getColorIdentity(color)
    const isAvailable = attempt < 360
      ? !usedColors?.has(hueIdentity)
      : !usedColors?.has(colorIdentity)

    if (isAvailable) {
      usedColors?.add(hueIdentity)
      usedColors?.add(colorIdentity)
      return color
    }
  }

  return createEntityColorFromHash(hash, 0)
}

export function createClientColor(client: string | null | undefined) {
  return createEntityColor(client, "client")
}

function createUniqueColorMap(
  values: Array<string | null | undefined>,
  namespace: string,
  usedColors: Set<string>
) {
  const labels = Array.from(new Set(values.map(normalizeEntityLabel).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  )

  return labels.reduce<Record<string, EntityColorStyle>>((colorMap, label) => {
    colorMap[label] = createEntityColor(label, namespace, usedColors)
    return colorMap
  }, {})
}

export function createEntityColorMaps(values: {
  clients?: Array<string | null | undefined>
  subClients?: Array<string | null | undefined>
  editors?: Array<string | null | undefined>
}): EntityColorMaps {
  const usedColors = new Set<string>()

  return {
    clients: createUniqueColorMap(values.clients ?? [], "client", usedColors),
    subClients: createUniqueColorMap(values.subClients ?? [], "subclient", usedColors),
    editors: createUniqueColorMap(values.editors ?? [], "editor", usedColors),
  }
}
