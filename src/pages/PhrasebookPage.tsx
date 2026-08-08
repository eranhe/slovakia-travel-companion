import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { phrasebook, phraseCategories } from '@/data/phrasebook-seed'
import { useApp } from '@/providers/AppProvider'

export function PhrasebookPage() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const [category, setCategory] = useState<(typeof phraseCategories)[number]['id'] | 'all'>('all')

  const rows = useMemo(
    () => (category === 'all' ? phrasebook : phrasebook.filter((row) => row.category === category)),
    [category],
  )

  return (
    <section className="page">
      <PageHeader
        titleEn="Phrasebook"
        titleHe="משפטים"
        subtitleEn="Short Slovak / Polish lines for the trip"
        subtitleHe="משפטים קצרים בסלובקית / פולנית לטיול"
      />

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
              </p>
            ) : null}
            {row.pl ? (
              <p className="phrase-line">
                <span className="muted small">PL</span> {row.pl}
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
