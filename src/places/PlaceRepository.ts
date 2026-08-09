import { tripPlacesSeed } from '@/data/trip-places-seed'
import type { Place } from '@/types/place'

const PLACE_BY_ID = new Map(tripPlacesSeed.map((place) => [place.id, place]))

/** Synchronous lookup for UI rows that only carry a placeId (no await). */
export function getPlaceByIdSync(id: string | null | undefined): Place | undefined {
  if (!id) return undefined
  return PLACE_BY_ID.get(id)
}

export async function getPlaces(): Promise<Place[]> {
  return structuredClone(tripPlacesSeed)
}

export async function getPlaceById(id: string): Promise<Place | null> {
  return structuredClone(tripPlacesSeed.find((place) => place.id === id) ?? null)
}

export async function getPlacesForDay(dayNumber: number): Promise<Place[]> {
  return structuredClone(
    tripPlacesSeed.filter((place) => place.dayNumbers.includes(dayNumber)),
  )
}
