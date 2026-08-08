import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import {
  destinationTips,
  emergencyNumbers,
  emergencyScenarios,
  insuranceSnapshot,
} from '@/data/emergency-seed'
import { useApp } from '@/providers/AppProvider'

export function EmergencyPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'

  return (
    <section className="page">
      <PageHeader
        titleEn="Emergency"
        titleHe="חירום"
        subtitleEn="Call 112 first if life may be at risk — ahead of any app."
        subtitleHe="אם יש סיכון לחיים — להתקשר ל-112 לפני כל אפליקציה."
      />

      <article className="surface-card emergency-critical">
        <h2>{isHe ? 'מספרים חשובים' : 'Important numbers'}</h2>
        <ul className="emergency-numbers">
          {emergencyNumbers.map((row) => (
            <li key={row.id}>
              <div>
                <strong>{isHe ? row.labelHe : row.labelEn}</strong>
                <p className="muted small">{isHe ? row.noteHe : row.noteEn}</p>
              </div>
              <a className={`btn ${row.critical ? 'btn-primary' : 'btn-secondary'}`} href={`tel:${row.number}`}>
                {row.number}
              </a>
            </li>
          ))}
        </ul>
      </article>

      <article className="surface-card">
        <h2>{isHe ? 'ביטוח' : 'Insurance'}</h2>
        <p>
          {insuranceSnapshot.provider} · {insuranceSnapshot.policyRef}
        </p>
        <p className="muted small">
          {isHe ? insuranceSnapshot.cardHintHe : insuranceSnapshot.cardHintEn}
        </p>
        <p className="muted small">{isHe ? insuranceSnapshot.noteHe : insuranceSnapshot.noteEn}</p>
        <Link to="/wallet" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
          {isHe ? 'לארנק' : 'Open Wallet'}
        </Link>
      </article>

      <article className="surface-card">
        <h2>{isHe ? 'טיפים קצרים' : 'Quick tips'}</h2>
        <ul className="activity-list">
          {destinationTips.map((tip) => (
            <li key={tip.id}>
              <strong>{isHe ? tip.titleHe : tip.titleEn}</strong>
              <div className="muted small">{isHe ? tip.bodyHe : tip.bodyEn}</div>
            </li>
          ))}
        </ul>
      </article>

      {emergencyScenarios.map((scenario) => (
        <article key={scenario.id} className="surface-card">
          <h2 style={{ fontSize: '1.1rem' }}>{isHe ? scenario.titleHe : scenario.titleEn}</h2>
          <ol className="scenario-steps">
            {(isHe ? scenario.stepsHe : scenario.stepsEn).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      ))}

      <p className="muted small">
        {isHe
          ? 'האפליקציה לא מאבחנת מצבים רפואיים ולא שומרת פרופיל רפואי אישי.'
          : 'This app does not diagnose medical conditions and does not store a personal medical profile.'}
      </p>
    </section>
  )
}
