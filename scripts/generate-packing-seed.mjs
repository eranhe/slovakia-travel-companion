import fs from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const j = require('../src/data/_packing-parsed.json')

const titleEn = {
  'sec-0': 'Documents bag',
  'sec-1': 'Mountain bag',
  'sec-2': 'Canyons & caves bag',
  'sec-3': 'Water bag',
  'sec-4': 'Clothing — 12 days',
  'sec-5': 'Electronics',
  'sec-6': 'Medication & first aid',
  'sec-7': 'Car & travel',
  'sec-8': 'Apartments & kitchen',
  'sec-9': 'Omer (11) & Rotem (8)',
}

const subEn = {
  'sec-0': 'Always on you — never left visible in the car',
  'sec-1': 'Chopok · Skalnate · Bachledka · Hrebienok days',
  'sec-2': 'Diery · Dobsinska + Sucha Bela · Belianska',
  'sec-3': 'Water parks, rafting, Termy, Energylandia',
  'sec-4': 'Per person · laundry available in both apartments',
  'sec-5': 'Partner roaming pack · Type E/F sockets',
  'sec-6': 'EU emergency 112 · mountain rescue HZS 18 300',
  'sec-7': '~1,400 km · Poland–Slovakia border crossed often',
  'sec-8': 'Maladinovo 5 nights · Zdiar 5 nights',
  'sec-9': 'Height limits matter for slides and rides',
}

const dayIso = {
  '17/8': '2026-08-17',
  '18/8': '2026-08-18',
  '19/8': '2026-08-19',
  '20/8': '2026-08-20',
  '21/8': '2026-08-21',
  '22/8': '2026-08-22',
  '23/8': '2026-08-23',
  '24/8': '2026-08-24',
  '25/8': '2026-08-25',
  '26/8': '2026-08-26',
  '27/8': '2026-08-27',
  '28/8': '2026-08-28',
}

const dayBagEn = {
  '17/8': 'Documents + water',
  '18/8': 'Water',
  '19/8': 'Canyons',
  '20/8': 'Mountain + water',
  '21/8': 'Canyons + warm layer',
  '22/8': 'Mountain',
  '23/8': 'Water — full dry set',
  '24/8': 'Mountain + mosquito repellent',
  '25/8': 'Water + PLN cash',
  '26/8': 'Canyons + mountain',
  '27/8': 'Water + large drink supply',
  '28/8': 'Documents',
}

const sections = j.sections.map((s) => ({
  id: s.id,
  titleEn: titleEn[s.id] || s.titleHe,
  titleHe: s.titleHe,
  subtitleEn: subEn[s.id] || s.subtitleHe,
  subtitleHe: s.subtitleHe || undefined,
  items: s.items.map((it) => ({
    id: it.id,
    labelEn: it.labelHe,
    labelHe: it.labelHe,
    noteEn: it.noteHe,
    noteHe: it.noteHe,
  })),
}))

const dayBagPlans = j.dayBags.map((d) => ({
  date: dayIso[d.dateLabel],
  activityEn: d.activityHe,
  activityHe: d.activityHe,
  bagEn: dayBagEn[d.dateLabel] || d.bagHe,
  bagHe: d.bagHe,
}))

const file = `/** Family packing list derived from the trip packing PDF/HTML (4-bag method). */

export interface PackingItem {
  id: string
  labelEn: string
  labelHe: string
  noteEn?: string
  noteHe?: string
}

export interface PackingSection {
  id: string
  titleEn: string
  titleHe: string
  subtitleEn?: string
  subtitleHe?: string
  items: PackingItem[]
}

export interface DayBagPlan {
  date: string
  activityEn: string
  activityHe: string
  bagEn: string
  bagHe: string
}

export const packingSections: PackingSection[] = ${JSON.stringify(sections, null, 2)}

export const dayBagPlans: DayBagPlan[] = ${JSON.stringify(dayBagPlans, null, 2)}

export const packingNonNegotiablesHe = [
  'כרטיס PassportCard הפיזי (מסתיים ב-5814)',
  'רישיון נהיגה בינלאומי ואישור מעבר גבול',
  'e-vignette רק דרך eZnamka הרשמי',
  'מדידת גובה של שני הילדים עם נעליים',
  'Energy Pass מודפס אם קונים',
  'מפות Mapy.com אופליין',
] as const

export const packingNonNegotiablesEn = [
  'Physical PassportCard (ends with 5814)',
  'International driving permit + border docs',
  'Slovak e-vignette only via official eZnamka',
  'Measure both kids height with shoes on',
  'Printed Energy Pass if purchased',
  'Offline Mapy.com maps',
] as const

export function packingProgress(checkedIds: ReadonlySet<string>): {
  total: number
  checked: number
  percent: number
} {
  const total = packingSections.reduce((sum, section) => sum + section.items.length, 0)
  const checked = packingSections.reduce(
    (sum, section) => sum + section.items.filter((item) => checkedIds.has(item.id)).length,
    0,
  )
  return {
    total,
    checked,
    percent: total === 0 ? 0 : Math.round((checked / total) * 100),
  }
}
`

fs.writeFileSync(new URL('../src/data/packing-seed.ts', import.meta.url), file)
console.log('ok', sections.length, dayBagPlans.length)
