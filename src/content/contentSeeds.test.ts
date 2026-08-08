import { describe, expect, it } from 'vitest'
import { packingProgress, packingSections, dayBagPlans } from '@/data/packing-seed'
import { phrasebook } from '@/data/phrasebook-seed'
import { emergencyNumbers } from '@/data/emergency-seed'

describe('phase 8 content seeds', () => {
  it('has a substantial packing checklist with day bags', () => {
    const total = packingSections.reduce((sum, section) => sum + section.items.length, 0)
    expect(packingSections.length).toBeGreaterThanOrEqual(8)
    expect(total).toBeGreaterThanOrEqual(80)
    expect(dayBagPlans.some((row) => row.date === '2026-08-18')).toBe(true)
    expect(packingProgress(new Set()).percent).toBe(0)
    const one = packingSections[0]!.items[0]!.id
    expect(packingProgress(new Set([one])).checked).toBe(1)
  })

  it('includes SK/PL phrases and EU 112', () => {
    expect(phrasebook.some((row) => row.sk && row.pl)).toBe(true)
    expect(emergencyNumbers.some((row) => row.number === '112' && row.critical)).toBe(true)
  })
})
