import type { JournalEntry, NightlyRecap } from '@/journal/types'

const JOURNAL_KEY = 'stc-journal-entries-v1'
const RECAP_KEY = 'stc-nightly-recaps-v1'

export function loadJournalEntries(): JournalEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(JOURNAL_KEY) ?? '[]') as JournalEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries))
}

export function upsertJournalEntry(entry: JournalEntry): JournalEntry[] {
  const all = loadJournalEntries()
  const index = all.findIndex((item) => item.id === entry.id || item.date === entry.date)
  const next = [...all]
  if (index >= 0) next[index] = entry
  else next.unshift(entry)
  saveJournalEntries(next)
  return next
}

export function getJournalByDate(date: string): JournalEntry | null {
  return loadJournalEntries().find((item) => item.date === date) ?? null
}

export function loadRecaps(): NightlyRecap[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECAP_KEY) ?? '[]') as NightlyRecap[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRecaps(recaps: NightlyRecap[]): void {
  localStorage.setItem(RECAP_KEY, JSON.stringify(recaps))
}

export function upsertRecap(recap: NightlyRecap): NightlyRecap[] {
  const all = loadRecaps()
  const index = all.findIndex((item) => item.date === recap.date)
  const next = [...all]
  if (index >= 0) next[index] = recap
  else next.unshift(recap)
  saveRecaps(next)
  return next
}

export function getRecapByDate(date: string): NightlyRecap | null {
  return loadRecaps().find((item) => item.date === date) ?? null
}

export function resetJournalState(): void {
  localStorage.removeItem(JOURNAL_KEY)
  localStorage.removeItem(RECAP_KEY)
}
