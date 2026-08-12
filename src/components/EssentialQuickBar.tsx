import { Link } from 'react-router-dom'
import { useApp } from '@/providers/AppProvider'

export function EssentialQuickBar() {
  const { preferences } = useApp()
  const isHe = preferences.locale === 'he'

  return (
    <div className="essential-quick-bar" aria-label={isHe ? 'גישה מהירה' : 'Quick access'}>
      <Link to="/essential" className="btn btn-secondary">
        {isHe ? 'חיוני עכשיו' : 'Essential now'}
      </Link>
      <a href="tel:112" className="btn essential-112">
        112
      </a>
    </div>
  )
}
