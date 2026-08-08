import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildEstimatedDayRoute,
  buildMapMarkers,
  markerFromPlace,
  routeQualityLabel,
} from '@/maps/mapModel'
import {
  addCheckIn,
  loadCheckIns,
  resetMapVisitState,
  toggleCompletedActivity,
} from '@/maps/visitStore'
import { tripPlacesSeed } from '@/data/trip-places-seed'
import type { ActivityStub } from '@/validation/tripSchemas'

const sampleActivity: ActivityStub = {
  id: 'act-tatralandia',
  dayNumber: 1,
  nameEn: 'Tatralandia',
  nameHe: 'טטרלנדיה',
  status: 'confirmed',
  placeId: 'place-tatralandia',
}

describe('map model + visit store', () => {
  beforeEach(() => {
    resetMapVisitState()
  })

  it('builds planned markers from approximate forecast points only', () => {
    const place = tripPlacesSeed.find((p) => p.id === 'place-tatralandia')!
    const marker = markerFromPlace(place, 'planned')
    expect(marker?.coordStatus).toBe('approximate-city')
    expect(marker?.wazeUrl).toContain('waze.com/ul')
  })

  it('moves completed activities onto the visited layer', () => {
    toggleCompletedActivity('act-tatralandia')
    const markers = buildMapMarkers({
      places: tripPlacesSeed,
      activities: [sampleActivity],
      completedIds: new Set(['act-tatralandia']),
      checkIns: [],
      dayFilter: 1,
      categoryFilter: 'all',
      layer: 'visited',
      includePrivate: false,
    })
    expect(markers.some((m) => m.layer === 'visited' && m.placeId === 'place-tatralandia')).toBe(
      true,
    )
  })

  it('labels day routes as estimated, never tracked', () => {
    const route = buildEstimatedDayRoute(
      1,
      tripPlacesSeed,
      ['act-tatralandia'],
      [sampleActivity],
    )
    // Single activity cannot form a route polyline
    expect(route).toBeNull()
    expect(routeQualityLabel('estimated', 'en')).toContain('Estimated')

    const multi = buildEstimatedDayRoute(
      1,
      tripPlacesSeed,
      ['act-tatralandia', 'act-extra'],
      [
        sampleActivity,
        {
          ...sampleActivity,
          id: 'act-extra',
          placeId: 'place-besenova',
          nameEn: 'Extra',
          nameHe: 'נוסף',
        },
      ],
    )
    expect(multi?.quality).toBe('estimated')
    expect(multi?.points.length).toBeGreaterThanOrEqual(2)
  })

  it('stores foreground check-ins locally', () => {
    addCheckIn({
      labelEn: 'Test',
      labelHe: 'בדיקה',
      source: 'foreground-geo',
      coordinates: { lat: 49.1, lng: 19.6, status: 'user-reported' },
    })
    expect(loadCheckIns()).toHaveLength(1)
  })
})
