import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { phrasebook, phraseCategories } from '@/data/phrasebook-seed'
import { canSpeak, speakPhrase, warmSpeechVoices } from '@/content/speakPhrase'
import { useApp } from '@/providers/AppProvider'

export function PhrasebookPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const [category, setCategory] = useState<(typeof phraseCategories)[number]['id'] | 'all'>('all')
  const [speechOk, setSpeechOk] = useState(false)

  useEffect(() => {
    warmSpeechVoices()
    setSpeechOk(canSpeak())
  }, [])

  const rows = useMemo(
    () => (category === 'all' ? phrasebook : phrasebook.filter((row) => row.category === category)),
    [category],
  )

  return (
    <section className="page">
      <PageHeader
        titleEn="Phrasebook"
        titleHe="משפטים"
        subtitleEn="Short Slovak / Polish lines — tap ▶ to hear pronunciation"
        subtitleHe="משפטים קצרים בסלובקית / פולנית — לחצו ▶ לשמיעת ההגייה"
      />

      {speechOk ? (
        <p className="muted small">
          {isHe
            ? 'ההגייה משתמשת בקולות המכשיר (Web Speech). אם אין קול סלובקי/פולני מותקן — יישמע קול ברירת מחדל.'
            : 'Pronunciation uses on-device voices (Web Speech). If no SK/PL voice is installed, the default voice is used.'}
        </p>
      ) : (
        <p className="muted small">
          {isHe ? 'מכשיר זה לא תומך בהשמעת דיבור.' : 'This device does not support speech playback.'}
        </p>
      )}

      <div className="contingency-chips" role="list">
        <button
          type="button"
          className={`contingency-chip${category === 'all' ? ' active' : ''}`}
          onClick={() => setCategory('all')}
        >
          {isHe ? 'הכל' : 'All'}
        </button>
        {phraseCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`contingency-chip${category === cat.id ? ' active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {isHe ? cat.labelHe : cat.labelEn}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {rows.map((row) => (
          <article key={row.id} className="surface-card phrase-card">
            <h2 style={{ fontSize: '1.05rem' }}>{isHe ? row.he : row.en}</h2>
            <p className="muted small">{isHe ? row.en : row.he}</p>
            {row.sk ? (
              <p className="phrase-line">
                <span className="muted small">SK</span> {row.sk}
                {speechOk ? (
                  <button
                    type="button"
                    className="btn btn-ghost phrase-speak"
                    aria-label={isHe ? 'השמע סלובקית' : 'Play Slovak'}
                    onClick={() => speakPhrase(row.sk!, 'sk')}
                  >
                    ▶
                  </button>
                ) : null}
              </p>
            ) : null}
            {row.pl ? (
              <p className="phrase-line">
                <span className="muted small">PL</span> {row.pl}
                {speechOk ? (
                  <button
                    type="button"
                    className="btn btn-ghost phrase-speak"
                    aria-label={isHe ? 'השמע פולנית' : 'Play Polish'}
                    onClick={() => speakPhrase(row.pl!, 'pl')}
                  >
                    ▶
                  </button>
                ) : null}
              </p>
            ) : null}
            {(isHe ? row.noteHe : row.noteEn) ? (
              <p className="muted small">{isHe ? row.noteHe : row.noteEn}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
