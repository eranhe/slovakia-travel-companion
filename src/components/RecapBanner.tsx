import { Link } from 'react-router-dom'
import { useSyncExternalStore } from 'react'
import { useApp } from '@/providers/AppProvider'
import {
  dismissRecapCue,
  getPendingRecapCue,
  subscribeRecapCue,
} from '@/journal/recapCueStore'

export function RecapBanner() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const cue = useSyncExternalStore(subscribeRecapCue, getPendingRecapCue, getPendingRecapCue)

  if (!cue) return null

  return (
    <div className="tomorrow-banner recap-banner" role="status">
      <p>{isHe ? cue.messageHe : cue.messageEn}</p>
      <div className="settings-row">
        <Link to="/journal" className="btn btn-primary">
          {isHe ? 'יומן וסיכום' : 'Journal & recap'}
        </Link>
        <button type="button" className="btn btn-ghost" onClick={() => dismissRecapCue()}>
          {isHe ? 'סגור' : 'Dismiss'}
        </button>
      </div>
    </div>
  )
}
