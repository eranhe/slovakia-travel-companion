/** Compress and thumbnail trip photos in-browser (no remote upload). */

export interface CompressedImage {
  blob: Blob
  thumb: Blob
  width: number
  height: number
  mimeType: string
}

function loadImageBitmap(file: Blob): Promise<ImageBitmap> {
  return createImageBitmap(file)
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Image compression failed.'))
        else resolve(blob)
      },
      mimeType,
      quality,
    )
  })
}

export async function compressImage(
  file: Blob,
  options: { maxEdge?: number; thumbEdge?: number; quality?: number } = {},
): Promise<CompressedImage> {
  const maxEdge = options.maxEdge ?? 1600
  const thumbEdge = options.thumbEdge ?? 360
  const quality = options.quality ?? 0.72
  const bitmap = await loadImageBitmap(file)
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable.')
    ctx.drawImage(bitmap, 0, 0, width, height)
    const mimeType = 'image/jpeg'
    const blob = await canvasToBlob(canvas, mimeType, quality)

    const tScale = Math.min(1, thumbEdge / Math.max(bitmap.width, bitmap.height))
    const tw = Math.max(1, Math.round(bitmap.width * tScale))
    const th = Math.max(1, Math.round(bitmap.height * tScale))
    const thumbCanvas = document.createElement('canvas')
    thumbCanvas.width = tw
    thumbCanvas.height = th
    const tctx = thumbCanvas.getContext('2d')
    if (!tctx) throw new Error('Canvas unavailable.')
    tctx.drawImage(bitmap, 0, 0, tw, th)
    const thumb = await canvasToBlob(thumbCanvas, mimeType, 0.65)

    return { blob, thumb, width, height, mimeType }
  } finally {
    bitmap.close()
  }
}

export async function fingerprintFile(file: File): Promise<string> {
  const header = await file.slice(0, 64_000).arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', header)
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${file.name}|${file.size}|${file.lastModified}|${hex.slice(0, 24)}`
}
