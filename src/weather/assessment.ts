import type { PlanKind } from '@/types/itinerary'
import type { WeatherSnapshot } from '@/types/place'
import type { ActivityStub } from '@/validation/tripSchemas'

export type ActivityWeatherStatus =
  | 'aligned'
  | 'preparation'
  | 'caution'
  | 'unsuitable'
  | 'unable'

export type DayWeatherStatus =
  | 'aligned'
  | 'preparation'
  | 'caution'
  | 'unsuitable'
  | 'unable'

export type SuggestionKind =
  | 'rain-protection'
  | 'warm-layers'
  | 'sun-protection'
  | 'start-earlier'
  | 'start-later'
  | 'shorten-outdoor'
  | 'activate-contingency'

export interface WeatherSuggestion {
  id: string
  kind: SuggestionKind
  activityId?: string
  contingencyKind?: Exclude<PlanKind, 'main'>
  titleEn: string
  titleHe: string
  reasonEn: string
  reasonHe: string
}

export interface ActivityAssessment {
  activityId: string
  nameEn: string
  nameHe: string
  status: ActivityWeatherStatus
  reasonEn: string
  reasonHe: string
  indoorOutdoor: string
  weatherSensitivity: string
  rainProbability: number | null
  tempMaxC: number | null
  tempMinC: number | null
  weatherCode: number | null
  placeId?: string
}

const STATUS_RANK: Record<ActivityWeatherStatus, number> = {
  aligned: 0,
  preparation: 1,
  caution: 2,
  unsuitable: 3,
  unable: 4,
}

export function worstStatus(
  statuses: ActivityWeatherStatus[],
): ActivityWeatherStatus {
  return statuses.reduce<ActivityWeatherStatus>((worst, status) => {
    return STATUS_RANK[status] > STATUS_RANK[worst] ? status : worst
  }, 'aligned')
}

export function dayStatusFromActivities(
  statuses: ActivityWeatherStatus[],
): DayWeatherStatus {
  if (statuses.length === 0) return 'aligned'
  const actionable = statuses.filter((s) => s !== 'unable')
  if (actionable.length === 0) return 'unable'
  const worst = worstStatus(actionable)
  if (statuses.includes('unable') && worst === 'aligned') return 'preparation'
  return worst
}

function isThunder(code: number | null): boolean {
  return code !== null && code >= 95
}

function isHeavyRain(code: number | null): boolean {
  return code !== null && ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
}

export function assessActivity(
  activity: Pick<
    ActivityStub,
    | 'id'
    | 'nameEn'
    | 'nameHe'
    | 'indoorOutdoor'
    | 'weatherSensitivity'
    | 'placeId'
  >,
  dayWeather: WeatherSnapshot['daily'][number] | undefined,
): ActivityAssessment {
  const indoorOutdoor = activity.indoorOutdoor ?? 'unknown'
  const sensitivity = activity.weatherSensitivity ?? 'medium'

  if (!dayWeather) {
    return {
      activityId: activity.id,
      nameEn: activity.nameEn,
      nameHe: activity.nameHe,
      status: 'unable',
      reasonEn: 'No forecast available for this day.',
      reasonHe: 'אין תחזית ליום זה.',
      indoorOutdoor,
      weatherSensitivity: sensitivity,
      rainProbability: null,
      tempMaxC: null,
      tempMinC: null,
      weatherCode: null,
      placeId: activity.placeId,
    }
  }

  const rain = dayWeather.precipitationProbabilityMax
  const tempMax = dayWeather.tempMaxC
  const tempMin = dayWeather.tempMinC
  const code = dayWeather.weatherCode

  let status: ActivityWeatherStatus = 'aligned'
  let reasonEn = 'Forecast looks compatible with the planned activity.'
  let reasonHe = 'התחזית תואמת לפעילות המתוכננת.'

  const outdoorLike = indoorOutdoor === 'outdoor' || indoorOutdoor === 'mixed'
  const high = sensitivity === 'high'
  const medium = sensitivity === 'medium' || high

  if (indoorOutdoor === 'indoor' && sensitivity !== 'none') {
    if (isThunder(code)) {
      status = 'preparation'
      reasonEn = 'Thunderstorm possible — keep travel buffers for indoor plans.'
      reasonHe = 'ייתכנו סופות רעמים — להשאיר באפר נסיעה גם לתוכנית מקורה.'
    }
  } else if (outdoorLike) {
    if (isThunder(code) && medium) {
      status = high ? 'unsuitable' : 'caution'
      reasonEn = 'Thunderstorm risk — outdoor exposure is not recommended.'
      reasonHe = 'סיכון לסופות רעמים — לא מומלץ לשהות בחוץ.'
    } else if ((rain ?? 0) >= 70 && high) {
      status = 'unsuitable'
      reasonEn = `High rain chance (${rain}%) for a weather-sensitive outdoor plan.`
      reasonHe = `סיכוי גשם גבוה (${rain}%) לתוכנית חיצונית רגישה למזג אוויר.`
    } else if ((rain ?? 0) >= 55 && medium) {
      status = high ? 'caution' : 'preparation'
      reasonEn = `Elevated rain chance (${rain}%) — prepare or consider a Rain Plan.`
      reasonHe = `סיכוי גשם מוגבר (${rain}%) — להתכונן או לשקול תוכנית גשם.`
    } else if ((rain ?? 0) >= 40 && outdoorLike) {
      status = 'preparation'
      reasonEn = `Some rain possible (${rain}%) — pack rain protection.`
      reasonHe = `ייתכן גשם (${rain}%) — לקחת הגנה מגשם.`
    } else if (isHeavyRain(code) && medium) {
      status = 'caution'
      reasonEn = 'Heavy rain/showers in the forecast.'
      reasonHe = 'גשם כבד / ממטרים בתחזית.'
    }

    if ((tempMax ?? 0) >= 33 && outdoorLike && medium && STATUS_RANK[status] < STATUS_RANK.caution) {
      status = high ? 'caution' : 'preparation'
      reasonEn = `Hot day (up to ${tempMax}°C) — start earlier and bring sun protection.`
      reasonHe = `יום חם (עד ${tempMax}°C) — להתחיל מוקדם ולהביא הגנה מהשמש.`
    }

    if ((tempMin ?? 99) <= 8 && outdoorLike && STATUS_RANK[status] < STATUS_RANK.preparation) {
      status = 'preparation'
      reasonEn = `Cool morning (from ${tempMin}°C) — pack warm layers.`
      reasonHe = `בוקר קריר (מ-${tempMin}°C) — לקחת שכבות חמות.`
    }
  }

  return {
    activityId: activity.id,
    nameEn: activity.nameEn,
    nameHe: activity.nameHe,
    status,
    reasonEn,
    reasonHe,
    indoorOutdoor,
    weatherSensitivity: sensitivity,
    rainProbability: rain,
    tempMaxC: tempMax,
    tempMinC: tempMin,
    weatherCode: code,
    placeId: activity.placeId,
  }
}

export function buildSuggestions(
  assessments: ActivityAssessment[],
  availableContingencies: Array<Exclude<PlanKind, 'main'>>,
): WeatherSuggestion[] {
  const suggestions: WeatherSuggestion[] = []
  const has = (kind: Exclude<PlanKind, 'main'>) => availableContingencies.includes(kind)

  for (const item of assessments) {
    if ((item.rainProbability ?? 0) >= 40 && item.indoorOutdoor !== 'indoor') {
      suggestions.push({
        id: `rain-kit-${item.activityId}`,
        kind: 'rain-protection',
        activityId: item.activityId,
        titleEn: 'Pack rain protection',
        titleHe: 'להכין הגנה מגשם',
        reasonEn: `${item.nameEn}: rain chance ${item.rainProbability}%.`,
        reasonHe: `${item.nameHe}: סיכוי גשם ${item.rainProbability}%.`,
      })
    }
    if ((item.tempMaxC ?? 0) >= 32 && item.indoorOutdoor !== 'indoor') {
      suggestions.push({
        id: `sun-${item.activityId}`,
        kind: 'sun-protection',
        activityId: item.activityId,
        titleEn: 'Add sun protection / start earlier',
        titleHe: 'הגנה מהשמש / התחלה מוקדמת',
        reasonEn: `${item.nameEn}: hot day up to ${item.tempMaxC}°C.`,
        reasonHe: `${item.nameHe}: יום חם עד ${item.tempMaxC}°C.`,
      })
      suggestions.push({
        id: `earlier-${item.activityId}`,
        kind: 'start-earlier',
        activityId: item.activityId,
        titleEn: 'Start earlier',
        titleHe: 'להתחיל מוקדם יותר',
        reasonEn: 'Reduce midday heat exposure.',
        reasonHe: 'להפחית חשיפה לחום בצהריים.',
      })
    }
    if ((item.tempMinC ?? 99) <= 8) {
      suggestions.push({
        id: `warm-${item.activityId}`,
        kind: 'warm-layers',
        activityId: item.activityId,
        titleEn: 'Add warm layers',
        titleHe: 'להוסיף שכבות חמות',
        reasonEn: `${item.nameEn}: cool conditions from ${item.tempMinC}°C.`,
        reasonHe: `${item.nameHe}: קריר מ-${item.tempMinC}°C.`,
      })
    }
    if (item.status === 'caution' || item.status === 'unsuitable') {
      if (item.indoorOutdoor === 'outdoor') {
        suggestions.push({
          id: `shorten-${item.activityId}`,
          kind: 'shorten-outdoor',
          activityId: item.activityId,
          titleEn: 'Shorten outdoor window',
          titleHe: 'לקצר את החלון החיצוני',
          reasonEn: item.reasonEn,
          reasonHe: item.reasonHe,
        })
      }
    }
  }

  const bad = assessments.some((a) => a.status === 'caution' || a.status === 'unsuitable')
  const rainy = assessments.some((a) => (a.rainProbability ?? 0) >= 55)
  const hot = assessments.some((a) => (a.tempMaxC ?? 0) >= 33)
  const stormy = assessments.some((a) => isThunder(a.weatherCode))

  if (bad && rainy && has('rain')) {
    suggestions.push({
      id: 'activate-rain',
      kind: 'activate-contingency',
      contingencyKind: 'rain',
      titleEn: 'Activate Rain Plan',
      titleHe: 'להפעיל תוכנית גשם',
      reasonEn: 'Tomorrow looks wet for outdoor-sensitive plans.',
      reasonHe: 'מחר נראה רטוב לתוכניות רגישות לגשם.',
    })
  }
  if (bad && stormy && has('mountain-weather')) {
    suggestions.push({
      id: 'activate-mountain',
      kind: 'activate-contingency',
      contingencyKind: 'mountain-weather',
      titleEn: 'Activate Mountain-Weather Plan',
      titleHe: 'להפעיל תוכנית מזג הרים',
      reasonEn: 'Storm/mountain conditions favor a safer alternative.',
      reasonHe: 'תנאי סערה/הרים מצדיקים חלופה בטוחה יותר.',
    })
  }
  if (hot && has('late-start')) {
    suggestions.push({
      id: 'activate-late',
      kind: 'activate-contingency',
      contingencyKind: 'late-start',
      titleEn: 'Activate Late-Start / heat-aware plan',
      titleHe: 'להפעיל תוכנית התחלה מאוחרת / חום',
      reasonEn: 'High temperatures — a shifted schedule may help.',
      reasonHe: 'טמפרטורות גבוהות — לוח זמנים מוזז עשוי לעזור.',
    })
  }
  if (hot && has('extreme-heat')) {
    suggestions.push({
      id: 'activate-heat',
      kind: 'activate-contingency',
      contingencyKind: 'extreme-heat',
      titleEn: 'Activate Extreme-Heat Plan',
      titleHe: 'להפעיל תוכנית חום קיצוני',
      reasonEn: 'Heat looks significant for outdoor activities.',
      reasonHe: 'החום משמעותי לפעילויות בחוץ.',
    })
  }
  if (bad && has('shortened')) {
    suggestions.push({
      id: 'activate-short',
      kind: 'activate-contingency',
      contingencyKind: 'shortened',
      titleEn: 'Activate Shortened Plan',
      titleHe: 'להפעיל תוכנית מקוצרת',
      reasonEn: 'A lighter day may fit the forecast better.',
      reasonHe: 'יום קל יותר עשוי להתאים טוב יותר לתחזית.',
    })
  }

  const seen = new Set<string>()
  return suggestions.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export function statusLabel(
  status: ActivityWeatherStatus | DayWeatherStatus,
  locale: 'en' | 'he',
): string {
  const map = {
    aligned: { en: 'Aligned with forecast', he: 'תואם לתחזית' },
    preparation: {
      en: 'Mostly aligned — preparation needed',
      he: 'בעיקר תואם — נדרשת הכנה',
    },
    caution: {
      en: 'Caution — adjustment recommended',
      he: 'זהירות — מומלץ להתאים',
    },
    unsuitable: { en: 'Likely unsuitable', he: 'כנראה לא מתאים' },
    unable: { en: 'Unable to verify', he: 'לא ניתן לאמת' },
  } as const
  return map[status][locale]
}
