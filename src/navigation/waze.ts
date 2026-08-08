import type { AccessPoint, Coordinates, Place } from '@/types/place'

const WAZE_BASE = 'https://waze.com/ul'

export type WazeLinkResult =
  | { ok: true; url: string; mode: 'll' | 'q'; label: string; privateLocation: boolean }
  | { ok: false; error: string }

export function isValidCoordinates(coords: Coordinates | undefined): coords is Coordinates {
  if (!coords) return false
  if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return false
  if (coords.lat < -90 || coords.lat > 90) return false
  if (coords.lng < -180 || coords.lng > 180) return false
  return true
}

/** Only verified coordinates may generate `ll=` navigation links. */
export function canUseCoordinateNavigation(
  coords: Coordinates | undefined,
): coords is Coordinates & { status: 'verified' } {
  return isValidCoordinates(coords) && coords.status === 'verified'
}

export function buildWazeLink(options: {
  place: Place
  accessPoint?: AccessPoint
  navigate?: boolean
  utmSource?: string
}): WazeLinkResult {
  const { place, navigate = true, utmSource = 'slovakia-travel-companion' } = options
  const accessPoint =
    options.accessPoint ??
    place.accessPoints.find((point) => point.isDefaultNav) ??
    place.accessPoints[0]

  if (!accessPoint) {
    return { ok: false, error: 'No access point available for this place.' }
  }

  const params = new URLSearchParams()
  params.set('utm_source', utmSource)
  if (navigate) params.set('navigate', 'yes')

  const coords = accessPoint.coordinates
  if (canUseCoordinateNavigation(coords)) {
    // Official docs encode comma as %2C in examples; raw comma also works in URLSearchParams.
    params.set('ll', `${coords.lat},${coords.lng}`)
    return {
      ok: true,
      url: `${WAZE_BASE}?${params.toString()}`,
      mode: 'll',
      label: accessPoint.labelEn,
      privateLocation: place.privateLocation,
    }
  }

  const query = accessPoint.wazeQuery?.trim() || place.addressEn?.trim() || place.nameEn.trim()
  if (!query) {
    return { ok: false, error: 'Missing Waze search query and verified coordinates.' }
  }

  params.set('q', query)
  return {
    ok: true,
    url: `${WAZE_BASE}?${params.toString()}`,
    mode: 'q',
    label: accessPoint.labelEn,
    privateLocation: place.privateLocation,
  }
}

export function openWaze(result: Extract<WazeLinkResult, { ok: true }>): void {
  window.open(result.url, '_blank', 'noopener,noreferrer')
}

export function osmSearchUrl(query: string): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`
}
