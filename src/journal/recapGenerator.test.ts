import { describe, expect, it } from 'vitest'
import {
  buildRecapFields,
  createNightlyRecap,
  renderRecapBody,
  sanitizeRecapForShare,
} from '@/journal/recapGenerator'
import { isPastRecapTime } from '@/journal/recapTime'
import type { ActivityStub } from '@/validation/tripSchemas'

const day = {
  dayNumber: 1,
  date: '2026-08-18',
  titleEn: 'Liptov · water parks',
  titleHe: 'ליפטוב · פארקי מים',
  baseLocationEn: 'Maladinovo',
  baseLocationHe: 'מלאדינובו',
  activityIds: ['act-tatralandia'],
}

const activity: ActivityStub = {
  id: 'act-tatralandia',
  dayNumber: 1,
  nameEn: 'Tatralandia',
  nameHe: 'טטרלנדיה',
  status: 'confirmed',
}

describe('nightly recap generator', () => {
  it('builds template fields and styles without AI', () => {
    const fields = buildRecapFields({
      date: '2026-08-18',
      day,
      activities: [activity],
      completedIds: new Set(['act-tatralandia']),
      checkIns: [],
      photos: [],
      notes: 'Great slides',
      favoriteMoment: 'Lazy river',
      style: 'family-update',
      locale: 'en',
    })
    expect(fields.title).toContain('Day 1')
    expect(fields.highlights).toContain('Tatralandia')
    expect(fields.notes).toBe('Great slides')

    const body = renderRecapBody(fields, 'whatsapp-story', 'en')
    expect(body).toContain('Herskovitz')
    expect(body).toContain('Lazy river')
  })

  it('preserves locked manual body across regeneration', () => {
    const first = createNightlyRecap({
      date: '2026-08-18',
      day,
      activities: [activity],
      completedIds: new Set(),
      checkIns: [],
      photos: [],
      style: 'minimal',
      locale: 'en',
    })
    first.body = 'Manual edit that must survive'
    first.bodyLocked = true

    const second = createNightlyRecap(
      {
        date: '2026-08-18',
        day,
        activities: [activity],
        completedIds: new Set(['act-tatralandia']),
        checkIns: [],
        photos: [],
        style: 'detailed-log',
        locale: 'en',
      },
      first,
    )
    expect(second.body).toBe('Manual edit that must survive')
    expect(second.bodyLocked).toBe(true)
  })

  it('sanitizes booking refs before share', () => {
    expect(sanitizeRecapForShare('Booking CPUFIH and policy 310823541')).toContain('[ref]')
    expect(sanitizeRecapForShare('Booking CPUFIH')).not.toContain('CPUFIH')
  })

  it('detects 21:30 recap window in trip timezone', () => {
    const before = new Date('2026-08-18T21:00:00+02:00')
    const after = new Date('2026-08-18T21:35:00+02:00')
    expect(isPastRecapTime('Europe/Bratislava', before)).toBe(false)
    expect(isPastRecapTime('Europe/Bratislava', after)).toBe(true)
  })
})
