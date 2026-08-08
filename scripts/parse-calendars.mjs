import fs from 'node:fs'
import path from 'node:path'

/** One-off importer: reads the Google Calendar .ics exports behind src/data/dedicated-trip.ts. */
const CAL_DIR =
  process.argv[2] ??
  'C:/Users/eranhe/Downloads/poll-slov/Polland-slovakia 2026-20260806T184349Z-1-001/Polland-slovakia 2026/תכנון/calendarfiles'

function unfold(text) {
  return text.replace(/\r?\n[ \t]/g, '')
}

function unescapeIcs(value) {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

function parseEvents(text) {
  const lines = unfold(text).split(/\r?\n/)
  const events = []
  let current = null
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (current) events.push(current)
      current = null
      continue
    }
    if (!current) continue
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const rawKey = line.slice(0, colon)
    const value = line.slice(colon + 1)
    const [key, ...params] = rawKey.split(';')
    const entry = { value: unescapeIcs(value), params }
    if (key === 'DTSTART' || key === 'DTEND') {
      current[key] = entry
    } else if (['SUMMARY', 'DESCRIPTION', 'LOCATION', 'STATUS', 'UID', 'RRULE', 'TRANSP'].includes(key)) {
      current[key] = entry
    }
  }
  return events
}

function toDateInfo(entry) {
  if (!entry) return null
  const value = entry.value
  const isDateOnly = entry.params.some((p) => p === 'VALUE=DATE') || /^\d{8}$/.test(value)
  if (isDateOnly) {
    const y = value.slice(0, 4)
    const m = value.slice(4, 6)
    const d = value.slice(6, 8)
    return { date: `${y}-${m}-${d}`, time: null, allDay: true }
  }
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/)
  if (!m) return null
  const [, y, mo, d, hh, mm, , z] = m
  if (z) {
    // Convert UTC to Europe/Bratislava (CEST = UTC+2 in August)
    const utc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm))
    const local = new Date(utc + 2 * 3600 * 1000)
    const pad = (n) => String(n).padStart(2, '0')
    return {
      date: `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`,
      time: `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`,
      allDay: false,
    }
  }
  return { date: `${y}-${mo}-${d}`, time: `${hh}:${mm}`, allDay: false }
}

const rows = []
for (const file of fs.readdirSync(CAL_DIR)) {
  if (!file.toLowerCase().endsWith('.ics')) continue
  const text = fs.readFileSync(path.join(CAL_DIR, file), 'utf8')
  for (const event of parseEvents(text)) {
    const start = toDateInfo(event.DTSTART)
    if (!start) continue
    if (!start.date.startsWith('2026-08')) continue
    const dayNum = Number(start.date.slice(8, 10))
    if (dayNum < 16 || dayNum > 29) continue
    const end = toDateInfo(event.DTEND)
    rows.push({
      source: file.slice(0, 24),
      date: start.date,
      start: start.time,
      end: end && end.date === start.date ? end.time : null,
      allDay: start.allDay,
      summary: event.SUMMARY?.value ?? '',
      location: event.LOCATION?.value ?? '',
      description: (event.DESCRIPTION?.value ?? '').slice(0, 600),
      status: event.STATUS?.value ?? '',
    })
  }
}

rows.sort((a, b) => (a.date + (a.start ?? '')).localeCompare(b.date + (b.start ?? '')))
fs.writeFileSync(
  new URL('../calendar-events.json', import.meta.url),
  JSON.stringify(rows, null, 2),
)
console.log('events:', rows.length)
for (const row of rows) {
  console.log(
    `${row.date} ${row.allDay ? 'ALLDAY' : `${row.start ?? '??'}-${row.end ?? '??'}`} | ${row.summary} | ${row.location}`,
  )
}
