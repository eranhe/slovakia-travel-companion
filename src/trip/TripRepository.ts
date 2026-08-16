import { dedicatedTripData } from '@/data/dedicated-trip'
import {
  DedicatedTripDataSchema,
  type ActivityStub,
  type DedicatedTripData,
  type DocumentMeta,
  type TripProfile,
  type TripReminder,
  type DayRecord,
} from '@/validation/tripSchemas'

/** Parsed once so schema defaults (isOptional, hasBlob, …) are applied to the seed. */
const seededTrip: DedicatedTripData = DedicatedTripDataSchema.parse(dedicatedTripData)

let currentTrip: DedicatedTripData = structuredClone(seededTrip)

export function resetDedicatedTripData(): void {
  currentTrip = structuredClone(seededTrip)
}

export async function getTripProfile(): Promise<TripProfile> {
  return structuredClone(currentTrip.trip)
}

export async function getTripDays(): Promise<DayRecord[]> {
  return structuredClone(currentTrip.days)
}

export async function ensureTripDays(): Promise<DayRecord[]> {
  return getTripDays()
}

export async function getActivities(): Promise<ActivityStub[]> {
  return structuredClone(currentTrip.activities)
}

export async function saveActivities(activities: ActivityStub[]): Promise<void> {
  currentTrip = { ...currentTrip, activities: structuredClone(activities) }
}

export async function getDocumentIndex(): Promise<DocumentMeta[]> {
  return structuredClone(currentTrip.documents)
}

export function getDocumentByIdSync(id: string): DocumentMeta | undefined {
  return currentTrip.documents.find((doc) => doc.id === id)
}

export function getDocumentsByIdsSync(ids: string[]): DocumentMeta[] {
  return ids
    .map((id) => currentTrip.documents.find((doc) => doc.id === id))
    .filter((doc): doc is DocumentMeta => Boolean(doc))
}

export async function getReminders(): Promise<TripReminder[]> {
  return structuredClone(currentTrip.reminders)
}

export function parseDedicatedTripData(raw: unknown): DedicatedTripData {
  return DedicatedTripDataSchema.parse(raw)
}

/** Test/helper override; production uses the built-in dedicated trip data. */
export async function seedDedicatedTrip(data: DedicatedTripData): Promise<void> {
  currentTrip = structuredClone(DedicatedTripDataSchema.parse(data))
}
