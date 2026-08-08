import type { ReactNode } from 'react'
import { useApp } from '@/providers/AppProvider'

interface PageHeaderProps {
  titleEn: string
  titleHe: string
  subtitleEn?: string
  subtitleHe?: string
  badge?: ReactNode
}

export function PageHeader({ titleEn, titleHe, subtitleEn, subtitleHe, badge }: PageHeaderProps) {
  const { preferences } = useApp()
  const title = preferences.locale === 'he' ? titleHe : titleEn
  const subtitle = preferences.locale === 'he' ? subtitleHe : subtitleEn

  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {badge}
    </header>
  )
}
