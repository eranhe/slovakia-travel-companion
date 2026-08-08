import { dedicatedTripData } from '@/data/dedicated-trip'
import { DayRecordSchema, type DayRecord } from '@/validation/tripSchemas'

/** Every calendar day the app knows about: 17 Aug (arrival) → 28 Aug (departure). */
export const ALL_TRIP_DATES: readonly string[] = dedicatedTripData.days.map((day) => day.date)

/** The ten active itinerary days, 18–27 Aug 2026. */
export const ACTIVE_TRIP_DATES: readonly string[] = dedicatedTripData.days
  .filter((day) => day.dayNumber >= 1 && day.dayNumber <= 10)
  .map((day) => day.date)

export const ARRIVAL_DAY_NUMBER = 0
export const DEPARTURE_DAY_NUMBER = 11

export function isActiveDayNumber(dayNumber: number): boolean {
  return dayNumber >= 1 && dayNumber <= 10
}

export function buildTripDayRecords(): DayRecord[] {
  return dedicatedTripData.days.map((day) => DayRecordSchema.parse(day))
}

export function dayByDate(days: DayRecord[], isoDate: string): DayRecord | undefined {
  return days.find((day) => day.date === isoDate)
}

export function todayIsoInTimezone(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Short label for day tabs / pills: A for arrival, D1–D10, R for the return day. */
export function dayCode(dayNumber: number): string {
  if (dayNumber === ARRIVAL_DAY_NUMBER) return 'A'
  if (dayNumber === DEPARTURE_DAY_NUMBER) return 'R'
  return `D${dayNumber}`
}

export function dayLabel(dayNumber: number, locale: 'en' | 'he'): string {
  if (dayNumber === ARRIVAL_DAY_NUMBER) return locale === 'he' ? 'יום הגעה' : 'Arrival day'
  if (dayNumber === DEPARTURE_DAY_NUMBER) return locale === 'he' ? 'יום חזרה' : 'Return day'
  return locale === 'he' ? `יום ${dayNumber}` : `Day ${dayNumber}`
}
