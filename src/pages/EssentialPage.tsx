import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { emergencyNumbers } from '@/data/emergency-seed'
import { openWazeForPlaceId } from '@/navigation/openPlaceWaze'
import { useApp } from '@/providers/AppProvider'
import { getDocumentIndex, getTripDays, getTripProfile } from '@/trip/TripRepository'
import { todayIsoInTimezone } from '@/trip/tripDays'
import type { DayRecord, DocumentMeta } from '@/validation/tripSchemas'

interface EssentialSnapshot {
  day: DayRecord | null
  lodging: DocumentMeta | null
  car: DocumentMeta | null
  insurance: DocumentMeta | null
}

export function EssentialPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const [snapshot, setSnapshot] = useState<EssentialSnapshot | null>(null)

  useEffect(() => {
    void (async () => {
      const [profile, days, docs] = await Promise.all([
        getTripProfile(),
        getTripDays(),
        getDocumentIndex(),
      ])
      const today = todayIsoInTimezone(profile.timezone)
      const day = days.find((item) => item.date === today) ?? days[0] ?? null
      const lodgingDocs = docs
        .filter(
          (doc) =>
            doc.category === 'accommodation' &&
            doc.dayNumber != null &&
            day != null &&
            doc.dayNumber <= day.dayNumber,
        )
        .sort((a, b) => (b.dayNumber ?? -1) - (a.dayNumber ?? -1))
      setSnapshot({
        day,
        lodging: lodgingDocs[0] ?? null,
        car: docs.find((doc) => doc.id === 'doc-car-rental') ?? null,
        insurance: docs.find((doc) => doc.id === 'doc-insurance') ?? null,
      })
    })()
  }, [])

  const emergency = emergencyNumbers.find((item) => item.id === 'eu-112')

  return (
    <section className="page">
      <PageHeader
        titleEn="Essential now"
        titleHe="חיוני עכשיו"
        subtitleEn="Lodging, emergency, car, and insurance — one short screen."
        subtitleHe="לינה, חירום, רכב וביטוח — במסך קצר אחד."
      />

      <article className="surface-card emergency-critical essential-emergency">
        <div>
          <h2>{isHe ? 'סכנת חיים' : 'Life emergency'}</h2>
          <p className="muted small">
            {isHe ? emergency?.noteHe : emergency?.noteEn}
          </p>
        </div>
        <a className="btn btn-primary" href="tel:112">
          {isHe ? 'התקשר 112' : 'Call 112'}
        </a>
      </article>

      {snapshot?.lodging ? (
        <article className="surface-card">
          <h2>{isHe ? 'הלינה הפעילה' : 'Current lodging'}</h2>
          <strong>
            {isHe
              ? (snapshot.lodging.titleHe ?? snapshot.lodging.title)
              : snapshot.lodging.title}
          </strong>
          <p>{isHe ? snapshot.lodging.noteHe : snapshot.lodging.note}</p>
          <div className="settings-row">
            {snapshot.day?.lodgingPlaceId ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void openWazeForPlaceId(snapshot.day!.lodgingPlaceId!)}
              >
                {isHe ? 'Waze ללינה' : 'Waze to lodging'}
              </button>
            ) : null}
            <Link className="btn btn-secondary" to="/wallet">
              {isHe ? 'מסמך הלינה' : 'Lodging document'}
            </Link>
            <Link className="btn btn-ghost" to="/places">
              {isHe ? 'שירותים ליד הלינה' : 'Nearby services'}
            </Link>
          </div>
        </article>
      ) : null}

      <div className="card-grid">
        {snapshot?.car ? (
          <article className="surface-card">
            <h2>{isHe ? 'רכב' : 'Car'}</h2>
            <p className="muted small">
              {isHe ? snapshot.car.noteHe : snapshot.car.note}
            </p>
            <Link className="btn btn-secondary" to="/wallet">
              {isHe ? 'פתח שובר רכב' : 'Open car voucher'}
            </Link>
          </article>
        ) : null}
        {snapshot?.insurance ? (
          <article className="surface-card">
            <h2>{isHe ? 'ביטוח' : 'Insurance'}</h2>
            <p className="muted small">
              {isHe ? snapshot.insurance.noteHe : snapshot.insurance.note}
            </p>
            <Link className="btn btn-secondary" to="/wallet">
              {isHe ? 'פתח פוליסה' : 'Open policy'}
            </Link>
          </article>
        ) : null}
      </div>
    </section>
  )
}
