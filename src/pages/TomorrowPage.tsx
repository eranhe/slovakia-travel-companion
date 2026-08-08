import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useApp } from '@/providers/AppProvider'
import {
  activatePlan,
  previewPlanActivation,
} from '@/itinerary/ItineraryRepository'
import type { ImpactPreview, PlanKind } from '@/types/itinerary'
import { ALL_TRIP_DATES } from '@/trip/tripDays'
import { getTripProfile } from '@/trip/TripRepository'
import { statusLabel, type WeatherSuggestion } from '@/weather/assessment'
import {
  buildEveningCheckIcs,
  downloadEveningCheckIcs,
} from '@/weather/calendarReminder'
import { runTomorrowCheck, type TomorrowCheckResult } from '@/weather/tomorrowCheck'
import {
  getLastTomorrowCheck,
  setTomorrowCheckResult,
  subscribeTomorrowCheck,
} from '@/weather/tomorrowCheckStore'

function statusClass(status: string): string {
  if (status === 'aligned') return 'wx-status wx-ok'
  if (status === 'preparation') return 'wx-status wx-prep'
  if (status === 'caution') return 'wx-status wx-caution'
  if (status === 'unsuitable') return 'wx-status wx-bad'
  return 'wx-status wx-unable'
}

export function TomorrowPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const last = useSyncExternalStore(subscribeTomorrowCheck, getLastTomorrowCheck, getLastTomorrowCheck)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TomorrowCheckResult | null>(last)
  const [preview, setPreview] = useState<ImpactPreview | null>(null)
  const [pendingKind, setPendingKind] = useState<Exclude<PlanKind, 'main'> | null>(null)

  useEffect(() => {
    setResult(last)
  }, [last])

  async function runCheck(trigger: 'manual' | 'morning' = 'manual') {
    setBusy(true)
    setError(null)
    setPreview(null)
    setPendingKind(null)
    try {
      const next = await runTomorrowCheck(trigger)
      setTomorrowCheckResult(next)
      setResult(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleSuggestion(suggestion: WeatherSuggestion) {
    if (suggestion.kind !== 'activate-contingency' || !suggestion.contingencyKind) return
    if (!result?.dayNumber) {
      setError(isHe ? 'אין יום מסלול להפעלת תוכנית.' : 'No itinerary day for plan activation.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const impact = await previewPlanActivation(result.dayNumber, suggestion.contingencyKind)
      setPreview(impact)
      setPendingKind(suggestion.contingencyKind)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function confirmActivation() {
    if (!result?.dayNumber || !pendingKind) return
    setBusy(true)
    try {
      await activatePlan(result.dayNumber, pendingKind)
      setPreview(null)
      setPendingKind(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function exportIcs() {
    const profile = await getTripProfile()
    const ics = buildEveningCheckIcs({
      // Every evening that still has a following trip day to review.
      reviewDates: ALL_TRIP_DATES.slice(0, -1),
      timeZone: profile.timezone,
    })
    downloadEveningCheckIcs(ics)
  }

  return (
    <section className="page">
      <PageHeader
        titleEn="Tomorrow Check"
        titleHe="בדיקת מחר"
        subtitleEn="Evening weather review for tomorrow’s plan"
        subtitleHe="סקירת מזג אוויר ערבית לתוכנית של מחר"
      />

      <article className="surface-card">
        <p className="muted small">
          {isHe
            ? 'ברירת מחדל 20:30 לפי שעון הטיול. הבדיקה רצה רק כשהאפליקציה פתוחה — אין מתזמן ברקע.'
            : 'Default 20:30 in trip timezone. Checks run only while the app is open — no background scheduler.'}
        </p>
        <div className="settings-row" style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => void runCheck('manual')}
          >
            {isHe ? 'בדוק מחר' : 'Check Tomorrow'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => void runCheck('morning')}
          >
            {isHe ? 'בדיקת בוקר' : 'Morning recheck'}
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void exportIcs()}>
            {isHe ? 'ייצוא תזכורת .ics' : 'Export .ics reminder'}
          </button>
          <Link to="/trip" className="btn btn-ghost">
            {isHe ? 'למסלול' : 'Trip'}
          </Link>
        </div>
      </article>

      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <article className="surface-card">
          <div className="place-card-header">
            <div>
              <h2>{isHe ? result.dayTitleHe : result.dayTitleEn}</h2>
              <p className="muted">
                {result.targetDate}
                {result.dayNumber ? ` · ${isHe ? 'יום' : 'Day'} ${result.dayNumber}` : null}
              </p>
            </div>
            <span className={statusClass(result.dayStatus)}>
              {statusLabel(result.dayStatus, isHe ? 'he' : 'en')}
            </span>
          </div>

          {result.skipped ? (
            <p className="muted" style={{ marginTop: '0.75rem' }}>
              {isHe ? result.skipReasonHe : result.skipReasonEn}
            </p>
          ) : (
            <>
              <ul className="wx-activity-list">
                {result.activities.map((item) => (
                  <li key={item.activityId} className="wx-activity-row">
                    <div>
                      <strong>{isHe ? item.nameHe : item.nameEn}</strong>
                      <p className="muted small">{isHe ? item.reasonHe : item.reasonEn}</p>
                      {item.rainProbability !== null ? (
                        <p className="muted small">
                          {isHe ? 'גשם' : 'Rain'} {item.rainProbability}%
                          {item.tempMaxC !== null
                            ? ` · ${item.tempMinC ?? '—'}–${item.tempMaxC}°C`
                            : ''}
                        </p>
                      ) : null}
                    </div>
                    <span className={statusClass(item.status)}>
                      {statusLabel(item.status, isHe ? 'he' : 'en')}
                    </span>
                  </li>
                ))}
              </ul>

              {result.suggestions.length > 0 ? (
                <div className="wx-suggestions">
                  <h3>{isHe ? 'הצעות' : 'Suggestions'}</h3>
                  <p className="muted small">
                    {isHe
                      ? 'האפליקציה לא משנה את המסלול אוטומטית. הפעלת תוכנית גיבוי דורשת תצוגה מקדימה ואישור.'
                      : 'The app never auto-changes the itinerary. Contingency activation needs preview and confirm.'}
                  </p>
                  <ul className="suggestion-list">
                    {result.suggestions.map((suggestion) => (
                      <li key={suggestion.id}>
                        <div>
                          <strong>{isHe ? suggestion.titleHe : suggestion.titleEn}</strong>
                          <p className="muted small">
                            {isHe ? suggestion.reasonHe : suggestion.reasonEn}
                          </p>
                        </div>
                        {suggestion.kind === 'activate-contingency' ? (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={busy}
                            onClick={() => void handleSuggestion(suggestion)}
                          >
                            {isHe ? 'תצוגה מקדימה' : 'Preview'}
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}

          <p className="muted small" style={{ marginTop: '0.75rem' }}>
            {isHe ? result.noteHe : result.noteEn}
          </p>
          <p className="muted small">
            {isHe ? 'נבדק: ' : 'Checked: '}
            {new Date(result.checkedAt).toLocaleString()} · {result.trigger}
            {result.weatherFetched ? '' : isHe ? ' · חלק מהתחזיות חסרות' : ' · some forecasts missing'}
          </p>
        </article>
      ) : (
        <article className="surface-card">
          <p className="muted">
            {isHe
              ? 'עדיין לא בוצעה בדיקה בסשן הזה. לחצו על «בדוק מחר».'
              : 'No check yet this session. Tap Check Tomorrow.'}
          </p>
        </article>
      )}

      {preview ? (
        <article className="surface-card impact-preview" role="region" aria-live="polite">
          <h3>{isHe ? 'תצוגת השפעה' : 'Impact preview'}</h3>
          <p>{isHe ? preview.summaryHe : preview.summaryEn}</p>
          <p className="muted small">
            {isHe
              ? 'התוכנית המקורית נשמרת. אפשר לבטל אחר כך במסלול.'
              : 'The original plan is preserved. You can undo later on Trip.'}
          </p>
          <div className="settings-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => void confirmActivation()}
            >
              {isHe ? 'אשר הפעלה' : 'Confirm activate'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => {
                setPreview(null)
                setPendingKind(null)
              }}
            >
              {isHe ? 'ביטול' : 'Cancel'}
            </button>
          </div>
        </article>
      ) : null}
    </section>
  )
}
