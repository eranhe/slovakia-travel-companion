import { compressImage, fingerprintFile } from '@/journal/compressImage'
import { findPhotoByFingerprint, putPhoto } from '@/journal/photoStore'
import type { PhotoRecord } from '@/journal/types'

export interface ImportPhotoOptions {
  dayNumber?: number
  activityId?: string
  placeId?: string
  caption?: string
  /** Must be explicit true before coordinates are stored. */
  includeLocation?: boolean
  coordinates?: { lat: number; lng: number }
}

export async function importPhotoFile(
  file: File,
  options: ImportPhotoOptions = {},
): Promise<{ photo: PhotoRecord; duplicate: boolean }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported.')
  }

  const fingerprint = await fingerprintFile(file)
  const existing = await findPhotoByFingerprint(fingerprint)
  if (existing) {
    // Return a lightweight duplicate signal; caller can skip rewriting blob.
    const duplicateRecord: PhotoRecord = {
      ...existing,
      blob: new Blob(),
      thumb: new Blob(),
    }
    return { photo: duplicateRecord, duplicate: true }
  }

  const compressed = await compressImage(file)
  const includeLocation = options.includeLocation === true && Boolean(options.coordinates)
  const record: PhotoRecord = {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    takenAt: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
    filename: file.name,
    mimeType: compressed.mimeType,
    caption: options.caption?.trim() ?? '',
    dayNumber: options.dayNumber,
    activityId: options.activityId,
    placeId: options.placeId,
    includeLocation,
    coordinates:
      includeLocation && options.coordinates
        ? {
            lat: options.coordinates.lat,
            lng: options.coordinates.lng,
            status: 'user-reported',
          }
        : undefined,
    width: compressed.width,
    height: compressed.height,
    bytes: compressed.blob.size,
    thumbBytes: compressed.thumb.size,
    fingerprint,
    blob: compressed.blob,
    thumb: compressed.thumb,
  }
  await putPhoto(record)
  return { photo: record, duplicate: false }
}
