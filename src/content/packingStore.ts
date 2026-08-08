import { packingProgress, packingSections } from '@/data/packing-seed'

const STORAGE_KEY = 'stc-packing-checked-v1'

export function loadPackingChecked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

export function savePackingChecked(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function togglePackingItem(id: string): Set<string> {
  const next = loadPackingChecked()
  if (next.has(id)) next.delete(id)
  else next.add(id)
  savePackingChecked(next)
  return next
}

export function clearPackingChecked(): Set<string> {
  const empty = new Set<string>()
  savePackingChecked(empty)
  return empty
}

export function getPackingProgressSnapshot() {
  return packingProgress(loadPackingChecked())
}

export function allPackingItemIds(): string[] {
  return packingSections.flatMap((section) => section.items.map((item) => item.id))
}
