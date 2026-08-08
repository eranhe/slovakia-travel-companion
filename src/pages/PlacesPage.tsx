import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { PlaceCard } from '@/components/PlaceCard'
import { useApp } from '@/providers/AppProvider'
import { getPlaces } from '@/places/PlaceRepository'
import { getTripDays } from '@/trip/TripRepository'
import { dayCode } from '@/trip/tripDays'
import type { Place } from '@/types/place'
import type { DayRecord } from '@/validation/tripSchemas'

export function PlacesPage() {
  const { preferences, sessionMode } = useApp()
  const isHe = preferences.locale === 'he'
  const isOpen = sessionMode === 'open'

  const [places, setPlaces] = useState<Place[]>([])
  const [days, setDays] = useState<DayRecord[]>([])
  const [filterDay, setFilterDay] = useState<number | 'all'>('all')

  const refresh = useCallback(async () => {
    if (!isOpen) return
    setPlaces(await getPlaces())
    setDays(await getTripDays())
  }, [isOpen])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const visible = useMemo(() => {
    if (filterDay === 'all') return places
    return places.filter((place) => place.dayNumbers.includes(filterDay))
  }, [places, filterDay])

  if (!isOpen) {
    return (
      <section className="page">
        <PageHeader
          titleEn="Places"
          titleHe="מקומות"
          subtitleEn="Sign in to view places, Waze, and weather."
          subtitleHe="התחבר כדי לראות מקומות, Waze ומזג אוויר."
        />
      </section>
    )
  }

  return (
    <section className="page">
      <PageHeader
        titleEn="Places"
        titleHe="מקומות"
        subtitleEn="Place cards with Waze search links and Open-Meteo forecasts."
        subtitleHe="כרטיסי מקום עם קישורי Waze (חיפוש) ותחזיות Open-Meteo."
      />

      <div className="day-tabs" role="tablist">
        <button
          type="button"
          className={`day-tab${filterDay === 'all' ? ' active' : ''}`}
          onClick={() => setFilterDay('all')}
        >
          {isHe ? 'הכל' : 'All'}
        </button>
        {days.map((day) => (
          <button
            key={day.dayNumber}
            type="button"
            className={`day-tab${filterDay === day.dayNumber ? ' active' : ''}`}
            onClick={() => setFilterDay(day.dayNumber)}
          >
            {dayCode(day.dayNumber)}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {visible.map((place) => {
          const visitDate =
            filterDay === 'all'
              ? days.find((day) => place.dayNumbers.includes(day.dayNumber))?.date
              : days.find((day) => day.dayNumber === filterDay)?.date
          return (
            <PlaceCard
              key={place.id}
              place={place}
              visitDate={visitDate}
            />
          )
        })}
      </div>

      {visible.length === 0 ? (
        <article className="surface-card">
          <p className="muted">
            {isHe ? 'אין מקומות מתוכננים.' : 'No planned places.'}
          </p>
        </article>
      ) : null}
    </section>
  )
}
