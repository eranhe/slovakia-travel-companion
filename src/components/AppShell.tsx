import { Outlet } from 'react-router-dom'
import { DesktopNav } from '@/components/DesktopNav'
import { EssentialQuickBar } from '@/components/EssentialQuickBar'
import { MobileNav } from '@/components/MobileNav'
import { RecapBanner } from '@/components/RecapBanner'
import { TomorrowCheckBanner } from '@/components/TomorrowCheckBanner'
import { useRecapTriggers } from '@/hooks/useRecapTriggers'
import { useTomorrowCheckTriggers } from '@/hooks/useTomorrowCheckTriggers'
import { imageUrl } from '@/media/images'

export function AppShell() {
  useTomorrowCheckTriggers()
  useRecapTriggers()

  const backdrop = imageUrl('hero-tatras')

  return (
    <div className="app-shell">
      <div
        className="app-backdrop"
        aria-hidden
        style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
      />
      <DesktopNav />
      <div className="app-main">
        <main className="app-content">
          <EssentialQuickBar />
          <TomorrowCheckBanner />
          <RecapBanner />
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
