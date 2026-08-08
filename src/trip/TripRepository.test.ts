import { beforeEach, describe, expect, it } from 'vitest'
import { buildTripDayRecords } from '@/trip/tripDays'
import {
  getActivities,
  getDocumentIndex,
  getTripDays,
  getTripProfile,
  parseDedicatedTripData,
  resetDedicatedTripData,
  seedDedicatedTrip,
} from '@/trip/TripRepository'
import type { DedicatedTripDataInput } from '@/validation/tripSchemas'

function sampleTrip(): DedicatedTripDataInput {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    trip: {
      name: 'Test Trip',
      startDate: '2026-08-18',
      endDate: '2026-08-27',
      timezone: 'Europe/Bratislava',
      countries: ['Slovakia'],
      regions: ['Liptov'],
      travelers: ['A', 'B'],
      homeCurrency: 'ILS',
    },
    days: buildTripDayRecords(),
    activities: [
      {
        id: 'act-1',
        dayNumber: 1,
        nameEn: 'Park',
        nameHe: 'פארק',
        status: 'confirmed',
      },
    ],
    documents: [
      {
        id: 'doc-1',
        title: 'Ticket',
        category: 'attraction',
        mimeType: 'application/pdf',
        createdAt: new Date().toISOString(),
        hasBlob: false,
        bookingRef: 'XYZ',
      },
    ],
  }
}

describe('trip day structure', () => {
  it('covers 17–28 Aug 2026, arrival through departure', () => {
    const days = buildTripDayRecords()
    expect(days).toHaveLength(12)
    expect(days[0]).toMatchObject({ dayNumber: 0, date: '2026-08-17' })
    expect(days[11]).toMatchObject({ dayNumber: 11, date: '2026-08-28' })
  })

  it('keeps ten active itinerary days between arrival and departure', () => {
    const active = buildTripDayRecords().filter(
      (day) => day.dayNumber >= 1 && day.dayNumber <= 10,
    )
    expect(active).toHaveLength(10)
    expect(active[0]?.date).toBe('2026-08-18')
    expect(active[9]?.date).toBe('2026-08-27')
  })
})

describe('dedicated trip seed', () => {
  beforeEach(resetDedicatedTripData)

  it('validates and loads dedicated trip data', async () => {
    const data = parseDedicatedTripData(sampleTrip())
    await seedDedicatedTrip(data)

    expect((await getTripProfile())?.name).toBe('Test Trip')
    expect(await getTripDays()).toHaveLength(12)
    expect(await getActivities()).toHaveLength(1)
    expect(await getDocumentIndex()).toHaveLength(1)
  })

  it('rejects a seed that is missing a trip day', () => {
    const invalid = { ...sampleTrip(), days: buildTripDayRecords().slice(0, 11) }
    expect(() => parseDedicatedTripData(invalid)).toThrow()
  })
})
