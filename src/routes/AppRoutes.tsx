import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { CommandCenterPage } from '@/pages/CommandCenterPage'
import { EmergencyPage } from '@/pages/EmergencyPage'
import { EssentialPage } from '@/pages/EssentialPage'
import { GuidePage } from '@/pages/GuidePage'
import { JournalPage } from '@/pages/JournalPage'
import { MapsPage } from '@/pages/MapsPage'
import { PackingPage } from '@/pages/PackingPage'
import { PhrasebookPage } from '@/pages/PhrasebookPage'
import { PlacesPage } from '@/pages/PlacesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TodayPage } from '@/pages/TodayPage'
import { TomorrowPage } from '@/pages/TomorrowPage'
import { TripPage } from '@/pages/TripPage'
import { UnlockPage } from '@/pages/UnlockPage'
import { WalletPage } from '@/pages/WalletPage'
import { useApp } from '@/providers/AppProvider'

function ProtectedRoutes() {
  const { sessionMode } = useApp()

  if (sessionMode === 'locked') {
    return <Navigate to="/unlock" replace />
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/today" element={<TodayPage />} />
        <Route path="/tomorrow" element={<TomorrowPage />} />
        <Route path="/trip" element={<TripPage />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/command" element={<CommandCenterPage />} />
        <Route path="/packing" element={<PackingPage />} />
        <Route path="/phrases" element={<PhrasebookPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/essential" element={<EssentialPage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/unlock" element={<UnlockPage />} />
      <Route path="*" element={<ProtectedRoutes />} />
    </Routes>
  )
}
