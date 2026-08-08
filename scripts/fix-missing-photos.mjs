import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.resolve(import.meta.dirname, '../public/images')
const UA = 'SlovakiaTravelCompanion/1.0 (family offline PWA; local use only)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: q,
      gsrnamespace: '6',
      gsrlimit: '10',
      prop: 'imageinfo',
      iiprop: 'url|mime|extmetadata',
      iiurlwidth: '960',
      format: 'json',
      origin: '*',
    })
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  const data = await res.json()
  for (const page of Object.values(data.query?.pages || {})) {
    const ii = page.imageinfo?.[0]
    if (!ii || !(ii.mime || '').startsWith('image/') || (ii.mime || '').includes('svg')) continue
    const lic = ii.extmetadata?.LicenseShortName?.value || ''
    if (/fair use|noncommercial/i.test(lic)) continue
    return {
      title: page.title,
      url: ii.thumburl || ii.url,
      license: lic,
      artist: stripHtml(ii.extmetadata?.Artist?.value),
    }
  }
  return null
}

async function download(url, attempt = 1) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if ((res.status === 429 || res.status === 503) && attempt < 6) {
    await sleep(attempt * 5000)
    return download(url, attempt + 1)
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function save(id, place, meta) {
  const buf = await download(meta.url)
  await sharp(buf).rotate().resize(960, 540, { fit: 'cover' }).webp({ quality: 78 }).toFile(path.join(OUT, `${id}.webp`))
  await sharp(buf).rotate().resize(320, 320, { fit: 'cover' }).webp({ quality: 74 }).toFile(path.join(OUT, `${id}-thumb.webp`))
  console.log(id, '=>', meta.title, meta.license)
  return {
    id,
    place,
    source: 'Wikimedia Commons',
    file: meta.title,
    license: meta.license,
    artist: meta.artist || 'see Commons file page',
    url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(meta.title.replace(/ /g, '_'))}`,
  }
}

const credits = JSON.parse(fs.readFileSync(path.join(OUT, 'CREDITS.json'), 'utf8'))
const jobs = [
  {
    id: 'place-resort',
    place: 'Liptov / resort area',
    queries: ['Demänovská Dolina', 'Jasná Low Tatras summer', 'Liptov mountains resort'],
  },
  {
    id: 'place-tatralandia',
    place: 'Tatralandia',
    queries: ['Aquapark Tatralandia', 'Tatralandia', 'Bešeňová aquapark outdoor'],
  },
]

for (const job of jobs) {
  let meta = null
  for (const q of job.queries) {
    console.log('search', q)
    meta = await search(q)
    await sleep(1500)
    if (meta) break
  }
  if (!meta) {
    console.log('FAIL', job.id)
    continue
  }
  const credit = await save(job.id, job.place, meta)
  await sleep(2500)
  const idx = credits.findIndex((c) => c.id === job.id)
  if (idx >= 0) credits[idx] = credit
  else credits.push(credit)
}

fs.writeFileSync(path.join(OUT, 'CREDITS.json'), JSON.stringify(credits, null, 2))
const md = [
  '# Photo credits',
  '',
  'Real photographs from Wikimedia Commons.',
  '',
  ...credits.map(
    (c) => `- **${c.id}** (${c.place}): [${c.file}](${c.url}) — ${c.license} — ${c.artist}`,
  ),
  '',
]
fs.writeFileSync(path.join(OUT, 'CREDITS.md'), md.join('\n'))
console.log('done', credits.length)
