export type NearbyServiceKind =
  | 'supermarket'
  | 'convenience'
  | 'fuel'
  | 'atm'
  | 'pharmacy'
  | 'medical'
  | 'hospital'
  | 'laundry'

export interface NearbyService {
  id: string
  kind: NearbyServiceKind
  nameEn: string
  nameHe: string
  /** Rough distance label, e.g. "~0.2 km / 2 min walk". */
  distanceEn: string
  distanceHe: string
  noteEn?: string
  noteHe?: string
  wazeQuery: string
  phone?: string
  /** Optional link to an existing place card in the Places list. */
  relatedPlaceId?: string
}

export interface LodgingNearbyServices {
  lodgingPlaceId: string
  services: NearbyService[]
}

export const NEARBY_SERVICE_KIND_LABEL: Record<
  NearbyServiceKind,
  { en: string; he: string }
> = {
  supermarket: { en: 'Supermarket', he: 'סופר' },
  convenience: { en: 'Shop', he: 'מכולת' },
  fuel: { en: 'Fuel', he: 'דלק' },
  atm: { en: 'ATM', he: 'כספומט' },
  pharmacy: { en: 'Pharmacy', he: 'בית מרקחת' },
  medical: { en: 'Clinic', he: 'מרפאה' },
  hospital: { en: 'Hospital', he: 'בית חולים' },
  laundry: { en: 'Laundry', he: 'מכבסה' },
}

/** Immediate services near the first two trip bases. Distances are approximate. */
export const lodgingNearbyServices: LodgingNearbyServices[] = [
  {
    lodgingPlaceId: 'place-maladinovo',
    services: [
      {
        id: 'svc-m-koruna',
        kind: 'convenience',
        nameEn: 'Potraviny Koruna',
        nameHe: 'Potraviny Koruna',
        distanceEn: '~0.2 km',
        distanceHe: '~0.2 ק״מ',
        noteEn: 'Closest small shop by the resort / Tatralandia strip.',
        noteHe: 'המכולת הקרובה ביותר ליד הריזורט / רצועת Tatralandia.',
        wazeQuery: 'Potraviny Koruna Liptovsky Mikulas',
      },
      {
        id: 'svc-m-orlen',
        kind: 'fuel',
        nameEn: 'Orlen',
        nameHe: 'Orlen',
        distanceEn: '~0.2 km',
        distanceHe: '~0.2 ק״מ',
        noteEn: 'Nearest fuel stop.',
        noteHe: 'תחנת הדלק הקרובה ביותר.',
        wazeQuery: 'Orlen Maladinovo Liptovsky Mikulas',
      },
      {
        id: 'svc-m-coop',
        kind: 'supermarket',
        nameEn: 'COOP Jednota',
        nameHe: 'COOP Jednota',
        distanceEn: '~0.5 km',
        distanceHe: '~0.5 ק״מ',
        noteEn: 'Closest supermarket; Lidl/Tesco ~1.5–2 km for a bigger stock-up.',
        noteHe: 'הסופר הקרוב; Lidl/Tesco ~1.5–2 ק״מ למלאי גדול יותר.',
        wazeQuery: 'COOP Jednota Liptovsky Mikulas',
      },
      {
        id: 'svc-m-pharmacy',
        kind: 'pharmacy',
        nameEn: 'Pharmacy · Námestie mieru',
        nameHe: 'בית מרקחת · Námestie mieru',
        distanceEn: '~0.5 km',
        distanceHe: '~0.5 ק״מ',
        wazeQuery: 'Lekaren Namestie mieru Liptovsky Mikulas',
      },
      {
        id: 'svc-m-clinic',
        kind: 'medical',
        nameEn: 'Poliklinika / clinics',
        nameHe: 'פוליקליניקה / מרפאות',
        distanceEn: '~0.6 km',
        distanceHe: '~0.6 ק״מ',
        noteEn: 'Primary care area near Jilemnického — not 24/7 ER.',
        noteHe: 'אזור מענה ראשוני ליד Jilemnického — לא מיון 24/7.',
        wazeQuery: 'Poliklinika Liptovsky Mikulas',
      },
      {
        id: 'svc-m-laundry',
        kind: 'laundry',
        nameEn: 'Self-service laundry · Štefánikova 1509/6',
        nameHe: 'מכבסה עצמית · Štefánikova 1509/6',
        distanceEn: '~0.9 km / ~10 min',
        distanceHe: '~0.9 ק״מ / ~10 דק׳',
        noteEn: 'Wash from ~€3.50 · dry from ~€1.50. Apartment also has a machine.',
        noteHe: 'כביסה מ-~3.50€ · ייבוש מ-~1.50€. גם בדירה יש מכונה.',
        wazeQuery: 'Stefanikova 1509 Liptovsky Mikulas',
      },
      {
        id: 'svc-m-hospital',
        kind: 'hospital',
        nameEn: 'NsP Liptovský Mikuláš · Palúčanská 25',
        nameHe: 'בית חולים Liptovský Mikuláš · Palúčanská 25',
        distanceEn: '~1.2 km',
        distanceHe: '~1.2 ק״מ',
        noteEn: 'Urgent care 24/7. Life threat: call 112 first.',
        noteHe: 'מיון 24/7. סכנת חיים: קודם 112.',
        wazeQuery: 'Nemocnica Palucanska 25 Liptovsky Mikulas',
        phone: '+421445563600',
      },
      {
        id: 'svc-m-tesco',
        kind: 'supermarket',
        nameEn: 'Tesco · Kamenné pole',
        nameHe: 'Tesco · Kamenné pole',
        distanceEn: '~1.5 km',
        distanceHe: '~1.5 ק״מ',
        noteEn: 'Full-size supermarket (also on arrival day).',
        noteHe: 'סופר מלא (גם ביום ההגעה).',
        wazeQuery: 'Tesco Kamenne pole Liptovsky Mikulas',
        relatedPlaceId: 'place-tesco-liptov',
      },
    ],
  },
  {
    lodgingPlaceId: 'place-zdiar',
    services: [
      {
        id: 'svc-z-pharmacy',
        kind: 'pharmacy',
        nameEn: 'Lekáreň Ždiar',
        nameHe: 'Lekáreň ז׳דיאר',
        distanceEn: '~0.1 km',
        distanceHe: '~0.1 ק״מ',
        noteEn: 'Usually Mon–Fri ~08:00–14:30.',
        noteHe: 'בדרך כלל א׳–ו׳ ~08:00–14:30.',
        wazeQuery: 'Lekaren Zdiar',
        phone: '+421524498498',
      },
      {
        id: 'svc-z-atm',
        kind: 'atm',
        nameEn: 'UniCredit ATM · health centre #261',
        nameHe: 'כספומט UniCredit · מרכז רפואי #261',
        distanceEn: '~0.1 km',
        distanceHe: '~0.1 ק״מ',
        noteEn: 'Same building as post + GP clinic.',
        noteHe: 'אותו בניין עם דואר ומרפאת רופא משפחה.',
        wazeQuery: 'Zdiar 261',
      },
      {
        id: 'svc-z-medical',
        kind: 'medical',
        nameEn: 'Zdravotné stredisko · adult GP',
        nameHe: 'מרכז רפואי · רופא משפחה למבוגרים',
        distanceEn: '~0.1 km',
        distanceHe: '~0.1 ק״מ',
        noteEn: 'Village primary care — not a hospital ER. Check opening hours locally.',
        noteHe: 'מענה ראשוני בכפר — לא מיון בית חולים. לבדוק שעות פתיחה במקום.',
        wazeQuery: 'Zdravotne stredisko Zdiar 261',
      },
      {
        id: 'svc-z-slovnaft',
        kind: 'fuel',
        nameEn: 'Slovnaft · Ždiar 287',
        nameHe: 'Slovnaft · ז׳דיאר 287',
        distanceEn: '~0.2 km',
        distanceHe: '~0.2 ק״מ',
        noteEn: 'Roughly 06:00–20:00 (Sun sometimes from 07:00). Small shop on site.',
        noteHe: 'בערך 06:00–20:00 (א׳ לעיתים מ-07:00). יש חנות קטנה בתחנה.',
        wazeQuery: 'Slovnaft Zdiar',
        phone: '+421524498105',
      },
      {
        id: 'svc-z-vlasta',
        kind: 'convenience',
        nameEn: 'Potraviny u Vlasty',
        nameHe: 'Potraviny u Vlasty',
        distanceEn: '~0.2 km',
        distanceHe: '~0.2 ק״מ',
        noteEn: 'Village grocery + basics.',
        noteHe: 'מכולת כפרית + מוצרי יסוד.',
        wazeQuery: 'Potraviny u Vlasty Zdiar',
      },
      {
        id: 'svc-z-konzum',
        kind: 'convenience',
        nameEn: 'Konzum ABC / Môj obchod',
        nameHe: 'Konzum ABC / Môj obchod',
        distanceEn: 'in village',
        distanceHe: 'בכפר',
        noteEn: 'Also listed under Places (fan tip).',
        noteHe: 'גם ברשימת המקומות (טיפ מאוורר).',
        wazeQuery: 'Konzum Zdiar',
        relatedPlaceId: 'place-konzum-zdiar',
        phone: '+421524498150',
      },
      {
        id: 'svc-z-sintra',
        kind: 'supermarket',
        nameEn: 'SINTRA · Ždiar 120',
        nameHe: 'SINTRA · ז׳דיאר 120',
        distanceEn: '~1.5 km',
        distanceHe: '~1.5 ק״מ',
        noteEn: 'Larger village grocery. No full hypermarket in Ždiar — Poprad for that.',
        noteHe: 'מכולת גדולה יותר בכפר. אין סופר מלא בז׳דיאר — לזה פופרד.',
        wazeQuery: 'Sintra Zdiar 120',
        relatedPlaceId: 'place-sintra-zdiar',
        phone: '+421524498144',
      },
      {
        id: 'svc-z-hospital',
        kind: 'hospital',
        nameEn: 'Nemocnica Poprad · Banícka 803/28',
        nameHe: 'בית חולים פופרד · Banícka 803/28',
        distanceEn: '~25 km / ~30 min',
        distanceHe: '~25 ק״מ / ~30 דק׳',
        noteEn: 'Nearest full hospital. Life threat: call 112 first. No laundry shop in the village.',
        noteHe: 'בית החולים המלא הקרוב. סכנת חיים: קודם 112. אין מכבסה בכפר.',
        wazeQuery: 'Nemocnica Poprad Banicka',
        phone: '+421527125111',
      },
    ],
  },
]

export function getNearbyServicesForPlace(placeId: string): NearbyService[] {
  return lodgingNearbyServices.find((row) => row.lodgingPlaceId === placeId)?.services ?? []
}
