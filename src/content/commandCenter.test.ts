import { beforeEach, describe, expect, it } from 'vitest'
import { buildCommandCenter } from '@/content/commandCenter'
import { resetItineraryState } from '@/itinerary/ItineraryRepository'
import { resetDedicatedTripData } from '@/trip/TripRepository'
import { resetTomorrowCheckStore } from '@/weather/tomorrowCheckStore'

describe('command center', () => {
  beforeEach(() => {
    resetDedicatedTripData()
    resetItineraryState()
    resetTomorrowCheckStore()
    localStorage.clear()
  })

  it('builds readiness items without vault/backup fields', async () => {
    const snap = await buildCommandCenter()
    expect(snap.tripName).toContain('Slovakia')
    expect(snap.packingTotal).toBeGreaterThan(50)
    expect(snap.items.some((item) => item.id === 'packing')).toBe(true)
    expect(snap.items.some((item) => item.id === 'rain-plans')).toBe(true)
    expect(snap.items.every((item) => !/backup/i.test(item.id))).toBe(true)
    expect(snap.tasks.length).toBeGreaterThan(0)
  })
})
