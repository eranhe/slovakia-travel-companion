/**
 * Waze deeplinks — prefer the official `www.waze.com/ul` form and keep `ll`
 * commas unencoded (URLSearchParams turns them into %2C, which some clients
 * mishandle and drop the user on the Waze homepage).
 * @see https://developers.google.com/waze/deeplinks
 */
import type { AccessPoint, Coordinates, Place } from '@/types/place'

const WAZE_WEB = 'https://www.waze.com/ul'
const WAZE_APP = 'waze://'

export type WazeLinkResult =
  | { ok: true; url: string; appUrl: string; mode: 'll' | 'q'; label: string; privateLocation: boolean }
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

function appendNavigate(base: string, navigate: boolean): string {
  if (!navigate) return base
  return `${base}${base.includes('?') ? '&' : '?'}navigate=yes`
}

export function buildWazeLink(options: {
  place: Place
  accessPoint?: AccessPoint
  navigate?: boolean
  utmSource?: string
}): WazeLinkResult {
  const { place, navigate = true } = options
  const accessPoint =
    options.accessPoint ??
    place.accessPoints.find((point) => point.isDefaultNav) ??
    place.accessPoints[0]

  if (!accessPoint) {
    return { ok: false, error: 'No access point available for this place.' }
  }

  const coords = accessPoint.coordinates
  if (canUseCoordinateNavigation(coords)) {
    // Keep a literal comma in `ll` — do not run through URLSearchParams.
    const ll = `${coords.lat},${coords.lng}`
    const web = appendNavigate(`${WAZE_WEB}?ll=${ll}`, navigate)
    const app = appendNavigate(`${WAZE_APP}?ll=${ll}`, navigate)
    return {
      ok: true,
      url: web,
      appUrl: app,
      mode: 'll',
      label: accessPoint.labelEn,
      privateLocation: place.privateLocation,
    }
  }

  const query = accessPoint.wazeQuery?.trim() || place.addressEn?.trim() || place.nameEn.trim()
  if (!query) {
    return { ok: false, error: 'Missing Waze search query and verified coordinates.' }
  }

  const encoded = encodeURIComponent(query)
  const web = appendNavigate(`${WAZE_WEB}?q=${encoded}`, navigate)
  const app = appendNavigate(`${WAZE_APP}?q=${encoded}`, navigate)
  return {
    ok: true,
    url: web,
    appUrl: app,
    mode: 'q',
    label: accessPoint.labelEn,
    privateLocation: place.privateLocation,
  }
}

/** Build a Waze search link from a free-text query (no Place / access point needed). */
export function buildWazeSearchLink(
  query: string,
  options?: { navigate?: boolean; label?: string },
): WazeLinkResult {
  const trimmed = query.trim()
  if (!trimmed) {
    return { ok: false, error: 'Missing Waze search query.' }
  }
  const navigate = options?.navigate ?? true
  const encoded = encodeURIComponent(trimmed)
  const web = appendNavigate(`${WAZE_WEB}?q=${encoded}`, navigate)
  const app = appendNavigate(`${WAZE_APP}?q=${encoded}`, navigate)
  return {
    ok: true,
    url: web,
    appUrl: app,
    mode: 'q',
    label: options?.label ?? trimmed,
    privateLocation: false,
  }
}

/**
 * Try the native `waze://` scheme first (mobile), then fall back to HTTPS.
 * Both open in a new tab/window so desktop browsers still reach the web client.
 */
export function openWaze(result: Extract<WazeLinkResult, { ok: true }>): void {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) {
    // Attempt native app; HTTPS remains the reliable fallback.
    window.location.href = result.appUrl
    window.setTimeout(() => {
      window.open(result.url, '_blank', 'noopener,noreferrer')
    }, 800)
    return
  }
  window.open(result.url, '_blank', 'noopener,noreferrer')
}

export function osmSearchUrl(query: string): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`
}

/** Google Maps search URL for users who do not navigate with Waze. */
export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
