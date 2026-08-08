import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { importPhotoFile } from '@/journal/importPhoto'
import {
  getJournalByDate,
  getRecapByDate,
  upsertJournalEntry,
  upsertRecap,
} from '@/journal/journalStore'
import { createNightlyRecap, sanitizeRecapForShare } from '@/journal/recapGenerator'
import { markRecapDone } from '@/journal/recapCueStore'
import { deletePhoto, getPhoto, listPhotoMeta } from '@/journal/photoStore'
import {
  RECAP_STYLES,
  type JournalEntry,
  type NightlyRecap,
  type PhotoMeta,
  type RecapStyle,
} from '@/journal/types'
import { loadCheckIns, loadCompletedActivityIds } from '@/maps/visitStore'
import { getActivities, getTripDays, getTripProfile } from '@/trip/TripRepository'
import { todayIsoInTimezone } from '@/trip/tripDays'
import { useApp } from '@/providers/AppProvider'
import type { ActivityStub, DayRecord } from '@/validation/tripSchemas'

interface ThumbState {
  id: string
  url: string
}

export function JournalPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const fileRef = useRef<HTMLInputElement | null>(null)
  const cameraRef = useRef<HTMLInputElement | null>(null)

  const [days, setDays] = useState<DayRecord[]>([])
  const [activities, setActivities] = useState<ActivityStub[]>([])
  const [date, setDate] = useState<string>('')
  const [photos, setPhotos] = useState<PhotoMeta[]>([])
  const [thumbs, setThumbs] = useState<ThumbState[]>([])
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [recap, setRecap] = useState<NightlyRecap | null>(null)
  const [style, setStyle] = useState<RecapStyle>('family-update')
  const [attachLocation, setAttachLocation] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ id: string; url: string } | null>(null)

  const day = useMemo(() => days.find((item) => item.date === date) ?? null, [days, date])

  const refreshPhotos = useCallback(async () => {
    const meta = await listPhotoMeta()
    setPhotos(meta)
    const nextThumbs: ThumbState[] = []
    for (const item of meta.slice(0, 40)) {
      const full = await getPhoto(item.id)
      if (!full) continue
      nextThumbs.push({ id: item.id, url: URL.createObjectURL(full.thumb) })
    }
    setThumbs((prev) => {
      for (const old of prev) URL.revokeObjectURL(old.url)
      return nextThumbs
    })
  }, [])

  useEffect(() => {
    void (async () => {
      const profile = await getTripProfile()
      const loadedDays = await getTripDays()
      setDays(loadedDays)
      setActivities(await getActivities())
      const today = todayIsoInTimezone(profile.timezone)
      setDate(loadedDays.find((d) => d.date === today)?.date ?? loadedDays[0]?.date ?? today)
      await refreshPhotos()
    })()
    return () => {
      setThumbs((prev) => {
        for (const old of prev) URL.revokeObjectURL(old.url)
        return []
      })
    }
  }, [refreshPhotos])

  useEffect(() => {
    if (!date) return
    const existing = getJournalByDate(date)
    setEntry(
      existing ?? {
        id: `journal-${date}`,
        date,
        dayNumber: day?.dayNumber,
        status: 'draft',
        notes: '',
        photoIds: [],
        updatedAt: new Date().toISOString(),
      },
    )
    setRecap(getRecapByDate(date))
  }, [date, day?.dayNumber])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url)
    }
  }, [preview])

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    setBusy(true)
    setMessage(null)
    try {
      let coords: { lat: number; lng: number } | undefined
      if (attachLocation && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 12_000,
            maximumAge: 0,
          })
        })
        coords = { lat: position.coords.latitude, lng: position.coords.longitude }
      }

      let imported = 0
      let duplicates = 0
      for (const file of Array.from(fileList)) {
        const result = await importPhotoFile(file, {
          dayNumber: day?.dayNumber,
          includeLocation: attachLocation,
          coordinates: coords,
        })
        if (result.duplicate) duplicates += 1
        else imported += 1
      }
      await refreshPhotos()
      setMessage(
        isHe
          ? `נוספו ${imported} תמונות${duplicates ? ` · ${duplicates} כפולות דולגו` : ''}`
          : `Added ${imported} photo(s)${duplicates ? ` · skipped ${duplicates} duplicate(s)` : ''}`,
      )
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
      if (cameraRef.current) cameraRef.current.value = ''
    }
  }

  function saveEntry(patch: Partial<JournalEntry>) {
    if (!entry) return
    const next: JournalEntry = {
      ...entry,
      ...patch,
      dayNumber: day?.dayNumber,
      updatedAt: new Date().toISOString(),
    }
    upsertJournalEntry(next)
    setEntry(next)
  }

  function generateRecap() {
    if (!entry) return
    const completedIds = loadCompletedActivityIds()
    const checkIns = loadCheckIns()
    const dayActs = activities.filter((act) => act.dayNumber === day?.dayNumber)
    const draft = createNightlyRecap(
      {
        date,
        day,
        activities: dayActs,
        completedIds,
        checkIns,
        photos,
        notes: entry.notes,
        favoriteMoment: entry.favoriteMoment,
        favoriteFood: entry.favoriteFood,
        funnyMoment: entry.funnyMoment,
        challenge: entry.challenge,
        mood: entry.mood,
        rating: entry.rating,
        style,
        locale: isHe ? 'he' : 'en',
        tomorrowStatus: isHe
          ? 'לעבור לבדיקת מחר אחרי האישור'
          : 'Open Tomorrow Check after approving',
      },
      recap,
    )
    upsertRecap(draft)
    setRecap(draft)
    setMessage(isHe ? 'נוצרה טיוטת סיכום מקומית (בלי AI).' : 'Local recap draft generated (no AI).')
  }

  function approveRecap() {
    if (!recap) return
    const next = {
      ...recap,
      status: 'completed' as const,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    upsertRecap(next)
    setRecap(next)
    markRecapDone(date)
    saveEntry({ status: 'completed' })
    setMessage(isHe ? 'הסיכום אושר ונשמר במכשיר.' : 'Recap approved and saved on device.')
  }

  async function shareRecap() {
    if (!recap) return
    const text = sanitizeRecapForShare(recap.body)
    if (navigator.share) {
      await navigator.share({ title: recap.fields.title, text })
      const next = { ...recap, status: 'shared' as const, updatedAt: new Date().toISOString() }
      upsertRecap(next)
      setRecap(next)
      return
    }
    await navigator.clipboard.writeText(text)
    const next = { ...recap, status: 'exported' as const, updatedAt: new Date().toISOString() }
    upsertRecap(next)
    setRecap(next)
    setMessage(isHe ? 'הועתק ללוח (אין Share API).' : 'Copied to clipboard (no Share API).')
  }

  async function openPhoto(id: string) {
    const photo = await getPhoto(id)
    if (!photo) return
    if (preview) URL.revokeObjectURL(preview.url)
    setPreview({ id, url: URL.createObjectURL(photo.blob) })
  }

  async function removePreviewPhoto() {
    if (!preview) return
    await deletePhoto(preview.id)
    URL.revokeObjectURL(preview.url)
    setPreview(null)
    await refreshPhotos()
  }

  const dayPhotos = photos.filter((p) => !p.dayNumber || p.dayNumber === day?.dayNumber)

  return (
    <section className="page">
      <PageHeader
        titleEn="Journal & photos"
        titleHe="יומן ותמונות"
        subtitleEn="Local only · no AI API · no background photo scanning"
        subtitleHe="מקומי בלבד · בלי API של AI · בלי סריקת גלריה ברקע"
      />

      <article className="surface-card">
        <p className="muted small">
          {isHe
            ? 'תמונות נשמרות ב-IndexedDB במכשיר (ללא הצפנה בגרסה המפושטת). לא נסרקת הגלריה אוטומטית. מיקום מצורף רק אם מאשרים במפורש.'
            : 'Photos stay in on-device IndexedDB (unencrypted in this simplified build). The gallery is never scanned automatically. Location is attached only with explicit approval.'}
        </p>
        <label className="muted small" style={{ display: 'block', marginTop: '0.65rem' }}>
          {isHe ? 'יום' : 'Day'}
          <select
            className="journal-select"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          >
            {days.map((item) => (
              <option key={item.date} value={item.date}>
                {item.dayNumber}. {isHe ? item.titleHe : item.titleEn}
              </option>
            ))}
          </select>
        </label>
      </article>

      <article className="surface-card">
        <h2>{isHe ? 'תמונות' : 'Photos'}</h2>
        <label className="map-check" style={{ marginTop: '0.35rem' }}>
          <input
            type="checkbox"
            checked={attachLocation}
            onChange={(e) => setAttachLocation(e.target.checked)}
          />
          {isHe
            ? 'לצרף מיקום נוכחי לתמונות החדשות (רק אם מסומן)'
            : 'Attach current location to new photos (only if checked)'}
        </label>
        <div className="settings-row" style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {isHe ? 'בחירת תמונות' : 'Choose photos'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
          >
            {isHe ? 'מצלמה' : 'Camera'}
          </button>
          <Link to="/maps" className="btn btn-ghost">
            {isHe ? 'מפות' : 'Maps'}
          </Link>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />

        <div className="photo-grid">
          {dayPhotos.map((photo) => {
            const thumb = thumbs.find((t) => t.id === photo.id)
            return (
              <button
                key={photo.id}
                type="button"
                className="photo-tile"
                onClick={() => void openPhoto(photo.id)}
              >
                {thumb ? <img src={thumb.url} alt={photo.caption || photo.filename} /> : null}
                <span className="muted small">{photo.caption || photo.filename}</span>
              </button>
            )
          })}
        </div>
        {dayPhotos.length === 0 ? (
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            {isHe ? 'אין תמונות ליום זה עדיין.' : 'No photos for this day yet.'}
          </p>
        ) : null}
      </article>

      {entry ? (
        <article className="surface-card">
          <h2>{isHe ? 'רשימות ליום' : 'Day notes'}</h2>
          <label className="journal-field">
            {isHe ? 'הערות' : 'Notes'}
            <textarea
              value={entry.notes}
              onChange={(e) => saveEntry({ notes: e.target.value })}
              rows={3}
            />
          </label>
          <label className="journal-field">
            {isHe ? 'רגע אהוב' : 'Favorite moment'}
            <input
              value={entry.favoriteMoment ?? ''}
              onChange={(e) => saveEntry({ favoriteMoment: e.target.value })}
            />
          </label>
          <label className="journal-field">
            {isHe ? 'אוכל אהוב' : 'Favorite food'}
            <input
              value={entry.favoriteFood ?? ''}
              onChange={(e) => saveEntry({ favoriteFood: e.target.value })}
            />
          </label>
          <label className="journal-field">
            {isHe ? 'מצחיק' : 'Funny moment'}
            <input
              value={entry.funnyMoment ?? ''}
              onChange={(e) => saveEntry({ funnyMoment: e.target.value })}
            />
          </label>
          <label className="journal-field">
            {isHe ? 'אתגר' : 'Challenge'}
            <input
              value={entry.challenge ?? ''}
              onChange={(e) => saveEntry({ challenge: e.target.value })}
            />
          </label>
          <div className="settings-row">
            <label className="journal-field" style={{ flex: 1 }}>
              {isHe ? 'מצב רוח' : 'Mood'}
              <input value={entry.mood ?? ''} onChange={(e) => saveEntry({ mood: e.target.value })} />
            </label>
            <label className="journal-field">
              {isHe ? 'דירוג' : 'Rating'}
              <select
                value={entry.rating ?? ''}
                onChange={(e) =>
                  saveEntry({ rating: e.target.value ? Number(e.target.value) : undefined })
                }
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>
      ) : null}

      <article className="surface-card">
        <h2>{isHe ? 'סיכום ערב מקומי' : 'Local nightly recap'}</h2>
        <p className="muted small">
          {isHe
            ? 'תבניות דטרמיניסטיות בלבד — בלי מפתח AI. עריכות ידניות נשמרות אם נועלים את הטקסט.'
            : 'Deterministic templates only — no AI key. Manual edits survive if you lock the text.'}
        </p>
        <label className="journal-field">
          {isHe ? 'סגנון' : 'Style'}
          <select value={style} onChange={(e) => setStyle(e.target.value as RecapStyle)}>
            {RECAP_STYLES.map((item) => (
              <option key={item.id} value={item.id}>
                {isHe ? item.labelHe : item.labelEn}
              </option>
            ))}
          </select>
        </label>
        <div className="settings-row">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={generateRecap}>
            {isHe ? 'צור / רענן טיוטה' : 'Generate / refresh draft'}
          </button>
          <Link to="/tomorrow" className="btn btn-secondary">
            {isHe ? 'בדיקת מחר' : 'Tomorrow Check'}
          </Link>
        </div>

        {recap ? (
          <>
            <label className="map-check" style={{ marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                checked={recap.bodyLocked}
                onChange={(e) => {
                  const next = {
                    ...recap,
                    bodyLocked: e.target.checked,
                    updatedAt: new Date().toISOString(),
                  }
                  upsertRecap(next)
                  setRecap(next)
                }}
              />
              {isHe
                ? 'נעל טקסט (עריכות ידניות ישורדו ברענון)'
                : 'Lock text (keep manual edits on refresh)'}
            </label>
            <textarea
              className="recap-body"
              rows={10}
              value={recap.body}
              onChange={(e) => {
                const next = {
                  ...recap,
                  body: e.target.value,
                  bodyLocked: true,
                  updatedAt: new Date().toISOString(),
                }
                upsertRecap(next)
                setRecap(next)
              }}
            />
            <p className="muted small">
              {isHe ? 'סטטוס: ' : 'Status: '}
              {recap.status}
              {recap.fields.estimatedLabel ? ` · ${recap.fields.estimatedLabel}` : ''}
            </p>
            <div className="settings-row">
              <button type="button" className="btn btn-primary" onClick={approveRecap}>
                {isHe ? 'אשר סיכום' : 'Approve recap'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => void shareRecap()}>
                {isHe ? 'שתף / העתק' : 'Share / copy'}
              </button>
            </div>
          </>
        ) : null}
      </article>

      {message ? (
        <p className="muted small" role="status">
          {message}
        </p>
      ) : null}

      {preview ? (
        <div className="qr-overlay" role="dialog" aria-modal="true">
          <div className="qr-card doc-preview">
            <img src={preview.url} alt="" className="doc-image" />
            <div className="settings-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  URL.revokeObjectURL(preview.url)
                  setPreview(null)
                }}
              >
                {isHe ? 'סגור' : 'Close'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void removePreviewPhoto()}>
                {isHe ? 'מחק תמונה' : 'Delete photo'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
