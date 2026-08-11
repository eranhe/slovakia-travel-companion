import { NavLink } from 'react-router-dom'
import { mobileNav } from '@/config/navigation'
import { useApp } from '@/providers/AppProvider'

export function MobileNav() {
  const { preferences } = useApp()

  return (
    <nav className="mobile-nav" aria-label={preferences.locale === 'he' ? 'ניווט ראשי' : 'Primary'}>
      {mobileNav.map((item) => {
        const label = preferences.locale === 'he' ? item.labelHe : item.labelEn
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="mobile-nav-label">{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
