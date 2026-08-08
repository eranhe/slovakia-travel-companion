import { Link } from 'react-router-dom'
import { useSyncExternalStore } from 'react'
import { useApp } from '@/providers/AppProvider'
import {
  dismissPendingTomorrowCue,
  getPendingTomorrowCue,
  subscribeTomorrowCheck,
} from '@/weather/tomorrowCheckStore'

export function TomorrowCheckBanner() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'
  const cue = useSyncExternalStore(
    subscribeTomorrowCheck,
    getPendingTomorrowCue,
    getPendingTomorrowCue,
  )

  if (!cue) return null

  return (
    <div className="tomorrow-banner" role="status">
      <p>{isHe ? cue.messageHe : cue.messageEn}</p>
      <div className="settings-row">
        <Link to="/tomorrow" className="btn btn-primary">
          {isHe ? 'בדיקת מחר' : 'Tomorrow Check'}
        </Link>
        <button type="button" className="btn btn-ghost" onClick={() => dismissPendingTomorrowCue()}>
          {isHe ? 'סגור' : 'Dismiss'}
        </button>
      </div>
    </div>
  )
}
