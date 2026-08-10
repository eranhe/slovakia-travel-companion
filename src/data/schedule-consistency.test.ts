import { describe, expect, it } from 'vitest'
import { contingencySeed } from '@/data/contingency-seed'
import { dedicatedTripData } from '@/data/dedicated-trip'
import { dayBagPlans } from '@/data/packing-seed'
import { tripPlacesSeed } from '@/data/trip-places-seed'
import { parseDedicatedTripData } from '@/trip/TripRepository'

const trip = parseDedicatedTripData(dedicatedTripData)
const activityById = new Map(trip.activities.map((act) => [act.id, act]))
const dateByDayNumber = new Map(trip.days.map((day) => [day.dayNumber, day.date]))

describe('schedule consistency after the calendar refresh', () => {
  it('keeps every contingency pointing at activities of its own day', () => {
    for (const plan of contingencySeed) {
      for (const id of plan.replacesActivityIds) {
        const activity = activityById.get(id)
        expect(activity, `${plan.id} replaces missing activity ${id}`).toBeDefined()
        expect(activity?.dayNumber, `${plan.id} replaces ${id} from another day`).toBe(
          plan.dayNumber,
        )
      }
    }
  })

  it('covers every weather-sensitive active day with a rain plan', () => {
    const rainDays = new Set(
      contingencySeed.filter((plan) => plan.kind === 'rain').map((plan) => plan.dayNumber),
    )
    for (const day of trip.days) {
      if (day.dayNumber < 1 || day.dayNumber > 10) continue
      const sensitive = trip.activities.some(
        (act) =>
          act.dayNumber === day.dayNumber &&
          act.indoorOutdoor !== 'indoor' &&
          act.weatherSensitivity !== 'none' &&
          act.weatherSensitivity !== 'low',
      )
      if (!sensitive) continue
      expect(rainDays, `day ${day.dayNumber} has no rain plan`).toContain(day.dayNumber)
    }
  })

  it('dates every reminder consistently with the day it belongs to', () => {
    for (const reminder of trip.reminders) {
      if (reminder.dayNumber === null || reminder.dayNumber === undefined) continue
      expect(reminder.date, `${reminder.id} is dated off its day`).toBe(
        dateByDayNumber.get(reminder.dayNumber),
      )
    }
  })

  it('lists a day bag for every trip date', () => {
    const bagDates = new Set(dayBagPlans.map((plan) => plan.date))
    for (const day of trip.days) {
      expect(bagDates, `no day bag for ${day.date}`).toContain(day.date)
    }
  })

  it('keeps place dayNumbers in sync with the activities they host', () => {
    for (const place of tripPlacesSeed) {
      for (const id of place.activityIds) {
        const activity = activityById.get(id)
        expect(activity, `${place.id} lists unknown activity ${id}`).toBeDefined()
        expect(
          place.dayNumbers,
          `${place.id} hosts ${id} on day ${activity?.dayNumber} but is not listed on that day`,
        ).toContain(activity?.dayNumber)
      }
    }
  })

  it('keeps every choice group on a single day', () => {
    const dayByGroup = new Map<string, number>()
    for (const activity of trip.activities) {
      if (!activity.choiceGroup) continue
      const known = dayByGroup.get(activity.choiceGroup)
      if (known === undefined) dayByGroup.set(activity.choiceGroup, activity.dayNumber)
      else expect(activity.dayNumber, `${activity.choiceGroup} spans days`).toBe(known)
    }
  })
})
