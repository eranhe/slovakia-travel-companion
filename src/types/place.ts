import { z } from 'zod'
import { TRIP_DAY_MAX, TRIP_DAY_MIN } from '@/validation/tripSchemas'

export const CoordStatusSchema = z.enum([
  'missing',
  'approximate-city',
  'approximate',
  'verified',
])

export const AccessPointKindSchema = z.enum([
  'entrance',
  'parking',
  'trailhead',
  'dropoff',
  'station',
  'general',
])

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  status: CoordStatusSchema,
  note: z.string().optional(),
})

export const AccessPointSchema = z.object({
  id: z.string(),
  kind: AccessPointKindSchema,
  labelEn: z.string(),
  labelHe: z.string(),
  /** Preferred Waze search query — used when verified coords are missing. */
  wazeQuery: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
  isDefaultNav: z.boolean().default(false),
})

export const PlaceSchema = z.object({
  id: z.string(),
  nameEn: z.string(),
  nameHe: z.string(),
  category: z.enum([
    'attraction',
    'accommodation',
    'transport',
    'food',
    'other',
  ]),
  addressEn: z.string().optional(),
  addressHe: z.string().optional(),
  dayNumbers: z
    .array(z.number().int().min(TRIP_DAY_MIN).max(TRIP_DAY_MAX))
    .default([]),
  activityIds: z.array(z.string()).default([]),
  accessPoints: z.array(AccessPointSchema).default([]),
  /** Illustration id resolved through `@/media/images`. */
  imageId: z.string().optional(),
  /** Official / useful website for the place (opens in a new tab). */
  websiteUrl: z.string().url().optional(),
  /** Short blurb for quick reading beyond the name. */
  summaryEn: z.string().optional(),
  summaryHe: z.string().optional(),
  /** City-level point for forecasts only — never treated as a precise Waze pin unless verified. */
  forecastPoint: CoordinatesSchema.optional(),
  privateLocation: z.boolean().default(false),
  indoorOutdoor: z.enum(['indoor', 'outdoor', 'mixed', 'unknown']).default('unknown'),
  notes: z.string().optional(),
})

export type CoordStatus = z.infer<typeof CoordStatusSchema>
export type AccessPointKind = z.infer<typeof AccessPointKindSchema>
export type Coordinates = z.infer<typeof CoordinatesSchema>
export type AccessPoint = z.infer<typeof AccessPointSchema>
export type Place = z.infer<typeof PlaceSchema>

export interface WeatherSnapshot {
  fetchedAt: string
  latitude: number
  longitude: number
  timezone: string
  currentTempC: number | null
  weatherCode: number | null
  daily: Array<{
    date: string
    tempMaxC: number | null
    tempMinC: number | null
    precipitationProbabilityMax: number | null
    weatherCode: number | null
  }>
  hourlyNearVisit?: Array<{
    time: string
    tempC: number | null
    precipitationProbability: number | null
    weatherCode: number | null
  }>
  source: 'open-meteo'
  label: string
}
