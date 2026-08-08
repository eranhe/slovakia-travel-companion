import { imageUrl } from '@/media/images'

interface HeroImageProps {
  imageId: string | null | undefined
  alt: string
  /** Text rendered over the darkened lower half of the image. */
  overlayTitle?: string
  overlaySubtitle?: string
  eyebrow?: string
}

/** Wide banner illustration used at the top of day and page cards. */
export function HeroImage({
  imageId,
  alt,
  overlayTitle,
  overlaySubtitle,
  eyebrow,
}: HeroImageProps) {
  const src = imageUrl(imageId, 'wide')
  if (!src) return null

  return (
    <div className="hero-image">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      {overlayTitle || overlaySubtitle || eyebrow ? (
        <div className="hero-image-overlay">
          {eyebrow ? <span className="hero-eyebrow">{eyebrow}</span> : null}
          {overlayTitle ? <strong className="hero-title">{overlayTitle}</strong> : null}
          {overlaySubtitle ? <span className="hero-subtitle">{overlaySubtitle}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

interface ThumbProps {
  imageId: string | null | undefined
  alt: string
  size?: 'sm' | 'md'
}

/** Small square illustration that accompanies a place or activity row. */
export function Thumb({ imageId, alt, size = 'md' }: ThumbProps) {
  const src = imageUrl(imageId, 'thumb')
  if (!src) return null

  return (
    <img
      className={`thumb thumb-${size}`}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
}
