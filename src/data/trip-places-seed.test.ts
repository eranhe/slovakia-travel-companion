import { describe, expect, it } from 'vitest'
import { tripPlacesSeed } from '@/data/trip-places-seed'
import { buildWazeLink } from '@/navigation/waze'

describe('trip places seed', () => {
  it('includes attractions and private accommodations', () => {
    expect(tripPlacesSeed.some((place) => place.category === 'attraction')).toBe(true)
    expect(tripPlacesSeed.some((place) => place.privateLocation)).toBe(true)
  })

  it('never uses unverified coordinates for ll navigation', () => {
    /** Official KRK P1 pin from the Aug 2026 car-return guide — only allowlisted verified ll. */
    const verifiedAllowlist = new Set(['ap-krk-p1-return'])

    for (const place of tripPlacesSeed) {
      for (const accessPoint of place.accessPoints) {
        if (accessPoint.coordinates) {
          if (verifiedAllowlist.has(accessPoint.id)) {
            expect(accessPoint.coordinates.status).toBe('verified')
          } else {
            expect(accessPoint.coordinates.status).not.toBe('verified')
          }
        }
        const link = buildWazeLink({ place, accessPoint })
        expect(link.ok).toBe(true)
        if (!link.ok) continue
        if (verifiedAllowlist.has(accessPoint.id)) {
          expect(link.mode).toBe('ll')
        } else {
          expect(link.mode).toBe('q')
        }
      }
    }
  })

  it('labels forecast points as approximate-city when present', () => {
    for (const place of tripPlacesSeed) {
      if (place.forecastPoint) {
        expect(place.forecastPoint.status).toBe('approximate-city')
      }
    }
  })
})
