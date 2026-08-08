import { useEffect, useRef } from 'react'
import { useApp } from '@/providers/AppProvider'
import { getTripProfile } from '@/trip/TripRepository'
import {
  hasEveningCheck,
  hasMorningCheck,
  setPendingTomorrowCue,
  setTomorrowCheckResult,
} from '@/weather/tomorrowCheckStore'
import {
  isMorningWindow,
  isPastEveningReviewTime,
  localPartsInTimezone,
  runTomorrowCheck,
} from '@/weather/tomorrowCheck'

/**
 * In-app Tomorrow Check triggers (no background scheduler):
 * 1) On open after 20:30 if evening review not done
 * 2) While open, when local trip time reaches 20:30
 * 3) Morning recheck cue next day if evening review happened yesterday
 */
export function useTomorrowCheckTriggers(): void {
  const { sessionMode } = useApp()
  const eveningFiredFor = useRef<string | null>(null)
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
      const pastEvening = isPastEveningReviewTime(profile.timezone)
      const morning = isMorningWindow(profile.timezone)

      if (reason === 'open' && !onOpenDone.current) {
        onOpenDone.current = true
        if (pastEvening && !hasEveningCheck(isoDate)) {
          setPendingTomorrowCue({
            kind: 'on-open',
            reviewDate: isoDate,
            messageEn: 'Evening review time — check tomorrow’s plan against the forecast.',
            messageHe: 'שעת סקירת ערב — כדאי לבדוק את תוכנית מחר מול התחזית.',
          })
          try {
            const result = await runTomorrowCheck('on-open')
            if (!cancelled) setTomorrowCheckResult(result)
          } catch {
            /* cue stays; user can run manually */
          }
          return
        }
        if (morning && !hasMorningCheck(isoDate)) {
          // Previous evening’s target is “today”
          setPendingTomorrowCue({
            kind: 'morning',
            reviewDate: isoDate,
            messageEn: 'Morning recheck — refresh today’s forecast before you leave.',
            messageHe: 'בדיקת בוקר — לרענן את תחזית היום לפני היציאה.',
          })
        }
      }

      if (pastEvening && !hasEveningCheck(isoDate) && eveningFiredFor.current !== isoDate) {
        eveningFiredFor.current = isoDate
        setPendingTomorrowCue({
          kind: 'evening',
          reviewDate: isoDate,
          messageEn: '20:30 tomorrow check — review the forecast for tomorrow.',
          messageHe: 'בדיקת מחר ב־20:30 — סקירת התחזית למחר.',
        })
        try {
          const result = await runTomorrowCheck('evening')
          if (!cancelled) setTomorrowCheckResult(result)
        } catch {
          /* leave cue visible */
        }
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
