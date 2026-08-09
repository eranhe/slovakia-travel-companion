import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryBadge } from '@/components/CategoryBadge'
import { HeroImage, Thumb } from '@/components/Illustration'
import { PageHeader } from '@/components/PageHeader'
import { PlaceCard } from '@/components/PlaceCard'
import {
  briefingPlanLabel,
  buildMorningBriefing,
  type MorningBriefing,
} from '@/content/morningBriefing'
import { useApp } from '@/providers/AppProvider'
import { openWazeForPlaceId } from '@/navigation/openPlaceWaze'
import { getPlacesForDay } from '@/places/PlaceRepository'
import { getDayItinerary, ensureItineraryState } from '@/itinerary/ItineraryRepository'
import { planKindLabel } from '@/itinerary/impactPreview'
import { categoryImageId } from '@/media/images'
import { getTripDays, getTripProfile } from '@/trip/TripRepository'
import { dayLabel, todayIsoInTimezone } from '@/trip/tripDays'
import type { ContingencyActivity, PlanKind } from '@/types/itinerary'
import type { Place } from '@/types/place'
import type { ActivityStub, DayRecord, TripProfile } from '@/validation/tripSchemas'

export function TodayPage() {
  const { preferences, sessionMode } = useApp()
  const isHe = preferences.locale === 'he'

  const [profile, setProfile] = useState<TripProfile | null>(null)
  const [days, setDays] = useState<DayRecord[]>([])
  const [activities, setActivities] = useState<Array<ActivityStub | ContingencyActivity>>([])
  const [activePlanKind, setActivePlanKind] = useState<PlanKind>('main')
  const [hasRainPlan, setHasRainPlan] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null)

  useEffect(() => {
    if (sessionMode !== 'open') return
    void (async () => {
      setProfile(await getTripProfile())
      const loadedDays = await getTripDays()
      setDays(loadedDays)
    })()
  }, [sessionMode])

  const todayIso = profile ? todayIsoInTimezone(profile.timezone) : null
  const currentDay = days.find((day) => day.date === todayIso) ?? days[0]

  useEffect(() => {
    if (sessionMode !== 'open' || !currentDay) {
      setPlaces([])
      setActivities([])
      return
    }
    void getPlacesForDay(currentDay.dayNumber).then(setPlaces)
    void (async () => {
      await ensureItineraryState()
      const bundle = await getDayItinerary(currentDay.dayNumber)
      if (!bundle) return
      setActivities(bundle.activeActivities)
      setActivePlanKind(bundle.day.activePlanKind)
      setHasRainPlan(bundle.contingencies.some((plan) => plan.kind === 'rain'))
    })()
  }, [sessionMode, currentDay])

  useEffect(() => {
    if (sessionMode !== 'open') return
    void buildMorningBriefing()
      .then(setBriefing)
      .catch(() => setBriefing(null))
  }, [sessionMode, currentDay?.dayNumber])

  return (
    <section className="page">
      <PageHeader
        titleEn="Today"
        titleHe="היום"
        subtitleEn={
          currentDay
            ? `${currentDay.date} · ${dayLabel(currentDay.dayNumber, 'en')} · ${planKindLabel(activePlanKind, 'en')}`
            : 'The trip is ready.'
        }
        subtitleHe={
          currentDay
            ? `${currentDay.date} · ${dayLabel(currentDay.dayNumber, 'he')} · ${planKindLabel(activePlanKind, 'he')}`
            : 'הטיול מוכן.'
        }
      />

      {briefing ? (
        <article className="surface-card briefing-card">
          <h2>{isHe ? 'תדריך בוקר' : 'Morning briefing'}</h2>
          <ul className="briefing-list">
            <li>
              <span className="muted small">{isHe ? 'לינה הלילה' : 'Sleeping tonight'}</span>
              <div>{isHe ? briefing.sleepTonightHe : briefing.sleepTonightEn}</div>
            </li>
            <li>
              <span className="muted small">{isHe ? 'קודם כל' : 'First up'}</span>
              <div>
                {isHe
                  ? briefing.firstActivityHe ?? 'אין פעילות מתוכננת'
                  : briefing.firstActivityEn ?? 'No planned activity'}
                {briefing.bookingRef ? ` · ${briefing.bookingRef}` : ''}
              </div>
            </li>
            <li>
              <span className="muted small">{isHe ? 'מזג אוויר' : 'Weather'}</span>
              <div>
                {isHe
                  ? briefing.weatherSummaryHe ?? 'אין תחזית עדיין'
                  : briefing.weatherSummaryEn ?? 'No forecast yet'}
              </div>
            </li>
            <li>
              <span className="muted small">{isHe ? 'מה ללבוש / לקחת' : 'Wear / carry'}</span>
              <div>
                {isHe ? briefing.wearHe : briefing.wearEn}
                {briefing.bagHe
                  ? ` · ${isHe ? 'תיק: ' : 'Bag: '}${isHe ? briefing.bagHe : briefing.bagEn}`
                  : ''}
              </div>
            </li>
            <li>
              <span className="muted small">{isHe ? 'תוכנית' : 'Plan'}</span>
              <div>
                {briefingPlanLabel(briefing.activePlanKind, isHe ? 'he' : 'en')}
                {briefing.hasRainPlan
                  ? isHe
                    ? ' · יש תוכנית גשם'
                    : ' · Rain Plan ready'
                  : ''}
                {briefing.wazeReady
                  ? isHe
                    ? ' · Waze מוכן'
                    : ' · Waze ready'
                  : ''}
              </div>
            </li>
            {briefing.cashNoteHe ? (
              <li>
                <span className="muted small">{isHe ? 'מזומן' : 'Cash'}</span>
                <div>{isHe ? briefing.cashNoteHe : briefing.cashNoteEn}</div>
              </li>
            ) : null}
            {briefing.changedSinceLastNightHe ? (
              <li>
                <span className="muted small">{isHe ? 'מאז אתמול בערב' : 'Since last night'}</span>
                <div>
                  {isHe ? briefing.changedSinceLastNightHe : briefing.changedSinceLastNightEn}
                </div>
              </li>
            ) : null}
          </ul>
          {briefing.reminders.length > 0 ? (
            <ul className="reminder-list">
              {briefing.reminders.map((item) => (
                <li key={item.id} className={`reminder reminder-${item.kind}`}>
                  <strong>
                    {item.time ? `${item.time} · ` : ''}
                    {isHe ? item.titleHe : item.titleEn}
                  </strong>
                  {item.detailEn ? (
                    <span className="muted small">{isHe ? item.detailHe : item.detailEn}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="settings-row" style={{ marginTop: '0.65rem' }}>
            <Link to="/emergency" className="btn btn-ghost">
              {isHe ? 'חירום' : 'Emergency'}
            </Link>
            <Link to="/packing" className="btn btn-ghost">
              {isHe ? 'ציוד' : 'Packing'}
            </Link>
          </div>
        </article>
      ) : null}

      <article className="surface-card">
        {currentDay ? (
          <HeroImage
            imageId={currentDay.imageId}
            alt=""
            eyebrow={`${dayLabel(currentDay.dayNumber, isHe ? 'he' : 'en')} · ${currentDay.date}`}
            overlayTitle={isHe ? currentDay.titleHe : currentDay.titleEn}
            overlaySubtitle={isHe ? currentDay.baseLocationHe : currentDay.baseLocationEn}
          />
        ) : (
          <p className="muted">
            {profile ? profile.name : isHe ? 'אין מסלול עדיין' : 'No itinerary yet'}
          </p>
        )}
        <p className="muted small" style={{ marginTop: '0.6rem' }}>
          {planKindLabel(activePlanKind, isHe ? 'he' : 'en')}
          {hasRainPlan ? (isHe ? ' · יש תוכנית גשם' : ' · Rain Plan available') : null}
        </p>
        {activities.length === 0 ? (
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            {isHe ? 'אין פעילות מתוכננת ליום זה.' : 'No activity planned for this day.'}
          </p>
        ) : (
          <ul className="schedule-list">
            {activities.map((act) => {
              const optional = 'isOptional' in act && act.isOptional === true
              const end = 'endTime' in act ? act.endTime : undefined
              const category = 'category' in act ? act.category : undefined
              const imageId = 'imageId' in act ? act.imageId : undefined
              const placeId = 'placeId' in act ? act.placeId : undefined
              const website =
                placeId != null ? places.find((p) => p.id === placeId)?.websiteUrl : undefined
              return (
                <li key={act.id} className={optional ? 'schedule-optional' : undefined}>
                  <span className="schedule-time">
                    {act.startTime ? (end ? `${act.startTime}–${end}` : act.startTime) : '—'}
                  </span>
                  <Thumb imageId={imageId ?? categoryImageId(category)} alt="" size="sm" />
                  <span className="schedule-body">
                    <span className="schedule-name">{isHe ? act.nameHe : act.nameEn}</span>
                    {category ? <CategoryBadge category={category} isHe={isHe} /> : null}
                    {optional ? (
                      <span className="status-pill pill-optional">
                        {isHe ? 'אופציונלי' : 'Optional'}
                      </span>
                    ) : null}
                    <span className="schedule-actions">
                      {placeId ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => void openWazeForPlaceId(placeId)}
                        >
                          Waze
                        </button>
                      ) : null}
                      {website ? (
                        <a className="btn btn-ghost" href={website} target="_blank" rel="noreferrer">
                          {isHe ? 'אתר' : 'Site'}
                        </a>
                      ) : null}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <div className="settings-row" style={{ marginTop: '0.75rem' }}>
          <Link to="/tomorrow" className="btn btn-primary">
            {isHe ? 'בדיקת מחר' : 'Check Tomorrow'}
          </Link>
          <Link to="/command" className="btn btn-secondary">
            {isHe ? 'מרכז פיקוד' : 'Command center'}
          </Link>
          <Link to="/maps" className="btn btn-ghost">
            {isHe ? 'מפות' : 'Maps'}
          </Link>
          <Link to="/journal" className="btn btn-ghost">
            {isHe ? 'יומן' : 'Journal'}
          </Link>
          <Link to="/guide" className="btn btn-ghost">
            {isHe ? 'מדריך' : 'Guide'}
          </Link>
          <Link to="/trip" className="btn btn-ghost">
            {isHe ? 'מסלול' : 'Trip'}
          </Link>
        </div>
      </article>

      {places.length > 0 ? (
        <div className="card-grid">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} visitDate={currentDay?.date} />
          ))}
        </div>
      ) : (
        <article className="surface-card">
          <p className="muted">
            {isHe ? 'אין מקומות מתוכננים ליום זה.' : 'No planned places for this day.'}
          </p>
        </article>
      )}
    </section>
  )
}
