import { describe, expect, it } from 'vitest'
import {
  buildImpactPreview,
  reorderActivityIds,
  ensureDayOrder,
} from '@/itinerary/impactPreview'
import { contingencySeed } from '@/data/contingency-seed'
import type { ActivityStub } from '@/validation/tripSchemas'

describe('impactPreview helpers', () => {
  const mainActivities: ActivityStub[] = [
    {
      id: 'act-tatralandia',
      dayNumber: 1,
      nameEn: 'Tatralandia',
      nameHe: 'טטרלנדיה',
      status: 'confirmed',
    },
  ]

  it('builds rain-plan impact with replaced and alternative labels', () => {
    const plan = contingencySeed.find((item) => item.id === 'cont-d1-rain')!
    const preview = buildImpactPreview({
      dayNumber: 1,
      fromKind: 'main',
      plan,
      mainActivities,
    })
    expect(preview.toKind).toBe('rain')
    expect(preview.preservesOriginal).toBe(true)
    expect(preview.replacedActivityLabelsEn).toContain('Tatralandia')
    expect(preview.alternativeLabelsEn.length).toBeGreaterThan(0)
  })

  it('reorders activities with keyboard-style up/down', () => {
    expect(reorderActivityIds(['a', 'b', 'c'], 'b', 'up')).toEqual(['b', 'a', 'c'])
    expect(reorderActivityIds(['a', 'b', 'c'], 'b', 'down')).toEqual(['a', 'c', 'b'])
    expect(reorderActivityIds(['a', 'b', 'c'], 'a', 'up')).toEqual(['a', 'b', 'c'])
  })

  it('ensures day order keeps original snapshot', () => {
    const day = ensureDayOrder(
      {
        dayNumber: 1,
        activePlanKind: 'main',
        activityOrder: ['act-2'],
        originalActivityOrder: [],
      },
      [
        { id: 'act-1', dayNumber: 1, nameEn: 'One', nameHe: 'אחת', status: 'planned' },
        { id: 'act-2', dayNumber: 1, nameEn: 'Two', nameHe: 'שתיים', status: 'planned' },
      ],
    )
    expect(day.activityOrder).toEqual(['act-2', 'act-1'])
    expect(day.originalActivityOrder).toEqual(['act-1', 'act-2'])
  })
})

describe('contingency seed', () => {
  it('covers rain plans for outdoor-heavy days', () => {
    const rainDays = new Set(
      contingencySeed.filter((plan) => plan.kind === 'rain').map((plan) => plan.dayNumber),
    )
    expect(rainDays.has(1)).toBe(true)
    expect(rainDays.has(6)).toBe(true)
    expect(rainDays.has(7)).toBe(true)
    expect(rainDays.has(10)).toBe(true)
  })

  it('does not invent verified coordinates on alternatives', () => {
    for (const plan of contingencySeed) {
      for (const activity of plan.activities) {
        expect('coordinates' in activity).toBe(false)
      }
    }
  })
})
