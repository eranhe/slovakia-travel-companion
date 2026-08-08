import { useEffect, useRef } from 'react'
import { useApp } from '@/providers/AppProvider'
import { getTripProfile } from '@/trip/TripRepository'
import { getRecapByDate } from '@/journal/journalStore'
import {
  hasRecapDone,
  markRecapDone,
  setPendingRecapCue,
} from '@/journal/recapCueStore'
import { isPastRecapTime } from '@/journal/recapTime'
import { localPartsInTimezone } from '@/weather/tomorrowCheck'

/**
 * Nightly recap cues at 21:30 trip-local time — only while the app is open.
 */
export function useRecapTriggers(): void {
  const { sessionMode } = useApp()
  const firedFor = useRef<string | null>(null)
  const onOpenDone = useRef(false)

  useEffect(() => {
    if (sessionMode !== 'open') {
      onOpenDone.current = false
      return
    }

    let cancelled = false

    async function evaluate(reason: 'open' | 'tick') {
      const profile = await getTripProfile()
      if (!profile || cancelled) return
      const { isoDate } = localPartsInTimezone(profile.timezone)
      const past = isPastRecapTime(profile.timezone)

      const existing = getRecapByDate(isoDate)
      if (existing && (existing.status === 'completed' || existing.status === 'shared' || existing.status === 'exported')) {
        markRecapDone(isoDate)
      }
      if (hasRecapDone(isoDate)) return

      if (reason === 'open' && !onOpenDone.current) {
        onOpenDone.current = true
        if (past) {
          setPendingRecapCue({
            kind: 'on-open',
            reviewDate: isoDate,
            messageEn: 'Evening recap time — capture notes and photos for today.',
            messageHe: 'שעת סיכום ערב — לתעד הערות ותמונות להיום.',
          })
        }
      }

      if (past && firedFor.current !== isoDate) {
        firedFor.current = isoDate
        setPendingRecapCue({
          kind: 'evening',
          reviewDate: isoDate,
          messageEn: '21:30 nightly recap — draft today’s journal summary.',
          messageHe: 'סיכום ערב ב־21:30 — לנסח את סיכום היום.',
        })
      }
    }

    void evaluate('open')
    const timer = window.setInterval(() => void evaluate('tick'), 60_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [sessionMode])
}
