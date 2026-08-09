import type { Place } from '@/types/place'
import type { ActivityStub } from '@/validation/tripSchemas'
import type { CheckInRecord, RouteQuality } from '@/maps/visitStore'
import { buildWazeLink } from '@/navigation/waze'

export type MapLayer = 'planned' | 'visited'

export type MapCategoryFilter =
  | 'all'
  | 'attraction'
  | 'accommodation'
  | 'transport'
  | 'food'
  | 'other'
  | 'checkin'

export interface MapMarker {
  id: string
  layer: MapLayer
  placeId?: string
  checkInId?: string
  activityId?: string
  nameEn: string
  nameHe: string
  category: MapCategoryFilter
  dayNumbers: number[]
  lat: number
  lng: number
  coordStatus: 'approximate-city' | 'approximate' | 'user-reported' | 'verified'
  accessLabelEn?: string
  accessLabelHe?: string
  addressEn?: string
  privateLocation: boolean
  wazeUrl?: string
  websiteUrl?: string
  noteEn?: string
  noteHe?: string
}

export interface EstimatedDayRoute {
  dayNumber: number
  quality: RouteQuality
  points: Array<{ lat: number; lng: number; labelEn: string }>
}

export function markerFromPlace(
  place: Place,
  layer: MapLayer,
  options: { activityId?: string } = {},
): MapMarker | null {
  const point = place.forecastPoint
  if (!point || point.status === 'missing') return null
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null

  const ap = place.accessPoints.find((item) => item.isDefaultNav) ?? place.accessPoints[0]
  const waze = buildWazeLink({ place, accessPoint: ap, navigate: true })

  return {
    id: `${layer}-${place.id}${options.activityId ? `-${options.activityId}` : ''}`,
    layer,
    placeId: place.id,
    activityId: options.activityId,
    nameEn: place.nameEn,
    nameHe: place.nameHe,
    category: place.category,
    dayNumbers: place.dayNumbers,
    lat: point.lat,
    lng: point.lng,
    coordStatus: point.status === 'verified' ? 'verified' : 'approximate-city',
    accessLabelEn: ap?.labelEn,
    accessLabelHe: ap?.labelHe,
    addressEn: place.addressEn,
    privateLocation: place.privateLocation,
    wazeUrl: waze.ok ? waze.url : undefined,
    websiteUrl: place.websiteUrl,
    noteEn: point.note ?? 'Approximate map point — not a verified entrance pin.',
    noteHe: point.note ?? 'נקודה משוערת במפה — לא פינ כניסה מאומת.',
  }
}

export function markerFromCheckIn(checkIn: CheckInRecord): MapMarker | null {
  if (!checkIn.coordinates) return null
  return {
    id: `visited-checkin-${checkIn.id}`,
    layer: 'visited',
    checkInId: checkIn.id,
    placeId: checkIn.placeId,
    nameEn: checkIn.labelEn,
    nameHe: checkIn.labelHe,
    category: 'checkin',
    dayNumbers: checkIn.dayNumber ? [checkIn.dayNumber] : [],
    lat: checkIn.coordinates.lat,
    lng: checkIn.coordinates.lng,
    coordStatus: checkIn.coordinates.status,
    privateLocation: false,
    noteEn: checkIn.note ?? `Manual check-in (${checkIn.source})`,
    noteHe: checkIn.note ?? `צ׳ק־אין ידני (${checkIn.source})`,
  }
}

export function buildMapMarkers(options: {
  places: Place[]
  activities: ActivityStub[]
  completedIds: ReadonlySet<string>
  checkIns: CheckInRecord[]
  dayFilter: number | 'all'
  categoryFilter: MapCategoryFilter
  layer: MapLayer | 'both'
  includePrivate?: boolean
}): MapMarker[] {
  const {
    places,
    activities,
    completedIds,
    checkIns,
    dayFilter,
    categoryFilter,
    layer,
    includePrivate = false,
  } = options

  const markers: MapMarker[] = []

  if (layer === 'planned' || layer === 'both') {
    for (const place of places) {
      if (!includePrivate && place.privateLocation) continue
      if (dayFilter !== 'all' && !place.dayNumbers.includes(dayFilter)) continue
      if (categoryFilter !== 'all' && categoryFilter !== 'checkin' && place.category !== categoryFilter) {
        continue
      }
      const marker = markerFromPlace(place, 'planned')
      if (marker) markers.push(marker)
    }
  }

  if (layer === 'visited' || layer === 'both') {
    for (const activity of activities) {
      if (!completedIds.has(activity.id)) continue
      if (dayFilter !== 'all' && activity.dayNumber !== dayFilter) continue
      const place = activity.placeId
        ? places.find((item) => item.id === activity.placeId)
        : places.find((item) => item.activityIds.includes(activity.id))
      if (!place) continue
      if (!includePrivate && place.privateLocation) continue
      if (categoryFilter !== 'all' && categoryFilter !== 'checkin' && place.category !== categoryFilter) {
        continue
      }
      const marker = markerFromPlace(place, 'visited', { activityId: activity.id })
      if (marker) {
        marker.nameEn = `${activity.nameEn} (done)`
        marker.nameHe = `${activity.nameHe} (בוצע)`
        markers.push(marker)
      }
    }

    for (const checkIn of checkIns) {
      if (dayFilter !== 'all' && checkIn.dayNumber !== dayFilter) continue
      if (categoryFilter !== 'all' && categoryFilter !== 'checkin') continue
      const marker = markerFromCheckIn(checkIn)
      if (marker) markers.push(marker)
    }
  }

  return markers
}

/** Connect a day's place forecast points in itinerary order — always estimated. */
export function buildEstimatedDayRoute(
  dayNumber: number,
  places: Place[],
  activityOrder: string[],
  activities: ActivityStub[],
): EstimatedDayRoute | null {
  const dayActs = activityOrder
    .map((id) => activities.find((act) => act.id === id))
    .filter((act): act is ActivityStub => act != null && act.dayNumber === dayNumber)

  const points: EstimatedDayRoute['points'] = []
  for (const act of dayActs) {
    const place =
      (act.placeId ? places.find((p) => p.id === act.placeId) : undefined) ??
      places.find((p) => p.activityIds.includes(act.id))
    const point = place?.forecastPoint
    if (!point || point.status === 'missing') continue
    points.push({ lat: point.lat, lng: point.lng, labelEn: act.nameEn })
  }

  // Include day accommodation as soft anchor if no activities
  if (points.length === 0) {
    const lodging = places.find(
      (p) => p.category === 'accommodation' && p.dayNumbers.includes(dayNumber) && p.forecastPoint,
    )
    if (lodging?.forecastPoint) {
      points.push({
        lat: lodging.forecastPoint.lat,
        lng: lodging.forecastPoint.lng,
        labelEn: lodging.nameEn,
      })
    }
  }

  if (points.length < 2) return null
  return { dayNumber, quality: 'estimated', points }
}

export function routeQualityLabel(quality: RouteQuality, locale: 'en' | 'he'): string {
  const map = {
    tracked: { en: 'Tracked', he: 'נמדד' },
    reconstructed: { en: 'Reconstructed', he: 'משוחזר' },
    estimated: { en: 'Estimated — not exact', he: 'משוער — לא מדויק' },
  } as const
  return map[quality][locale]
}
