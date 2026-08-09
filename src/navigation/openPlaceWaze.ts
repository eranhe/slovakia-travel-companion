import type { WazeLinkResult } from '@/navigation/waze'
import { buildWazeLink, openWaze } from '@/navigation/waze'
import { getPlaceById } from '@/places/PlaceRepository'
import type { Place } from '@/types/place'

/** Build and open Waze for a known place id (sync if place already loaded). */
export function openWazeForPlace(place: Place): WazeLinkResult {
  const result = buildWazeLink({ place, navigate: true })
  if (result.ok) openWaze(result)
  return result
}

export async function openWazeForPlaceId(placeId: string): Promise<WazeLinkResult> {
  const place = await getPlaceById(placeId)
  if (!place) return { ok: false, error: 'Place not found.' }
  return openWazeForPlace(place)
}
