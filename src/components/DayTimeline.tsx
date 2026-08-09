import { useState } from 'react'
import { CategoryBadge } from '@/components/CategoryBadge'
import { Thumb } from '@/components/Illustration'
import { planKindLabel } from '@/itinerary/impactPreview'
import { categoryImageId } from '@/media/images'
import { openWazeForPlaceId } from '@/navigation/openPlaceWaze'
import { getPlaceByIdSync } from '@/places/PlaceRepository'
import type { ContingencyActivity, DayItineraryState, PlanKind } from '@/types/itinerary'
import type { ActivityStub } from '@/validation/tripSchemas'

type TimelineItem = ActivityStub | ContingencyActivity

function isMainActivity(item: TimelineItem): item is ActivityStub {
  return 'dayNumber' in item && 'status' in item
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

/** Waze + website + on-demand place details for a schedule row. */
function PlaceRowActions({ placeId, isHe }: { placeId?: string; isHe: boolean }) {
  const [open, setOpen] = useState(false)
  const place = getPlaceByIdSync(placeId)
  if (!place) return null

  const summary = isHe ? place.summaryHe : place.summaryEn
  const hasDetails = Boolean(summary || place.addressEn)

  return (
    <div className="timeline-place">
      <div className="settings-row" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => void openWazeForPlaceId(place.id)}
        >
          Waze
        </button>
        {place.websiteUrl ? (
          <a className="btn btn-ghost" href={place.websiteUrl} target="_blank" rel="noreferrer">
            {isHe ? 'אתר המקום' : 'Website'}
          </a>
        ) : null}
        {hasDetails ? (
          <button type="button" className="btn btn-ghost" onClick={() => setOpen((v) => !v)}>
            {open ? (isHe ? 'הסתר פרטים' : 'Hide details') : isHe ? 'על המקום' : 'About place'}
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="timeline-place-details">
          <strong>{isHe ? place.nameHe : place.nameEn}</strong>
          {summary ? <p className="muted small">{summary}</p> : null}
          {place.addressEn ? (
            <p className="muted small">{isHe && place.addressHe ? place.addressHe : place.addressEn}</p>
          ) : null}
          {place.websiteUrl ? (
            <a href={place.websiteUrl} target="_blank" rel="noreferrer">
              {place.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
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
            const placeId = 'placeId' in item ? item.placeId : undefined
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
                  {main?.category ? (
                    <div style={{ marginTop: '0.25rem' }}>
                      <CategoryBadge category={main.category} isHe={isHe} />
                    </div>
                  ) : null}
                  {description ? <p className="timeline-note">{description}</p> : null}
                  <PlaceRowActions placeId={placeId ?? undefined} isHe={isHe} />
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
