import { contingencySeed } from '@/data/contingency-seed'
import { packingProgress } from '@/data/packing-seed'
import { tripPlacesSeed } from '@/data/trip-places-seed'
import { ensureItineraryState } from '@/itinerary/ItineraryRepository'
import {
  getDocumentIndex,
  getActivities,
  getReminders,
  getTripDays,
  getTripProfile,
} from '@/trip/TripRepository'
import { ACTIVE_TRIP_DATES, isActiveDayNumber, todayIsoInTimezone } from '@/trip/tripDays'
import { hasEveningCheck } from '@/weather/tomorrowCheckStore'
import { loadPackingChecked } from '@/content/packingStore'

export type ReadinessStatus = 'ready' | 'attention' | 'missing' | 'optional' | 'unable'

export interface ReadinessItem {
  id: string
  status: ReadinessStatus
  titleEn: string
  titleHe: string
  detailEn: string
  detailHe: string
}

export interface CommandCenterSnapshot {
  checkedAt: string
  todayIso: string
  daysUntilStart: number | null
  daysUntilEnd: number | null
  travelers: string[]
  tripName: string
  packingPercent: number
  packingChecked: number
  packingTotal: number
  items: ReadinessItem[]
  tasks: Array<{ id: string; titleEn: string; titleHe: string }>
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T12:00:00Z`)
  const b = Date.parse(`${toIso}T12:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}

export async function buildCommandCenter(): Promise<CommandCenterSnapshot> {
  const profile = await getTripProfile()
  const days = await getTripDays()
  const activities = await getActivities()
  const docs = await getDocumentIndex()
  await ensureItineraryState()

  const todayIso = todayIsoInTimezone(profile.timezone)
  const packing = packingProgress(loadPackingChecked())

  const rainDays = new Set(
    contingencySeed.filter((plan) => plan.kind === 'rain').map((plan) => plan.dayNumber),
  )
  const activeDays = days.map((day) => day.dayNumber).filter(isActiveDayNumber)
  const daysWithoutRain = activeDays.filter((dayNumber) => {
    const dayActs = activities.filter((act) => act.dayNumber === dayNumber)
    const needsRain =
      dayActs.some(
        (act) =>
          (act.indoorOutdoor === 'outdoor' || act.indoorOutdoor === 'mixed') &&
          (act.weatherSensitivity === 'medium' || act.weatherSensitivity === 'high'),
      ) || dayActs.length === 0
    return needsRain && !rainDays.has(dayNumber)
  })

  const weatherSensitive = activities.filter(
    (act) =>
      (act.indoorOutdoor === 'outdoor' || act.indoorOutdoor === 'mixed') &&
      (act.weatherSensitivity === 'high' || act.weatherSensitivity === 'medium'),
  )

  const placesNoForecast = tripPlacesSeed.filter(
    (place) => !place.forecastPoint || place.forecastPoint.status === 'missing',
  )
  const placesNoVerifiedWaze = tripPlacesSeed.filter((place) => {
    const verified = place.accessPoints.some(
      (ap) => ap.coordinates?.status === 'verified' || Boolean(ap.wazeQuery),
    )
    return !verified
  })

  const docsWithRef = docs.filter((doc) => Boolean(doc.bookingRef))
  const eveningDone = hasEveningCheck(todayIso)

  const reminders = await getReminders()
  const openReminders = reminders.filter((item) => item.date >= todayIso)
  const nextReminder = openReminders[0] ?? null
  const optionalActivities = activities.filter((act) => act.isOptional)

  const items: ReadinessItem[] = [
    {
      id: 'bookings',
      status: docsWithRef.length >= 3 ? 'ready' : 'attention',
      titleEn: 'Booking codes in Wallet',
      titleHe: 'קודי הזמנה בארנק',
      detailEn: `${docsWithRef.length} documents with booking refs`,
      detailHe: `${docsWithRef.length} מסמכים עם קודי הזמנה`,
    },
    {
      id: 'packing',
      status: packing.percent >= 90 ? 'ready' : packing.percent >= 40 ? 'attention' : 'missing',
      titleEn: 'Packing progress',
      titleHe: 'התקדמות אריזה',
      detailEn: `${packing.checked}/${packing.total} (${packing.percent}%)`,
      detailHe: `${packing.checked}/${packing.total} (${packing.percent}%)`,
    },
    {
      id: 'rain-plans',
      status: daysWithoutRain.length === 0 ? 'ready' : 'attention',
      titleEn: 'Rain-plan coverage',
      titleHe: 'כיסוי תוכניות גשם',
      detailEn:
        daysWithoutRain.length === 0
          ? 'Sensitive days have rain alternatives seeded'
          : `Days needing attention: ${daysWithoutRain.join(', ')}`,
      detailHe:
        daysWithoutRain.length === 0
          ? 'לימים רגישים יש חלופות גשם'
          : `ימים לבדיקה: ${daysWithoutRain.join(', ')}`,
    },
    {
      id: 'weather-sensitive',
      status: weatherSensitive.length > 0 ? 'attention' : 'ready',
      titleEn: 'Weather-sensitive activities',
      titleHe: 'פעילויות רגישות למזג אוויר',
      detailEn: `${weatherSensitive.length} flagged on the main plan`,
      detailHe: `${weatherSensitive.length} מסומנות בתוכנית הראשית`,
    },
    {
      id: 'forecast-points',
      status: placesNoForecast.length === 0 ? 'ready' : 'attention',
      titleEn: 'Forecast coverage',
      titleHe: 'כיסוי תחזית',
      detailEn:
        placesNoForecast.length === 0
          ? 'All seeded places have forecast points'
          : `${placesNoForecast.length} places without forecast points`,
      detailHe:
        placesNoForecast.length === 0
          ? 'לכל המקומות יש נקודת תחזית'
          : `${placesNoForecast.length} מקומות בלי נקודת תחזית`,
    },
    {
      id: 'waze',
      status: placesNoVerifiedWaze.length === 0 ? 'ready' : 'optional',
      titleEn: 'Waze destinations',
      titleHe: 'יעדי Waze',
      detailEn:
        placesNoVerifiedWaze.length === 0
          ? 'Every place has a search destination'
          : `${placesNoVerifiedWaze.length} places need a Waze query`,
      detailHe:
        placesNoVerifiedWaze.length === 0
          ? 'לכל מקום יש יעד חיפוש'
          : `${placesNoVerifiedWaze.length} מקומות בלי שאילתת Waze`,
    },
    {
      id: 'tomorrow-review',
      status: eveningDone ? 'ready' : 'optional',
      titleEn: 'Tomorrow review (this evening)',
      titleHe: 'סקירת מחר (הערב)',
      detailEn: eveningDone
        ? 'Evening check recorded this session'
        : 'Run Tomorrow Check around 20:30 while the app is open',
      detailHe: eveningDone
        ? 'בדיקת ערב נרשמה בסשן הזה'
        : 'להריץ בדיקת מחר בסביבות 20:30 כשהאפליקציה פתוחה',
    },
    {
      id: 'reminders',
      status: openReminders.length === 0 ? 'ready' : 'attention',
      titleEn: 'Deadlines & check-ins',
      titleHe: 'מועדים וצ׳ק-אינים',
      detailEn: nextReminder
        ? `${openReminders.length} open · next: ${nextReminder.titleEn} (${nextReminder.date})`
        : 'Nothing outstanding',
      detailHe: nextReminder
        ? `${openReminders.length} פתוחים · הבא: ${nextReminder.titleHe} (${nextReminder.date})`
        : 'אין משימות פתוחות',
    },
    {
      id: 'optional-choices',
      status: optionalActivities.length > 0 ? 'optional' : 'ready',
      titleEn: 'Optional / pick-one slots',
      titleHe: 'משבצות אופציונליות / לבחירה',
      detailEn: `${optionalActivities.length} calendar entries are still a choice`,
      detailHe: `${optionalActivities.length} אירועי יומן עדיין פתוחים לבחירה`,
    },
    {
      id: 'offline',
      status: 'optional',
      titleEn: 'Offline readiness',
      titleHe: 'מוכנות אופליין',
      detailEn: 'Install the PWA and download Mapy.com regions before canyon days.',
      detailHe: 'להתקין את ה-PWA ולהוריד אזורי Mapy.com לפני ימי קניון.',
    },
  ]

  const tasks: CommandCenterSnapshot['tasks'] = []
  if (packing.percent < 100) {
    tasks.push({
      id: 'task-packing',
      titleEn: 'Continue packing checklist',
      titleHe: 'להמשיך את רשימת הציוד',
    })
  }
  if (!eveningDone && (ACTIVE_TRIP_DATES as readonly string[]).includes(todayIso)) {
    tasks.push({
      id: 'task-tomorrow',
      titleEn: 'Review tomorrow vs forecast',
      titleHe: 'לבדוק מחר מול התחזית',
    })
  }
  if (daysWithoutRain.length > 0) {
    tasks.push({
      id: 'task-rain',
      titleEn: 'Review days without Rain Plans',
      titleHe: 'לבדוק ימים בלי תוכנית גשם',
    })
  }
  tasks.push({
    id: 'task-checkin',
    titleEn: 'Complete online flight check-in when available',
    titleHe: 'להשלים צ׳ק־אין אונליין לטיסה כשנפתח',
  })

  return {
    checkedAt: new Date().toISOString(),
    todayIso,
    daysUntilStart: daysBetween(todayIso, profile.startDate),
    daysUntilEnd: daysBetween(todayIso, profile.endDate),
    travelers: profile.travelers,
    tripName: profile.name,
    packingPercent: packing.percent,
    packingChecked: packing.checked,
    packingTotal: packing.total,
    items,
    tasks,
  }
}

export function readinessLabel(status: ReadinessStatus, locale: 'en' | 'he'): string {
  const map = {
    ready: { en: 'Ready', he: 'מוכן' },
    attention: { en: 'Needs attention', he: 'דורש תשומת לב' },
    missing: { en: 'Missing', he: 'חסר' },
    optional: { en: 'Optional', he: 'אופציונלי' },
    unable: { en: 'Unable to verify', he: 'לא ניתן לאמת' },
  } as const
  return map[status][locale]
}
