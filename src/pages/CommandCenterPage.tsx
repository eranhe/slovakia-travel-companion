import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import {
  buildCommandCenter,
  readinessLabel,
  type CommandCenterSnapshot,
  type ReadinessStatus,
} from '@/content/commandCenter'
import { useApp } from '@/providers/AppProvider'

function statusClass(status: ReadinessStatus): string {
  if (status === 'ready') return 'wx-status wx-ok'
  if (status === 'attention') return 'wx-status wx-caution'
  if (status === 'missing') return 'wx-status wx-bad'
  if (status === 'optional') return 'wx-status wx-prep'
  return 'wx-status wx-unable'
}

export function CommandCenterPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const [snap, setSnap] = useState<CommandCenterSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void buildCommandCenter()
      .then(setSnap)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [])

  return (
    <section className="page">
      <PageHeader
        titleEn="Command center"
        titleHe="מרכז פיקוד"
        subtitleEn="Trip readiness at a glance"
        subtitleHe="מוכנות הטיול במבט אחד"
      />

      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}

      {!snap ? (
        <article className="surface-card">
          <p className="muted">{isHe ? 'טוען…' : 'Loading…'}</p>
        </article>
      ) : (
        <>
          <article className="surface-card">
            <h2>{snap.tripName}</h2>
            <p className="muted">
              {isHe ? 'היום ' : 'Today '}
              {snap.todayIso}
              {snap.daysUntilStart !== null
                ? isHe
                  ? ` · ${snap.daysUntilStart} ימים לתחילת המסלול`
                  : ` · ${snap.daysUntilStart} days to itinerary start`
                : null}
            </p>
            <p className="muted small">{snap.travelers.join(' · ')}</p>
            <p style={{ marginTop: '0.65rem' }}>
              {isHe ? 'אריזה: ' : 'Packing: '}
              <strong>
                {snap.packingChecked}/{snap.packingTotal} ({snap.packingPercent}%)
              </strong>
            </p>
            <div className="settings-row" style={{ marginTop: '0.75rem' }}>
              <Link to="/packing" className="btn btn-primary">
                {isHe ? 'לרשימת ציוד' : 'Packing list'}
              </Link>
              <Link to="/tomorrow" className="btn btn-secondary">
                {isHe ? 'בדיקת מחר' : 'Tomorrow Check'}
              </Link>
              <Link to="/guide" className="btn btn-ghost">
                {isHe ? 'מדריך' : 'Guide'}
              </Link>
            </div>
          </article>

          <div className="card-grid">
            {snap.items.map((item) => (
              <article key={item.id} className="surface-card">
                <div className="place-card-header">
                  <h2 style={{ fontSize: '1.05rem' }}>{isHe ? item.titleHe : item.titleEn}</h2>
                  <span className={statusClass(item.status)}>
                    {readinessLabel(item.status, isHe ? 'he' : 'en')}
                  </span>
                </div>
                <p className="muted small">{isHe ? item.detailHe : item.detailEn}</p>
              </article>
            ))}
          </div>

          <article className="surface-card">
            <h2>{isHe ? 'משימות מוצעות' : 'Suggested tasks'}</h2>
            <ul className="activity-list">
              {snap.tasks.map((task) => (
                <li key={task.id}>{isHe ? task.titleHe : task.titleEn}</li>
              ))}
            </ul>
          </article>
        </>
      )}
    </section>
  )
}
