export interface RecapCue {
  kind: 'evening' | 'on-open' | 'manual'
  reviewDate: string
  messageEn: string
  messageHe: string
}

interface StoreState {
  doneDates: Set<string>
  dismissed: Set<string>
  pending: RecapCue | null
  listeners: Set<() => void>
}

const store: StoreState = {
  doneDates: new Set(),
  dismissed: new Set(),
  pending: null,
  listeners: new Set(),
}

function notify(): void {
  for (const listener of store.listeners) listener()
}

export function subscribeRecapCue(listener: () => void): () => void {
  store.listeners.add(listener)
  return () => store.listeners.delete(listener)
}

export function getPendingRecapCue(): RecapCue | null {
  return store.pending
}

export function hasRecapDone(date: string): boolean {
  return store.doneDates.has(date)
}

export function markRecapDone(date: string): void {
  store.doneDates.add(date)
  if (store.pending?.reviewDate === date) store.pending = null
  notify()
}

export function setPendingRecapCue(cue: RecapCue | null): void {
  if (cue) {
    const key = `${cue.kind}:${cue.reviewDate}`
    if (store.dismissed.has(key) || store.doneDates.has(cue.reviewDate)) {
      store.pending = null
      notify()
      return
    }
  }
  store.pending = cue
  notify()
}

export function dismissRecapCue(): void {
  if (store.pending) {
    store.dismissed.add(`${store.pending.kind}:${store.pending.reviewDate}`)
  }
  store.pending = null
  notify()
}

export function resetRecapCueStore(): void {
  store.doneDates.clear()
  store.dismissed.clear()
  store.pending = null
  notify()
}
