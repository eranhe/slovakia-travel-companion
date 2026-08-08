import { dayBagPlans } from '@/data/packing-seed'
import { ensureItineraryState, getDayItinerary } from '@/itinerary/ItineraryRepository'
import { planKindLabel } from '@/itinerary/impactPreview'
import { getPlaceById, getPlacesForDay } from '@/places/PlaceRepository'
import {
  getDocumentIndex,
  getReminders,
  getTripDays,
  getTripProfile,
} from '@/trip/TripRepository'
import { todayIsoInTimezone } from '@/trip/tripDays'
import type { Place } from '@/types/place'
import type { ActivityStub, DayRecord, TripReminder } from '@/validation/tripSchemas'
import type { ContingencyActivity, PlanKind } from '@/types/itinerary'
import { fetchPlaceWeather, weatherCodeLabel } from '@/weather/openMeteo'
import { getLastTomorrowCheck } from '@/weather/tomorrowCheckStore'

export interface MorningBriefing {
  date: string
  dayNumber: number | null
  titleEn: string
  titleHe: string
  baseEn: string
  baseHe: string
  sleepTonightEn: string
  sleepTonightHe: string
  firstActivityEn: string | null
  firstActivityHe: string | null
  bookingRef: string | null
  activePlanKind: PlanKind
  hasRainPlan: boolean
  bagEn: string | null
  bagHe: string | null
  weatherSummaryEn: string | null
  weatherSummaryHe: string | null
  wearEn: string
  wearHe: string
  cashNoteEn: string | null
  cashNoteHe: string | null
  changedSinceLastNightEn: string | null
  changedSinceLastNightHe: string | null
  wazeReady: boolean
  imageId: string | null
  optionalCount: number
  reminders: TripReminder[]
}

async function sleepBaseForDay(day: DayRecord | undefined): Promise<{ en: string; he: string }> {
  if (!day) return { en: 'See Trip for lodging', he: 'לראות במסלול את הלינה' }
  if (!day.lodgingPlaceId) {
    return { en: 'Home / in transit', he: 'בבית / בדרך' }
  }
  const lodging = await getPlaceById(day.lodgingPlaceId)
  if (!lodging) return { en: day.baseLocationEn, he: day.baseLocationHe }
  return { en: lodging.nameEn, he: lodging.nameHe }
}

export async function buildMorningBriefing(now = new Date()): Promise<MorningBriefing | null> {
  const profile = await getTripProfile()
  const days = await getTripDays()
  const todayIso = todayIsoInTimezone(profile.timezone, now)
  const day = days.find((item) => item.date === todayIso) ?? null

  await ensureItineraryState()
  const bundle = day ? await getDayItinerary(day.dayNumber) : null
  const activities = bundle?.activeActivities ?? []
  const first = activities[0] as ActivityStub | ContingencyActivity | undefined
  const places = day ? await getPlacesForDay(day.dayNumber) : []
  const docs = await getDocumentIndex()

  let weatherSummaryEn: string | null = null
  let weatherSummaryHe: string | null = null
  const forecastPlace =
    places.find((p) => p.forecastPoint && p.forecastPoint.status !== 'missing') ??
    (null as Place | null)
  if (forecastPlace?.forecastPoint) {
    try {
      const snap = await fetchPlaceWeather(forecastPlace.forecastPoint, {
        visitDate: todayIso,
        label: forecastPlace.nameEn,
      })
      const daily = snap.daily.find((row) => row.date === todayIso)
      if (daily) {
        weatherSummaryEn = `${weatherCodeLabel(daily.weatherCode)} · ${daily.tempMinC ?? '—'}–${daily.tempMaxC ?? '—'}°C · rain ${daily.precipitationProbabilityMax ?? '—'}%`
        weatherSummaryHe = `${weatherCodeLabel(daily.weatherCode)} · ${daily.tempMinC ?? '—'}–${daily.tempMaxC ?? '—'}°C · גשם ${daily.precipitationProbabilityMax ?? '—'}%`
      }
    } catch {
      weatherSummaryEn = 'Weather unavailable right now'
      weatherSummaryHe = 'תחזית לא זמינה כרגע'
    }
  }

  const bag = dayBagPlans.find((item) => item.date === todayIso) ?? null
  const sleep = await sleepBaseForDay(day ?? undefined)
  const bookingRef =
    (first && 'bookingRef' in first ? first.bookingRef : undefined) ??
    docs.find((doc) => doc.dayNumber === day?.dayNumber)?.bookingRef ??
    null

  const lastCheck = getLastTomorrowCheck()
  let changedSinceLastNightEn: string | null = null
  let changedSinceLastNightHe: string | null = null
  if (lastCheck && lastCheck.targetDate === todayIso) {
    changedSinceLastNightEn = `Last evening review: ${lastCheck.dayStatus}`
    changedSinceLastNightHe = `סקירת ערב אחרונה: ${lastCheck.dayStatus}`
  }

  const rainProb = weatherSummaryEn?.match(/rain (\d+)/)?.[1]
  const wearEn =
    rainProb && Number(rainProb) >= 40
      ? 'Pack rain protection and the day bag listed below.'
      : 'Dress for the day bag below; bring sun protection if outdoors.'
  const wearHe =
    rainProb && Number(rainProb) >= 40
      ? 'לקחת הגנה מגשם ואת תיק היום למטה.'
      : 'להתלבש לפי תיק היום למטה; הגנה מהשמש אם בחוץ.'

  const cashNote =
    todayIso === '2026-08-25' || todayIso === '2026-08-27'
      ? {
          en: 'Keep PLN cash for parking / small vendors in Poland.',
          he: 'להשאיר מזומן בזלוטי לחניונים / דוכנים בפולין.',
        }
      : null

  const wazeReady = places.some((place) =>
    place.accessPoints.some((ap) => Boolean(ap.wazeQuery) || ap.coordinates?.status === 'verified'),
  )

  return {
    date: todayIso,
    dayNumber: day?.dayNumber ?? null,
    titleEn: day?.titleEn ?? 'Outside active itinerary days',
    titleHe: day?.titleHe ?? 'מחוץ לימי המסלול הפעילים',
    baseEn: day?.baseLocationEn ?? profile.name,
    baseHe: day?.baseLocationHe ?? profile.name,
    sleepTonightEn: sleep.en,
    sleepTonightHe: sleep.he,
    firstActivityEn: first ? first.nameEn : null,
    firstActivityHe: first ? first.nameHe : null,
    bookingRef: bookingRef ?? null,
    activePlanKind: bundle?.day.activePlanKind ?? 'main',
    hasRainPlan: Boolean(bundle?.contingencies.some((plan) => plan.kind === 'rain')),
    bagEn: bag?.bagEn ?? null,
    bagHe: bag?.bagHe ?? null,
    weatherSummaryEn,
    weatherSummaryHe,
    wearEn,
    wearHe,
    cashNoteEn: cashNote?.en ?? null,
    cashNoteHe: cashNote?.he ?? null,
    changedSinceLastNightEn,
    changedSinceLastNightHe,
    wazeReady,
    imageId: day?.imageId ?? null,
    optionalCount: activities.filter((act) => 'isOptional' in act && act.isOptional).length,
    reminders: (await getReminders()).filter((item) => item.date === todayIso),
  }
}

export function briefingPlanLabel(kind: PlanKind, locale: 'en' | 'he'): string {
  return planKindLabel(kind, locale)
}
