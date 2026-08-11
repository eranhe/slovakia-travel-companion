import { describe, expect, it } from 'vitest'
import {
  getNearbyServicesForPlace,
  lodgingNearbyServices,
} from '@/data/nearby-services-seed'
import { buildWazeSearchLink } from '@/navigation/waze'

describe('nearby lodging services', () => {
  it('covers Maladinovo and Ždiar lodging cards', () => {
    expect(lodgingNearbyServices.map((row) => row.lodgingPlaceId).sort()).toEqual([
      'place-maladinovo',
      'place-zdiar',
    ])
  })

  it('returns curated services with Waze queries', () => {
    const maladinovo = getNearbyServicesForPlace('place-maladinovo')
    const zdiar = getNearbyServicesForPlace('place-zdiar')
    expect(maladinovo.length).toBeGreaterThanOrEqual(6)
    expect(zdiar.length).toBeGreaterThanOrEqual(6)
    expect(maladinovo.some((s) => s.kind === 'hospital')).toBe(true)
    expect(zdiar.some((s) => s.kind === 'atm')).toBe(true)
    for (const service of [...maladinovo, ...zdiar]) {
      expect(service.wazeQuery.trim().length).toBeGreaterThan(3)
      const link = buildWazeSearchLink(service.wazeQuery)
      expect(link.ok).toBe(true)
    }
  })

  it('returns empty for unknown lodging', () => {
    expect(getNearbyServicesForPlace('place-hilton-krk')).toEqual([])
  })
})
