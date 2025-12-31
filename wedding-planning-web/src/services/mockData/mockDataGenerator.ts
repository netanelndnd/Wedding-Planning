/**
 * Mock Data Generator
 * יצירת נתונים מדומים בעברית לבדיקות
 */

import { Task, Guest, Vendor, Epic, Couple, Priority, TaskStatus } from '@/types';

// קטגוריות ספקים עם שמות בעברית
const VENDOR_CATEGORIES: Record<string, { name: string; vendors: string[] }> = {
  venue: {
    name: 'אולם',
    vendors: ['גן אירועים הגפן', 'אולמי הראל', 'אחוזת רוטשילד', 'אולמי נסיכות'],
  },
  photography: {
    name: 'צילום',
    vendors: ['סטודיו יניב', 'צילומי אור', 'מומנטים צילום', 'פוקוס הפקות'],
  },
  catering: {
    name: 'קייטרינג',
    vendors: ['קייטרינג גולדן', 'שף דוד', 'טעמים של פעם', 'קייטרינג לב'],
  },
  music: {
    name: 'מוזיקה',
    vendors: ['DJ יוסי', 'להקת הכוכבים', 'הפקות מוזיקה', 'DJ אלון'],
  },
  flowers: {
    name: 'פרחים',
    vendors: ['פרחי הגן', 'עיצוב פרחים שירה', 'פרחי נוי', 'הפרח הלבן'],
  },
  makeup: {
    name: 'איפור ושיער',
    vendors: ['סטודיו ביוטי', 'מייקאפ ענת', 'שיער ואיפור מיכל', 'ביוטי קליניק'],
  },
  dress: {
    name: 'שמלת כלה',
    vendors: ['בוטיק הכלה', 'שמלות כלה גאיה', 'סטודיו לבן', 'עיצובי כלה'],
  },
  suit: {
    name: 'חליפת חתן',
    vendors: ['חליפות VIP', 'סטייל גברים', 'האופנה לחתן', 'חליפות פרימיום'],
  },
};

// יחסי קרבה לאורחים
const GUEST_RELATIONSHIPS = ['משפחה', 'חברים', 'עבודה', 'צד החתן', 'צד הכלה', 'שכנים'];

// שמות בעברית
const HEBREW_MALE_NAMES = [
  'יוסי', 'דני', 'משה', 'אבי', 'רון', 'עומר', 'איתי', 'נועם', 'ליאור', 'גיל',
  'אורי', 'עידו', 'יונתן', 'דוד', 'אלון', 'תומר', 'ניר', 'שי', 'עמית', 'רועי',
];

const HEBREW_FEMALE_NAMES = [
  'שרה', 'רחל', 'מיכל', 'יעל', 'נוי', 'מאיה', 'ליה', 'תמר', 'עדי', 'שירה',
  'נועה', 'הדר', 'רוני', 'אורית', 'גלי', 'דנה', 'שני', 'מור', 'איילת', 'טל',
];

const HEBREW_LAST_NAMES = [
  'כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'אברהם', 'דהן', 'אזולאי', 'גבאי', 'שלום',
  'אוחיון', 'חדד', 'ישראלי', 'רוזנברג', 'פרידמן', 'גולדשטיין', 'שפירא', 'מלכה', 'אגבאריה', 'עמר',
];

/**
 * יצירת שם בעברית
 */
function generateHebrewName(isMale: boolean = Math.random() > 0.5): string {
  const firstNames = isMale ? HEBREW_MALE_NAMES : HEBREW_FEMALE_NAMES;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = HEBREW_LAST_NAMES[Math.floor(Math.random() * HEBREW_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

/**
 * יצירת מספר טלפון ישראלי
 */
function generatePhone(): string {
  const prefixes = ['050', '052', '053', '054', '058'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}-${number}`;
}

/**
 * יצירת אימייל
 */
function generateEmail(name: string): string {
  const cleanName = name.replace(/\s/g, '.').toLowerCase();
  const transliterated = cleanName
    .replace(/[\u0590-\u05FF]/g, (c) => {
      const map: Record<string, string> = {
        'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
        'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
        'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'f',
        'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
      };
      return map[c] || c;
    });
  const domains = ['gmail.com', 'walla.co.il', 'hotmail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${transliterated}${Math.floor(Math.random() * 100)}@${domain}`;
}

// הגדרות כמויות
export interface MockDataConfig {
  guestCount?: number;
  vendorCount?: number;
  taskCount?: number;
  epicCount?: number;
}

/**
 * יצירת נתוני זוג
 */
export function generateMockCouple(userId: string): Couple {
  const maleName = HEBREW_MALE_NAMES[Math.floor(Math.random() * HEBREW_MALE_NAMES.length)];
  const femaleName = HEBREW_FEMALE_NAMES[Math.floor(Math.random() * HEBREW_FEMALE_NAMES.length)];

  // תאריך חתונה בעוד 3-12 חודשים
  const weddingDate = new Date();
  weddingDate.setMonth(weddingDate.getMonth() + 3 + Math.floor(Math.random() * 9));

  return {
    id: userId,
    partner1Name: maleName,
    partner2Name: femaleName,
    weddingDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * יצירת אפיקים
 */
export function generateMockEpics(coupleId: string, count: number = 4): Epic[] {
  const categories = [
    { title: 'הכנות ראשוניות', category: 'preparation', color: '#6D28D9' },
    { title: 'ספקים ואירוע', category: 'vendors', color: '#BE185D' },
    { title: 'אורחים והזמנות', category: 'guests', color: '#D4AF37' },
    { title: 'לבוש ומראה', category: 'attire', color: '#87A878' },
    { title: 'לוגיסטיקה', category: 'logistics', color: '#2563EB' },
    { title: 'מוזיקה ובידור', category: 'entertainment', color: '#DC2626' },
  ];

  return categories.slice(0, count).map((cat, index) => ({
    id: `epic-${coupleId}-${index}`,
    coupleId,
    title: cat.title,
    category: cat.category,
    color: cat.color,
    order: index,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * יצירת משימות
 */
export function generateMockTasks(coupleId: string, epics: Epic[], count: number = 12): Task[] {
  const taskTemplates = [
    { title: 'לבחור אולם אירועים', priority: 'high' as Priority, category: 'venue' },
    { title: 'להזמין צלם', priority: 'high' as Priority, category: 'photography' },
    { title: 'לסגור קייטרינג', priority: 'high' as Priority, category: 'catering' },
    { title: 'לבחור DJ או להקה', priority: 'medium' as Priority, category: 'music' },
    { title: 'להזמין פרחים', priority: 'medium' as Priority, category: 'flowers' },
    { title: 'לקבוע מאפרת', priority: 'medium' as Priority, category: 'makeup' },
    { title: 'לבחור שמלת כלה', priority: 'high' as Priority, category: 'dress' },
    { title: 'לבחור חליפה לחתן', priority: 'high' as Priority, category: 'suit' },
    { title: 'לתאם רב מסדר קידושין', priority: 'high' as Priority, category: 'rabbi' },
    { title: 'להזמין הזמנות', priority: 'medium' as Priority, category: 'invitation' },
    { title: 'לשלוח הזמנות', priority: 'medium' as Priority, category: 'invitation' },
    { title: 'לאסוף אישורי הגעה', priority: 'low' as Priority, category: 'guests' },
    { title: 'לבחור עוגת חתונה', priority: 'low' as Priority, category: 'catering' },
    { title: 'לתכנן ירח דבש', priority: 'low' as Priority, category: 'honeymoon' },
    { title: 'לסדר הסעות', priority: 'medium' as Priority, category: 'logistics' },
  ];

  const statuses: TaskStatus[] = ['pending', 'in-progress', 'completed'];

  return taskTemplates.slice(0, count).map((template, index) => {
    const status = statuses[Math.floor(Math.random() * 3)];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (index + 1) * 7);

    return {
      id: `task-${coupleId}-${index}`,
      coupleId,
      epicId: epics[index % epics.length].id,
      title: template.title,
      description: `תיאור עבור: ${template.title}`,
      category: template.category,
      priority: template.priority,
      status,
      dueDate,
      completedAt: status === 'completed' ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

/**
 * יצירת אורחים
 */
export function generateMockGuests(coupleId: string, count: number = 50): Guest[] {
  const rsvpStatuses: ('invited' | 'accepted' | 'declined' | 'pending')[] = [
    'invited', 'accepted', 'declined', 'pending',
  ];

  return Array.from({ length: count }, (_, index) => {
    const isMale = Math.random() > 0.5;
    const name = generateHebrewName(isMale);
    const rsvpStatus = rsvpStatuses[Math.floor(Math.random() * 4)];

    return {
      id: `guest-${coupleId}-${index}`,
      coupleId,
      name,
      email: generateEmail(name),
      phone: generatePhone(),
      relationship: GUEST_RELATIONSHIPS[Math.floor(Math.random() * GUEST_RELATIONSHIPS.length)],
      plusOne: Math.floor(Math.random() * 3),
      rsvpStatus,
      notes: Math.random() > 0.8 ? 'צמחוני' : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

/**
 * יצירת ספקים
 */
export function generateMockVendors(coupleId: string, count: number = 8): Vendor[] {
  const categories = Object.entries(VENDOR_CATEGORIES);

  return categories.slice(0, count).map(([key, value], index) => {
    const vendorName = value.vendors[Math.floor(Math.random() * value.vendors.length)];
    const price = Math.floor(Math.random() * 50000) + 5000;

    return {
      id: `vendor-${coupleId}-${index}`,
      coupleId,
      name: vendorName,
      category: key,
      phone: generatePhone(),
      email: generateEmail(vendorName),
      price,
      actualPrice: Math.random() > 0.5 ? price + Math.floor(Math.random() * 2000) - 1000 : undefined,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5 כוכבים
      isSelected: Math.random() > 0.5,
      notes: Math.random() > 0.7 ? 'הערות על הספק' : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}
