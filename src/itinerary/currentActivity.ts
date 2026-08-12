export interface TimedActivity {
  id: string
  startTime?: string
  endTime?: string
}

export interface CurrentActivityResult<T extends TimedActivity> {
  activity: T
  state: 'now' | 'next'
}

function minutes(time: string | undefined): number | null {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null
  const [hours, mins] = time.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return null
  return hours * 60 + mins
}

/**
 * Picks the activity the family needs now. Completion wins over clock time so
 * manually skipped/completed rows never stay highlighted.
 */
export function selectCurrentActivity<T extends TimedActivity>(
  activities: T[],
  completedIds: Set<string>,
  options: { isToday: boolean; nowTime: string },
): CurrentActivityResult<T> | null {
  const remaining = activities.filter((item) => !completedIds.has(item.id))
  if (remaining.length === 0) return null
  if (!options.isToday) return { activity: remaining[0]!, state: 'next' }

  const now = minutes(options.nowTime)
  if (now == null) return { activity: remaining[0]!, state: 'next' }

  const active = remaining.find((item) => {
    const start = minutes(item.startTime)
    const end = minutes(item.endTime)
    return start != null && start <= now && (end == null || now < end)
  })
  if (active) return { activity: active, state: 'now' }

  const next = remaining.find((item) => {
    const start = minutes(item.startTime)
    return start != null && start >= now
  })
  return { activity: next ?? remaining[0]!, state: 'next' }
}
