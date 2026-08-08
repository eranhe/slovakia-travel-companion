import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import {
  dayBagPlans,
  packingNonNegotiablesEn,
  packingNonNegotiablesHe,
  packingProgress,
  packingSections,
} from '@/data/packing-seed'
import {
  clearPackingChecked,
  loadPackingChecked,
  savePackingChecked,
} from '@/content/packingStore'
import { useApp } from '@/providers/AppProvider'

export function PackingPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const [checked, setChecked] = useState(() => loadPackingChecked())

  const progress = useMemo(() => packingProgress(checked), [checked])

  function toggle(id: string) {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    savePackingChecked(next)
    setChecked(next)
  }

  function reset() {
    setChecked(clearPackingChecked())
  }

  return (
    <section className="page">
      <PageHeader
        titleEn="Packing"
        titleHe="ציוד"
        subtitleEn={`${progress.checked}/${progress.total} packed · four-bag method`}
        subtitleHe={`${progress.checked}/${progress.total} נארזו · שיטת ארבעת התיקים`}
      />

      <article className="surface-card">
        <h2>{isHe ? 'שש נקודות שאין להן תחליף' : 'Six non‑negotiables'}</h2>
        <ul className="activity-list">
          {(isHe ? packingNonNegotiablesHe : packingNonNegotiablesEn).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="settings-row" style={{ marginTop: '0.75rem' }}>
          <Link to="/command" className="btn btn-secondary">
            {isHe ? 'מרכז פיקוד' : 'Command center'}
          </Link>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            {isHe ? 'אפס סימונים' : 'Reset checks'}
          </button>
        </div>
      </article>

      {packingSections.map((section) => {
        const done = section.items.filter((item) => checked.has(item.id)).length
        return (
          <article key={section.id} className="surface-card packing-section">
            <div className="place-card-header">
              <div>
                <h2 style={{ fontSize: '1.1rem' }}>{isHe ? section.titleHe : section.titleEn}</h2>
                <p className="muted small">
                  {isHe ? section.subtitleHe : section.subtitleEn}
                </p>
              </div>
              <span className="status-pill">
                {done}/{section.items.length}
              </span>
            </div>
            <ul className="packing-list">
              {section.items.map((item) => (
                <li key={item.id}>
                  <label className="packing-item">
                    <input
                      type="checkbox"
                      checked={checked.has(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                    <span>
                      <span className="item-label">{isHe ? item.labelHe : item.labelEn}</span>
                      {(isHe ? item.noteHe : item.noteEn) ? (
                        <span className="muted small item-note">
                          {isHe ? item.noteHe : item.noteEn}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </article>
        )
      })}

      <article className="surface-card">
        <h2>{isHe ? 'איזה תיק בכל יום' : 'Which bag each day'}</h2>
        <div className="day-bag-table">
          {dayBagPlans.map((row) => (
            <div key={row.date} className="day-bag-row">
              <strong>{row.date}</strong>
              <span className="muted small">{isHe ? row.activityHe : row.activityEn}</span>
              <span>{isHe ? row.bagHe : row.bagEn}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
