import { Link } from 'react-router-dom'
import { Thumb } from '@/components/Illustration'
import { PageHeader } from '@/components/PageHeader'
import { useApp } from '@/providers/AppProvider'

const links = [
  {
    to: '/places',
    imageId: 'place-resort',
    titleEn: 'Places',
    titleHe: 'מקומות',
    bodyEn: 'Place cards with Waze, forecasts, and the services near each lodging.',
    bodyHe: 'כרטיסי מקום עם Waze, תחזיות ושירותים ליד כל לינה.',
  },
  {
    to: '/journal',
    imageId: 'place-liptovska-mara',
    titleEn: 'Journal & photos',
    titleHe: 'יומן ותמונות',
    bodyEn: 'Local photos, day notes, and nightly recap templates.',
    bodyHe: 'תמונות מקומיות, הערות יום וסיכום ערב בתבניות.',
  },
  {
    to: '/maps',
    imageId: 'place-drive',
    titleEn: 'Maps',
    titleHe: 'מפות',
    bodyEn: 'Planned vs visited layers, check-ins, estimated day routes.',
    bodyHe: 'שכבות מתוכנן/בוקר, צ׳ק־אין ומסלולי יום משוערים.',
  },
  {
    to: '/command',
    imageId: 'place-skalnate-pleso',
    titleEn: 'Command center',
    titleHe: 'מרכז פיקוד',
    bodyEn: 'Trip readiness, packing progress, rain-plan coverage.',
    bodyHe: 'מוכנות לטיול, התקדמות אריזה, כיסוי תוכניות גשם.',
  },
  {
    to: '/packing',
    imageId: 'place-zdiar',
    titleEn: 'Packing',
    titleHe: 'ציוד',
    bodyEn: 'Four-bag checklist for the family trip.',
    bodyHe: 'רשימת ארבעת התיקים למשפחת הטיול.',
  },
  {
    to: '/phrases',
    imageId: 'place-red-monastery',
    titleEn: 'Phrasebook',
    titleHe: 'משפטים',
    bodyEn: 'Short Slovak and Polish phrases.',
    bodyHe: 'משפטים קצרים בסלובקית ופולנית.',
  },
  {
    to: '/emergency',
    imageId: 'place-chopok',
    titleEn: 'Emergency',
    titleHe: 'חירום',
    bodyEn: '112, mountain rescue, insurance pointers, scenarios.',
    bodyHe: '112, חילוץ הררי, ביטוח ותרחישים.',
  },
] as const

export function GuidePage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'

  return (
    <section className="page">
      <PageHeader
        titleEn="Guide"
        titleHe="מדריך"
        subtitleEn="Places, journal, maps, packing, phrases, and emergency."
        subtitleHe="מקומות, יומן, מפות, ציוד, משפטים וחירום."
      />
      <div className="card-grid">
        {links.map((link) => (
          <article key={link.to} className="surface-card">
            <div className="place-card-header">
              <Thumb imageId={link.imageId} alt="" />
              <div>
                <h2>{isHe ? link.titleHe : link.titleEn}</h2>
                <p className="muted">{isHe ? link.bodyHe : link.bodyEn}</p>
              </div>
            </div>
            <Link to={link.to} className="btn btn-secondary" style={{ marginTop: '0.65rem' }}>
              {isHe ? 'פתח' : 'Open'}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
