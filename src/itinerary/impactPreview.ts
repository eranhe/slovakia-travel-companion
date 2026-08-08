import type {
  ContingencyPlan,
  DayItineraryState,
  ImpactPreview,
  ItineraryState,
  PlanKind,
  RevisionEntry,
} from '@/types/itinerary'
import type { ActivityStub } from '@/validation/tripSchemas'

export function buildImpactPreview(options: {
  dayNumber: number
  fromKind: PlanKind
  plan: ContingencyPlan | null
  mainActivities: ActivityStub[]
}): ImpactPreview {
  const { dayNumber, fromKind, plan, mainActivities } = options
  if (!plan) {
    return {
      dayNumber,
      fromKind,
      toKind: 'main',
      planTitleEn: 'Main Plan',
      planTitleHe: 'תוכנית ראשית',
      summaryEn: 'Return to the original main timeline for this day. Contingency activities are cleared from the active view.',
      summaryHe: 'חזרה ללוח הזמנים הראשי של היום. פעילויות הגיבוי יוסרו מהתצוגה הפעילה.',
      replacedActivityLabelsEn: [],
      replacedActivityLabelsHe: [],
      alternativeLabelsEn: mainActivities.map((a) => a.nameEn),
      alternativeLabelsHe: mainActivities.map((a) => a.nameHe),
      preservesOriginal: true,
      canUndo: true,
    }
  }

  const replaced = mainActivities.filter((act) => plan.replacesActivityIds.includes(act.id))
  return {
    dayNumber,
    fromKind,
    toKind: plan.kind,
    planTitleEn: plan.titleEn,
    planTitleHe: plan.titleHe,
    summaryEn: plan.summaryEn,
    summaryHe: plan.summaryHe,
    replacedActivityLabelsEn: replaced.map((a) => a.nameEn),
    replacedActivityLabelsHe: replaced.map((a) => a.nameHe),
    alternativeLabelsEn: plan.activities.map((a) => a.nameEn),
    alternativeLabelsHe: plan.activities.map((a) => a.nameHe),
    preservesOriginal: true,
    canUndo: true,
  }
}

export function reorderActivityIds(order: string[], activityId: string, direction: 'up' | 'down'): string[] {
  const index = order.indexOf(activityId)
  if (index < 0) return order
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= order.length) return order
  const next = [...order]
  const tmp = next[index]!
  next[index] = next[target]!
  next[target] = tmp
  return next
}

export function ensureDayOrder(
  day: DayItineraryState,
  dayActivities: ActivityStub[],
): DayItineraryState {
  const ids = dayActivities.map((act) => act.id)
  const kept = day.activityOrder.filter((id) => ids.includes(id))
  const missing = ids.filter((id) => !kept.includes(id))
  const activityOrder = [...kept, ...missing]
  const originalActivityOrder =
    day.originalActivityOrder.length > 0
      ? day.originalActivityOrder.filter((id) => ids.includes(id)).concat(
          ids.filter((id) => !day.originalActivityOrder.includes(id)),
        )
      : [...ids]
  return { ...day, activityOrder, originalActivityOrder }
}

export function appendRevision(
  state: ItineraryState,
  entry: Omit<RevisionEntry, 'id' | 'at'> & { id?: string; at?: string },
  max = 40,
): ItineraryState {
  const revision: RevisionEntry = {
    id: entry.id ?? `rev-${crypto.randomUUID()}`,
    at: entry.at ?? new Date().toISOString(),
    dayNumber: entry.dayNumber,
    action: entry.action,
    summaryEn: entry.summaryEn,
    summaryHe: entry.summaryHe,
    before: entry.before,
    after: entry.after,
  }
  return {
    ...state,
    revisions: [revision, ...state.revisions].slice(0, max),
  }
}

export function planKindLabel(kind: PlanKind, locale: 'en' | 'he'): string {
  const map: Record<PlanKind, { en: string; he: string }> = {
    main: { en: 'Main Plan', he: 'תוכנית ראשית' },
    rain: { en: 'Rain Plan', he: 'תוכנית גשם' },
    'low-energy': { en: 'Low-Energy Plan', he: 'תוכנית אנרגיה נמוכה' },
    'late-start': { en: 'Late-Start Plan', he: 'תוכנית התחלה מאוחרת' },
    'transport-disruption': { en: 'Transport Disruption', he: 'שיבוש תחבורה' },
    'attraction-closed': { en: 'Attraction Closed', he: 'אטרקציה סגורה' },
    'extreme-heat': { en: 'Extreme Heat', he: 'חום קיצוני' },
    'strong-wind': { en: 'Strong Wind', he: 'רוח חזקה' },
    'mountain-weather': { en: 'Mountain Weather', he: 'מזג אוויר בהרים' },
    accessibility: { en: 'Accessibility Plan', he: 'תוכנית נגישות' },
    shortened: { en: 'Shortened Plan', he: 'תוכנית מקוצרת' },
    other: { en: 'Other Plan', he: 'תוכנית אחרת' },
  }
  return map[kind][locale]
}
