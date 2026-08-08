import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { useApp } from '@/providers/AppProvider'
import { getDocumentIndex } from '@/trip/TripRepository'
import type { DocumentMeta } from '@/validation/tripSchemas'

const CATEGORY_LABELS: Record<string, { en: string; he: string }> = {
  flight: { en: 'Flights', he: 'טיסות' },
  transport: { en: 'Car & transport', he: 'רכב ותחבורה' },
  accommodation: { en: 'Lodging', he: 'לינה' },
  attraction: { en: 'Attractions & tickets', he: 'אטרקציות וכרטיסים' },
  insurance: { en: 'Insurance', he: 'ביטוח' },
  other: { en: 'Other', he: 'שונות' },
}

const CATEGORY_ORDER = ['flight', 'transport', 'accommodation', 'attraction', 'insurance', 'other']

export function WalletPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [codeDoc, setCodeDoc] = useState<DocumentMeta | null>(null)

  useEffect(() => {
    void getDocumentIndex().then(setDocs)
  }, [])

  const groups = useMemo(() => {
    const byCategory = new Map<string, DocumentMeta[]>()
    for (const doc of docs) {
      const list = byCategory.get(doc.category) ?? []
      list.push(doc)
      byCategory.set(doc.category, list)
    }
    const known = CATEGORY_ORDER.filter((cat) => byCategory.has(cat))
    const extra = [...byCategory.keys()].filter((cat) => !CATEGORY_ORDER.includes(cat))
    return [...known, ...extra].map((cat) => ({ category: cat, items: byCategory.get(cat) ?? [] }))
  }, [docs])

  return (
    <section className="page">
      <PageHeader
        titleEn="Wallet"
        titleHe="ארנק"
        subtitleEn="Tickets, reservations, and important codes."
        subtitleHe="כרטיסים, הזמנות וקודים חשובים."
      />

      {groups.map((group) => {
        const label = CATEGORY_LABELS[group.category] ?? { en: group.category, he: group.category }
        return (
          <div key={group.category} className="wallet-group">
            <h2 className="wallet-group-title">{isHe ? label.he : label.en}</h2>
            <div className="card-grid">
              {group.items.map((doc) => (
                <article key={doc.id} className="surface-card wallet-card">
                  <h3>{doc.title}</h3>
                  <p className="muted small">
                    {doc.dayNumber != null ? (isHe ? `יום ${doc.dayNumber}` : `Day ${doc.dayNumber}`) : ''}
                  </p>
                  {doc.bookingRef ? (
                    <>
                      <p className="booking-code-inline">{doc.bookingRef}</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setCodeDoc(doc)}
                      >
                        {isHe ? 'הצג קוד בגדול' : 'Show large code'}
                      </button>
                    </>
                  ) : null}
                  {doc.note ? <p className="wallet-note">{doc.note}</p> : null}
                </article>
              ))}
            </div>
          </div>
        )
      })}

      {codeDoc?.bookingRef ? (
        <div className="qr-overlay" role="dialog" aria-modal="true">
          <div className="qr-card">
            <h2>{codeDoc.title}</h2>
            <p className="qr-code">{codeDoc.bookingRef}</p>
            {codeDoc.note ? <p className="wallet-note">{codeDoc.note}</p> : null}
            <button type="button" className="btn btn-primary" onClick={() => setCodeDoc(null)}>
              {isHe ? 'סגור' : 'Close'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
