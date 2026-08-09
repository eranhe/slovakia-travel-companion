import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { TripMap } from '@/components/TripMap'
import {
  buildEstimatedDayRoute,
  buildMapMarkers,
  routeQualityLabel,
  type MapCategoryFilter,
  type MapLayer,
  type MapMarker,
} from '@/maps/mapModel'
import {
  addCheckIn,
  loadCheckIns,
  loadCompletedActivityIds,
  removeCheckIn,
  toggleCompletedActivity,
  type CheckInRecord,
} from '@/maps/visitStore'
import { ensureItineraryState, getDayItinerary } from '@/itinerary/ItineraryRepository'
import { getPlaces } from '@/places/PlaceRepository'
import { getActivities, getTripDays } from '@/trip/TripRepository'
import { dayCode, dayLabel } from '@/trip/tripDays'
import { useApp } from '@/providers/AppProvider'
import type { Place } from '@/types/place'
import type { ActivityStub, DayRecord } from '@/validation/tripSchemas'

export function MapsPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'

  const [places, setPlaces] = useState<Place[]>([])
  const [days, setDays] = useState<DayRecord[]>([])
  const [activities, setActivities] = useState<ActivityStub[]>([])
  const [activityOrderByDay, setActivityOrderByDay] = useState<Record<number, string[]>>({})
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [dayFilter, setDayFilter] = useState<number | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<MapCategoryFilter>('all')
  const [layer, setLayer] = useState<MapLayer | 'both'>('both')
  const [includePrivate, setIncludePrivate] = useState(false)
  const [selected, setSelected] = useState<MapMarker | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const refreshLocal = useCallback(() => {
    setCheckIns(loadCheckIns())
    setCompletedIds(loadCompletedActivityIds())
  }, [])

  useEffect(() => {
    void (async () => {
      setPlaces(await getPlaces())
      const loadedDays = await getTripDays()
      setDays(loadedDays)
      setActivities(await getActivities())
      await ensureItineraryState()
      const orders: Record<number, string[]> = {}
      for (const day of loadedDays) {
        const bundle = await getDayItinerary(day.dayNumber)
        if (bundle) orders[day.dayNumber] = bundle.day.activityOrder
      }
      setActivityOrderByDay(orders)
      refreshLocal()
    })()
  }, [refreshLocal])

  const markers = useMemo(
    () =>
      buildMapMarkers({
        places,
        activities,
        completedIds,
        checkIns,
        dayFilter,
        categoryFilter,
        layer,
        includePrivate,
      }),
    [places, activities, completedIds, checkIns, dayFilter, categoryFilter, layer, includePrivate],
  )

  const route = useMemo(() => {
    if (dayFilter === 'all') return null
    return buildEstimatedDayRoute(
      dayFilter,
      places,
      activityOrderByDay[dayFilter] ?? [],
      activities,
    )
  }, [dayFilter, places, activityOrderByDay, activities])

  const dayActivities = useMemo(() => {
    if (dayFilter === 'all') return activities
    return activities.filter((act) => act.dayNumber === dayFilter)
  }, [activities, dayFilter])

  async function handleForegroundCheckIn() {
    setBusy(true)
    setMessage(null)
    try {
      if (!navigator.geolocation) {
        setMessage(isHe ? 'אין תמיכה במיקום בדפדפן זה.' : 'Geolocation is not supported in this browser.')
        return
      }
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 0,
        })
      })
      addCheckIn({
        labelEn: 'Foreground check-in',
        labelHe: 'צ׳ק־אין מהמיקום הנוכחי',
        dayNumber: dayFilter === 'all' ? undefined : dayFilter,
        source: 'foreground-geo',
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          status: 'user-reported',
        },
        note: isHe
          ? 'נשמר מקומית במכשיר בלבד. אין מעקב ברקע.'
          : 'Stored locally on this device only. No background tracking.',
      })
      refreshLocal()
      setLayer((prev) => (prev === 'planned' ? 'both' : prev))
      setMessage(isHe ? 'הצ׳ק־אין נשמר.' : 'Check-in saved.')
    } catch {
      setMessage(
        isHe
          ? 'המיקום לא אושר או נכשל.'
          : 'Location permission denied or failed.',
      )
    } finally {
      setBusy(false)
    }
  }

  function handlePlaceCheckIn(place: Place) {
    const point = place.forecastPoint
    addCheckIn({
      labelEn: place.nameEn,
      labelHe: place.nameHe,
      placeId: place.id,
      dayNumber: dayFilter === 'all' ? place.dayNumbers[0] : dayFilter,
      source: 'manual',
      coordinates: point
        ? {
            lat: point.lat,
            lng: point.lng,
            status: 'approximate',
          }
        : undefined,
      note: isHe
        ? 'צ׳ק־אין ידני בנקודה משוערת של המקום.'
        : 'Manual check-in at the place approximate point.',
    })
    refreshLocal()
    setLayer((prev) => (prev === 'planned' ? 'both' : prev))
    setMessage(isHe ? 'סומן כביקור.' : 'Marked as visited check-in.')
  }

  function handleToggleComplete(activityId: string) {
    setCompletedIds(toggleCompletedActivity(activityId))
    setLayer((prev) => (prev === 'planned' ? 'both' : prev))
  }

  return (
    <section className="page">
      <PageHeader
        titleEn="Maps"
        titleHe="מפות"
        subtitleEn="Planned vs visited · Option A: manual check-ins, no background tracking"
        subtitleHe="מתוכנן מול בוקר · אפשרות A: צ׳ק־אין ידני, בלי מעקב ברקע"
      />

      <article className="surface-card">
        <p className="muted small">
          {isHe
            ? 'שכבות: מתוכנן (תכלת) ובוקר/בוצע (ירוק). מסלול מקווקוו = משוער בלבד. מיקום נשמר רק כשמאשרים צ׳ק־אין — אין מעקב כשהאפליקציה סגורה.'
            : 'Layers: planned (teal) and visited/done (green). Dashed route = estimated only. Location is saved only when you confirm a check-in — no tracking while the app is closed.'}
        </p>

        <div className="map-filters">
          <label>
            {isHe ? 'יום' : 'Day'}
            <select
              value={dayFilter === 'all' ? 'all' : String(dayFilter)}
              onChange={(e) =>
                setDayFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
            >
              <option value="all">{isHe ? 'כל הימים' : 'All days'}</option>
              {days.map((day) => (
                <option key={day.dayNumber} value={day.dayNumber}>
                  {dayCode(day.dayNumber)} · {isHe ? day.titleHe : day.titleEn}
                </option>
              ))}
            </select>
          </label>

          <label>
            {isHe ? 'שכבה' : 'Layer'}
            <select
              value={layer}
              onChange={(e) => setLayer(e.target.value as MapLayer | 'both')}
            >
              <option value="both">{isHe ? 'שתי השכבות' : 'Both'}</option>
              <option value="planned">{isHe ? 'מתוכנן' : 'Planned'}</option>
              <option value="visited">{isHe ? 'בוקר / בוצע' : 'Visited'}</option>
            </select>
          </label>

          <label>
            {isHe ? 'קטגוריה' : 'Category'}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as MapCategoryFilter)}
            >
              <option value="all">{isHe ? 'הכל' : 'All'}</option>
              <option value="attraction">{isHe ? 'אטרקציות' : 'Attractions'}</option>
              <option value="accommodation">{isHe ? 'לינה' : 'Accommodation'}</option>
              <option value="transport">{isHe ? 'תחבורה' : 'Transport'}</option>
              <option value="food">{isHe ? 'אוכל' : 'Food'}</option>
              <option value="checkin">{isHe ? 'צ׳ק־אין' : 'Check-ins'}</option>
            </select>
          </label>

          <label className="map-check">
            <input
              type="checkbox"
              checked={includePrivate}
              onChange={(e) => setIncludePrivate(e.target.checked)}
            />
            {isHe ? 'הצג לינה פרטית' : 'Show private lodging'}
          </label>
        </div>

        <div className="settings-row" style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => void handleForegroundCheckIn()}
          >
            {isHe ? 'צ׳ק־אין מהמיקום (בחזית)' : 'Check in here (foreground)'}
          </button>
          <Link to="/places" className="btn btn-ghost">
            {isHe ? 'מקומות' : 'Places'}
          </Link>
          <Link to="/guide" className="btn btn-ghost">
            {isHe ? 'מדריך' : 'Guide'}
          </Link>
        </div>
        {message ? (
          <p className="muted small" style={{ marginTop: '0.5rem' }} role="status">
            {message}
          </p>
        ) : null}
      </article>

      <TripMap
        markers={markers}
        route={route}
        selectedId={selected?.id}
        onSelect={setSelected}
        isHe={isHe}
      />

      {route ? (
        <p className="muted small">
          {isHe ? 'איכות מסלול: ' : 'Route quality: '}
          {routeQualityLabel(route.quality, isHe ? 'he' : 'en')}
        </p>
      ) : null}

      {selected ? (
        <article className="surface-card">
          <h2>{isHe ? selected.nameHe : selected.nameEn}</h2>
          <p className="muted small">
            {selected.layer === 'visited'
              ? isHe
                ? 'שכבת בוקר'
                : 'Visited layer'
              : isHe
                ? 'שכבת מתוכנן'
                : 'Planned layer'}
            {' · '}
            {selected.coordStatus}
            {selected.accessLabelEn
              ? ` · ${isHe ? selected.accessLabelHe : selected.accessLabelEn}`
              : ''}
          </p>
          {selected.addressEn ? <p className="muted">{selected.addressEn}</p> : null}
          <p className="muted small">{isHe ? selected.noteHe : selected.noteEn}</p>
          <div className="settings-row" style={{ marginTop: '0.65rem' }}>
            {selected.wazeUrl ? (
              <a className="btn btn-primary" href={selected.wazeUrl} target="_blank" rel="noreferrer">
                {isHe ? 'פתח ב-Waze' : 'Open in Waze'}
              </a>
            ) : null}
            {selected.websiteUrl ? (
              <a
                className="btn btn-secondary"
                href={selected.websiteUrl}
                target="_blank"
                rel="noreferrer"
              >
                {isHe ? 'אתר המקום' : 'Website'}
              </a>
            ) : null}
            {selected.placeId ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const place = places.find((p) => p.id === selected.placeId)
                  if (place) handlePlaceCheckIn(place)
                }}
              >
                {isHe ? 'צ׳ק־אין במקום' : 'Check in at place'}
              </button>
            ) : null}
            {selected.checkInId ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  removeCheckIn(selected.checkInId!)
                  refreshLocal()
                  setSelected(null)
                }}
              >
                {isHe ? 'מחק צ׳ק־אין' : 'Remove check-in'}
              </button>
            ) : null}
          </div>
        </article>
      ) : null}

      <article className="surface-card">
        <h2>{isHe ? 'פעילויות להשלמה' : 'Complete activities'}</h2>
        <p className="muted small">
          {isHe
            ? 'סימון בוצע מעביר את המקום לשכבת Visited (משוחזר מפעילות).'
            : 'Marking done moves the place onto the Visited layer (reconstructed from activity).'}
        </p>
        {dayActivities.length === 0 ? (
          <p className="muted">{isHe ? 'אין פעילויות לסינון הנוכחי.' : 'No activities for this filter.'}</p>
        ) : (
          <ul className="packing-list">
            {dayActivities.map((act) => (
              <li key={act.id}>
                <label className="packing-item">
                  <input
                    type="checkbox"
                    checked={completedIds.has(act.id)}
                    onChange={() => handleToggleComplete(act.id)}
                  />
                  <span>
                    <span className="item-label">{isHe ? act.nameHe : act.nameEn}</span>
                    <span className="muted small item-note">
                      {[
                        dayLabel(act.dayNumber, isHe ? 'he' : 'en'),
                        act.startTime,
                        act.isOptional ? (isHe ? 'אופציונלי' : 'optional') : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </article>

      {checkIns.length > 0 ? (
        <article className="surface-card">
          <h2>{isHe ? 'צ׳ק־אינים אחרונים' : 'Recent check-ins'}</h2>
          <ul className="activity-list">
            {checkIns.slice(0, 8).map((item) => (
              <li key={item.id}>
                {(isHe ? item.labelHe : item.labelEn) +
                  ` · ${new Date(item.at).toLocaleString()} · ${item.source}`}
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  )
}
