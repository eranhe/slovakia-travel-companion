import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearWeatherCache, fetchPlaceWeather, weatherCodeLabel } from '@/weather/openMeteo'

describe('open-meteo adapter', () => {
  afterEach(() => {
    clearWeatherCache()
    vi.unstubAllGlobals()
  })

  it('maps weather codes', () => {
    expect(weatherCodeLabel(0)).toBe('Clear')
    expect(weatherCodeLabel(61)).toBe('Rain')
  })

  it('fetches, caches, and dedupes in-flight requests', async () => {
    let calls = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        calls += 1
        return {
          ok: true,
          json: async () => ({
            timezone: 'Europe/Bratislava',
            current: { temperature_2m: 22, weather_code: 1 },
            daily: {
              time: ['2026-08-20'],
              temperature_2m_max: [25],
              temperature_2m_min: [14],
              precipitation_probability_max: [20],
              weather_code: [1],
            },
            hourly: {
              time: ['2026-08-20T10:00', '2026-08-20T11:00'],
              temperature_2m: [21, 22],
              precipitation_probability: [10, 15],
              weather_code: [1, 1],
            },
          }),
        }
      }),
    )

    const point = { lat: 49.1, lng: 19.6, status: 'approximate-city' as const }
    const [a, b] = await Promise.all([
      fetchPlaceWeather(point, { visitDate: '2026-08-20', label: 'test' }),
      fetchPlaceWeather(point, { visitDate: '2026-08-20', label: 'test' }),
    ])
    expect(a.currentTempC).toBe(22)
    expect(b.currentTempC).toBe(22)
    expect(calls).toBe(1)

    const cached = await fetchPlaceWeather(point, { visitDate: '2026-08-20' })
    expect(cached.currentTempC).toBe(22)
    expect(calls).toBe(1)
  })

  it('blocks non-allowlisted hosts via URL construction safety', async () => {
    // Adapter hardcodes allowlisted host; ensure request uses https open-meteo only.
    const fetchMock = vi.fn(async (input: RequestInfo) => {
      const href = String(input)
      expect(href.startsWith('https://api.open-meteo.com/')).toBe(true)
      return {
        ok: true,
        json: async () => ({
          current: { temperature_2m: 10, weather_code: 0 },
          daily: { time: [] },
        }),
      }
    })
    vi.stubGlobal('fetch', fetchMock)
    await fetchPlaceWeather({ lat: 49, lng: 19, status: 'approximate-city' })
    expect(fetchMock).toHaveBeenCalled()
  })
})
