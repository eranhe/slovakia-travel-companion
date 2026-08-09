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
  {
    id: 'kaizen-airport',
    labelEn: 'Kaizen Rent — Kraków Airport desk',
    labelHe: 'Kaizen Rent — דלפק נמל התעופה קרקוב',
    number: '+48 881 212 968',
    noteEn: 'Pickup / return · also email balice.rent@kaizenrent.pl',
    noteHe: 'איסוף / החזרה · גם מייל balice.rent@kaizenrent.pl',
  },
  {
    id: 'kaizen-hub',
    labelEn: 'Kaizen Rent — general hub',
    labelHe: 'Kaizen Rent — מוקד כללי',
    number: '+48 76 727 99 99',
    noteEn: 'Call if LY5119 is significantly delayed',
    noteHe: 'להתקשר אם LY5119 מתעכבת משמעותית',
  },
  {
    id: 'hilton-krk',
    labelEn: 'Hilton Garden Inn Kraków Airport',
    labelHe: 'Hilton Garden Inn נמל תעופה קרקוב',
    number: '+48 12 340 00 00',
    noteEn: 'Confirmation 6756.877.990 · PIN 8081',
    noteHe: 'אישור 6756.877.990 · PIN 8081',
  },
  {
    id: 'rentalcars-il',
    labelEn: 'Rentalcars Israel',
    labelHe: 'Rentalcars ישראל',
    number: '03-372-2087',
    noteEn: 'Booking 751370640',
    noteHe: 'הזמנה 751370640',
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
      'TLV by ~04:00 · pocket card Arrivals→+1→Kaizen→P1 Sector E L5.5 · written Travel Permit + early-return + fuel/vignette · car photos · supermarket · Maladinovo PIN 0910 · soft lake only if energy remains.',
    bodyHe:
      'נתב״ג בסביבות 04:00 · כרטיס כיס Arrivals←+1←Kaizen←P1 Sector E L5.5 · Travel Permit + החזרה מוקדמת + דלק/vignette בכתב · תמונות רכב · סופר · PIN מלאדינובו 0910 · אגם רק אם נשאר כוח.',
  },
  {
    id: 'tip-departure',
    titleEn: 'Departure day (28 Aug)',
    titleHe: 'יום חזרה (28/8)',
    bodyEn:
      'Car already returned evening 27 Aug. Room sweep → Hilton checkout ~06:15–06:30 → covered bridge walk → security by ~07:00 → LY5120 09:50. Keep return protocol + fuel receipt + boarding passes offline.',
    bodyHe:
      'הרכב כבר הוחזר בערב 27/8. בדיקת חדר → צ׳ק-אאוט הילטון ~06:15–06:30 → הליכה בגשר המקורה → בידוק עד ~07:00 → LY5120 09:50. לשמור פרוטוקול החזרה + קבלת תדלוק + כרטיסי עלייה אופליין.',
  },
  {
    id: 'tip-zdiar-fan',
    titleEn: 'Hot room in Ždiar',
    titleHe: 'חדר חם בז׳דיאר',
    bodyEn:
      'Ask reception first. Then call Konzum (+421 52 449 81 50) or SINTRA (+421 52 449 81 44). Best bet: NAY Poprad (~32 min, +421 850 111 444) — PLANEO as backup. See Trip contingencies on Day 5.',
    bodyHe:
      'קודם לשאול בקבלה. אחר כך להתקשר ל-Konzum (+421 52 449 81 50) או SINTRA (+421 52 449 81 44). הכי אמין: NAY פופרד (~32 דק׳, +421 850 111 444) — PLANEO כגיבוי. ראו תוכניות גיבוי ביום 5 במסלול.',
  },
] as const
