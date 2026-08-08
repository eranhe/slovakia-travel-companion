export type AppLocale = 'he' | 'en'

export type SessionMode = 'locked' | 'open'

export interface AppPreferences {
  locale: AppLocale
  rtl: boolean
}

export interface NavItem {
  path: string
  labelEn: string
  labelHe: string
  icon: string
}
