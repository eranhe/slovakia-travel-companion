export type CheckInSource = 'manual' | 'foreground-geo'

export interface CheckInRecord {
  id: string
  at: string
  labelEn: string
  labelHe: string
  placeId?: string
  dayNumber?: number
  note?: string
  source: CheckInSource
  coordinates?: {
    lat: number
    lng: number
    /** User-reported or approximate — never treated as verified Waze pin. */
    status: 'approximate' | 'user-reported'
  }
}

export type RouteQuality = 'tracked' | 'reconstructed' | 'estimated'

const CHECKINS_KEY = 'stc-checkins-v1'
const COMPLETED_KEY = 'stc-completed-activities-v1'

export function loadCheckIns(): CheckInRecord[] {
  try {
    const raw = localStorage.getItem(CHECKINS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CheckInRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCheckIns(records: CheckInRecord[]): void {
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(records))
}

export function addCheckIn(
  input: Omit<CheckInRecord, 'id' | 'at'> & { at?: string },
): CheckInRecord {
  const record: CheckInRecord = {
    ...input,
    id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: input.at ?? new Date().toISOString(),
  }
  const next = [record, ...loadCheckIns()]
  saveCheckIns(next)
  return record
}

export function removeCheckIn(id: string): void {
  saveCheckIns(loadCheckIns().filter((item) => item.id !== id))
}

export function loadCompletedActivityIds(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

export function saveCompletedActivityIds(ids: Set<string>): void {
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...ids]))
}

export function toggleCompletedActivity(activityId: string): Set<string> {
  const next = loadCompletedActivityIds()
  if (next.has(activityId)) next.delete(activityId)
  else next.add(activityId)
  saveCompletedActivityIds(next)
  return next
}

export function isActivityCompleted(activityId: string): boolean {
  return loadCompletedActivityIds().has(activityId)
}

/** Test helper */
export function resetMapVisitState(): void {
  localStorage.removeItem(CHECKINS_KEY)
  localStorage.removeItem(COMPLETED_KEY)
}
