import { useMemo, useState } from 'react'
import type { ContingencyPlan, ImpactPreview, PlanKind, RevisionEntry } from '@/types/itinerary'
import { planKindLabel } from '@/itinerary/impactPreview'
import type { ActivityStub } from '@/validation/tripSchemas'

interface ContingencyPanelProps {
  isHe: boolean
  activePlanKind: PlanKind
  contingencies: ContingencyPlan[]
  mainActivities: ActivityStub[]
  revisions: RevisionEntry[]
  onPreview: (kind: PlanKind) => Promise<ImpactPreview>
  onConfirmActivate: (kind: PlanKind) => Promise<void>
  onRestoreOriginal: () => Promise<void>
  onUndo: () => Promise<void>
}

export function ContingencyPanel({
  isHe,
  activePlanKind,
  contingencies,
  mainActivities,
  revisions,
  onPreview,
  onConfirmActivate,
  onRestoreOriginal,
  onUndo,
}: ContingencyPanelProps) {
  const [selectedKind, setSelectedKind] = useState<PlanKind | null>(null)
  const [preview, setPreview] = useState<ImpactPreview | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const kinds = useMemo(() => {
    const unique = new Map<PlanKind, ContingencyPlan>()
    for (const plan of contingencies) unique.set(plan.kind, plan)
    return [...unique.values()]
  }, [contingencies])

  async function handleSelect(kind: PlanKind) {
    setError(null)
    setSelectedKind(kind)
    setBusy(true)
    try {
      setPreview(await onPreview(kind))
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirm() {
    if (!selectedKind) return
    setBusy(true)
    setError(null)
    try {
      await onConfirmActivate(selectedKind)
      setPreview(null)
      setSelectedKind(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="surface-card contingency-panel">
      <h3>{isHe ? 'תוכניות גיבוי' : 'Contingency plans'}</h3>
      <p className="muted small">
        {isHe
          ? `פעילה כעת: ${planKindLabel(activePlanKind, 'he')}. הפעלה דורשת תצוגה מקדימה ואישור.`
          : `Active: ${planKindLabel(activePlanKind, 'en')}. Activation requires preview and confirmation.`}
      </p>

      <div className="contingency-chips" role="list">
        <button
          type="button"
          className={`contingency-chip${activePlanKind === 'main' ? ' active' : ''}`}
          onClick={() => void handleSelect('main')}
          disabled={busy || activePlanKind === 'main'}
        >
          {isHe ? 'ראשית' : 'Main'}
        </button>
        {kinds.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`contingency-chip${activePlanKind === plan.kind ? ' active' : ''}`}
            onClick={() => void handleSelect(plan.kind)}
            disabled={busy}
          >
            {isHe ? plan.titleHe : plan.titleEn}
          </button>
        ))}
      </div>

      {kinds.length === 0 ? (
        <p className="muted">{isHe ? 'אין תוכניות גיבוי ליום זה.' : 'No contingency plans for this day.'}</p>
      ) : null}

      {preview ? (
        <div className="impact-preview" role="region" aria-live="polite">
          <h4>{isHe ? 'תצוגת השפעה' : 'Impact preview'}</h4>
          <p>{isHe ? preview.summaryHe : preview.summaryEn}</p>
          {preview.replacedActivityLabelsEn.length > 0 ? (
            <p className="muted small">
              {isHe ? 'מוחלף: ' : 'Replaced: '}
              {(isHe ? preview.replacedActivityLabelsHe : preview.replacedActivityLabelsEn).join(
                ', ',
              )}
            </p>
          ) : null}
          <p className="muted small">
            {isHe ? 'חלופות: ' : 'Alternatives: '}
            {(isHe ? preview.alternativeLabelsHe : preview.alternativeLabelsEn).join(', ') ||
              (isHe ? 'אין' : 'none')}
          </p>
          <p className="muted small">
            {isHe
              ? 'התוכנית המקורית נשמרת. אפשר לבטל אחרי ההפעלה.'
              : 'The original plan is preserved. You can undo after activating.'}
          </p>
          <div className="settings-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || selectedKind === activePlanKind}
              onClick={() => void handleConfirm()}
            >
              {isHe ? 'אשר הפעלה' : 'Confirm activate'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => {
                setPreview(null)
                setSelectedKind(null)
              }}
            >
              {isHe ? 'ביטול' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}

      <div className="settings-row" style={{ marginTop: '0.75rem' }}>
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void onUndo()}>
          {isHe ? 'בטל שינוי אחרון' : 'Undo last change'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => void onRestoreOriginal()}
        >
          {isHe ? 'שחזר סדר מקורי' : 'Restore original order'}
        </button>
      </div>

      {mainActivities.length > 0 ? (
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          {isHe ? 'פעילויות ראשיות: ' : 'Main activities: '}
          {mainActivities.map((act) => (isHe ? act.nameHe : act.nameEn)).join(' · ')}
        </p>
      ) : null}

      {revisions.length > 0 ? (
        <details className="revision-history">
          <summary>{isHe ? 'היסטוריית שינויים' : 'Revision history'}</summary>
          <ul className="revision-list">
            {revisions.map((rev) => (
              <li key={rev.id}>
                <span className="muted small">{new Date(rev.at).toLocaleString()}</span>
                <div>{isHe ? rev.summaryHe : rev.summaryEn}</div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  )
}
