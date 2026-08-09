import { z } from 'zod'

/**
 * Day numbering covers the whole trip: 0 = arrival (17 Aug), 1–10 = active
 * itinerary days (18–27 Aug), 11 = departure (28 Aug).
 */
export const TRIP_DAY_MIN = 0
export const TRIP_DAY_MAX = 11
export const TRIP_DAY_COUNT = TRIP_DAY_MAX - TRIP_DAY_MIN + 1

const dayNumberSchema = z.number().int().min(TRIP_DAY_MIN).max(TRIP_DAY_MAX)

export const DayRecordSchema = z.object({
  dayNumber: dayNumberSchema,
  date: z.string(), // YYYY-MM-DD
  titleEn: z.string(),
  titleHe: z.string(),
  baseLocationEn: z.string(),
  baseLocationHe: z.string(),
  activityIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
  /** Where the family sleeps at the end of this day. */
  lodgingPlaceId: z.string().optional(),
  /** Illustration id resolved through `@/media/images`. */
  imageId: z.string().optional(),
})

export const ActivityStubSchema = z.object({
  id: z.string(),
  dayNumber: dayNumberSchema,
  nameEn: z.string(),
  nameHe: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  bookingRef: z.string().optional(),
  placeName: z.string().optional(),
  placeId: z.string().optional(),
  category: z
    .enum(['attraction', 'transport', 'food', 'accommodation', 'other'])
    .optional(),
  descriptionEn: z.string().optional(),
  descriptionHe: z.string().optional(),
  flexibility: z.enum(['fixed', 'flexible']).optional(),
  transportationMethod: z.string().optional(),
  travelDurationMinutes: z.number().int().nonnegative().optional(),
  indoorOutdoor: z.enum(['indoor', 'outdoor', 'mixed', 'unknown']).optional(),
  weatherSensitivity: z.enum(['none', 'low', 'medium', 'high']).optional(),
  status: z.enum(['planned', 'confirmed', 'tentative']).default('planned'),
  /** Nice-to-have from the calendar — shown but never treated as committed. */
  isOptional: z.boolean().optional(),
  /** Activities sharing a group are mutually exclusive ("pick one"). */
  choiceGroup: z.string().optional(),
  /** Illustration id resolved through `@/media/images`. */
  imageId: z.string().optional(),
})

export const TripReminderSchema = z.object({
  id: z.string(),
  date: z.string(),
  time: z.string().optional(),
  kind: z.enum(['check-in', 'deadline', 'prep', 'decision']),
  titleEn: z.string(),
  titleHe: z.string(),
  detailEn: z.string().optional(),
  detailHe: z.string().optional(),
  dayNumber: dayNumberSchema.nullable().optional(),
})

export const DocumentMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  mimeType: z.string(),
  sourceFileId: z.string().optional(),
  dayNumber: dayNumberSchema.nullable().optional(),
  bookingRef: z.string().optional(),
  createdAt: z.string(),
  /** Reserved for a future document viewer. */
  hasBlob: z.boolean().default(false),
  note: z.string().optional(),
  /** Relative (under BASE_URL) or absolute URL to a full PDF / printable doc. */
  fileUrl: z.string().optional(),
  /** Value to encode as a QR code (defaults to bookingRef when omitted). */
  qrValue: z.string().optional(),
  /** External booking / portal link. */
  externalUrl: z.string().url().optional(),
  /** Ready-to-copy text (e.g. email draft to the rental desk). */
  copyText: z.string().optional(),
})

export const TripProfileSchema = z.object({
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string().default('Europe/Bratislava'),
  countries: z.array(z.string()),
  regions: z.array(z.string()),
  travelers: z.array(z.string()),
  homeCurrency: z.string().default('ILS'),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  notes: z.string().optional(),
})

/** Runtime data for this one dedicated trip. Extraction/review metadata stays out of the app. */
export const DedicatedTripDataSchema = z.object({
  version: z.literal(1),
  createdAt: z.string(),
  trip: TripProfileSchema,
  days: z.array(DayRecordSchema).length(TRIP_DAY_COUNT),
  activities: z.array(ActivityStubSchema).default([]),
  documents: z.array(DocumentMetaSchema).default([]),
  reminders: z.array(TripReminderSchema).default([]),
})

export type DayRecord = z.infer<typeof DayRecordSchema>
export type ActivityStub = z.infer<typeof ActivityStubSchema>
export type TripReminder = z.infer<typeof TripReminderSchema>
export type DocumentMeta = z.infer<typeof DocumentMetaSchema>
export type TripProfile = z.infer<typeof TripProfileSchema>
export type DedicatedTripData = z.infer<typeof DedicatedTripDataSchema>
/** Seed-authoring shape: schema defaults may be omitted. */
export type DedicatedTripDataInput = z.input<typeof DedicatedTripDataSchema>
