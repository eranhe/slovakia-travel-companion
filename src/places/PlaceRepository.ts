import { tripPlacesSeed } from '@/data/trip-places-seed'
import type { Place } from '@/types/place'

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
