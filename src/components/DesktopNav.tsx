import { NavLink } from 'react-router-dom'
import { appConfig } from '@/config/env'
import { guideNav, primaryNav } from '@/config/navigation'
import { useApp } from '@/providers/AppProvider'
import type { NavItem } from '@/types/app'

function NavLinks({
  items,
  locale,
}: {
  items: NavItem[]
  locale: 'he' | 'en'
}) {
  return (
    <>
      {items.map((item) => {
        const label = locale === 'he' ? item.labelHe : item.labelEn
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
    </>
  )
}

export function DesktopNav() {
  const { preferences, sessionMode } = useApp()
  const isHe = preferences.locale === 'he'

  return (
    <aside className="desktop-nav" aria-label={isHe ? 'ניווט ראשי' : 'Primary'}>
      <div className="desktop-nav-brand">
        <p className="brand-title">{appConfig.appName}</p>
        <p className="brand-subtitle">{appConfig.tripLabel}</p>
      </div>
      <div className="desktop-nav-scroll">
        <div className="desktop-nav-links">
          <NavLinks items={primaryNav} locale={preferences.locale} />
        </div>
        <div className="desktop-nav-section">
          <p className="desktop-nav-section-label">{isHe ? 'מדריך' : 'Guide'}</p>
          <div className="desktop-nav-links">
            <NavLinks items={guideNav} locale={preferences.locale} />
          </div>
        </div>
      </div>
      <p className="desktop-nav-session">
        {sessionMode === 'open'
          ? isHe
            ? 'מחובר'
            : 'Signed in'
          : isHe
            ? 'לא מחובר'
            : 'Signed out'}
      </p>
    </aside>
  )
}
