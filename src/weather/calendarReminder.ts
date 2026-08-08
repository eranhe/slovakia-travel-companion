/** Build a simple evening reminder .ics for Tomorrow Check (local download only). */

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatIcsLocal(dateIso: string, hour: number, minute: number): string {
  const [y, m, d] = dateIso.split('-')
  return `${y}${m}${d}T${pad(hour)}${pad(minute)}00`
}

function formatIcsUtcStamp(now = new Date()): string {
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  )
}

export function buildEveningCheckIcs(options: {
  reviewDates: string[]
  timeZone: string
  titleEn?: string
}): string {
  const title = options.titleEn ?? 'Tomorrow Check · Slovakia trip'
  const stamp = formatIcsUtcStamp()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Slovakia Travel Companion//Tomorrow Check//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const date of options.reviewDates) {
    const uid = `tomorrow-check-${date}@slovakia-travel-companion.local`
    const dtStart = formatIcsLocal(date, 20, 30)
    const dtEnd = formatIcsLocal(date, 20, 45)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${options.timeZone}:${dtStart}`,
      `DTEND;TZID=${options.timeZone}:${dtEnd}`,
      `SUMMARY:${title}`,
      'DESCRIPTION:Open the Slovakia Travel Companion app and run Check Tomorrow. This reminder does not run checks while the browser is closed.',
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadEveningCheckIcs(ics: string, filename = 'tomorrow-check.ics'): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
