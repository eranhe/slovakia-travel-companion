import { localPartsInTimezone } from '@/weather/tomorrowCheck'

const RECAP_HOUR = 21
const RECAP_MINUTE = 30

export function isPastRecapTime(timeZone: string, now = new Date()): boolean {
  const { hour, minute } = localPartsInTimezone(timeZone, now)
  return hour > RECAP_HOUR || (hour === RECAP_HOUR && minute >= RECAP_MINUTE)
}
