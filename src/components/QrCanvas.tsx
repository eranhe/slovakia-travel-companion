import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCanvasProps {
  value: string
  size?: number
  label?: string
}

export function QrCanvas({ value, size = 220, label }: QrCanvasProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    void QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0c1222', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'QR failed')
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (error) return <p className="form-error">{error}</p>
  if (!dataUrl) return <p className="muted small">…</p>

  return (
    <figure className="qr-figure">
      <img src={dataUrl} width={size} height={size} alt={label ?? value} />
      {label ? <figcaption className="muted small">{label}</figcaption> : null}
    </figure>
  )
}
