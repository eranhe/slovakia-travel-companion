import { HashRouter } from 'react-router-dom'
import { appConfig } from '@/config/env'
import { AppProvider } from '@/providers/AppProvider'
import { AppRoutes } from '@/routes/AppRoutes'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="app-root" data-app={appConfig.appName}>
          <AppRoutes />
        </div>
      </HashRouter>
    </AppProvider>
  )
}
