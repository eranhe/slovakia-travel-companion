/**
 * Download curated Wikimedia Commons photos for trip places, then write
 * 960×540 and 320×320 WebP into public/images (same ids as the illustrations).
 * Attribution is written to public/images/CREDITS.json.
 *
 * Usage: node scripts/fetch-real-photos.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.resolve(import.meta.dirname, '../public/images')
const UA = 'SlovakiaTravelCompanion/1.0 (family offline PWA; local use only)'

/**
 * Curated Commons file titles — scenic / recognizable for each itinerary place.
 * Prefer CC BY / CC BY-SA / CC0 / Public domain. Avoid logos and maps.
 */
const PHOTOS = [
  {
    id: 'hero-tatras',
    file: 'Slovakia VysokeTatry panorama hires.JPG',
    place: 'High Tatras panorama',
  },
  {
    id: 'place-chopok',
    file: 'Chopok - Jasná Ski Resort.JPG',
    place: 'Chopok / Jasná',
  },
  {
    id: 'place-bachledka',
    file: 'Chodník Korunami Stromov (Treetop walk) (50359326307).jpg',
    place: 'Bachledka treetop walk',
  },
  {
    id: 'place-belianska-cave',
    file: 'Belianska Cave, Vysoké Tatry, Slovakia (Unsplash).jpg',
    place: 'Belianska Cave',
  },
  {
    id: 'place-besenova',
    file: 'Besenova -Aquapark Gino Paradise - panoramio.jpg',
    place: 'Bešeňová',
  },
  {
    id: 'place-dunajec',
    file: 'Rafting on the Dunajec River.jpg',
    place: 'Dunajec rafting',
  },
  {
    id: 'place-red-monastery',
    file: 'Červený Kláštor Monastery 01.JPG',
    place: 'Red Monastery',
  },
  {
    id: 'place-ice-cave',
    file: 'Dobšinská Ice Cave, 11.jpg',
    place: 'Dobšinská Ice Cave',
  },
  {
    id: 'place-janosikove-diery',
    file: 'Jánošíkove Diery Slovakia (6).jpg',
    place: 'Jánošíkove Diery',
  },
  {
    id: 'place-liptovska-mara',
    file: 'Liptovská Mara.jpg',
    place: 'Liptovská Mara',
  },
  {
    id: 'place-skalnate-pleso',
    file: 'Skalnaté pleso.jpg',
    place: 'Skalnaté pleso',
  },
  {
    id: 'place-sucha-bela',
    file: 'Suchá Belá, Slovenský raj 07.jpg',
    place: 'Suchá Belá',
  },
  {
    id: 'place-hrebienok',
    file: 'Hrebienok.jpg',
    place: 'Hrebienok',
  },
  {
    id: 'place-zakopane',
    file: 'Zakopane Gubalowka 1.jpg',
    place: 'Zakopane / Gubałówka',
  },
  {
    id: 'place-zdiar',
    file: 'Ždiar Slovakia.jpg',
    place: 'Ždiar',
  },
  {
    id: 'place-tatralandia',
    file: 'Tatralandia 1.jpg',
    place: 'Tatralandia',
  },
  {
    id: 'place-chocholow',
    file: 'Chochołów wooden houses.jpg',
    place: 'Chochołów',
  },
  {
    id: 'place-energylandia',
    file: 'Energylandia - Hyperion.jpg',
    place: 'Energylandia',
  },
  {
    id: 'place-airport',
    file: 'Kraków Airport terminal.jpg',
    place: 'Kraków Airport',
  },
  {
    id: 'place-drive',
    file: 'Road in High Tatras Slovakia.jpg',
    place: 'Mountain road, Tatras',
  },
  {
    id: 'place-resort',
    file: 'Liptovský Mikuláš Slovakia.jpg',
    place: 'Liptov / resort area',
  },
  {
    id: 'place-adventure-park',
    file: 'Vrátna dolina.jpg',
    place: 'Vrátna valley',
  },
  {
    id: 'place-mountain-cart',
    file: 'Tatranská Lomnica cable car.jpg',
    place: 'Tatranská Lomnica',
  },
]

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function resolveFile(title) {
  const fileTitle = title.startsWith('File:') ? title : `File:${title}`
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      titles: fileTitle,
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '960',
      format: 'json',
      origin: '*',
    })
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`API ${res.status} for ${fileTitle}`)
  const data = await res.json()
  const page = Object.values(data.query?.pages || {})[0]
  if (!page || page.missing != null) return null
  const ii = page.imageinfo?.[0]
  if (!ii) return null
  return {
    title: page.title,
    url: ii.thumburl || ii.url,
    fullUrl: ii.url,
    mime: ii.mime,
    artist: stripHtml(ii.extmetadata?.Artist?.value),
    license: ii.extmetadata?.LicenseShortName?.value || 'unknown',
    credit: stripHtml(ii.extmetadata?.Credit?.value),
    description: stripHtml(ii.extmetadata?.ImageDescription?.value).slice(0, 180),
  }
}

async function searchFallback(query) {
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: query,
      gsrnamespace: '6',
      gsrlimit: '8',
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '960',
      format: 'json',
      origin: '*',
    })
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`search ${res.status}`)
  const data = await res.json()
  const pages = Object.values(data.query?.pages || {})
  for (const page of pages) {
    const ii = page.imageinfo?.[0]
    if (!ii) continue
    if (!(ii.mime || '').startsWith('image/')) continue
    if ((ii.mime || '').includes('svg') || (ii.mime || '').includes('gif')) continue
    const lic = ii.extmetadata?.LicenseShortName?.value || ''
    if (/fair use|noncommercial|copyrighted/i.test(lic)) continue
    return {
      title: page.title,
      url: ii.thumburl || ii.url,
      fullUrl: ii.url,
      mime: ii.mime,
      artist: stripHtml(ii.extmetadata?.Artist?.value),
      license: lic || 'unknown',
      credit: stripHtml(ii.extmetadata?.Credit?.value),
      description: stripHtml(ii.extmetadata?.ImageDescription?.value).slice(0, 180),
    }
  }
  return null
}

async function download(url, attempt = 1) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (res.status === 429 || res.status === 503) {
    if (attempt >= 6) throw new Error(`download ${res.status} after retries ${url}`)
    const wait = attempt * 4000
    console.log(`rate-limited, wait ${wait}ms…`)
    await sleep(wait)
    return download(url, attempt + 1)
  }
  if (!res.ok) throw new Error(`download ${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

fs.mkdirSync(OUT, { recursive: true })

const credits = []
let total = 0

const FALLBACK_QUERY = {
  'place-liptovska-mara': 'Liptovská Mara Slovakia lake',
  'place-skalnate-pleso': 'Skalnaté pleso Tatry',
  'place-sucha-bela': 'Suchá Belá Slovenský raj',
  'place-hrebienok': 'Hrebienok Vysoké Tatry',
  'place-zakopane': 'Gubałówka Zakopane view',
  'place-zdiar': 'Ždiar Belianske Tatry',
  'place-tatralandia': 'Tatralandia Liptovský Mikuláš',
  'place-chocholow': 'Chochołów wooden architecture',
  'place-energylandia': 'Energylandia Zator',
  'place-airport': 'Kraków Airport Balice terminal',
  'place-drive': 'High Tatras road Slovakia',
  'place-resort': 'Liptovský Mikuláš lake resort',
  'place-adventure-park': 'Vrátna dolina Terchová',
  'place-mountain-cart': 'Tatranská Lomnica gondola',
}

for (const entry of PHOTOS) {
  process.stdout.write(`${entry.id} … `)
  let meta = await resolveFile(entry.file)
  await sleep(800)
  if (!meta) {
    const q = FALLBACK_QUERY[entry.id] || entry.place
    meta = await searchFallback(q)
    await sleep(1200)
  }
  if (!meta) {
    console.log('SKIP (not found)')
    continue
  }

  const buf = await download(meta.url)
  await sleep(2000)

  const wide = path.join(OUT, `${entry.id}.webp`)
  const thumb = path.join(OUT, `${entry.id}-thumb.webp`)
  await sharp(buf).rotate().resize(960, 540, { fit: 'cover' }).webp({ quality: 78 }).toFile(wide)
  await sharp(buf).rotate().resize(320, 320, { fit: 'cover' }).webp({ quality: 74 }).toFile(thumb)

  const wideSize = fs.statSync(wide).size
  const thumbSize = fs.statSync(thumb).size
  total += wideSize + thumbSize
  console.log(`${meta.title} · ${meta.license} · ${(wideSize / 1024).toFixed(0)}kB`)

  credits.push({
    id: entry.id,
    place: entry.place,
    source: 'Wikimedia Commons',
    file: meta.title,
    license: meta.license,
    artist: meta.artist || meta.credit || 'see Commons file page',
    url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(meta.title.replace(/ /g, '_'))}`,
  })
}

fs.writeFileSync(path.join(OUT, 'CREDITS.json'), JSON.stringify(credits, null, 2), 'utf8')

const md = [
  '# Photo credits',
  '',
  'Real photographs bundled for offline use. All from [Wikimedia Commons](https://commons.wikimedia.org/).',
  'Licenses are typically CC BY / CC BY-SA / CC0 / Public domain — see each file page for full terms.',
  '',
  ...credits.map(
    (c) =>
      `- **${c.id}** (${c.place}): [${c.file}](${c.url}) — ${c.license} — ${c.artist}`,
  ),
  '',
]
fs.writeFileSync(path.join(OUT, 'CREDITS.md'), md.join('\n'), 'utf8')

console.log(`\n${credits.length} photos → ${(total / 1024 / 1024).toFixed(2)} MB in public/images`)
console.log('Wrote CREDITS.json and CREDITS.md')
