import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SRC =
  'C:/Users/eranhe/.cursor/projects/c-Users-eranhe-Downloads-poll-slov-slovakia-travel-companion/assets'
const OUT = path.resolve(import.meta.dirname, '../public/images')

fs.mkdirSync(OUT, { recursive: true })

const files = fs.readdirSync(SRC).filter((file) => file.endsWith('.png'))
let total = 0

for (const file of files) {
  const base = file.replace(/\.png$/, '')
  const input = path.join(SRC, file)

  const wide = path.join(OUT, `${base}.webp`)
  await sharp(input).resize(960, 540, { fit: 'cover' }).webp({ quality: 72 }).toFile(wide)

  const thumb = path.join(OUT, `${base}-thumb.webp`)
  await sharp(input).resize(320, 320, { fit: 'cover' }).webp({ quality: 70 }).toFile(thumb)

  const wideSize = fs.statSync(wide).size
  const thumbSize = fs.statSync(thumb).size
  total += wideSize + thumbSize
  console.log(`${base}: ${(wideSize / 1024).toFixed(0)}kB + ${(thumbSize / 1024).toFixed(0)}kB`)
}

console.log(`\n${files.length} images → ${(total / 1024 / 1024).toFixed(2)} MB total`)
