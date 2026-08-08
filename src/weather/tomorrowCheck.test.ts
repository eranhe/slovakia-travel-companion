import { describe, expect, it } from 'vitest'
import {
  addDaysIso,
  isPastEveningReviewTime,
  localPartsInTimezone,
  resolveTargetDay,
} from '@/weather/tomorrowCheck'
import { buildTripDayRecords } from '@/trip/tripDays'
import type { TripProfile } from '@/validation/tripSchemas'
import { buildEveningCheckIcs } from '@/weather/calendarReminder'

const profile: TripProfile = {
  name: 'Test',
  startDate: '2026-08-18',
  endDate: '2026-08-27',
  timezone: 'Europe/Bratislava',
  countries: ['Slovakia'],
  regions: [],
  travelers: [],
  homeCurrency: 'ILS',
  departureDate: '2026-08-28',
}

describe('tomorrow check helpers', () => {
  it('adds calendar days in ISO', () => {
    expect(addDaysIso('2026-08-27', 1)).toBe('2026-08-28')
  })

  it('resolves an active tomorrow day', () => {
    const days = buildTripDayRecords()
    const now = new Date('2026-08-19T10:00:00+02:00')
    const resolved = resolveTargetDay(profile, days, now)
    expect(resolved.skipped).toBe(false)
    expect(resolved.targetDate).toBe('2026-08-20')
    expect(resolved.day?.dayNumber).toBe(3)
  })

  it('resolves morning recheck to today', () => {
    const days = buildTripDayRecords()
    const now = new Date('2026-08-20T08:00:00+02:00')
    const resolved = resolveTargetDay(profile, days, now, 'morning')
    expect(resolved.skipped).toBe(false)
    expect(resolved.targetDate).toBe('2026-08-20')
    expect(resolved.day?.dayNumber).toBe(3)
  })

  it('resolves the arrival day on the evening before the trip', () => {
    const days = buildTripDayRecords()
    const now = new Date('2026-08-16T21:00:00+02:00')
    const resolved = resolveTargetDay(profile, days, now)
    expect(resolved.skipped).toBe(false)
    expect(resolved.targetDate).toBe('2026-08-17')
    expect(resolved.day?.dayNumber).toBe(0)
  })

  it('reviews the departure day on the evening of Day 10', () => {
    const days = buildTripDayRecords()
    const now = new Date('2026-08-27T21:00:00+02:00')
    const resolved = resolveTargetDay(profile, days, now)
    expect(resolved.skipped).toBe(false)
    expect(resolved.targetDate).toBe('2026-08-28')
    expect(resolved.day?.dayNumber).toBe(11)
  })

  it('skips the evening check once the trip is over', () => {
    const days = buildTripDayRecords()
    const now = new Date('2026-08-28T21:00:00+02:00')
    const resolved = resolveTargetDay(profile, days, now)
    expect(resolved.skipped).toBe(true)
  })

  it('detects evening review window in trip timezone', () => {
    const before = new Date('2026-08-20T18:00:00+02:00')
    const after = new Date('2026-08-20T20:35:00+02:00')
    expect(isPastEveningReviewTime('Europe/Bratislava', before)).toBe(false)
    expect(isPastEveningReviewTime('Europe/Bratislava', after)).toBe(true)
    expect(localPartsInTimezone('Europe/Bratislava', after).hour).toBe(20)
  })

  it('builds an .ics with 20:30 events', () => {
    const ics = buildEveningCheckIcs({
      reviewDates: ['2026-08-18', '2026-08-19'],
      timeZone: 'Europe/Bratislava',
    })
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('DTSTART;TZID=Europe/Bratislava:20260818T203000')
    expect(ics).toContain('Tomorrow Check')
  })
})
