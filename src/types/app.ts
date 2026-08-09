export type AppLocale = 'he' | 'en'

export type SessionMode = 'locked' | 'open'

/** Visual skin — dark is default; light is an optional brighter look. */
export type AppSkin = 'dark' | 'light'

export interface AppPreferences {
  locale: AppLocale
  rtl: boolean
  skin: AppSkin
}

export interface NavItem {
  path: string
  labelEn: string
  labelHe: string
  icon: string
}
