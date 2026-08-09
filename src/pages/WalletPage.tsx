import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { QrCanvas } from '@/components/QrCanvas'
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

function resolveDocUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${pathOrUrl.replace(/^\//, '')}`
}

export function WalletPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [codeDoc, setCodeDoc] = useState<DocumentMeta | null>(null)
  const [qrDoc, setQrDoc] = useState<DocumentMeta | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    void getDocumentIndex().then(setDocs)
  }, [])

  async function copyDocText(doc: DocumentMeta) {
    if (!doc.copyText) return
    try {
      await navigator.clipboard.writeText(doc.copyText)
      setCopiedId(doc.id)
      window.setTimeout(() => setCopiedId((id) => (id === doc.id ? null : id)), 2000)
    } catch {
      // Fallback for older browsers / denied clipboard
      window.prompt(isHe ? 'העתיקו את הטקסט:' : 'Copy this text:', doc.copyText)
    }
  }

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
        subtitleEn="Tickets, reservations, QR codes, and printable docs."
        subtitleHe="כרטיסים, הזמנות, קודי QR ומסמכים להדפסה."
      />

      {groups.map((group) => {
        const label = CATEGORY_LABELS[group.category] ?? { en: group.category, he: group.category }
        return (
          <div key={group.category} className="wallet-group">
            <h2 className="wallet-group-title">{isHe ? label.he : label.en}</h2>
            <div className="card-grid">
              {group.items.map((doc) => {
                const qrValue = doc.qrValue ?? doc.bookingRef
                return (
                  <article key={doc.id} className="surface-card wallet-card">
                    <h3>{doc.title}</h3>
                    <p className="muted small">
                      {doc.dayNumber != null
                        ? isHe
                          ? `יום ${doc.dayNumber}`
                          : `Day ${doc.dayNumber}`
                        : ''}
                    </p>
                    {doc.bookingRef ? (
                      <p className="booking-code-inline">{doc.bookingRef}</p>
                    ) : null}
                    <div className="settings-row" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {doc.bookingRef ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setCodeDoc(doc)}
                        >
                          {isHe ? 'קוד בגדול' : 'Large code'}
                        </button>
                      ) : null}
                      {qrValue ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setQrDoc(doc)}
                        >
                          {isHe ? 'הצג QR' : 'Show QR'}
                        </button>
                      ) : null}
                      {doc.fileUrl ? (
                        <a
                          className="btn btn-ghost"
                          href={resolveDocUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {isHe ? 'מסמך מלא' : 'Full document'}
                        </a>
                      ) : null}
                      {doc.externalUrl ? (
                        <a
                          className="btn btn-ghost"
                          href={doc.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {isHe ? 'אתר הזמנה' : 'Booking site'}
                        </a>
                      ) : null}
                      {doc.copyText ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => void copyDocText(doc)}
                        >
                          {copiedId === doc.id
                            ? isHe
                              ? 'הועתק ✓'
                              : 'Copied ✓'
                            : isHe
                              ? 'העתק מייל'
                              : 'Copy email'}
                        </button>
                      ) : null}
                    </div>
                    {doc.note ? <p className="wallet-note">{doc.note}</p> : null}
                  </article>
                )
              })}
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

      {qrDoc ? (
        <div className="qr-overlay" role="dialog" aria-modal="true">
          <div className="qr-card">
            <h2>{qrDoc.title}</h2>
            <QrCanvas
              value={qrDoc.qrValue ?? qrDoc.bookingRef ?? qrDoc.title}
              label={qrDoc.qrValue ?? qrDoc.bookingRef}
            />
            {qrDoc.note ? <p className="wallet-note">{qrDoc.note}</p> : null}
            <button type="button" className="btn btn-primary" onClick={() => setQrDoc(null)}>
              {isHe ? 'סגור' : 'Close'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
