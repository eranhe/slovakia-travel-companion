import type {
  ActivityAssessment,
  DayWeatherStatus,
  WeatherSuggestion,
} from '@/weather/assessment'
import {
  assessActivity,
  buildSuggestions,
  dayStatusFromActivities,
} from '@/weather/assessment'
import { ensureItineraryState, getDayItinerary } from '@/itinerary/ItineraryRepository'
import { getPlaceById, getPlacesForDay } from '@/places/PlaceRepository'
import { getTripDays, getTripProfile } from '@/trip/TripRepository'
import { ACTIVE_TRIP_DATES, todayIsoInTimezone } from '@/trip/tripDays'
import type { PlanKind } from '@/types/itinerary'
import type { Coordinates, WeatherSnapshot } from '@/types/place'
import type { DayRecord, TripProfile } from '@/validation/tripSchemas'
import { fetchPlaceWeather } from '@/weather/openMeteo'

export type TomorrowCheckTrigger = 'manual' | 'evening' | 'on-open' | 'morning'

export interface TomorrowCheckResult {
  checkedAt: string
  trigger: TomorrowCheckTrigger
  reviewDate: string
  targetDate: string
  dayNumber: number | null
  dayTitleEn: string
  dayTitleHe: string
  dayStatus: DayWeatherStatus
  activities: ActivityAssessment[]
  suggestions: WeatherSuggestion[]
  skipped: boolean
  skipReasonEn?: string
  skipReasonHe?: string
  weatherFetched: boolean
  noteEn: string
  noteHe: string
}

const EVENING_HOUR = 20
const EVENING_MINUTE = 30

export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const utc = Date.UTC(y!, m! - 1, d! + days)
  return new Date(utc).toISOString().slice(0, 10)
}

/** Local wall-clock parts in a given IANA timezone. */
export function localPartsInTimezone(
  timeZone: string,
  now = new Date(),
): { hour: number; minute: number; isoDate: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0'
  return {
    isoDate: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  }
}

export function isPastEveningReviewTime(timeZone: string, now = new Date()): boolean {
  const { hour, minute } = localPartsInTimezone(timeZone, now)
  return hour > EVENING_HOUR || (hour === EVENING_HOUR && minute >= EVENING_MINUTE)
}

export function isMorningWindow(timeZone: string, now = new Date()): boolean {
  const { hour } = localPartsInTimezone(timeZone, now)
  return hour >= 5 && hour < 12
}

/**
 * Resolve which calendar day the check should evaluate.
 * Evening / on-open / manual → tomorrow.
 * Morning recheck → today (the day reviewed last night).
 * Day 10 evening → departure day only if trip.departureDate is set.
 */
export function resolveTargetDay(
  profile: TripProfile,
  days: DayRecord[],
  now = new Date(),
  mode: TomorrowCheckTrigger = 'manual',
): {
  reviewDate: string
  targetDate: string
  day: DayRecord | null
  skipped: boolean
  skipReasonEn?: string
  skipReasonHe?: string
} {
  const reviewDate = todayIsoInTimezone(profile.timezone, now)
  const targetDate = mode === 'morning' ? reviewDate : addDaysIso(reviewDate, 1)
  const day = days.find((item) => item.date === targetDate) ?? null

  if (day) {
    return { reviewDate, targetDate, day, skipped: false }
  }

  // Evening of last active day: only review departure / return-home if planned
  const lastActive = ACTIVE_TRIP_DATES[ACTIVE_TRIP_DATES.length - 1]!
  if (mode !== 'morning' && reviewDate === lastActive && profile.departureDate) {
    return {
      reviewDate,
      targetDate: profile.departureDate,
      day: null,
      skipped: false,
    }
  }

  if (mode !== 'morning' && reviewDate >= lastActive && !profile.departureDate) {
    return {
      reviewDate,
      targetDate,
      day: null,
      skipped: true,
      skipReasonEn: 'No next-day itinerary and no departure plan to review.',
      skipReasonHe: 'אין מסלול ליום הבא ואין תוכנית יציאה לבדיקה.',
    }
  }

  return {
    reviewDate,
    targetDate,
    day: null,
    skipped: true,
    skipReasonEn:
      mode === 'morning' ? 'No itinerary day for today.' : 'No itinerary day for tomorrow.',
    skipReasonHe: mode === 'morning' ? 'אין יום מסלול להיום.' : 'אין יום מסלול למחר.',
  }
}

async function weatherForActivityPlace(
  placeId: string | undefined,
  dayNumber: number | null,
  visitDate: string,
  fallbackPlaces: Awaited<ReturnType<typeof getPlacesForDay>>,
): Promise<{ point: Coordinates | null; snapshot: WeatherSnapshot | null }> {
  let place = placeId ? await getPlaceById(placeId) : null
  if (!place && dayNumber) {
    place = fallbackPlaces.find((p) => p.forecastPoint && p.forecastPoint.status !== 'missing') ?? null
  }
  const point = place?.forecastPoint
  if (!point || point.status === 'missing') {
    return { point: null, snapshot: null }
  }
  try {
    const snapshot = await fetchPlaceWeather(point, {
      visitDate,
      label: place?.nameEn ?? 'forecast',
    })
    return { point, snapshot }
  } catch {
    return { point, snapshot: null }
  }
}

export async function runTomorrowCheck(
  trigger: TomorrowCheckTrigger,
  now = new Date(),
): Promise<TomorrowCheckResult> {
  const profile = await getTripProfile()
  if (!profile) {
    return {
      checkedAt: now.toISOString(),
      trigger,
      reviewDate: todayIsoInTimezone('Europe/Bratislava', now),
      targetDate: '',
      dayNumber: null,
      dayTitleEn: 'No trip',
      dayTitleHe: 'אין טיול',
      dayStatus: 'unable',
      activities: [],
      suggestions: [],
      skipped: true,
      skipReasonEn: 'Trip profile not loaded.',
      skipReasonHe: 'פרופיל הטיול לא נטען.',
      weatherFetched: false,
      noteEn: 'Checks only run while this app is open — there is no background scheduler.',
      noteHe: 'הבדיקה רצה רק כשהאפליקציה פתוחה — אין מתזמן ברקע.',
    }
  }

  const days = await getTripDays()
  const resolved = resolveTargetDay(profile, days, now, trigger)

  const noteEn =
    'Checks only run while this app is open — there is no server or background scheduler.'
  const noteHe =
    'הבדיקה רצה רק כשהאפליקציה פתוחה — אין שרת או מתזמן ברקע.'

  if (resolved.skipped) {
    return {
      checkedAt: now.toISOString(),
      trigger,
      reviewDate: resolved.reviewDate,
      targetDate: resolved.targetDate,
      dayNumber: null,
      dayTitleEn: 'No tomorrow day',
      dayTitleHe: 'אין יום מחר',
      dayStatus: 'aligned',
      activities: [],
      suggestions: [],
      skipped: true,
      skipReasonEn: resolved.skipReasonEn,
      skipReasonHe: resolved.skipReasonHe,
      weatherFetched: false,
      noteEn,
      noteHe,
    }
  }

  // Departure-only day (after Day 10)
  if (!resolved.day && profile.departureDate === resolved.targetDate) {
    const airportArea = await getPlaceById('place-hilton-krk')
    const point = airportArea?.forecastPoint
    let dayWeather: WeatherSnapshot['daily'][number] | undefined
    let weatherFetched = false
    if (point && point.status !== 'missing') {
      try {
        const snap = await fetchPlaceWeather(point, {
          visitDate: resolved.targetDate,
          label: 'Departure',
        })
        dayWeather = snap.daily.find((d) => d.date === resolved.targetDate)
        weatherFetched = true
      } catch {
        weatherFetched = false
      }
    }
    const pseudo = {
      id: 'act-departure',
      nameEn: 'Departure / return travel',
      nameHe: 'יציאה / נסיעת חזרה',
      placeId: 'place-hilton-krk',
      indoorOutdoor: 'mixed' as const,
      weatherSensitivity: 'medium' as const,
    }
    const assessment = assessActivity(pseudo, dayWeather)
    return {
      checkedAt: now.toISOString(),
      trigger,
      reviewDate: resolved.reviewDate,
      targetDate: resolved.targetDate,
      dayNumber: null,
      dayTitleEn: 'Departure day',
      dayTitleHe: 'יום יציאה',
      dayStatus: assessment.status,
      activities: [assessment],
      suggestions: buildSuggestions([assessment], []),
      skipped: false,
      weatherFetched,
      noteEn,
      noteHe,
    }
  }

  const day = resolved.day!
  await ensureItineraryState()
  const bundle = await getDayItinerary(day.dayNumber)
  const mainActivities = bundle?.mainActivities ?? []
  const dayPlaces = await getPlacesForDay(day.dayNumber)

  const assessments: ActivityAssessment[] = []
  let weatherFetched = false

  if (mainActivities.length === 0) {
    // Free day — still try base-area forecast for packing cues
    const basePlace =
      dayPlaces.find((p) => p.forecastPoint && p.forecastPoint.status !== 'missing') ?? null
    let dayWeather: WeatherSnapshot['daily'][number] | undefined
    if (basePlace?.forecastPoint) {
      try {
        const snap = await fetchPlaceWeather(basePlace.forecastPoint, {
          visitDate: day.date,
          label: basePlace.nameEn,
        })
        dayWeather = snap.daily.find((d) => d.date === day.date)
        weatherFetched = true
      } catch {
        weatherFetched = false
      }
    }
    assessments.push(
      assessActivity(
        {
          id: `free-${day.dayNumber}`,
          nameEn: 'Free / optional day',
          nameHe: 'יום חופשי / אופציונלי',
          indoorOutdoor: 'mixed',
          weatherSensitivity: 'low',
        },
        dayWeather,
      ),
    )
  } else {
    for (const activity of mainActivities) {
      const { snapshot } = await weatherForActivityPlace(
        activity.placeId,
        day.dayNumber,
        day.date,
        dayPlaces,
      )
      if (snapshot) weatherFetched = true
      const dayWeather = snapshot?.daily.find((d) => d.date === day.date)
      assessments.push(assessActivity(activity, dayWeather))
    }
  }

  const contingencyKinds = (bundle?.contingencies ?? []).map(
    (plan) => plan.kind,
  ) as Array<Exclude<PlanKind, 'main'>>

  const dayStatus = dayStatusFromActivities(assessments.map((a) => a.status))
  const suggestions = buildSuggestions(assessments, contingencyKinds)

  return {
    checkedAt: now.toISOString(),
    trigger,
    reviewDate: resolved.reviewDate,
    targetDate: resolved.targetDate,
    dayNumber: day.dayNumber,
    dayTitleEn: day.titleEn,
    dayTitleHe: day.titleHe,
    dayStatus,
    activities: assessments,
    suggestions,
    skipped: false,
    weatherFetched,
    noteEn,
    noteHe,
  }
}
