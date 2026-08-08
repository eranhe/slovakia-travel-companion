export type JournalStatus = 'draft' | 'completed' | 'shared' | 'exported'

export type RecapStyle =
  | 'personal-diary'
  | 'family-update'
  | 'whatsapp-story'
  | 'detailed-log'
  | 'photo-postcard'
  | 'minimal'

export interface PhotoMeta {
  id: string
  createdAt: string
  takenAt?: string
  filename: string
  mimeType: string
  caption: string
  dayNumber?: number
  activityId?: string
  placeId?: string
  /** User explicitly approved attaching coordinates. */
  includeLocation: boolean
  coordinates?: {
    lat: number
    lng: number
    status: 'user-reported'
  }
  width: number
  height: number
  bytes: number
  thumbBytes: number
  fingerprint: string
}

export interface PhotoRecord extends PhotoMeta {
  blob: Blob
  thumb: Blob
}

export interface JournalEntry {
  id: string
  date: string
  dayNumber?: number
  status: JournalStatus
  notes: string
  favoriteMoment?: string
  favoriteFood?: string
  funnyMoment?: string
  challenge?: string
  mood?: string
  rating?: number
  photoIds: string[]
  updatedAt: string
}

export interface RecapFields {
  title: string
  region: string
  highlights: string
  timeline: string
  weather: string
  notes: string
  favoriteMoment: string
  favoriteFood: string
  surprise: string
  lesson: string
  funnyMoment: string
  challenge: string
  localPhrase: string
  mood: string
  rating: string
  tomorrowStatus: string
  estimatedLabel: string
}

export interface NightlyRecap {
  id: string
  date: string
  dayNumber?: number
  style: RecapStyle
  status: JournalStatus
  fields: RecapFields
  /** Full editable body; manual edits survive regeneration when set. */
  body: string
  bodyLocked: boolean
  photoIds: string[]
  createdAt: string
  updatedAt: string
  approvedAt?: string
}

export const RECAP_STYLES: Array<{ id: RecapStyle; labelEn: string; labelHe: string }> = [
  { id: 'personal-diary', labelEn: 'Personal diary', labelHe: 'יומן אישי' },
  { id: 'family-update', labelEn: 'Family update', labelHe: 'עדכון משפחתי' },
  { id: 'whatsapp-story', labelEn: 'WhatsApp story', labelHe: 'סטטוס WhatsApp' },
  { id: 'detailed-log', labelEn: 'Detailed travel log', labelHe: 'יומן מסע מפורט' },
  { id: 'photo-postcard', labelEn: 'Photo-first postcard', labelHe: 'גלויה עם תמונות' },
  { id: 'minimal', labelEn: 'Minimal factual', labelHe: 'עובדתי קצר' },
]
