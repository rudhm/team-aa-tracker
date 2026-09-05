import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatName(name: string | null | undefined) {
  if (!name) return ""
  return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

const EDITOR_COLORS = [
  '#9333EA', // Purple
  '#2563EB', // Blue
  '#EAB308', // Yellow
  '#E11D48', // Rose
  '#059669', // Emerald
  '#D97706', // Amber
  '#0284C7', // Light Blue
  '#4F46E5', // Indigo
]

export function getEditorDotColor(name: string | null | undefined): string {
  if (!name) return '#9CA3AF'
  const lowerName = name.trim().toLowerCase()
  if (lowerName === 'abhishek') return '#9333EA'
  if (lowerName === 'pranjya') return '#2563EB'
  if (lowerName === 'aakash') return '#EAB308'
  
  let hash = 0
  for (let i = 0; i < lowerName.length; i++) {
    hash = lowerName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return EDITOR_COLORS[Math.abs(hash) % EDITOR_COLORS.length]
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
