export interface EmergencyNumber {
  id: string
  labelEn: string
  labelHe: string
  number: string
  noteEn?: string
  noteHe?: string
  critical?: boolean
}

export interface EmergencyScenario {
  id: string
  titleEn: string
  titleHe: string
  stepsEn: string[]
  stepsHe: string[]
}

/** Public emergency / insurance pointers for the trip — no medical profile stored. */
export const emergencyNumbers: EmergencyNumber[] = [
  {
    id: 'eu-112',
    labelEn: 'EU emergency',
    labelHe: 'חירום אירופי',
    number: '112',
    critical: true,
    noteEn: 'Police / ambulance / fire across EU',
    noteHe: 'משטרה / אמבולנס / כיבוי בכל האיחוד',
  },
  {
    id: 'sk-hzs',
    labelEn: 'Mountain rescue (Slovakia HZS)',
    labelHe: 'חילוץ הררי סלובקיה (HZS)',
    number: '18300',
    noteEn: 'Mountain emergencies in Slovakia',
    noteHe: 'חירום בהרים בסלובקיה',
  },
  {
    id: 'pl-gop',
    labelEn: 'Mountain rescue (Poland GOPR/TOPR info)',
    labelHe: 'חילוץ הררי פולין (GOPR/TOPR)',
    number: '985',
    noteEn: 'Confirm locally in the Tatras; 112 always works',
    noteHe: 'לאשר מקומית בטטרה; 112 תמיד עובד',
  },
]

export const insuranceSnapshot = {
  provider: 'PassportCard',
  policyRef: '310823541',
  cardHintEn: 'Physical card ends with 5814',
  cardHintHe: 'כרטיס פיזי מסתיים ב-5814',
  noteEn: 'Open the insurance document from Wallet for claim steps.',
  noteHe: 'לפתוח את מסמך הביטוח בארנק לפרטי תביעה.',
}

export const emergencyScenarios: EmergencyScenario[] = [
  {
    id: 'life-threat',
    titleEn: 'Possible life-threatening situation',
    titleHe: 'מצב שעלול להיות מסכן חיים',
    stepsEn: [
      'Call 112 first — more important than navigation apps.',
      'Stay on the line and follow dispatcher instructions.',
      'Share your last known place name and road signs.',
    ],
    stepsHe: [
      'להתקשר ל-112 קודם — חשוב יותר מאפליקציות ניווט.',
      'להישאר על הקו ולעקוב אחרי הוראות המוקד.',
      'למסור שם מקום אחרון ידוע ושלטי דרך.',
    ],
  },
  {
    id: 'mountain',
    titleEn: 'Mountain emergency',
    titleHe: 'חירום בהרים',
    stepsEn: [
      'Call 112 or HZS 18300 in Slovakia.',
      'Do not leave the group; mark your last clear landmark.',
      'Use offline Mapy.com if mobile signal is weak.',
    ],
    stepsHe: [
      'להתקשר ל-112 או ל-HZS 18300 בסלובקיה.',
      'לא להתפצל מהקבוצה; לסמן ציון דרך ברור אחרון.',
      'להשתמש ב-Mapy.com אופליין אם הקליטה חלשה.',
    ],
  },
  {
    id: 'lost-passport',
    titleEn: 'Lost passport',
    titleHe: 'דרכון אבוד',
    stepsEn: [
      'Check Wallet / screenshots for booking IDs.',
      'Contact the Israeli embassy/consulate guidance for travelers.',
      'Keep police report number if theft is involved.',
    ],
    stepsHe: [
      'לבדוק בארנק / צילומי מסך מספרי הזמנה.',
      'לפנות להנחיות שגרירות/קונסוליה ישראלית למטיילים.',
      'לשמור מספר דוח משטרה אם מדובר בגניבה.',
    ],
  },
  {
    id: 'car-breakdown',
    titleEn: 'Car breakdown',
    titleHe: 'תקלת רכב',
    stepsEn: [
      'Move to a safe spot if possible; hazard lights on.',
      'Use the rental voucher assistance number from Wallet docs.',
      'Call 112 if the vehicle creates a road hazard.',
    ],
    stepsHe: [
      'לעצור במקום בטוח אם אפשר; אורות מצוקה.',
      'להשתמש במספר הסיוע של השכרת הרכב ממסמכי הארנק.',
      'להתקשר ל-112 אם הרכב מסכן את הכביש.',
    ],
  },
  {
    id: 'separated',
    titleEn: 'Separated traveler / lost child',
    titleHe: 'היפרדות / ילד אבוד',
    stepsEn: [
      'Call/text immediately; meet at a named entrance or info desk.',
      'Ask staff for a loudspeaker announcement.',
      'Call 112 if contact is lost and risk is high.',
    ],
    stepsHe: [
      'להתקשר/לשלוח הודעה מיד; להיפגש בכניסה או בדלפק מידע.',
      'לבקש מהצוות כריזה.',
      'להתקשר ל-112 אם אין קשר והסיכון גבוה.',
    ],
  },
  {
    id: 'no-internet',
    titleEn: 'No internet',
    titleHe: 'אין אינטרנט',
    stepsEn: [
      'Use offline Mapy.com regions and saved Waze searches.',
      'Open tickets from Wallet screenshots.',
      'Keep paper copies of passports and key vouchers.',
    ],
    stepsHe: [
      'להשתמש באזורי Mapy.com אופליין ובחיפושי Waze שמורים.',
      'לפתוח כרטיסים מצילומי מסך בארנק.',
      'לשמור עותקים מודפסים של דרכונים ושוברי מפתח.',
    ],
  },
]

export const destinationTips = [
  {
    id: 'tip-currency',
    titleEn: 'Currency',
    titleHe: 'מטבע',
    bodyEn: 'Euro in Slovakia, złoty in Poland. Keep small cash for parking and toilets.',
    bodyHe: 'יורו בסלובקיה, זלוטי בפולין. להשאיר מזומן קטן לחניונים ושירותים.',
  },
  {
    id: 'tip-vignette',
    titleEn: 'Slovak e-vignette',
    titleHe: 'e-vignette סלובקית',
    bodyEn: 'Buy only via the official eZnamka channel if not included with the rental.',
    bodyHe: 'לקנות רק בערוץ eZnamka הרשמי אם לא כלול בהשכרה.',
  },
  {
    id: 'tip-offline',
    titleEn: 'Offline maps',
    titleHe: 'מפות אופליין',
    bodyEn: 'Download Liptov, High Tatras, Slovak Paradise, and Pieniny in Mapy.com before canyon days.',
    bodyHe: 'להוריד ליפטוב, טטרה גבוהה, גן עדן סלובקי ופייניני ב-Mapy.com לפני ימי קניון.',
  },
  {
    id: 'tip-water-parks',
    titleEn: 'Water parks',
    titleHe: 'פארקי מים',
    bodyEn: 'Towels are usually not provided. Measure kids with shoes for height limits.',
    bodyHe: 'בדרך כלל אין מגבות. למדוד ילדים עם נעליים למגבלות גובה.',
  },
  {
    id: 'tip-arrival',
    titleEn: 'Arrival day (17 Aug)',
    titleHe: 'יום הגעה (17/8)',
    bodyEn:
      'TLV by ~04:00 · car desk checklist (border/fuel/vignette + photos) · supermarket · Maladinovo PIN 0910 · soft lake only if energy remains · four day-bags + screenshots that evening.',
    bodyHe:
      'נתב״ג בסביבות 04:00 · צ׳קליסט דלפק רכב (גבול/דלק/vignette + תמונות) · סופר · PIN מלאדינובו 0910 · אגם רק אם נשאר כוח · ערב: ארבעה תיקי יום + צילומי מסך.',
  },
  {
    id: 'tip-departure',
    titleEn: 'Departure day (28 Aug)',
    titleHe: 'יום חזרה (28/8)',
    bodyEn:
      'Room sweep → Hilton checkout → refuel → return car 751370640 early → security by ~07:20 → LY5120 09:50. Boarding passes offline from the night before.',
    bodyHe:
      'בדיקת חדר → צ׳ק-אאוט הילטון → תדלוק → החזרת רכב 751370640 מוקדם → בידוק בסביבות 07:20 → LY5120 ב-09:50. כרטיסי עלייה אופליין מהערב הקודם.',
  },
] as const
