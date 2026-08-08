import { NavLink } from 'react-router-dom'
import { appConfig } from '@/config/env'
import { primaryNav } from '@/config/navigation'
import { useApp } from '@/providers/AppProvider'

export function DesktopNav() {
  const { preferences, sessionMode } = useApp()

  return (
    <aside className="desktop-nav" aria-label="Primary">
      <div className="desktop-nav-brand">
        <p className="brand-title">{appConfig.appName}</p>
        <p className="brand-subtitle">{appConfig.tripLabel}</p>
      </div>
      <div className="desktop-nav-links">
        {primaryNav.map((item) => {
          const label = preferences.locale === 'he' ? item.labelHe : item.labelEn
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `desktop-nav-link${isActive ? ' active' : ''}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{label}</span>
            </NavLink>
          )
        })}
      </div>
      <p className="desktop-nav-session">
        {sessionMode === 'open'
          ? preferences.locale === 'he'
            ? 'מחובר'
            : 'Signed in'
          : preferences.locale === 'he'
            ? 'לא מחובר'
            : 'Signed out'}
      </p>
    </aside>
  )
}
