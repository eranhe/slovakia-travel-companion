import type { NavItem } from '@/types/app'

export const primaryNav: NavItem[] = [
  { path: '/today', labelEn: 'Today', labelHe: 'היום', icon: '☀' },
  { path: '/trip', labelEn: 'Trip', labelHe: 'מסלול', icon: '🗺' },
  { path: '/wallet', labelEn: 'Wallet', labelHe: 'ארנק', icon: '🎫' },
  { path: '/settings', labelEn: 'Settings', labelHe: 'הגדרות', icon: '⚙' },
]

/** Guide hub — shown in the mobile bottom bar (desktop has the full guideNav list). */
export const guideHubNav: NavItem = {
  path: '/guide',
  labelEn: 'Guide',
  labelHe: 'מדריך',
  icon: '📖',
}

/** Mobile bottom bar: day-of destinations + Guide hub + one-tap Emergency. */
export const mobileNav: NavItem[] = [
  primaryNav[0],
  primaryNav[1],
  primaryNav[2],
  guideHubNav,
  { path: '/emergency', labelEn: 'Emergency', labelHe: 'חירום', icon: '🆘' },
]

/** Direct links to every Guide destination — shown in the desktop side nav. */
export const guideNav: NavItem[] = [
  { path: '/essential', labelEn: 'Essential', labelHe: 'חיוני', icon: '★' },
  { path: '/places', labelEn: 'Places', labelHe: 'מקומות', icon: '📍' },
  { path: '/journal', labelEn: 'Journal', labelHe: 'יומן', icon: '📷' },
  { path: '/maps', labelEn: 'Maps', labelHe: 'מפות', icon: '🧭' },
  { path: '/command', labelEn: 'Command', labelHe: 'פיקוד', icon: '📋' },
  { path: '/packing', labelEn: 'Packing', labelHe: 'ציוד', icon: '🎒' },
  { path: '/phrases', labelEn: 'Phrases', labelHe: 'משפטים', icon: '💬' },
  { path: '/emergency', labelEn: 'Emergency', labelHe: 'חירום', icon: '🆘' },
]
