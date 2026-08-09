import { describe, expect, it } from 'vitest'
import { buildWazeLink, canUseCoordinateNavigation, isValidCoordinates } from '@/navigation/waze'
import type { Place } from '@/types/place'

const samplePlace: Place = {
  id: 'p1',
  nameEn: 'Test Park',
  nameHe: 'פארק',
  category: 'attraction',
  dayNumbers: [1],
  activityIds: [],
  privateLocation: false,
  indoorOutdoor: 'outdoor',
  accessPoints: [
    {
      id: 'ap1',
      kind: 'entrance',
      labelEn: 'Entrance',
      labelHe: 'כניסה',
      wazeQuery: 'Test Park Slovakia',
      isDefaultNav: true,
    },
  ],
}

describe('waze links', () => {
  it('builds search-based navigate links with encoded query', () => {
    const result = buildWazeLink({ place: samplePlace })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.mode).toBe('q')
    expect(result.url.startsWith('https://www.waze.com/ul?')).toBe(true)
    expect(result.url).toContain('navigate=yes')
    expect(result.url).toContain('q=Test')
    expect(result.appUrl.startsWith('waze://')).toBe(true)
  })

  it('rejects invalid coordinates', () => {
    expect(isValidCoordinates({ lat: 100, lng: 20, status: 'verified' })).toBe(false)
    expect(canUseCoordinateNavigation({ lat: 49.1, lng: 19.6, status: 'approximate-city' })).toBe(
      false,
    )
  })

  it('uses ll only for verified coordinates and keeps a raw comma', () => {
    const withVerified: Place = {
      ...samplePlace,
      accessPoints: [
        {
          id: 'ap2',
          kind: 'parking',
          labelEn: 'Parking',
          labelHe: 'חניה',
          isDefaultNav: true,
          coordinates: { lat: 49.1, lng: 19.6, status: 'verified' },
        },
      ],
    }
    const result = buildWazeLink({ place: withVerified })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.mode).toBe('ll')
    expect(result.url).toContain('ll=49.1,19.6')
    expect(result.url).not.toContain('%2C')
  })

  it('fails when no query and no verified coords', () => {
    const empty: Place = {
      ...samplePlace,
      nameEn: '',
      addressEn: undefined,
      accessPoints: [
        {
          id: 'ap3',
          kind: 'general',
          labelEn: 'X',
          labelHe: 'X',
          isDefaultNav: true,
        },
      ],
    }
    const result = buildWazeLink({ place: empty })
    expect(result.ok).toBe(false)
  })
})
