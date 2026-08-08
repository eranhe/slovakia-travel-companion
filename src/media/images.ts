/**
 * Bundled place photos live in `public/images` as `<id>.webp` (960×540) and
 * `<id>-thumb.webp` (320×320). Real Wikimedia Commons photographs ship with the
 * app so the PWA stays offline. See `public/images/CREDITS.md` for attribution.
 */
export const IMAGE_IDS = [
  'hero-tatras',
  'place-adventure-park',
  'place-airport',
  'place-bachledka',
  'place-belianska-cave',
  'place-besenova',
  'place-chocholow',
  'place-chopok',
  'place-drive',
  'place-dunajec',
  'place-energylandia',
  'place-hrebienok',
  'place-ice-cave',
  'place-janosikove-diery',
  'place-liptovska-mara',
  'place-mountain-cart',
  'place-red-monastery',
  'place-resort',
  'place-skalnate-pleso',
  'place-sucha-bela',
  'place-tatralandia',
  'place-zakopane',
  'place-zdiar',
] as const

export type ImageId = (typeof IMAGE_IDS)[number]

const IMAGE_ID_SET = new Set<string>(IMAGE_IDS)

export function isImageId(value: string | null | undefined): value is ImageId {
  return value != null && IMAGE_ID_SET.has(value)
}

export function imageUrl(
  id: string | null | undefined,
  variant: 'wide' | 'thumb' = 'wide',
): string | undefined {
  if (!isImageId(id)) return undefined
  const suffix = variant === 'thumb' ? '-thumb' : ''
  return `${import.meta.env.BASE_URL}images/${id}${suffix}.webp`
}

/** Fallback photo per activity/place category, so nothing renders bare. */
const CATEGORY_IMAGE: Record<string, ImageId> = {
  attraction: 'hero-tatras',
  transport: 'place-drive',
  food: 'place-zdiar',
  accommodation: 'place-resort',
  other: 'hero-tatras',
}

export function categoryImageId(category: string | undefined): ImageId {
  return CATEGORY_IMAGE[category ?? 'other'] ?? 'hero-tatras'
}

export interface PhotoCredit {
  id: string
  place: string
  source: string
  file: string
  license: string
  artist: string
  url: string
}

export async function loadPhotoCredits(): Promise<PhotoCredit[]> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}images/CREDITS.json`)
    if (!res.ok) return []
    return (await res.json()) as PhotoCredit[]
  } catch {
    return []
  }
}
