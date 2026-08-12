import { useCallback, useEffect, useState } from 'react'
import { ContingencyPanel } from '@/components/ContingencyPanel'
import { DayTimeline } from '@/components/DayTimeline'
import { HeroImage } from '@/components/Illustration'
import { PageHeader } from '@/components/PageHeader'
import { PlaceCard } from '@/components/PlaceCard'
import {
  activatePlan,
  ensureItineraryState,
  getDayItinerary,
  previewPlanActivation,
  restoreOriginalOrder,
  undoLastRevision,
} from '@/itinerary/ItineraryRepository'
import { useApp } from '@/providers/AppProvider'
import { loadCompletedActivityIds, toggleCompletedActivity } from '@/maps/visitStore'
import { getPlacesForDay } from '@/places/PlaceRepository'
import { getReminders, getTripDays, getTripProfile } from '@/trip/TripRepository'
import { dayCode, dayLabel, todayIsoInTimezone } from '@/trip/tripDays'
import type {
  ContingencyActivity,
  ContingencyPlan,
  DayItineraryState,
  PlanKind,
  RevisionEntry,
} from '@/types/itinerary'
import type { Place } from '@/types/place'
import type {
  ActivityStub,
  DayRecord,
  TripProfile,
  TripReminder,
} from '@/validation/tripSchemas'

export function TripPage() {
  const { preferences, sessionMode } = useApp()
  const isHe = preferences.locale === 'he'
  const isOpen = sessionMode === 'open'

  const [profile, setProfile] = useState<TripProfile | null>(null)
  const [days, setDays] = useState<DayRecord[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [autoSelected, setAutoSelected] = useState(false)
  const [dayState, setDayState] = useState<DayItineraryState | null>(null)
  const [mainActivities, setMainActivities] = useState<ActivityStub[]>([])
  const [activeItems, setActiveItems] = useState<Array<ActivityStub | ContingencyActivity>>([])
  const [contingencies, setContingencies] = useState<ContingencyPlan[]>([])
  const [revisions, setRevisions] = useState<RevisionEntry[]>([])
  const [reminders, setReminders] = useState<TripReminder[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(() =>
    loadCompletedActivityIds(),
  )

  const reloadDay = useCallback(async (dayNumber: number) => {
    await ensureItineraryState()
    const bundle = await getDayItinerary(dayNumber)
    if (!bundle) return
    setDayState(bundle.day)
    setMainActivities(bundle.mainActivities)
    setActiveItems(bundle.activeActivities)
    setContingencies(bundle.contingencies)
    setRevisions(bundle.revisions)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    void (async () => {
      setProfile(await getTripProfile())
      setDays(await getTripDays())
      setReminders(await getReminders())
      await reloadDay(selectedDay)
    })()
  }, [isOpen, selectedDay, reloadDay])

  useEffect(() => {
    if (!isOpen) return
    void getPlacesForDay(selectedDay).then(setPlaces)
  }, [isOpen, selectedDay])

  // Jump to the day the family is actually living, once, on first load.
  useEffect(() => {
    if (autoSelected || !profile || days.length === 0) return
    const today = todayIsoInTimezone(profile.timezone)
    const match = days.find((item) => item.date === today)
    if (match) setSelectedDay(match.dayNumber)
    setAutoSelected(true)
  }, [autoSelected, profile, days])

  const day = days.find((item) => item.dayNumber === selectedDay) ?? days[0]
  const dayReminders = day ? reminders.filter((item) => item.date === day.date) : []

  if (!isOpen) {
    return (
      <section className="page">
        <PageHeader
          titleEn="Trip"
          titleHe="מסלול"
          subtitleEn="Open the trip to view the itinerary."
          subtitleHe="פתח את הטיול כדי לצפות במסלול."
        />
      </section>
    )
  }

  return (
    <section className="page">
      <PageHeader
        titleEn="Trip"
        titleHe="מסלול"
        subtitleEn={
          profile
            ? `${profile.startDate} → ${profile.endDate} · arrival + 10 active days + return`
            : 'Preparing the itinerary…'
        }
        subtitleHe={
          profile
            ? `${profile.startDate} → ${profile.endDate} · הגעה + 10 ימי פעילות + חזרה`
            : 'מכין את המסלול…'
        }
      />

      {profile ? (
        <article className="surface-card">
          <HeroImage
            imageId="hero-tatras"
            alt=""
            eyebrow={profile.countries.join(' · ')}
            overlayTitle={profile.name}
            overlaySubtitle={`${profile.startDate} → ${profile.endDate}`}
          />
          <p style={{ marginTop: '0.75rem' }}>{profile.travelers.join(' · ')}</p>
          <p className="muted">{profile.regions.join(', ')}</p>
        </article>
      ) : null}

      <div className="day-tabs" role="tablist" aria-label={isHe ? 'ימי הטיול' : 'Trip days'}>
        {days.map((item) => (
          <button
            key={item.dayNumber}
            type="button"
            role="tab"
            aria-selected={item.dayNumber === selectedDay}
            className={`day-tab${item.dayNumber === selectedDay ? ' active' : ''}`}
            onClick={() => setSelectedDay(item.dayNumber)}
          >
            <span>{dayCode(item.dayNumber)}</span>
            <small>{item.date.slice(5)}</small>
          </button>
        ))}
      </div>

      {day ? (
        <article className="surface-card">
          <HeroImage
            imageId={day.imageId}
            alt=""
            eyebrow={`${dayLabel(day.dayNumber, isHe ? 'he' : 'en')} · ${day.date}`}
            overlayTitle={isHe ? day.titleHe : day.titleEn}
            overlaySubtitle={isHe ? day.baseLocationHe : day.baseLocationEn}
          />
          {day.notes || day.notesHe ? (
            <p style={{ marginTop: '0.5rem' }}>
              {isHe ? (day.notesHe ?? day.notes) : (day.notes ?? day.notesHe)}
            </p>
          ) : null}

          {dayReminders.length > 0 ? (
            <ul className="reminder-list">
              {dayReminders.map((item) => (
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

          {dayState ? (
            <DayTimeline
              isHe={isHe}
              day={dayState}
              items={activeItems}
              completedIds={completedIds}
              onToggleCompleted={(activityId) =>
                setCompletedIds(toggleCompletedActivity(activityId))
              }
            />
          ) : null}
        </article>
      ) : null}

      {dayState ? (
        <ContingencyPanel
          isHe={isHe}
          activePlanKind={dayState.activePlanKind}
          contingencies={contingencies}
          mainActivities={mainActivities}
          revisions={revisions}
          onPreview={(kind) => previewPlanActivation(selectedDay, kind)}
          onConfirmActivate={async (kind: PlanKind) => {
            await activatePlan(selectedDay, kind)
            await reloadDay(selectedDay)
          }}
          onRestoreOriginal={async () => {
            await restoreOriginalOrder(selectedDay)
            await reloadDay(selectedDay)
          }}
          onUndo={async () => {
            await undoLastRevision(selectedDay)
            await reloadDay(selectedDay)
          }}
        />
      ) : null}

      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          visitDate={day?.date}
        />
      ))}
    </section>
  )
}
