import { z } from 'zod'
import { TRIP_DAY_COUNT, TRIP_DAY_MAX, TRIP_DAY_MIN } from '@/validation/tripSchemas'

const dayNumberSchema = z.number().int().min(TRIP_DAY_MIN).max(TRIP_DAY_MAX)

export const PlanKindSchema = z.enum([
  'main',
  'rain',
  'low-energy',
  'late-start',
  'transport-disruption',
  'attraction-closed',
  'extreme-heat',
  'strong-wind',
  'mountain-weather',
  'accessibility',
  'shortened',
  'other',
])

export const WeatherSensitivitySchema = z.enum(['none', 'low', 'medium', 'high'])
export const FlexibilitySchema = z.enum(['fixed', 'flexible'])
export const IndoorOutdoorSchema = z.enum(['indoor', 'outdoor', 'mixed', 'unknown'])

export const ContingencyActivitySchema = z.object({
  id: z.string(),
  nameEn: z.string(),
  nameHe: z.string(),
  descriptionEn: z.string().optional(),
  descriptionHe: z.string().optional(),
  placeId: z.string().optional(),
  /** Waze search when no place record exists — never invent precise pins. */
  wazeQuery: z.string().optional(),
  indoorOutdoor: IndoorOutdoorSchema.default('unknown'),
  weatherSensitivity: WeatherSensitivitySchema.default('low'),
  durationMinutes: z.number().int().positive().optional(),
  travelDurationMinutes: z.number().int().nonnegative().optional(),
  suitabilityReasonEn: z.string().optional(),
  suitabilityReasonHe: z.string().optional(),
  startTime: z.string().optional(),
  reservationNote: z.string().optional(),
})

export const ContingencyPlanSchema = z.object({
  id: z.string(),
  dayNumber: dayNumberSchema,
  kind: z.enum([
    'rain',
    'low-energy',
    'late-start',
    'transport-disruption',
    'attraction-closed',
    'extreme-heat',
    'strong-wind',
    'mountain-weather',
    'accessibility',
    'shortened',
    'other',
  ]),
  titleEn: z.string(),
  titleHe: z.string(),
  summaryEn: z.string(),
  summaryHe: z.string(),
  activities: z.array(ContingencyActivitySchema).default([]),
  replacesActivityIds: z.array(z.string()).default([]),
  notesEn: z.string().optional(),
  notesHe: z.string().optional(),
})

export const DayItineraryStateSchema = z.object({
  dayNumber: dayNumberSchema,
  activePlanKind: PlanKindSchema.default('main'),
  /** Ordered main-plan activity ids for this day. */
  activityOrder: z.array(z.string()).default([]),
  /** Snapshot of first known order — used by restore-original. */
  originalActivityOrder: z.array(z.string()).default([]),
})

export const RevisionActionSchema = z.enum([
  'reorder',
  'activate-plan',
  'restore-main',
  'restore-original-order',
  'undo',
])

export const RevisionEntrySchema = z.object({
  id: z.string(),
  at: z.string(),
  dayNumber: dayNumberSchema,
  action: RevisionActionSchema,
  summaryEn: z.string(),
  summaryHe: z.string(),
  before: z.object({
    activePlanKind: PlanKindSchema,
    activityOrder: z.array(z.string()),
  }),
  after: z.object({
    activePlanKind: PlanKindSchema,
    activityOrder: z.array(z.string()),
  }),
})

export const ItineraryStateSchema = z.object({
  version: z.literal(1),
  days: z.array(DayItineraryStateSchema).length(TRIP_DAY_COUNT),
  contingencies: z.array(ContingencyPlanSchema).default([]),
  revisions: z.array(RevisionEntrySchema).default([]),
  seededAt: z.string().optional(),
})

export type PlanKind = z.infer<typeof PlanKindSchema>
export type WeatherSensitivity = z.infer<typeof WeatherSensitivitySchema>
export type ContingencyActivity = z.infer<typeof ContingencyActivitySchema>
export type ContingencyPlan = z.infer<typeof ContingencyPlanSchema>
export type DayItineraryState = z.infer<typeof DayItineraryStateSchema>
export type RevisionEntry = z.infer<typeof RevisionEntrySchema>
export type ItineraryState = z.infer<typeof ItineraryStateSchema>

export interface ImpactPreview {
  dayNumber: number
  fromKind: PlanKind
  toKind: PlanKind
  planTitleEn: string
  planTitleHe: string
  summaryEn: string
  summaryHe: string
  replacedActivityLabelsEn: string[]
  replacedActivityLabelsHe: string[]
  alternativeLabelsEn: string[]
  alternativeLabelsHe: string[]
  preservesOriginal: true
  canUndo: true
}
