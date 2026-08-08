import { beforeEach, describe, expect, it } from 'vitest'
import {
  activatePlan,
  ensureItineraryState,
  getDayItinerary,
  moveActivity,
  previewPlanActivation,
  resetItineraryState,
  restoreOriginalOrder,
  undoLastRevision,
} from '@/itinerary/ItineraryRepository'
import { buildTripDayRecords } from '@/trip/tripDays'
import { parseDedicatedTripData, saveActivities, seedDedicatedTrip } from '@/trip/TripRepository'
import type { DedicatedTripDataInput } from '@/validation/tripSchemas'

function sampleTrip(): DedicatedTripDataInput {
  const days = buildTripDayRecords()
  const dayOneIndex = days.findIndex((day) => day.dayNumber === 1)
  days[dayOneIndex] = { ...days[dayOneIndex]!, activityIds: ['act-tatralandia', 'act-extra'] }
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    trip: {
      name: 'Test',
      startDate: '2026-08-18',
      endDate: '2026-08-27',
      timezone: 'Europe/Bratislava',
      countries: ['Slovakia'],
      regions: ['Liptov'],
      travelers: ['A'],
      homeCurrency: 'ILS',
    },
    days,
    activities: [
      {
        id: 'act-tatralandia',
        dayNumber: 1,
        nameEn: 'Tatralandia',
        nameHe: 'טטרלנדיה',
        status: 'confirmed',
      },
      {
        id: 'act-extra',
        dayNumber: 1,
        nameEn: 'Cafe stop',
        nameHe: 'עצירת קפה',
        status: 'planned',
      },
    ],
    documents: [],
  }
}

describe('ItineraryRepository', () => {
  beforeEach(async () => {
    resetItineraryState()
    await seedDedicatedTrip(parseDedicatedTripData(sampleTrip()))
  })

  it('seeds contingencies and activates rain plan with undo', async () => {
    const state = await ensureItineraryState()
    expect(state.contingencies.length).toBeGreaterThan(0)

    const preview = await previewPlanActivation(1, 'rain')
    expect(preview.toKind).toBe('rain')
    expect(preview.preservesOriginal).toBe(true)

    await activatePlan(1, 'rain')
    const after = await getDayItinerary(1)
    expect(after?.day.activePlanKind).toBe('rain')
    expect(after?.activeActivities[0]?.nameEn).toMatch(/Tatralandia|Liptovsk/i)

    await undoLastRevision(1)
    const undone = await getDayItinerary(1)
    expect(undone?.day.activePlanKind).toBe('main')
  })

  it('reorders main plan and restores original order', async () => {
    await saveActivities([
      {
        id: 'act-tatralandia',
        dayNumber: 1,
        nameEn: 'Tatralandia',
        nameHe: 'טטרלנדיה',
        status: 'confirmed',
      },
      {
        id: 'act-extra',
        dayNumber: 1,
        nameEn: 'Cafe stop',
        nameHe: 'עצירת קפה',
        status: 'planned',
      },
    ])
    await ensureItineraryState({ replace: true })

    const before = await getDayItinerary(1)
    expect(before?.mainActivities.map((a) => a.id)).toEqual(['act-tatralandia', 'act-extra'])

    await moveActivity(1, 'act-extra', 'up')
    const moved = await getDayItinerary(1)
    expect(moved?.mainActivities.map((a) => a.id)).toEqual(['act-extra', 'act-tatralandia'])

    await restoreOriginalOrder(1)
    const restored = await getDayItinerary(1)
    expect(restored?.mainActivities.map((a) => a.id)).toEqual(['act-tatralandia', 'act-extra'])
    expect(restored?.day.activePlanKind).toBe('main')
  })

  it('blocks reorder while a contingency is active', async () => {
    await activatePlan(1, 'rain')
    await expect(moveActivity(1, 'act-tatralandia', 'down')).rejects.toThrow(/Main Plan/i)
  })
})
