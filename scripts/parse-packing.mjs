import fs from 'node:fs'

const html = fs.readFileSync(
  'C:/Users/eranhe/Downloads/poll-slov/Polland-slovakia 2026-20260806T184349Z-1-001/Polland-slovakia 2026/תכנון/רשימת_ציוד_סלובקיה_פולין_2026.html',
  'utf8',
)

const sections = []
const parts = html.split('<div class="section">').slice(1)
let si = 0
for (const part of parts) {
  const block = part.split('<h2>')[0]
  const title = block.match(/class="title">([^<]+)/)?.[1]?.trim()
  const sub = block.match(/class="section-sub">([^<]+)/)?.[1]?.trim() ?? ''
  if (!title) continue
  const items = []
  const itemRe =
    /<div class='item'>[\s\S]*?<div class='item-label'>([^<]*)<\/div>(?:<div class='item-note'>([^<]*)<\/div>)?/g
  let im
  let ii = 0
  while ((im = itemRe.exec(block))) {
    items.push({
      id: `pack-${si}-${ii}`,
      labelHe: im[1].trim(),
      noteHe: im[2]?.trim() || undefined,
    })
    ii += 1
  }
  sections.push({
    id: `sec-${si}`,
    titleHe: title,
    subtitleHe: sub,
    items,
  })
  si += 1
}

const dayBags = []
const rowRe = /<tr><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/g
let r
while ((r = rowRe.exec(html))) {
  dayBags.push({ dateLabel: r[1], activityHe: r[2], bagHe: r[3] })
}

const out = { sections, dayBags }
fs.writeFileSync(new URL('../src/data/_packing-parsed.json', import.meta.url), JSON.stringify(out, null, 2))
console.log(sections.length, 'sections', sections.reduce((a, s) => a + s.items.length, 0), 'items', dayBags.length, 'days')
