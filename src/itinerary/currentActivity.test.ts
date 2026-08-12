import { describe, expect, it } from 'vitest'
import { selectCurrentActivity } from '@/itinerary/currentActivity'

const activities = [
  { id: 'a', startTime: '08:00', endTime: '09:00' },
  { id: 'b', startTime: '09:30', endTime: '11:00' },
  { id: 'c', startTime: '12:00' },
]

describe('selectCurrentActivity', () => {
  it('returns the activity currently in progress', () => {
    expect(
      selectCurrentActivity(activities, new Set(), {
        isToday: true,
        nowTime: '10:00',
      }),
    ).toEqual({ activity: activities[1], state: 'now' })
  })

  it('returns the next upcoming activity between slots', () => {
    expect(
      selectCurrentActivity(activities, new Set(), {
        isToday: true,
        nowTime: '11:30',
      }),
    ).toEqual({ activity: activities[2], state: 'next' })
  })

  it('skips completed activities', () => {
    expect(
      selectCurrentActivity(activities, new Set(['a', 'b']), {
        isToday: false,
        nowTime: '07:00',
      }),
    ).toEqual({ activity: activities[2], state: 'next' })
  })

  it('returns null when all activities are complete', () => {
    expect(
      selectCurrentActivity(activities, new Set(['a', 'b', 'c']), {
        isToday: true,
        nowTime: '13:00',
      }),
    ).toBeNull()
  })
})
