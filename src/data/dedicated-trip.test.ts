import { describe, expect, it } from 'vitest'
import { dedicatedTripData } from '@/data/dedicated-trip'
import { tripPlacesSeed } from '@/data/trip-places-seed'
import { isImageId } from '@/media/images'
import { parseDedicatedTripData } from '@/trip/TripRepository'

const trip = parseDedicatedTripData(dedicatedTripData)
const placeIds = new Set(tripPlacesSeed.map((place) => place.id))
const activityIds = new Set(trip.activities.map((act) => act.id))

describe('dedicated trip seed', () => {
  it('spans arrival through departure with unique consecutive dates', () => {
    expect(trip.days.map((day) => day.dayNumber)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ])
    expect(trip.days[0]?.date).toBe('2026-08-17')
    expect(trip.days.at(-1)?.date).toBe('2026-08-28')
    expect(new Set(trip.days.map((day) => day.date)).size).toBe(12)
  })

  it('gives both travel days real activities', () => {
    const arrival = trip.activities.filter((act) => act.dayNumber === 0)
    const departure = trip.activities.filter((act) => act.dayNumber === 11)
    const eve = trip.activities.filter((act) => act.dayNumber === 10)
    expect(arrival.map((act) => act.id)).toContain('act-flight-out')
    expect(arrival.map((act) => act.id)).toContain('act-gett-tlv')
    expect(arrival.map((act) => act.id)).toContain('act-tlv-cash-withdraw')
    expect(arrival.map((act) => act.id)).toContain('act-eznamka')
    expect(arrival.map((act) => act.id)).toContain('act-car-pickup')
    expect(arrival.map((act) => act.id)).toContain('act-supermarket')
    expect(arrival.map((act) => act.id)).toContain('act-maladinovo-checkin')
    expect(eve.map((act) => act.id)).toContain('act-refuel-return')
    expect(eve.map((act) => act.id)).toContain('act-hilton-checkin')
    expect(eve.map((act) => act.id)).toContain('act-birthday-treat')
    expect(departure.map((act) => act.id)).toContain('act-flight-home')
    expect(departure.map((act) => act.id)).toContain('act-security-boarding')
    expect(departure.map((act) => act.id)).not.toContain('act-refuel-return')
  })

  it('keeps arrival and departure booking refs in Wallet', () => {
    const refs = new Set(trip.documents.map((doc) => doc.bookingRef).filter(Boolean))
    expect(refs).toContain('CPUFIH')
    expect(refs).toContain('751370640')
    expect(refs).toContain('6299.313.025')
    expect(refs).toContain('6756.877.990')
    expect(refs).toContain('102307991')
  })

  it('links boarding, cash receipts, and ticket PDFs in Wallet', () => {
    expect(trip.documents.find((doc) => doc.id === 'doc-boarding-outbound')?.fileUrl).toBe(
      'docs/originals/boarding-pass-outbound.pdf',
    )
    expect(trip.documents.find((doc) => doc.id === 'doc-tlv-cash')?.fileUrl).toBe(
      'docs/originals/tlv-cash-withdrawal.pdf',
    )
    expect(trip.documents.find((doc) => doc.id === 'doc-gett-tlv')?.fileUrl).toBe(
      'docs/originals/gett-tlv-booking.pdf',
    )
    expect(trip.documents.find((doc) => doc.id === 'doc-bachledka')?.fileUrl).toBe(
      'docs/originals/bachledka-tickets.pdf',
    )
    expect(trip.documents.find((doc) => doc.id === 'doc-chocholow')?.fileUrl).toBe(
      'docs/originals/chocholow-tickets.pdf',
    )
    expect(trip.activities.find((act) => act.id === 'act-flight-out')?.documentIds).toEqual([
      'doc-flight',
      'doc-boarding-outbound',
    ])
    expect(trip.activities.find((act) => act.id === 'act-gett-tlv')?.bookingRef).toBe('102307991')
    expect(trip.activities.find((act) => act.id === 'act-bachledka')?.documentIds).toEqual([
      'doc-bachledka',
    ])
    expect(trip.activities.find((act) => act.id === 'act-chocholow')?.documentIds).toEqual([
      'doc-chocholow',
    ])
    expect(trip.activities.find((act) => act.id === 'act-eznamka')?.externalUrl).toBe(
      'https://eznamka.sk',
    )
  })

  it('includes Kaizen early-return email draft and critical reminder', () => {
    const car = trip.documents.find((doc) => doc.id === 'doc-car-rental')
    expect(car?.copyText).toContain('751370640')
    expect(car?.copyText).toContain('540586')
    expect(car?.note).toContain('540586')
    const rem = trip.reminders.find((item) => item.id === 'rem-kaizen-early-return')
    expect(rem?.kind).toBe('deadline')
    expect(rem?.date).toBe('2026-08-16')
  })

  it('opens copied source PDFs as full wallet documents', () => {
    expect(trip.documents.length).toBeGreaterThan(0)
    for (const doc of trip.documents) {
      expect(doc.fileUrl, `${doc.id} is missing its source document`).toMatch(
        /^docs\/originals\/.+\.pdf$/,
      )
    }
    expect(trip.documents.find((doc) => doc.id === 'doc-flight')?.summaryUrl).toBe(
      'docs/flight-elal.html',
    )
  })

  it('leaves no day without a plan', () => {
    for (const day of trip.days) {
      expect(day.activityIds.length, `day ${day.dayNumber} has no activities`).toBeGreaterThan(0)
    }
  })

  it('cross-references day activityIds and activity dayNumbers', () => {
    for (const day of trip.days) {
      for (const id of day.activityIds) {
        const activity = trip.activities.find((act) => act.id === id)
        expect(activity, `${id} referenced by day ${day.dayNumber} is missing`).toBeDefined()
        expect(activity?.dayNumber).toBe(day.dayNumber)
      }
    }
    for (const activity of trip.activities) {
      const day = trip.days.find((item) => item.dayNumber === activity.dayNumber)
      expect(day?.activityIds, `${activity.id} is not listed on its day`).toContain(activity.id)
    }
  })

  it('points every activity and place reference at a real record', () => {
    for (const activity of trip.activities) {
      if (activity.placeId) expect(placeIds).toContain(activity.placeId)
    }
    for (const place of tripPlacesSeed) {
      for (const id of place.activityIds) expect(activityIds).toContain(id)
    }
  })

  it('resolves every imageId to a bundled illustration', () => {
    for (const day of trip.days) {
      if (day.imageId) expect(isImageId(day.imageId)).toBe(true)
    }
    for (const activity of trip.activities) {
      if (activity.imageId) expect(isImageId(activity.imageId)).toBe(true)
    }
    for (const place of tripPlacesSeed) {
      if (place.imageId) expect(isImageId(place.imageId)).toBe(true)
    }
  })

  it('keeps every "pick one" group at two or more mutually exclusive options', () => {
    const groups = new Map<string, number>()
    for (const activity of trip.activities) {
      if (!activity.choiceGroup) continue
      groups.set(activity.choiceGroup, (groups.get(activity.choiceGroup) ?? 0) + 1)
    }
    expect(groups.size).toBeGreaterThan(0)
    for (const [group, count] of groups) {
      expect(count, `choice group ${group} needs alternatives`).toBeGreaterThan(1)
    }
  })

  it('orders start times within each day', () => {
    for (const day of trip.days) {
      const starts = day.activityIds
        .map((id) => trip.activities.find((act) => act.id === id)?.startTime)
        .filter((value): value is string => Boolean(value))
      expect([...starts].sort(), `day ${day.dayNumber} is out of order`).toEqual(starts)
    }
  })
})
