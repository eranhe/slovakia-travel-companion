import type { CheckInRecord } from '@/maps/visitStore'
import type { NightlyRecap, RecapFields, RecapStyle } from '@/journal/types'
import type { ActivityStub, DayRecord } from '@/validation/tripSchemas'
import type { PhotoMeta } from '@/journal/types'

export interface RecapInput {
  date: string
  day?: DayRecord | null
  activities: ActivityStub[]
  completedIds: ReadonlySet<string>
  checkIns: CheckInRecord[]
  photos: PhotoMeta[]
  notes?: string
  favoriteMoment?: string
  favoriteFood?: string
  funnyMoment?: string
  challenge?: string
  mood?: string
  rating?: number
  weatherSummary?: string | null
  tomorrowStatus?: string | null
  style: RecapStyle
  locale: 'en' | 'he'
}

function emptyFields(): RecapFields {
  return {
    title: '',
    region: '',
    highlights: '',
    timeline: '',
    weather: '',
    notes: '',
    favoriteMoment: '',
    favoriteFood: '',
    surprise: '',
    lesson: '',
    funnyMoment: '',
    challenge: '',
    localPhrase: '',
    mood: '',
    rating: '',
    tomorrowStatus: '',
    estimatedLabel: '',
  }
}

export function buildRecapFields(input: RecapInput): RecapFields {
  const isHe = input.locale === 'he'
  const day = input.day
  const completed = input.activities.filter((act) => input.completedIds.has(act.id))
  const plannedNames = input.activities.map((act) => (isHe ? act.nameHe : act.nameEn))
  const doneNames = completed.map((act) => (isHe ? act.nameHe : act.nameEn))
  const checkInLabels = input.checkIns
    .filter((c) => !c.dayNumber || c.dayNumber === day?.dayNumber)
    .map((c) => (isHe ? c.labelHe : c.labelEn))
  const photoCount = input.photos.filter((p) => !p.dayNumber || p.dayNumber === day?.dayNumber).length

  const fields = emptyFields()
  fields.title = day
    ? isHe
      ? `סיכום יום ${day.dayNumber} · ${day.titleHe}`
      : `Day ${day.dayNumber} recap · ${day.titleEn}`
    : isHe
      ? `סיכום ${input.date}`
      : `Recap ${input.date}`
  fields.region = day ? (isHe ? day.baseLocationHe : day.baseLocationEn) : ''
  fields.highlights =
    doneNames.length > 0
      ? doneNames.join(isHe ? ' · ' : ' · ')
      : plannedNames.slice(0, 3).join(isHe ? ' · ' : ' · ') ||
        (isHe ? 'יום רגוע / ללא סימון בוצע' : 'Quiet day / nothing marked done')
  fields.timeline =
    plannedNames.length > 0
      ? plannedNames.join(isHe ? ' ← ' : ' → ')
      : isHe
        ? 'אין ציר פעילויות'
        : 'No activity timeline'
  fields.weather = input.weatherSummary ?? (isHe ? 'תחזית לא צורפה' : 'Weather not attached')
  fields.notes = input.notes?.trim() ?? ''
  fields.favoriteMoment = input.favoriteMoment?.trim() ?? ''
  fields.favoriteFood = input.favoriteFood?.trim() ?? ''
  fields.funnyMoment = input.funnyMoment?.trim() ?? ''
  fields.challenge = input.challenge?.trim() ?? ''
  fields.mood = input.mood?.trim() ?? ''
  fields.rating = input.rating ? `${input.rating}/5` : ''
  fields.tomorrowStatus =
    input.tomorrowStatus ??
    (isHe ? 'לבדוק מחר במסך בדיקת מחר' : 'Review tomorrow on Tomorrow Check')
  fields.estimatedLabel = isHe
    ? 'נתוני מסלול/מיקום עשויים להיות משוערים'
    : 'Route/location data may be estimated'
  fields.localPhrase = isHe ? 'Ďakujem / Dziękuję' : 'Ďakujem / Dziękuję'
  fields.surprise =
    checkInLabels.length > 0
      ? isHe
        ? `צ׳ק־אינים: ${checkInLabels.slice(0, 3).join(' · ')}`
        : `Check-ins: ${checkInLabels.slice(0, 3).join(' · ')}`
      : ''
  fields.lesson =
    photoCount > 0
      ? isHe
        ? `${photoCount} תמונות מהיום נשמרו במכשיר`
        : `${photoCount} photos from today saved on device`
      : isHe
        ? 'עדיין אין תמונות מסומנות ליום זה'
        : 'No photos tagged for this day yet'

  return fields
}

export function renderRecapBody(fields: RecapFields, style: RecapStyle, locale: 'en' | 'he'): string {
  const isHe = locale === 'he'
  const lines: string[] = []

  const push = (value: string) => {
    if (value.trim()) lines.push(value.trim())
  }

  switch (style) {
    case 'minimal':
      push(fields.title)
      push(fields.highlights)
      push(fields.weather)
      break
    case 'whatsapp-story':
      push(isHe ? `משפחת הרשקוביץ · ${fields.title}` : `Herskovitz family · ${fields.title}`)
      push(fields.highlights)
      if (fields.favoriteMoment) push((isHe ? 'רגע אהוב: ' : 'Favorite: ') + fields.favoriteMoment)
      if (fields.funnyMoment) push((isHe ? 'מצחיק: ' : 'Funny: ') + fields.funnyMoment)
      push(fields.weather)
      break
    case 'photo-postcard':
      push(fields.title)
      push(fields.region)
      push(fields.lesson)
      push(fields.highlights)
      if (fields.favoriteMoment) push(fields.favoriteMoment)
      break
    case 'family-update':
      push(fields.title)
      push((isHe ? 'איפה היינו: ' : 'Where we were: ') + fields.region)
      push((isHe ? 'מה עשינו: ' : 'What we did: ') + fields.highlights)
      if (fields.favoriteFood) push((isHe ? 'אוכל: ' : 'Food: ') + fields.favoriteFood)
      if (fields.mood) push((isHe ? 'מצב רוח: ' : 'Mood: ') + fields.mood)
      push(fields.tomorrowStatus)
      break
    case 'detailed-log':
      push(fields.title)
      push(fields.region)
      push((isHe ? 'ציר: ' : 'Timeline: ') + fields.timeline)
      push((isHe ? 'בוצע: ' : 'Done: ') + fields.highlights)
      push((isHe ? 'מזג אוויר: ' : 'Weather: ') + fields.weather)
      if (fields.notes) push((isHe ? 'הערות: ' : 'Notes: ') + fields.notes)
      if (fields.favoriteMoment) push((isHe ? 'רגע אהוב: ' : 'Favorite moment: ') + fields.favoriteMoment)
      if (fields.favoriteFood) push((isHe ? 'אוכל: ' : 'Food: ') + fields.favoriteFood)
      if (fields.challenge) push((isHe ? 'אתגר: ' : 'Challenge: ') + fields.challenge)
      if (fields.funnyMoment) push((isHe ? 'מצחיק: ' : 'Funny: ') + fields.funnyMoment)
      if (fields.surprise) push(fields.surprise)
      push(fields.lesson)
      push(fields.localPhrase)
      push(fields.tomorrowStatus)
      push(fields.estimatedLabel)
      break
    case 'personal-diary':
    default:
      push(fields.title)
      push(fields.region)
      push(fields.highlights)
      if (fields.notes) push(fields.notes)
      if (fields.favoriteMoment) push((isHe ? 'אהבתי במיוחד: ' : 'Loved: ') + fields.favoriteMoment)
      if (fields.mood || fields.rating) {
        push([fields.mood, fields.rating].filter(Boolean).join(' · '))
      }
      push(fields.weather)
      push(fields.tomorrowStatus)
      break
  }

  return lines.join('\n')
}

export function createNightlyRecap(
  input: RecapInput,
  existing?: NightlyRecap | null,
): NightlyRecap {
  const fields = buildRecapFields(input)
  const generatedBody = renderRecapBody(fields, input.style, input.locale)
  const now = new Date().toISOString()
  const bodyLocked = Boolean(existing?.bodyLocked)
  return {
    id: existing?.id ?? `recap-${input.date}-${input.style}`,
    date: input.date,
    dayNumber: input.day?.dayNumber,
    style: input.style,
    status: existing?.status ?? 'draft',
    fields: {
      ...fields,
      // Preserve manually filled extras if regenerating fields that user typed into journal
      notes: input.notes?.trim() || fields.notes,
      favoriteMoment: input.favoriteMoment?.trim() || fields.favoriteMoment,
      favoriteFood: input.favoriteFood?.trim() || fields.favoriteFood,
      funnyMoment: input.funnyMoment?.trim() || fields.funnyMoment,
      challenge: input.challenge?.trim() || fields.challenge,
      mood: input.mood?.trim() || fields.mood,
    },
    body: bodyLocked && existing ? existing.body : generatedBody,
    bodyLocked,
    photoIds: input.photos
      .filter((p) => !p.dayNumber || p.dayNumber === input.day?.dayNumber)
      .map((p) => p.id),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    approvedAt: existing?.approvedAt,
  }
}

/** Strip sensitive patterns before share/export. */
export function sanitizeRecapForShare(body: string): string {
  return body
    .replace(/\b(?:CPUFIH|GYGWZAV7Z7Z3|204-R9C1GY5|310823541|8F4AQ5)\b/gi, '[ref]')
    .replace(/\bPIN\b[:\s]*\S+/gi, 'PIN:[hidden]')
}
