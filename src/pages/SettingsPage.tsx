import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { loadPhotoCredits, type PhotoCredit } from '@/media/images'
import { useApp } from '@/providers/AppProvider'

export function SettingsPage() {
  const navigate = useNavigate()
  const { preferences, logout, setLocale } = useApp()
  const isHe = preferences.locale === 'he'
  const [credits, setCredits] = useState<PhotoCredit[]>([])
  const [showCredits, setShowCredits] = useState(false)

  useEffect(() => {
    void loadPhotoCredits().then(setCredits)
  }, [])

  function handleLogout() {
    logout()
    navigate('/unlock', { replace: true })
  }

  return (
    <section className="page">
      <PageHeader
        titleEn="Settings"
        titleHe="הגדרות"
        subtitleEn="Language, guide, tomorrow check, and sign out."
        subtitleHe="שפה, מדריך, בדיקת מחר ויציאה."
      />
      <div className="card-grid">
        <article className="surface-card">
          <h2>{isHe ? 'שפה' : 'Language'}</h2>
          <div className="settings-row">
            <button type="button" className="btn btn-secondary" onClick={() => setLocale('he')}>
              עברית
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setLocale('en')}>
              English
            </button>
          </div>
        </article>

        <article className="surface-card">
          <h2>{isHe ? 'מדריך' : 'Guide'}</h2>
          <p className="muted small">
            {isHe
              ? 'מרכז פיקוד, ציוד, משפטים וחירום.'
              : 'Command center, packing, phrases, and emergency.'}
          </p>
          <Link to="/guide" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
            {isHe ? 'פתח מדריך' : 'Open Guide'}
          </Link>
        </article>

        <article className="surface-card">
          <h2>{isHe ? 'בדיקת מחר' : 'Tomorrow Check'}</h2>
          <p className="muted small">
            {isHe
              ? 'סקירת מזג אוויר לערב (20:30) — רק כשהאפליקציה פתוחה.'
              : 'Evening weather review (20:30) — only while the app is open.'}
          </p>
          <Link to="/tomorrow" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
            {isHe ? 'פתח בדיקת מחר' : 'Open Tomorrow Check'}
          </Link>
        </article>

        <article className="surface-card">
          <h2>{isHe ? 'קרדיט תמונות' : 'Photo credits'}</h2>
          <p className="muted small">
            {isHe
              ? `${credits.length} תמונות אמיתיות מוויקימדיה קומונס (אופליין באפליקציה).`
              : `${credits.length} real photos from Wikimedia Commons (bundled offline).`}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '0.5rem' }}
            onClick={() => setShowCredits((value) => !value)}
          >
            {showCredits
              ? isHe
                ? 'הסתר רשימה'
                : 'Hide list'
              : isHe
                ? 'הצג קרדיטים'
                : 'Show credits'}
          </button>
          {showCredits ? (
            <ul className="photo-credits-list">
              {credits.map((credit) => (
                <li key={credit.id}>
                  <strong>{credit.place}</strong>
                  <span className="muted small">
                    {credit.artist} · {credit.license}
                  </span>
                  <a href={credit.url} target="_blank" rel="noreferrer">
                    Commons
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="surface-card">
          <h2>{isHe ? 'יציאה' : 'Sign out'}</h2>
          <button type="button" className="btn btn-primary" onClick={handleLogout}>
            {isHe ? 'התנתק' : 'Sign out'}
          </button>
        </article>
      </div>
    </section>
  )
}
