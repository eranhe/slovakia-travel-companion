import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppLocale, AppPreferences, AppSkin, SessionMode } from '@/types/app'
import { verifyPassword } from '@/auth/password'

const STORAGE_KEY = 'stc-preferences-v1'

interface AppContextValue {
  sessionMode: SessionMode
  preferences: AppPreferences
  login: (password: string) => boolean
  logout: () => void
  setLocale: (locale: AppLocale) => void
  setSkin: (skin: AppSkin) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function loadPreferences(): AppPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<AppPreferences>
    const locale: AppLocale = parsed.locale === 'en' ? 'en' : 'he'
    const skin: AppSkin = parsed.skin === 'light' ? 'light' : 'dark'
    return {
      locale,
      rtl: locale === 'he',
      skin,
    }
  } catch {
    return { locale: 'he', rtl: true, skin: 'dark' }
  }
}

function applySkin(skin: AppSkin) {
  document.documentElement.dataset.skin = skin
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [sessionMode, setSessionMode] = useState<SessionMode>('locked')
  const [preferences, setPreferences] = useState<AppPreferences>(loadPreferences)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    document.documentElement.lang = preferences.locale
    document.documentElement.dir = preferences.rtl ? 'rtl' : 'ltr'
    applySkin(preferences.skin)
  }, [preferences])

  const login = useCallback((password: string) => {
    const accepted = verifyPassword(password)
    if (accepted) setSessionMode('open')
    return accepted
  }, [])

  const logout = useCallback(() => setSessionMode('locked'), [])

  const setLocale = useCallback((locale: AppLocale) => {
    setPreferences((prev) => ({ ...prev, locale, rtl: locale === 'he' }))
  }, [])

  const setSkin = useCallback((skin: AppSkin) => {
    setPreferences((prev) => ({ ...prev, skin }))
  }, [])

  const value = useMemo(
    () => ({ sessionMode, preferences, login, logout, setLocale, setSkin }),
    [sessionMode, preferences, login, logout, setLocale, setSkin],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- colocated tiny context hook
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
