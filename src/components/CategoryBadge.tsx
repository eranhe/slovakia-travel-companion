/** Category badge — restaurants get a distinct mark from attractions / lodging. */

const LABELS: Record<string, { en: string; he: string; icon: string; className: string }> = {
  food: { en: 'Restaurant', he: 'מסעדה', icon: '🍽', className: 'cat-badge cat-food' },
  attraction: { en: 'Attraction', he: 'אטרקציה', icon: '◎', className: 'cat-badge cat-attraction' },
  accommodation: { en: 'Lodging', he: 'לינה', icon: '⌂', className: 'cat-badge cat-lodging' },
  transport: { en: 'Transport', he: 'תחבורה', icon: '➜', className: 'cat-badge cat-transport' },
  other: { en: 'Admin', he: 'ניהול', icon: '·', className: 'cat-badge cat-other' },
}

interface CategoryBadgeProps {
  category?: string
  isHe: boolean
}

export function CategoryBadge({ category, isHe }: CategoryBadgeProps) {
  const meta = LABELS[category ?? 'other'] ?? LABELS.other
  return (
    <span className={meta.className} title={isHe ? meta.he : meta.en}>
      <span aria-hidden>{meta.icon}</span>
      {isHe ? meta.he : meta.en}
    </span>
  )
}
