import type { Coordinates, WeatherSnapshot } from '@/types/place'

const ALLOWED_WEATHER_HOSTS = new Set(['api.open-meteo.com'])

const cache = new Map<string, { expiresAt: number; value: WeatherSnapshot }>()
const inflight = new Map<string, Promise<WeatherSnapshot>>()

const CACHE_TTL_MS = 30 * 60 * 1000

function assertAllowedUrl(url: URL): void {
  if (!ALLOWED_WEATHER_HOSTS.has(url.hostname)) {
    throw new Error(`Weather host not allowlisted: ${url.hostname}`)
  }
  if (url.protocol !== 'https:') {
    throw new Error('Weather requests must use HTTPS.')
  }
}

function cacheKey(lat: number, lng: number, date?: string): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)},${date ?? 'range'}`
}

export function weatherCodeLabel(code: number | null): string {
  if (code === null) return 'Unknown'
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 48) return 'Fog'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Showers'
  if (code <= 86) return 'Snow showers'
  if (code <= 99) return 'Thunderstorm'
  return `Code ${code}`
}

export async function fetchPlaceWeather(
  point: Coordinates,
  options: { visitDate?: string; label?: string } = {},
): Promise<WeatherSnapshot> {
  if (point.status === 'missing') {
    throw new Error('No forecast point available for this place.')
  }

  const key = cacheKey(point.lat, point.lng, options.visitDate)
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const existing = inflight.get(key)
  if (existing) return existing

  const promise = (async () => {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    assertAllowedUrl(url)
    url.searchParams.set('latitude', String(point.lat))
    url.searchParams.set('longitude', String(point.lng))
    url.searchParams.set('current', 'temperature_2m,weather_code')
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    )
    url.searchParams.set('hourly', 'temperature_2m,precipitation_probability,weather_code')
    url.searchParams.set('forecast_days', '10')
    url.searchParams.set('timezone', 'auto')

    const response = await fetch(url.toString(), { method: 'GET' })
    if (!response.ok) {
      throw new Error(`Weather request failed (${response.status})`)
    }

    const data = (await response.json()) as OpenMeteoResponse
    const daily: WeatherSnapshot['daily'] = (data.daily?.time ?? []).map((date, index) => ({
      date,
      tempMaxC: data.daily?.temperature_2m_max?.[index] ?? null,
      tempMinC: data.daily?.temperature_2m_min?.[index] ?? null,
      precipitationProbabilityMax: data.daily?.precipitation_probability_max?.[index] ?? null,
      weatherCode: data.daily?.weather_code?.[index] ?? null,
    }))

    let hourlyNearVisit: WeatherSnapshot['hourlyNearVisit']
    if (options.visitDate && data.hourly?.time) {
      hourlyNearVisit = data.hourly.time
        .map((time, index) => ({
          time,
          tempC: data.hourly?.temperature_2m?.[index] ?? null,
          precipitationProbability: data.hourly?.precipitation_probability?.[index] ?? null,
          weatherCode: data.hourly?.weather_code?.[index] ?? null,
        }))
        .filter((row) => row.time.startsWith(options.visitDate!))
        .slice(8, 20) // daytime window roughly
    }

    const snapshot: WeatherSnapshot = {
      fetchedAt: new Date().toISOString(),
      latitude: point.lat,
      longitude: point.lng,
      timezone: data.timezone ?? 'auto',
      currentTempC: data.current?.temperature_2m ?? null,
      weatherCode: data.current?.weather_code ?? null,
      daily,
      hourlyNearVisit,
      source: 'open-meteo',
      label: options.label ?? `${point.lat.toFixed(3)},${point.lng.toFixed(3)}`,
    }

    cache.set(key, { value: snapshot, expiresAt: Date.now() + CACHE_TTL_MS })
    return snapshot
  })()

  inflight.set(key, promise)
  try {
    return await promise
  } finally {
    inflight.delete(key)
  }
}

export function clearWeatherCache(): void {
  cache.clear()
  inflight.clear()
}

interface OpenMeteoResponse {
  timezone?: string
  current?: {
    temperature_2m?: number
    weather_code?: number
  }
  daily?: {
    time?: string[]
    temperature_2m_max?: Array<number | null>
    temperature_2m_min?: Array<number | null>
    precipitation_probability_max?: Array<number | null>
    weather_code?: Array<number | null>
  }
  hourly?: {
    time?: string[]
    temperature_2m?: Array<number | null>
    precipitation_probability?: Array<number | null>
    weather_code?: Array<number | null>
  }
}
