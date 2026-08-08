import { contingencySeed } from '@/data/contingency-seed'
import {
  appendRevision,
  buildImpactPreview,
  ensureDayOrder,
  reorderActivityIds,
} from '@/itinerary/impactPreview'
import type {
  ContingencyPlan,
  DayItineraryState,
  ImpactPreview,
  ItineraryState,
  PlanKind,
  RevisionEntry,
} from '@/types/itinerary'
import { getActivities } from '@/trip/TripRepository'
import { TRIP_DAY_COUNT, TRIP_DAY_MIN } from '@/validation/tripSchemas'
import type { ActivityStub } from '@/validation/tripSchemas'

let currentItinerary: ItineraryState | null = null

export function resetItineraryState(): void {
  currentItinerary = null
}

function emptyDays(): DayItineraryState[] {
  return Array.from({ length: TRIP_DAY_COUNT }, (_, index) => ({
    dayNumber: TRIP_DAY_MIN + index,
    activePlanKind: 'main' as const,
    activityOrder: [],
    originalActivityOrder: [],
  }))
}

export function buildDefaultItineraryState(activities: ActivityStub[]): ItineraryState {
  const days = emptyDays().map((day) => {
    const dayActs = activities.filter((act) => act.dayNumber === day.dayNumber)
    return ensureDayOrder(day, dayActs)
  })
  return {
    version: 1,
    days,
    contingencies: contingencySeed,
    revisions: [],
    seededAt: new Date().toISOString(),
  }
}

export async function getItineraryState(): Promise<ItineraryState | null> {
  return currentItinerary ? structuredClone(currentItinerary) : null
}

export async function saveItineraryState(state: ItineraryState): Promise<void> {
  currentItinerary = structuredClone(state)
}

export async function ensureItineraryState(options: { replace?: boolean } = {}): Promise<ItineraryState> {
  const existing = options.replace ? null : await getItineraryState()
  const activities = await getActivities()
  if (existing) {
    const synced = {
      ...existing,
      days: existing.days.map((day) =>
        ensureDayOrder(
          day,
          activities.filter((act) => act.dayNumber === day.dayNumber),
        ),
      ),
      contingencies:
        existing.contingencies.length > 0 ? existing.contingencies : contingencySeed,
    }
    await saveItineraryState(synced)
    return synced
  }
  const created = buildDefaultItineraryState(activities)
  await saveItineraryState(created)
  return created
}

export async function getDayItinerary(dayNumber: number): Promise<{
  day: DayItineraryState
  contingencies: ContingencyPlan[]
  mainActivities: ActivityStub[]
  activeActivities: Array<ActivityStub | ContingencyPlan['activities'][number]>
  revisions: RevisionEntry[]
} | null> {
  const state = await ensureItineraryState()
  const day = state.days.find((item) => item.dayNumber === dayNumber)
  if (!day) return null
  const activities = await getActivities()
  const mainActivities = orderActivities(
    activities.filter((act) => act.dayNumber === dayNumber),
    day.activityOrder,
  )
  const contingencies = state.contingencies.filter((plan) => plan.dayNumber === dayNumber)
  const activePlan =
    day.activePlanKind === 'main'
      ? null
      : contingencies.find((plan) => plan.kind === day.activePlanKind) ?? null
  const activeActivities = activePlan ? activePlan.activities : mainActivities
  return {
    day,
    contingencies,
    mainActivities,
    activeActivities,
    revisions: state.revisions.filter((rev) => rev.dayNumber === dayNumber).slice(0, 12),
  }
}

function orderActivities(activities: ActivityStub[], order: string[]): ActivityStub[] {
  const map = new Map(activities.map((act) => [act.id, act]))
  const ordered: ActivityStub[] = []
  for (const id of order) {
    const act = map.get(id)
    if (act) {
      ordered.push(act)
      map.delete(id)
    }
  }
  return [...ordered, ...map.values()]
}

export async function previewPlanActivation(
  dayNumber: number,
  toKind: PlanKind,
): Promise<ImpactPreview> {
  const bundle = await getDayItinerary(dayNumber)
  if (!bundle) throw new Error('Day not found')
  const plan =
    toKind === 'main' ? null : bundle.contingencies.find((item) => item.kind === toKind) ?? null
  if (toKind !== 'main' && !plan) throw new Error('Contingency plan not found for this day.')
  return buildImpactPreview({
    dayNumber,
    fromKind: bundle.day.activePlanKind,
    plan,
    mainActivities: bundle.mainActivities,
  })
}

export async function activatePlan(dayNumber: number, toKind: PlanKind): Promise<ItineraryState> {
  const state = await ensureItineraryState()
  const dayIndex = state.days.findIndex((item) => item.dayNumber === dayNumber)
  if (dayIndex < 0) throw new Error('Day not found')
  const day = state.days[dayIndex]!
  if (day.activePlanKind === toKind) return state

  const activities = await getActivities()
  const mainActivities = activities.filter((act) => act.dayNumber === dayNumber)
  const plan =
    toKind === 'main'
      ? null
      : state.contingencies.find((item) => item.dayNumber === dayNumber && item.kind === toKind) ??
        null
  if (toKind !== 'main' && !plan) throw new Error('Contingency plan not found.')

  const afterDay: DayItineraryState = { ...day, activePlanKind: toKind }
  const days = [...state.days]
  days[dayIndex] = afterDay

  const impact = buildImpactPreview({
    dayNumber,
    fromKind: day.activePlanKind,
    plan,
    mainActivities,
  })

  const next = appendRevision(
    { ...state, days },
    {
      dayNumber,
      action: toKind === 'main' ? 'restore-main' : 'activate-plan',
      summaryEn: `Activated ${impact.planTitleEn}`,
      summaryHe: `הופעלה ${impact.planTitleHe}`,
      before: { activePlanKind: day.activePlanKind, activityOrder: day.activityOrder },
      after: { activePlanKind: toKind, activityOrder: day.activityOrder },
    },
  )
  await saveItineraryState(next)
  return next
}

export async function moveActivity(
  dayNumber: number,
  activityId: string,
  direction: 'up' | 'down',
): Promise<ItineraryState> {
  const state = await ensureItineraryState()
  const dayIndex = state.days.findIndex((item) => item.dayNumber === dayNumber)
  if (dayIndex < 0) throw new Error('Day not found')
  const day = state.days[dayIndex]!
  if (day.activePlanKind !== 'main') {
    throw new Error('Reorder is available on the Main Plan only. Restore Main Plan first.')
  }
  const activityOrder = reorderActivityIds(day.activityOrder, activityId, direction)
  if (activityOrder.join() === day.activityOrder.join()) return state

  const afterDay = { ...day, activityOrder }
  const days = [...state.days]
  days[dayIndex] = afterDay
  const next = appendRevision(
    { ...state, days },
    {
      dayNumber,
      action: 'reorder',
      summaryEn: `Moved activity ${direction}`,
      summaryHe: direction === 'up' ? 'הזזת פעילות למעלה' : 'הזזת פעילות למטה',
      before: { activePlanKind: day.activePlanKind, activityOrder: day.activityOrder },
      after: { activePlanKind: day.activePlanKind, activityOrder },
    },
  )
  await saveItineraryState(next)
  return next
}

export async function restoreOriginalOrder(dayNumber: number): Promise<ItineraryState> {
  const state = await ensureItineraryState()
  const dayIndex = state.days.findIndex((item) => item.dayNumber === dayNumber)
  if (dayIndex < 0) throw new Error('Day not found')
  const day = state.days[dayIndex]!
  const activityOrder = [...day.originalActivityOrder]
  const afterDay: DayItineraryState = { ...day, activePlanKind: 'main', activityOrder }
  const days = [...state.days]
  days[dayIndex] = afterDay
  const next = appendRevision(
    { ...state, days },
    {
      dayNumber,
      action: 'restore-original-order',
      summaryEn: 'Restored original main-plan order',
      summaryHe: 'שוחזר סדר התוכנית הראשית המקורי',
      before: { activePlanKind: day.activePlanKind, activityOrder: day.activityOrder },
      after: { activePlanKind: 'main', activityOrder },
    },
  )
  await saveItineraryState(next)
  return next
}

export async function undoLastRevision(dayNumber?: number): Promise<ItineraryState | null> {
  const state = await ensureItineraryState()
  const revision = state.revisions.find((item) =>
    dayNumber === undefined ? true : item.dayNumber === dayNumber,
  )
  if (!revision) return null

  const dayIndex = state.days.findIndex((item) => item.dayNumber === revision.dayNumber)
  if (dayIndex < 0) return null
  const day = state.days[dayIndex]!
  const afterDay: DayItineraryState = {
    ...day,
    activePlanKind: revision.before.activePlanKind,
    activityOrder: [...revision.before.activityOrder],
  }
  const days = [...state.days]
  days[dayIndex] = afterDay
  const without = state.revisions.filter((item) => item.id !== revision.id)
  const next = appendRevision(
    { ...state, days, revisions: without },
    {
      dayNumber: revision.dayNumber,
      action: 'undo',
      summaryEn: `Undo: ${revision.summaryEn}`,
      summaryHe: `ביטול: ${revision.summaryHe}`,
      before: { activePlanKind: day.activePlanKind, activityOrder: day.activityOrder },
      after: {
        activePlanKind: revision.before.activePlanKind,
        activityOrder: revision.before.activityOrder,
      },
    },
  )
  await saveItineraryState(next)
  return next
}
