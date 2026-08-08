import { Thumb } from '@/components/Illustration'
import { planKindLabel } from '@/itinerary/impactPreview'
import { categoryImageId } from '@/media/images'
import type { ContingencyActivity, DayItineraryState, PlanKind } from '@/types/itinerary'
import type { ActivityStub } from '@/validation/tripSchemas'

type TimelineItem = ActivityStub | ContingencyActivity

function isMainActivity(item: TimelineItem): item is ActivityStub {
  return 'dayNumber' in item && 'status' in item
}

const CATEGORY_LABEL: Record<string, { en: string; he: string }> = {
  attraction: { en: 'Attraction', he: 'אטרקציה' },
  transport: { en: 'Transport', he: 'תחבורה' },
  food: { en: 'Food', he: 'אוכל' },
  accommodation: { en: 'Lodging', he: 'לינה' },
  other: { en: 'Admin', he: 'ניהול' },
}

const STATUS_LABEL: Record<string, { en: string; he: string }> = {
  confirmed: { en: 'Confirmed', he: 'מאושר' },
  planned: { en: 'Planned', he: 'מתוכנן' },
  tentative: { en: 'Tentative', he: 'לא סופי' },
}

function timeRange(item: TimelineItem): string | null {
  const start = item.startTime
  const end = 'endTime' in item ? item.endTime : undefined
  if (start && end) return `${start}–${end}`
  return start ?? null
}

interface DayTimelineProps {
  isHe: boolean
  day: DayItineraryState
  items: TimelineItem[]
  onMove?: (activityId: string, direction: 'up' | 'down') => void
  canReorder: boolean
}

export function DayTimeline({ isHe, day, items, onMove, canReorder }: DayTimelineProps) {
  const locale = isHe ? 'he' : 'en'
  const planLabel = planKindLabel(day.activePlanKind as PlanKind, locale)

  const choiceCounts = new Map<string, number>()
  for (const item of items) {
    if (isMainActivity(item) && item.choiceGroup) {
      choiceCounts.set(item.choiceGroup, (choiceCounts.get(item.choiceGroup) ?? 0) + 1)
    }
  }

  return (
    <div className="timeline">
      <div className="timeline-head">
        <h3>{isHe ? 'ציר זמן' : 'Timeline'}</h3>
        <span className="status-pill">{planLabel}</span>
      </div>
      {items.length === 0 ? (
        <p className="muted">
          {isHe ? 'אין פעילויות בתוכנית הפעילה.' : 'No activities on the active plan.'}
        </p>
      ) : (
        <ol className="timeline-list">
          {items.map((item, index) => {
            const id = item.id
            const main = isMainActivity(item) ? item : null
            const range = timeRange(item)
            const travel =
              'travelDurationMinutes' in item && item.travelDurationMinutes
                ? item.travelDurationMinutes
                : undefined
            const sensitivity =
              'weatherSensitivity' in item && item.weatherSensitivity
                ? item.weatherSensitivity
                : undefined
            const indoor =
              'indoorOutdoor' in item && item.indoorOutdoor ? item.indoorOutdoor : undefined
            const description = isHe
              ? (item.descriptionHe ?? ('suitabilityReasonHe' in item ? item.suitabilityReasonHe : undefined))
              : (item.descriptionEn ?? ('suitabilityReasonEn' in item ? item.suitabilityReasonEn : undefined))
            const isOptional = main?.isOptional === true
            const inChoice = main?.choiceGroup
              ? (choiceCounts.get(main.choiceGroup) ?? 0) > 1
              : false

            return (
              <li
                key={id}
                className={`timeline-item${isOptional ? ' timeline-item-optional' : ''}`}
              >
                <div className="timeline-marker" aria-hidden>
                  {range ? range.slice(0, 5) : index + 1}
                </div>
                <div className="timeline-body">
                  <div className="timeline-title-row">
                    <Thumb
                      imageId={main?.imageId ?? categoryImageId(main?.category)}
                      alt=""
                      size="sm"
                    />
                    <strong>{isHe ? item.nameHe : item.nameEn}</strong>
                    {isOptional ? (
                      <span className="status-pill pill-optional">
                        {isHe ? 'אופציונלי' : 'Optional'}
                      </span>
                    ) : null}
                    {inChoice ? (
                      <span className="status-pill pill-choice">
                        {isHe ? 'לבחור אחת' : 'Pick one'}
                      </span>
                    ) : null}
                    {main ? (
                      <span className="status-pill">
                        {STATUS_LABEL[main.status]?.[locale] ?? main.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="muted small">
                    {[
                      range,
                      main?.category ? CATEGORY_LABEL[main.category]?.[locale] : null,
                      main?.bookingRef ? `#${main.bookingRef}` : null,
                      travel != null
                        ? isHe
                          ? `נסיעה ~${travel} דק׳`
                          : `Travel ~${travel} min`
                        : null,
                      indoor && indoor !== 'unknown' ? indoor : null,
                      sensitivity && sensitivity !== 'none'
                        ? isHe
                          ? `רגישות מזג: ${sensitivity}`
                          : `Weather: ${sensitivity}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {description ? <p className="timeline-note">{description}</p> : null}
                  {canReorder && onMove ? (
                    <div className="timeline-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={index === 0}
                        onClick={() => onMove(id, 'up')}
                        aria-label={isHe ? 'הזז למעלה' : 'Move up'}
                      >
                        {isHe ? '▲ למעלה' : '▲ Up'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={index === items.length - 1}
                        onClick={() => onMove(id, 'down')}
                        aria-label={isHe ? 'הזז למטה' : 'Move down'}
                      >
                        {isHe ? '▼ למטה' : '▼ Down'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
