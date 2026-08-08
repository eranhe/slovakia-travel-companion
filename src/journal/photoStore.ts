import type { PhotoMeta, PhotoRecord } from '@/journal/types'

const DB_NAME = 'stc-media-v1'
const STORE = 'photos'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Failed to open media DB'))
  })
}

function toMeta(record: PhotoRecord): PhotoMeta {
  const { blob: _b, thumb: _t, ...meta } = record
  return meta
}

export async function listPhotoMeta(): Promise<PhotoMeta[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const rows = (req.result as PhotoRecord[]).map(toMeta)
      rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      resolve(rows)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getPhoto(id: string): Promise<PhotoRecord | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve((req.result as PhotoRecord | undefined) ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function putPhoto(record: PhotoRecord): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function findPhotoByFingerprint(fingerprint: string): Promise<PhotoMeta | null> {
  const all = await listPhotoMeta()
  return all.find((item) => item.fingerprint === fingerprint) ?? null
}

/** Test helper — clears all photos. */
export async function clearAllPhotos(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
