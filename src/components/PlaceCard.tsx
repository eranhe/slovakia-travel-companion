import { useEffect, useState } from 'react'
import { Thumb } from '@/components/Illustration'
import { categoryImageId } from '@/media/images'
import type { AccessPoint, Place, WeatherSnapshot } from '@/types/place'
import { buildWazeLink, openWaze, osmSearchUrl } from '@/navigation/waze'
import { fetchPlaceWeather, weatherCodeLabel } from '@/weather/openMeteo'
import { useApp } from '@/providers/AppProvider'

interface PlaceCardProps {
  place: Place
  visitDate?: string
}

export function PlaceCard({ place, visitDate }: PlaceCardProps) {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const [selectedAp, setSelectedAp] = useState<AccessPoint | undefined>(
    place.accessPoints.find((point) => point.isDefaultNav) ?? place.accessPoints[0],
  )
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [weatherBusy, setWeatherBusy] = useState(false)

  useEffect(() => {
    setSelectedAp(place.accessPoints.find((point) => point.isDefaultNav) ?? place.accessPoints[0])
  }, [place])

  async function loadWeather() {
    if (!place.forecastPoint) {
      setWeatherError(isHe ? 'אין נקודת תחזית למקום זה.' : 'No forecast point for this place.')
      return
    }
    setWeatherBusy(true)
    setWeatherError(null)
    try {
      const snapshot = await fetchPlaceWeather(place.forecastPoint, {
        visitDate,
        label: place.nameEn,
      })
      setWeather(snapshot)
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : 'Weather failed')
    } finally {
      setWeatherBusy(false)
    }
  }

  function handleWaze() {
    const result = buildWazeLink({ place, accessPoint: selectedAp, navigate: true })
    if (!result.ok) {
      setWeatherError(result.error)
      return
    }
    openWaze(result)
  }

  const dayWeather = weather?.daily.find((day) => day.date === visitDate) ?? weather?.daily[0]
  const mapQuery = selectedAp?.wazeQuery || place.addressEn || place.nameEn

  return (
    <article className="surface-card place-card">
      <div className="place-card-header">
        <Thumb imageId={place.imageId ?? categoryImageId(place.category)} alt="" />
        <div>
          <h2>{isHe ? place.nameHe : place.nameEn}</h2>
          <p className="muted small">
            {place.category}
            {place.privateLocation ? (isHe ? ' · מיקום פרטי' : ' · private location') : ''}
          </p>
        </div>
        {place.privateLocation ? <span className="private-badge">{isHe ? 'פרטי' : 'Private'}</span> : null}
      </div>

      {place.addressEn ? <p className="muted">{isHe && place.addressHe ? place.addressHe : place.addressEn}</p> : null}
      {place.notes ? <p className="muted small">{place.notes}</p> : null}

      {place.accessPoints.length > 0 ? (
        <label className="ap-select">
          <span>{isHe ? 'נקודת גישה' : 'Access point'}</span>
          <select
            className="settings-select"
            value={selectedAp?.id ?? ''}
            onChange={(event) => {
              setSelectedAp(place.accessPoints.find((point) => point.id === event.target.value))
            }}
          >
            {place.accessPoints.map((point) => (
              <option key={point.id} value={point.id}>
                {isHe ? point.labelHe : point.labelEn} ({point.kind})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="settings-row">
        <button type="button" className="btn btn-primary" onClick={handleWaze}>
          {isHe ? 'פתח ב-Waze' : 'Open in Waze'}
        </button>
        <a className="btn btn-secondary" href={osmSearchUrl(mapQuery)} target="_blank" rel="noreferrer">
          {isHe ? 'מפה פנימית (OSM)' : 'Internal map (OSM)'}
        </a>
      </div>

      <div className="weather-block">
        <div className="settings-row">
          <h3>{isHe ? 'מזג אוויר' : 'Weather'}</h3>
          <button type="button" className="btn btn-secondary" disabled={weatherBusy} onClick={() => void loadWeather()}>
            {weatherBusy ? (isHe ? 'טוען…' : 'Loading…') : isHe ? 'טען תחזית' : 'Load forecast'}
          </button>
        </div>
        {place.forecastPoint ? (
          <p className="muted small">
            {isHe ? 'נקודת תחזית:' : 'Forecast point:'} {place.forecastPoint.status}
            {place.forecastPoint.note ? ` — ${place.forecastPoint.note}` : ''}
          </p>
        ) : (
          <p className="muted small">{isHe ? 'אין נקודת תחזית.' : 'No forecast point.'}</p>
        )}
        {weatherError ? <p className="form-error">{weatherError}</p> : null}
        {weather ? (
          <div className="weather-summary">
            <p>
              {isHe ? 'עכשיו:' : 'Now:'} {weather.currentTempC ?? '—'}°C ·{' '}
              {weatherCodeLabel(weather.weatherCode)}
            </p>
            {dayWeather ? (
              <p>
                {dayWeather.date}: {dayWeather.tempMinC ?? '—'}° / {dayWeather.tempMaxC ?? '—'}° ·{' '}
                {weatherCodeLabel(dayWeather.weatherCode)} ·{' '}
                {isHe ? 'גשם' : 'rain'} {dayWeather.precipitationProbabilityMax ?? '—'}%
              </p>
            ) : null}
            {weather.hourlyNearVisit && weather.hourlyNearVisit.length > 0 ? (
              <p className="muted small">
                {isHe ? 'שעות ביום הביקור (מדגם):' : 'Visit-day hours (sample):'}{' '}
                {weather.hourlyNearVisit
                  .filter((_, index) => index % 3 === 0)
                  .map((row) => `${row.time.slice(11, 16)} ${row.tempC ?? '—'}°`)
                  .join(' · ')}
              </p>
            ) : null}
            <p className="muted small">
              Open-Meteo · {weather.fetchedAt.slice(0, 19).replace('T', ' ')}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  )
}
