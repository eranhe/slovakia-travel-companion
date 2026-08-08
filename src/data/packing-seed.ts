/** Family packing list derived from the trip packing PDF/HTML (4-bag method). */

export interface PackingItem {
  id: string
  labelEn: string
  labelHe: string
  noteEn?: string
  noteHe?: string
}

export interface PackingSection {
  id: string
  titleEn: string
  titleHe: string
  subtitleEn?: string
  subtitleHe?: string
  items: PackingItem[]
}

export interface DayBagPlan {
  date: string
  activityEn: string
  activityHe: string
  bagEn: string
  bagHe: string
}

export const packingSections: PackingSection[] = [
  {
    "id": "sec-0",
    "titleEn": "Documents bag",
    "titleHe": "תיק מסמכים",
    "subtitleEn": "Always on you — never left visible in the car",
    "subtitleHe": "תמיד עליכם — לא נשאר גלוי ברכב",
    "items": [
      {
        "id": "pack-0-0",
        "labelEn": "4 דרכונים",
        "labelHe": "4 דרכונים",
        "noteEn": "בתוקף לפחות 6 חודשים מעבר ל-28/8",
        "noteHe": "בתוקף לפחות 6 חודשים מעבר ל-28/8"
      },
      {
        "id": "pack-0-1",
        "labelEn": "כרטיסי טיסה LY5119 / LY5120",
        "labelHe": "כרטיסי טיסה LY5119 / LY5120",
        "noteEn": "הזמנה CPUFIH · אישור 8F4AQ5 — מודפס וגם צילום מסך",
        "noteHe": "הזמנה CPUFIH · אישור 8F4AQ5 — מודפס וגם צילום מסך"
      },
      {
        "id": "pack-0-2",
        "labelEn": "רישיון נהיגה ישראלי + בינלאומי",
        "labelHe": "רישיון נהיגה ישראלי + בינלאומי"
      },
      {
        "id": "pack-0-3",
        "labelEn": "כרטיס אשראי של הנהג הראשי",
        "labelHe": "כרטיס אשראי של הנהג הראשי",
        "noteEn": "לפיקדון בדלפק הרכב",
        "noteHe": "לפיקדון בדלפק הרכב"
      },
      {
        "id": "pack-0-4",
        "labelEn": "שובר Rentalcars + פוליסת RentalCover",
        "labelHe": "שובר Rentalcars + פוליסת RentalCover"
      },
      {
        "id": "pack-0-5",
        "labelEn": "כרטיס PassportCard פיזי",
        "labelHe": "כרטיס PassportCard פיזי",
        "noteEn": "מסתיים ב-5814 · פוליסה 310823541",
        "noteHe": "מסתיים ב-5814 · פוליסה 310823541"
      },
      {
        "id": "pack-0-6",
        "labelEn": "3 אישורי לינה",
        "labelHe": "3 אישורי לינה",
        "noteEn": "Maladinovo · Ždiar 451 · Hilton KRK",
        "noteHe": "Maladinovo · Ždiar 451 · Hilton KRK"
      },
      {
        "id": "pack-0-7",
        "labelEn": "כרטיסי Gopass + PIN ל-Bešeňová",
        "labelHe": "כרטיסי Gopass + PIN ל-Bešeňová",
        "noteEn": "4 כרטיסים, PIN נפרד לכל אחד",
        "noteHe": "4 כרטיסים, PIN נפרד לכל אחד"
      },
      {
        "id": "pack-0-8",
        "labelEn": "כרטיסי Bachledka",
        "labelHe": "כרטיסי Bachledka",
        "noteEn": "Order 204-R9C1GY5 · SP526YJ45XY2",
        "noteHe": "Order 204-R9C1GY5 · SP526YJ45XY2"
      },
      {
        "id": "pack-0-9",
        "labelEn": "וואוצ'ר Chochołowskie Termy",
        "labelHe": "וואוצ'ר Chochołowskie Termy",
        "noteEn": "GYGWZAV7Z7Z3 · PIN /p5yNjCG",
        "noteHe": "GYGWZAV7Z7Z3 · PIN /p5yNjCG"
      },
      {
        "id": "pack-0-10",
        "labelEn": "אישור רפטינג MARIA",
        "labelHe": "אישור רפטינג MARIA"
      },
      {
        "id": "pack-0-11",
        "labelEn": "כרטיסי Energylandia + Tatralandia",
        "labelHe": "כרטיסי Energylandia + Tatralandia"
      },
      {
        "id": "pack-0-12",
        "labelEn": "Energy Pass מודפס",
        "labelHe": "Energy Pass מודפס",
        "noteEn": "רק אם קונים — חובה מודפס, לא מסך",
        "noteHe": "רק אם קונים — חובה מודפס, לא מסך"
      },
      {
        "id": "pack-0-13",
        "labelEn": "מזומן ביורו וגם בזלוטי",
        "labelHe": "מזומן ביורו וגם בזלוטי",
        "noteEn": "חניונים, דוכנים ושירותים ציבוריים בפולין",
        "noteHe": "חניונים, דוכנים ושירותים ציבוריים בפולין"
      },
      {
        "id": "pack-0-14",
        "labelEn": "אישור e-vignette סלובקית",
        "labelHe": "אישור e-vignette סלובקית",
        "noteEn": "רק דרך eZnamka הרשמי, אם לא כלול ברכב",
        "noteHe": "רק דרך eZnamka הרשמי, אם לא כלול ברכב"
      },
      {
        "id": "pack-0-15",
        "labelEn": "צילומי מסך אופליין של כל ה-QR",
        "labelHe": "צילומי מסך אופליין של כל ה-QR"
      }
    ]
  },
  {
    "id": "sec-1",
    "titleEn": "Mountain bag",
    "titleHe": "תיק הרים",
    "subtitleEn": "Chopok · Skalnate · Bachledka · Hrebienok days",
    "subtitleHe": "20/8 Chopok · 22/8 Skalnaté pleso · 24/8 Bachledka · 26/8 Hrebienok",
    "items": [
      {
        "id": "pack-1-0",
        "labelEn": "מעיל רוח/גשם קל × 4",
        "labelHe": "מעיל רוח/גשם קל × 4"
      },
      {
        "id": "pack-1-1",
        "labelEn": "שכבה חמה אמיתית × 4",
        "labelHe": "שכבה חמה אמיתית × 4",
        "noteEn": "בפסגת Chopok נמדדו 6°C באוגוסט — לא קפוצ'ון סמלי",
        "noteHe": "בפסגת Chopok נמדדו 6°C באוגוסט — לא קפוצ'ון סמלי"
      },
      {
        "id": "pack-1-2",
        "labelEn": "כובעים דקים לילדים",
        "labelHe": "כובעים דקים לילדים"
      },
      {
        "id": "pack-1-3",
        "labelEn": "כפפות דקות × 4",
        "labelHe": "כפפות דקות × 4"
      },
      {
        "id": "pack-1-4",
        "labelEn": "קרם הגנה SPF 50 + משקפי שמש",
        "labelHe": "קרם הגנה SPF 50 + משקפי שמש"
      },
      {
        "id": "pack-1-5",
        "labelEn": "בקבוק מים לכל אחד",
        "labelHe": "בקבוק מים לכל אחד"
      },
      {
        "id": "pack-1-6",
        "labelEn": "חטיפי אנרגיה",
        "labelHe": "חטיפי אנרגיה"
      },
      {
        "id": "pack-1-7",
        "labelEn": "פאוור בנק",
        "labelHe": "פאוור בנק",
        "noteEn": "כרטיסי Gopass ומצלמות בטלפון",
        "noteHe": "כרטיסי Gopass ומצלמות בטלפון"
      }
    ]
  },
  {
    "id": "sec-2",
    "titleEn": "Canyons & caves bag",
    "titleHe": "תיק קניונים ומערות",
    "subtitleEn": "Diery · Dobsinska + Sucha Bela · Belianska",
    "subtitleHe": "19/8 Diery · 21/8 Dobšinská + Suchá Belá · 26/8 Belianska",
    "items": [
      {
        "id": "pack-2-0",
        "labelEn": "נעלי הליכה עם אחיזה × 4",
        "labelHe": "נעלי הליכה עם אחיזה × 4",
        "noteEn": "לא נעלי ריצה חלקות — עץ רטוב, סלעים ומדרכי מתכת",
        "noteHe": "לא נעלי ריצה חלקות — עץ רטוב, סלעים ומדרכי מתכת"
      },
      {
        "id": "pack-2-1",
        "labelEn": "4 סטים גרביים יבשות לרכב",
        "labelHe": "4 סטים גרביים יבשות לרכב"
      },
      {
        "id": "pack-2-2",
        "labelEn": "כפפות דקות לאחיזה בסולמות",
        "labelHe": "כפפות דקות לאחיזה בסולמות"
      },
      {
        "id": "pack-2-3",
        "labelEn": "מעיל גשם",
        "labelHe": "מעיל גשם"
      },
      {
        "id": "pack-2-4",
        "labelEn": "1–1.5 ליטר מים לאדם",
        "labelHe": "1–1.5 ליטר מים לאדם",
        "noteEn": "ל-Suchá Belá ביום חם",
        "noteHe": "ל-Suchá Belá ביום חם"
      },
      {
        "id": "pack-2-5",
        "labelEn": "כריכים אמיתיים + חטיפים מלוחים",
        "labelHe": "כריכים אמיתיים + חטיפים מלוחים"
      },
      {
        "id": "pack-2-6",
        "labelEn": "ערכת עזרה ראשונה",
        "labelHe": "ערכת עזרה ראשונה"
      },
      {
        "id": "pack-2-7",
        "labelEn": "תרמיל קטן צמוד לגוף",
        "labelHe": "תרמיל קטן צמוד לגוף",
        "noteEn": "ידיים חייבות להישאר פנויות בסולמות",
        "noteHe": "ידיים חייבות להישאר פנויות בסולמות"
      },
      {
        "id": "pack-2-8",
        "labelEn": "פנס ראש",
        "labelHe": "פנס ראש"
      },
      {
        "id": "pack-2-9",
        "labelEn": "שכבה חמה למערות",
        "labelHe": "שכבה חמה למערות",
        "noteEn": "Dobšinská קרח · Belianska כ-6°C ו-800 מדרגות",
        "noteHe": "Dobšinská קרח · Belianska כ-6°C ו-800 מדרגות"
      },
      {
        "id": "pack-2-10",
        "labelEn": "מפות Mapy.com אופליין",
        "labelHe": "מפות Mapy.com אופליין",
        "noteEn": "אין קליטה סלולרית בתוך Suchá Belá",
        "noteHe": "אין קליטה סלולרית בתוך Suchá Belá"
      }
    ]
  },
  {
    "id": "sec-3",
    "titleEn": "Water bag",
    "titleHe": "תיק מים",
    "subtitleEn": "Water parks, rafting, Termy, Energylandia",
    "subtitleHe": "18/8 Tatralandia · 20/8 Bešeňová · 23/8 רפטינג · 25/8 Termy · 27/8 Energylandia",
    "items": [
      {
        "id": "pack-3-0",
        "labelEn": "2 סטים בגדי ים לכל אחד",
        "labelHe": "2 סטים בגדי ים לכל אחד"
      },
      {
        "id": "pack-3-1",
        "labelEn": "4 מגבות",
        "labelHe": "4 מגבות",
        "noteEn": "לא מסופקות בפארקי המים",
        "noteHe": "לא מסופקות בפארקי המים"
      },
      {
        "id": "pack-3-2",
        "labelEn": "כפכפים או נעלי מים עם סוליה לא חלקה",
        "labelHe": "כפכפים או נעלי מים עם סוליה לא חלקה",
        "noteEn": "הרצפות המקורות חלקות מאוד",
        "noteHe": "הרצפות המקורות חלקות מאוד"
      },
      {
        "id": "pack-3-3",
        "labelEn": "נעליים סגורות שיכולות להירטב לרפטינג",
        "labelHe": "נעליים סגורות שיכולות להירטב לרפטינג",
        "noteEn": "לא כפכפים פתוחים",
        "noteHe": "לא כפכפים פתוחים"
      },
      {
        "id": "pack-3-4",
        "labelEn": "שקיות אטומות לבגדים רטובים",
        "labelHe": "שקיות אטומות לבגדים רטובים"
      },
      {
        "id": "pack-3-5",
        "labelEn": "סט בגדים יבשים מלא לכל אחד",
        "labelHe": "סט בגדים יבשים מלא לכל אחד"
      },
      {
        "id": "pack-3-6",
        "labelEn": "רצועה למשקפיים",
        "labelHe": "רצועה למשקפיים",
        "noteEn": "לרפטינג",
        "noteHe": "לרפטינג"
      },
      {
        "id": "pack-3-7",
        "labelEn": "שמפו וסבון קטנים",
        "labelHe": "שמפו וסבון קטנים"
      },
      {
        "id": "pack-3-8",
        "labelEn": "מברשת שיער וגומיות",
        "labelHe": "מברשת שיער וגומיות"
      }
    ]
  },
  {
    "id": "sec-4",
    "titleEn": "Clothing — 12 days",
    "titleHe": "ביגוד — 12 ימים",
    "subtitleEn": "Per person · laundry available in both apartments",
    "subtitleHe": "לכל אחד מארבעת בני המשפחה · יש מכונת כביסה בשתי הדירות",
    "items": [
      {
        "id": "pack-4-0",
        "labelEn": "8 חולצות קצרות",
        "labelHe": "8 חולצות קצרות"
      },
      {
        "id": "pack-4-1",
        "labelEn": "4 מכנסיים קצרים",
        "labelHe": "4 מכנסיים קצרים"
      },
      {
        "id": "pack-4-2",
        "labelEn": "2 מכנסיים ארוכים",
        "labelHe": "2 מכנסיים ארוכים",
        "noteEn": "ימי הרים וערבים",
        "noteHe": "ימי הרים וערבים"
      },
      {
        "id": "pack-4-3",
        "labelEn": "12 הלבשה תחתונה",
        "labelHe": "12 הלבשה תחתונה"
      },
      {
        "id": "pack-4-4",
        "labelEn": "12 גרביים כולל גרבי הליכה עבות",
        "labelHe": "12 גרביים כולל גרבי הליכה עבות"
      },
      {
        "id": "pack-4-5",
        "labelEn": "2 פיג'מות",
        "labelHe": "2 פיג'מות"
      },
      {
        "id": "pack-4-6",
        "labelEn": "בגד חם לערבים בהרים",
        "labelHe": "בגד חם לערבים בהרים"
      },
      {
        "id": "pack-4-7",
        "labelEn": "נעלי יומיום נוחות",
        "labelHe": "נעלי יומיום נוחות"
      },
      {
        "id": "pack-4-8",
        "labelEn": "כובע רחב שוליים",
        "labelHe": "כובע רחב שוליים"
      }
    ]
  },
  {
    "id": "sec-5",
    "titleEn": "Electronics",
    "titleHe": "אלקטרוניקה",
    "subtitleEn": "Partner roaming pack · Type E/F sockets",
    "subtitleHe": "חבילת פרטנר 90GB פעילה מ-17/8 · שקעים Type E/F",
    "items": [
      {
        "id": "pack-5-0",
        "labelEn": "מטענים לכל הטלפונים",
        "labelHe": "מטענים לכל הטלפונים"
      },
      {
        "id": "pack-5-1",
        "labelEn": "2 פאוור בנקים",
        "labelHe": "2 פאוור בנקים"
      },
      {
        "id": "pack-5-2",
        "labelEn": "מטען USB לרכב עם 2 יציאות",
        "labelHe": "מטען USB לרכב עם 2 יציאות"
      },
      {
        "id": "pack-5-3",
        "labelEn": "מחזיק טלפון לרכב",
        "labelHe": "מחזיק טלפון לרכב"
      },
      {
        "id": "pack-5-4",
        "labelEn": "אוזניות לילדים לנסיעות",
        "labelHe": "אוזניות לילדים לנסיעות"
      },
      {
        "id": "pack-5-5",
        "labelEn": "טאבלט עם סרטים מוטמעים אופליין",
        "labelHe": "טאבלט עם סרטים מוטמעים אופליין"
      },
      {
        "id": "pack-5-6",
        "labelEn": "מתאמי שקע אירופאיים + מפצל",
        "labelHe": "מתאמי שקע אירופאיים + מפצל"
      },
      {
        "id": "pack-5-7",
        "labelEn": "מצלמה עמידה למים",
        "labelHe": "מצלמה עמידה למים",
        "noteEn": "רפטינג, מגלשות, Mountain Cart",
        "noteHe": "רפטינג, מגלשות, Mountain Cart"
      }
    ]
  },
  {
    "id": "sec-6",
    "titleEn": "Medication & first aid",
    "titleHe": "תרופות ועזרה ראשונה",
    "subtitleEn": "EU emergency 112 · mountain rescue HZS 18 300",
    "subtitleHe": "חירום אירופאי 112 · חילוץ הררי HZS 18 300",
    "items": [
      {
        "id": "pack-6-0",
        "labelEn": "אקמול ונורופן — מבוגרים וילדים",
        "labelHe": "אקמול ונורופן — מבוגרים וילדים"
      },
      {
        "id": "pack-6-1",
        "labelEn": "תרופות אישיות קבועות",
        "labelHe": "תרופות אישיות קבועות"
      },
      {
        "id": "pack-6-2",
        "labelEn": "תרופה לבחילות ומחלת נסיעה",
        "labelHe": "תרופה לבחילות ומחלת נסיעה",
        "noteEn": "כבישים מפותלים, רכבלים ומתקנים ב-Energylandia",
        "noteHe": "כבישים מפותלים, רכבלים ומתקנים ב-Energylandia"
      },
      {
        "id": "pack-6-3",
        "labelEn": "פלסטרים כולל פלסטר יבלות",
        "labelHe": "פלסטרים כולל פלסטר יבלות"
      },
      {
        "id": "pack-6-4",
        "labelEn": "קרם לשריפות שמש",
        "labelHe": "קרם לשריפות שמש"
      },
      {
        "id": "pack-6-5",
        "labelEn": "חומר דוחה יתושים + תחליב לגירודים",
        "labelHe": "חומר דוחה יתושים + תחליב לגירודים",
        "noteEn": "היער ב-Bachledka",
        "noteHe": "היער ב-Bachledka"
      },
      {
        "id": "pack-6-6",
        "labelEn": "תרופה לשלשולים ופרוביוטיקה",
        "labelHe": "תרופה לשלשולים ופרוביוטיקה"
      },
      {
        "id": "pack-6-7",
        "labelEn": "מדחום, פינצטה ומספריים",
        "labelHe": "מדחום, פינצטה ומספריים"
      },
      {
        "id": "pack-6-8",
        "labelEn": "ג'ל אלכוהול ומגבונים",
        "labelHe": "ג'ל אלכוהול ומגבונים"
      }
    ]
  },
  {
    "id": "sec-7",
    "titleEn": "Car & travel",
    "titleHe": "רכב ונסיעות",
    "subtitleEn": "~1,400 km · Poland–Slovakia border crossed often",
    "subtitleHe": "כ-1,400 ק״מ · חוצים גבול פולין–סלובקיה ארבע פעמים",
    "items": [
      {
        "id": "pack-7-0",
        "labelEn": "הורדת אזורי Mapy.com",
        "labelHe": "הורדת אזורי Mapy.com",
        "noteEn": "Liptov · Malá Fatra · Slovenský raj · Vysoké Tatry · Pieniny",
        "noteHe": "Liptov · Malá Fatra · Slovenský raj · Vysoké Tatry · Pieniny"
      },
      {
        "id": "pack-7-1",
        "labelEn": "שקיות אשפה וסל קטן לרכב",
        "labelHe": "שקיות אשפה וסל קטן לרכב"
      },
      {
        "id": "pack-7-2",
        "labelEn": "מגבונים לחים",
        "labelHe": "מגבונים לחים"
      },
      {
        "id": "pack-7-3",
        "labelEn": "שמיכה קלה וכריות צוואר לילדים",
        "labelHe": "שמיכה קלה וכריות צוואר לילדים"
      },
      {
        "id": "pack-7-4",
        "labelEn": "צידנית רכה קטנה",
        "labelHe": "צידנית רכה קטנה"
      },
      {
        "id": "pack-7-5",
        "labelEn": "לחלק את הציוד ל-4 תיקים נפרדים",
        "labelHe": "לחלק את הציוד ל-4 תיקים נפרדים",
        "noteEn": "הרים · קניונים · מים · מסמכים — מונע פתיחת מזוודות בחניה",
        "noteHe": "הרים · קניונים · מים · מסמכים — מונע פתיחת מזוודות בחניה"
      }
    ]
  },
  {
    "id": "sec-8",
    "titleEn": "Apartments & kitchen",
    "titleHe": "דירות ומטבח",
    "subtitleEn": "Maladinovo 5 nights · Zdiar 5 nights",
    "subtitleHe": "Maladinovo 5 לילות · Ždiar 5 לילות — מטבח מאובזר בשתיהן",
    "items": [
      {
        "id": "pack-8-0",
        "labelEn": "קפסולות כיבוס",
        "labelHe": "קפסולות כיבוס"
      },
      {
        "id": "pack-8-1",
        "labelEn": "שקיות זיפלוק בגדלים שונים",
        "labelHe": "שקיות זיפלוק בגדלים שונים"
      },
      {
        "id": "pack-8-2",
        "labelEn": "כלים לפיקניק ופותחן",
        "labelHe": "כלים לפיקניק ופותחן"
      },
      {
        "id": "pack-8-3",
        "labelEn": "מלח, פלפל, קפה ותה",
        "labelHe": "מלח, פלפל, קפה ותה"
      },
      {
        "id": "pack-8-4",
        "labelEn": "חטיפי בית לילדים",
        "labelHe": "חטיפי בית לילדים"
      },
      {
        "id": "pack-8-5",
        "labelEn": "קנייה גדולה ב-Tesco ליפטובסקי מיקולאש ביום הראשון",
        "labelHe": "קנייה גדולה ב-Tesco ליפטובסקי מיקולאש ביום הראשון",
        "noteEn": "שישיות מים, ארוחות בוקר וחטיפים למסלולים",
        "noteHe": "שישיות מים, ארוחות בוקר וחטיפים למסלולים"
      }
    ]
  },
  {
    "id": "sec-9",
    "titleEn": "Omer (11) & Rotem (8)",
    "titleHe": "עומר (11) ורותם (8)",
    "subtitleEn": "Height limits matter for slides and rides",
    "subtitleHe": "מגבלות גובה קובעות מה אפשר במגלשות ובמתקנים",
    "items": [
      {
        "id": "pack-9-0",
        "labelEn": "למדוד את שניהם עם נעליים לפני היציאה",
        "labelHe": "למדוד את שניהם עם נעליים לפני היציאה",
        "noteEn": "לסמן מראש אילו מגלשות ומתקנים מתאימים",
        "noteHe": "לסמן מראש אילו מגלשות ומתקנים מתאימים"
      },
      {
        "id": "pack-9-1",
        "labelEn": "תרמיל קטן לכל אחד עם מים וחטיף",
        "labelHe": "תרמיל קטן לכל אחד עם מים וחטיף"
      },
      {
        "id": "pack-9-2",
        "labelEn": "צמידי זיהוי עם מספר טלפון",
        "labelHe": "צמידי זיהוי עם מספר טלפון",
        "noteEn": "Energylandia ופארקי המים",
        "noteHe": "Energylandia ופארקי המים"
      },
      {
        "id": "pack-9-3",
        "labelEn": "בקבוק מים אישי עם שם",
        "labelHe": "בקבוק מים אישי עם שם"
      },
      {
        "id": "pack-9-4",
        "labelEn": "משחקי דרך, חוברות וסטיקרים",
        "labelHe": "משחקי דרך, חוברות וסטיקרים"
      },
      {
        "id": "pack-9-5",
        "labelEn": "צעצוע קטן אהוב לכל אחד",
        "labelHe": "צעצוע קטן אהוב לכל אחד"
      },
      {
        "id": "pack-9-6",
        "labelEn": "לזכור: עומר בטנדם ב-Mountain Cart",
        "labelHe": "לזכור: עומר בטנדם ב-Mountain Cart",
        "noteEn": "רכיבה יחידנית רק מגיל 12 — משקל משולב עד 130 ק״ג",
        "noteHe": "רכיבה יחידנית רק מגיל 12 — משקל משולב עד 130 ק״ג"
      }
    ]
  }
]

export const dayBagPlans: DayBagPlan[] = [
  {
    "date": "2026-08-17",
    "activityEn": "Arrival — flight, car desk, supermarket, Maladinovo",
    "activityHe": "הגעה — טיסה, דלפק רכב, סופר, מלאדינובו",
    "bagEn": "Documents bag (passports, boarding, rental 751370640, Maladinovo PIN 0910, PassportCard) + water multipacks after supermarket",
    "bagHe": "תיק מסמכים (דרכונים, עלייה, רכב 751370640, PIN מלאדינובו 0910, PassportCard) + שישיות מים אחרי הסופר"
  },
  {
    "date": "2026-08-18",
    "activityEn": "Tatralandia — יום מלא",
    "activityHe": "Tatralandia — יום מלא",
    "bagEn": "Water",
    "bagHe": "מים"
  },
  {
    "date": "2026-08-19",
    "activityEn": "Jánošíkove Diery + אטרקציה אחת",
    "activityHe": "Jánošíkove Diery + אטרקציה אחת",
    "bagEn": "Canyons",
    "bagHe": "קניונים"
  },
  {
    "date": "2026-08-20",
    "activityEn": "Chopok בבוקר, Bešeňová אחה״צ",
    "activityHe": "Chopok בבוקר, Bešeňová אחה״צ",
    "bagEn": "Mountain + water",
    "bagHe": "הרים + מים"
  },
  {
    "date": "2026-08-21",
    "activityEn": "Dobšinská Ice Cave + Suchá Belá",
    "activityHe": "Dobšinská Ice Cave + Suchá Belá",
    "bagEn": "Canyons + warm layer",
    "bagHe": "קניונים + שכבה חמה"
  },
  {
    "date": "2026-08-22",
    "activityEn": "מעבר, רכבלים, Mountain Cart",
    "activityHe": "מעבר, רכבלים, Mountain Cart",
    "bagEn": "Mountain",
    "bagHe": "הרים"
  },
  {
    "date": "2026-08-23",
    "activityEn": "רפטינג Dunajec + המנזר האדום",
    "activityHe": "רפטינג Dunajec + המנזר האדום",
    "bagEn": "Water — full dry set",
    "bagHe": "מים — סט יבש מלא"
  },
  {
    "date": "2026-08-24",
    "activityEn": "Bachledka — יום מלא",
    "activityHe": "Bachledka — יום מלא",
    "bagEn": "Mountain + mosquito repellent",
    "bagHe": "הרים + דוחה יתושים"
  },
  {
    "date": "2026-08-25",
    "activityEn": "Chochołowskie Termy + פולין",
    "activityHe": "Chochołowskie Termy + פולין",
    "bagEn": "Water + PLN cash",
    "bagHe": "מים + זלוטי"
  },
  {
    "date": "2026-08-26",
    "activityEn": "Belianska Cave + Hrebienok",
    "activityHe": "Belianska Cave + Hrebienok",
    "bagEn": "Canyons + mountain",
    "bagHe": "קניונים + הרים"
  },
  {
    "date": "2026-08-27",
    "activityEn": "Energylandia",
    "activityHe": "Energylandia",
    "bagEn": "Water + large drink supply",
    "bagHe": "מים + מלאי שתייה גדול"
  },
  {
    "date": "2026-08-28",
    "activityEn": "Departure — room sweep, fuel, car return, LY5120",
    "activityHe": "חזרה — בדיקת חדר, תדלוק, החזרת רכב, LY5120",
    "bagEn": "Documents bag only — passports, boarding passes, rental return voucher 751370640, PassportCard; chargers in cabin bag",
    "bagHe": "תיק מסמכים בלבד — דרכונים, כרטיסי עלייה, שובר החזרת רכב 751370640, PassportCard; מטענים בתיק היד"
  }
]

export const packingNonNegotiablesHe = [
  'כרטיס PassportCard הפיזי (מסתיים ב-5814)',
  'רישיון נהיגה בינלאומי ואישור מעבר גבול',
  'e-vignette רק דרך eZnamka הרשמי',
  'מדידת גובה של שני הילדים עם נעליים',
  'Energy Pass מודפס אם קונים',
  'מפות Mapy.com אופליין',
] as const

export const packingNonNegotiablesEn = [
  'Physical PassportCard (ends with 5814)',
  'International driving permit + border docs',
  'Slovak e-vignette only via official eZnamka',
  'Measure both kids height with shoes on',
  'Printed Energy Pass if purchased',
  'Offline Mapy.com maps',
] as const

export function packingProgress(checkedIds: ReadonlySet<string>): {
  total: number
  checked: number
  percent: number
} {
  const total = packingSections.reduce((sum, section) => sum + section.items.length, 0)
  const checked = packingSections.reduce(
    (sum, section) => sum + section.items.filter((item) => checkedIds.has(item.id)).length,
    0,
  )
  return {
    total,
    checked,
    percent: total === 0 ? 0 : Math.round((checked / total) * 100),
  }
}
