import type { TomorrowCheckResult } from '@/weather/tomorrowCheck'

export interface TomorrowCheckCue {
  kind: 'evening' | 'on-open' | 'morning'
  reviewDate: string
  messageEn: string
  messageHe: string
}

interface StoreState {
  lastResult: TomorrowCheckResult | null
  /** reviewDate keys for which an evening check was completed */
  eveningDone: Set<string>
  /** reviewDate keys for which a morning recheck was completed */
  morningDone: Set<string>
  /** dismissed cue keys `${kind}:${reviewDate}` */
  dismissedCues: Set<string>
  pendingCue: TomorrowCheckCue | null
  listeners: Set<() => void>
}

const store: StoreState = {
  lastResult: null,
  eveningDone: new Set(),
  morningDone: new Set(),
  dismissedCues: new Set(),
  pendingCue: null,
  listeners: new Set(),
}

function notify(): void {
  for (const listener of store.listeners) listener()
}

export function subscribeTomorrowCheck(listener: () => void): () => void {
  store.listeners.add(listener)
  return () => store.listeners.delete(listener)
}

export function getLastTomorrowCheck(): TomorrowCheckResult | null {
  return store.lastResult
}

export function getPendingTomorrowCue(): TomorrowCheckCue | null {
  return store.pendingCue
}

export function setTomorrowCheckResult(result: TomorrowCheckResult): void {
  store.lastResult = result
  if (result.trigger === 'evening' || result.trigger === 'on-open' || result.trigger === 'manual') {
    store.eveningDone.add(result.reviewDate)
  }
  if (result.trigger === 'morning') {
    store.morningDone.add(result.reviewDate)
  }
  // Clear matching cue
  if (store.pendingCue && store.pendingCue.reviewDate === result.reviewDate) {
    store.pendingCue = null
  }
  notify()
}

export function hasEveningCheck(reviewDate: string): boolean {
  return store.eveningDone.has(reviewDate)
}

export function hasMorningCheck(reviewDate: string): boolean {
  return store.morningDone.has(reviewDate)
}

export function setPendingTomorrowCue(cue: TomorrowCheckCue | null): void {
  if (cue) {
    const key = `${cue.kind}:${cue.reviewDate}`
    if (store.dismissedCues.has(key)) {
      store.pendingCue = null
      notify()
      return
    }
  }
  store.pendingCue = cue
  notify()
}

export function dismissPendingTomorrowCue(): void {
  if (store.pendingCue) {
    store.dismissedCues.add(`${store.pendingCue.kind}:${store.pendingCue.reviewDate}`)
  }
  store.pendingCue = null
  notify()
}

/** Test helper */
export function resetTomorrowCheckStore(): void {
  store.lastResult = null
  store.eveningDone.clear()
  store.morningDone.clear()
  store.dismissedCues.clear()
  store.pendingCue = null
  notify()
}
