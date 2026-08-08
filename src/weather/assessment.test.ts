import { describe, expect, it } from 'vitest'
import {
  assessActivity,
  buildSuggestions,
  dayStatusFromActivities,
  worstStatus,
} from '@/weather/assessment'
import type { ActivityStub } from '@/validation/tripSchemas'

const outdoorHigh: ActivityStub = {
  id: 'a1',
  dayNumber: 6,
  nameEn: 'Rafting',
  nameHe: 'רפטינג',
  status: 'planned',
  indoorOutdoor: 'outdoor',
  weatherSensitivity: 'high',
}

describe('weather assessment', () => {
  it('marks high-sensitivity outdoor as unsuitable on heavy rain chance', () => {
    const result = assessActivity(outdoorHigh, {
      date: '2026-08-23',
      tempMaxC: 22,
      tempMinC: 14,
      precipitationProbabilityMax: 80,
      weatherCode: 61,
    })
    expect(result.status).toBe('unsuitable')
  })

  it('suggests rain protection and rain contingency when wet and cautioned', () => {
    const wet = assessActivity(outdoorHigh, {
      date: '2026-08-23',
      tempMaxC: 20,
      tempMinC: 12,
      precipitationProbabilityMax: 60,
      weatherCode: 63,
    })
    expect(wet.status).toBe('caution')
    const suggestions = buildSuggestions([wet], ['rain', 'shortened'])
    expect(suggestions.some((s) => s.kind === 'rain-protection')).toBe(true)
    expect(suggestions.some((s) => s.contingencyKind === 'rain')).toBe(true)
  })

  it('returns unable without forecast', () => {
    expect(assessActivity(outdoorHigh, undefined).status).toBe('unable')
  })

  it('aggregates day status to the worst actionable status', () => {
    expect(worstStatus(['aligned', 'caution', 'preparation'])).toBe('caution')
    expect(dayStatusFromActivities(['aligned', 'unable'])).toBe('preparation')
    expect(dayStatusFromActivities(['unable', 'unable'])).toBe('unable')
  })

  it('keeps indoor mostly aligned even with some rain', () => {
    const indoor: ActivityStub = {
      ...outdoorHigh,
      id: 'indoor',
      indoorOutdoor: 'indoor',
      weatherSensitivity: 'low',
    }
    const result = assessActivity(indoor, {
      date: '2026-08-23',
      tempMaxC: 18,
      tempMinC: 12,
      precipitationProbabilityMax: 70,
      weatherCode: 61,
    })
    expect(result.status).toBe('aligned')
  })
})
