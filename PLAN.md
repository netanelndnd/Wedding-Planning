<div dir="rtl">

# תכנית MVP - מערכת תכנון חתונה

## סיכום דרישות

### טכנולוגיות
| ספרייה | גרסה | תפקיד |
|--------|------|-------|
| Next.js | 15+ | Framework עם App Router |
| Tailwind CSS | 4 | עיצוב עם תמיכה ב-RTL |
| Firebase | 11+ | Auth + Firestore |
| react-firebase-hooks | 5.1+ | Hooks ל-Firebase |
| TypeScript | 5+ | Type Safety |

### משתמשים
- Multi-tenant (הרבה זוגות)
- משתמש אחד לזוג
- Toggle חתן/כלה בראש המסך

---

## איך כל ספרייה תמומש (הסבר פשוט)

### 1. Next.js 15 - App Router

**מה זה:** מערכת ניתוב מבוססת תיקיות. כל תיקייה = נתיב באתר.

**איך זה עובד:**
```
src/app/
├── page.tsx           →  www.site.com/
├── login/page.tsx     →  www.site.com/login
├── dashboard/page.tsx →  www.site.com/dashboard
└── invite/[id]/page.tsx → www.site.com/invite/abc123
```

**דברים חשובים:**
- **Server Components** (ברירת מחדל) - רצים בשרת, טובים לטעינת נתונים
- **Client Components** - מתחילים עם `'use client'`, משמשים ל-hooks ואינטראקציה
- **Layout** - עוטף דפים, נשאר קבוע בין ניווטים (טוב ל-Header, Sidebar)

**דוגמה:**
```tsx
// src/app/dashboard/page.tsx
import { TaskList } from '@/components/tasks/TaskList';

export default function DashboardPage() {
  return (
    <main>
      <h1>הדשבורד שלי</h1>
      <TaskList />  {/* קומפוננטת Client */}
    </main>
  );
}
```

### 2. Firebase Auth - אימות משתמשים

**מה זה:** מערכת הרשמה והתחברות מוכנה של Google.

**איך זה עובד:**
1. משתמש נרשם עם אימייל וסיסמה
2. Firebase שולח מייל אימות
3. משתמש לוחץ על הלינק במייל
4. החשבון מאומת ואפשר להתחבר

**הפונקציות העיקריות (Firebase v11 Modular):**
```typescript
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';

const auth = getAuth(app);

// הרשמה
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await sendEmailVerification(userCredential.user);

// התחברות
await signInWithEmailAndPassword(auth, email, password);

// בדיקה אם מאומת
if (user.emailVerified) { /* מאושר */ }

// שכחתי סיסמה
await sendPasswordResetEmail(auth, email);

// התנתקות
await signOut(auth);
```

**⚠️ חשוב (2025):**
- localhost לא מורשה כברירת מחדל - צריך להוסיף ידנית ב-Firebase Console
- Firebase Dynamic Links נסגר באוגוסט 2025 - להשתמש ב-actionCodeSettings

### 3. Firebase Firestore - בסיס נתונים

**מה זה:** בסיס נתונים NoSQL בזמן אמת.

**איך זה עובד:**
- הנתונים מאורגנים ב-**Collections** (אוספים) ו-**Documents** (מסמכים)
- שינויים מתעדכנים אוטומטית בכל המכשירים

**הפונקציות העיקריות (Firebase v11 Modular):**
```typescript
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const db = getFirestore(app);

// הוספת מסמך
const docRef = await addDoc(collection(db, 'couples', coupleId, 'tasks'), {
  title: 'משימה חדשה',
  status: 'pending',
  createdAt: serverTimestamp()
});

// קריאת מסמך בודד
const docSnap = await getDoc(doc(db, 'couples', coupleId));
if (docSnap.exists()) {
  const data = docSnap.data();
}

// Query עם פילטרים
const q = query(
  collection(db, 'couples', coupleId, 'tasks'),
  where('status', '==', 'pending'),
  orderBy('dueDate')
);
const snapshot = await getDocs(q);

// עדכון מסמך
await updateDoc(doc(db, 'couples', coupleId, 'tasks', taskId), {
  status: 'completed',
  updatedAt: serverTimestamp()
});

// מחיקת מסמך
await deleteDoc(doc(db, 'couples', coupleId, 'tasks', taskId));

// האזנה בזמן אמת
const unsubscribe = onSnapshot(q, (snapshot) => {
  const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
```

### 4. react-firebase-hooks v5

**מה זה:** ספרייה שהופכת את Firebase לפשוט יותר עם React Hooks.

**התקנה:**
```bash
npm install react-firebase-hooks
```

**Hooks עיקריים:**
```typescript
// Auth Hooks
import { useAuthState } from 'react-firebase-hooks/auth';
const [user, loading, error] = useAuthState(auth);

// Firestore - קריאת אוסף בזמן אמת
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
const [snapshot, loading, error] = useCollection(tasksQuery);
// או עם המרה אוטומטית ל-data:
const [tasks, loading, error] = useCollectionData(tasksQuery, { idField: 'id' });

// Firestore - קריאת מסמך בודד
import { useDocument, useDocumentData } from 'react-firebase-hooks/firestore';
const [couple, loading, error] = useDocumentData(coupleRef);
```

**למה להשתמש בזה:**
- קוד פשוט יותר (10x פחות קוד)
- ניהול אוטומטי של loading ו-error
- ביטול אוטומטי של listeners כשהקומפוננטה נהרסת
- תמיכה מלאה ב-Firebase v9+ Modular SDK

### 5. Tailwind CSS v4 - עיצוב עם RTL

**מה זה:** ספריית CSS עם class-ים מוכנים.

**איך עושים RTL:**
```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
```

**כללי זהב ל-RTL - Logical Properties:**
| ❌ לא להשתמש | ✅ להשתמש במקום |
|-------------|-----------------|
| `ml-4` | `ms-4` (margin-start) |
| `mr-4` | `me-4` (margin-end) |
| `pl-4` | `ps-4` (padding-start) |
| `pr-4` | `pe-4` (padding-end) |
| `left-0` | `start-0` |
| `right-0` | `end-0` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `rounded-l-lg` | `rounded-s-lg` |
| `rounded-r-lg` | `rounded-e-lg` |

**דוגמה:**
```tsx
// ❌ לא טוב (לא יעבוד נכון ב-RTL)
<div className="ml-4 pl-2 text-left border-l-2">

// ✅ טוב (יעבוד בשתי הכיוונים)
<div className="ms-4 ps-2 text-start border-s-2">
```

**אם צריך התנהגות שונה ל-RTL:**
```tsx
<div className="ltr:ml-4 rtl:mr-4">
```

---

## פיצ'רים ל-MVP

### 1. אימות והרשמה
- הרשמה עם אימות מייל
- התחברות
- שכחתי סיסמה

### 2. פרופיל זוג
- שמות בני הזוג (חתן + כלה)
- תאריך החתונה
- תקציב יעד כולל לחתונה

### 3. קטגוריות (Epics)
- רשימה קבועה מראש:
  - צילום ווידאו
  - קייטרינג
  - אולם/מקום
  - מוזיקה ודי-ג'יי
  - שמלת כלה
  - חליפת חתן
  - פרחים ועיצוב
  - הזמנות
  - רבנות ואישורים
  - אחר
- אפשרות להוסיף קטגוריות חדשות
- תקציב יעד לכל קטגוריה (אופציונלי)

### 4. משימות (Tasks)
שדות:
- כותרת
- תיאור (אופציונלי)
- תאריך יעד
- אחראי: חתן / כלה / שניהם (ברירת מחדל: היוצר)
- עלות משוערת (אופציונלי)
- עלות בפועל (אופציונלי)
- סטטוס: ממתין / בתהליך / הושלם / בוטל
- הערות

### 5. ניהול אורחים (הרשמה עצמית)
- שליחת לינק ייחודי לזוג דרך WhatsApp
- האורח ממלא:
  - שם מלא
  - טלפון
  - כמה אנשים מגיעים
  - הערות
  - RSVP: מגיע / לא מגיע / אולי

### 6. דשבורד KPIs
- אחוז משימות שהושלמו
- תקציב: יעד מול בפועל (עם התראה על חריגה)
- פילוח לפי קטגוריות

### 7. תזכורות במייל
- סיכום שבועי של משימות השבוע הקרוב
- תזכורת יום לפני משימה שלא הושלמה

### 8. שיתוף
- לינק WhatsApp (wa.me) עם טקסט מוכן
- קובץ .ics לייצוא ללוח שנה

---

## מבנה Firestore

```
couples/{coupleId}
  - partner1Name: string
  - partner2Name: string
  - weddingDate: timestamp
  - targetBudget: number
  - createdAt: timestamp
  - updatedAt: timestamp

couples/{coupleId}/epics/{epicId}
  - title: string
  - icon: string
  - color: string
  - targetBudget: number (optional)
  - order: number
  - isDefault: boolean
  - createdAt: timestamp

couples/{coupleId}/tasks/{taskId}
  - epicId: string
  - title: string
  - description: string
  - dueDate: timestamp
  - assignedTo: 'partner1' | 'partner2' | 'both'
  - estimatedCost: number (optional)
  - actualCost: number (optional)
  - status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  - notes: string
  - createdAt: timestamp
  - updatedAt: timestamp

couples/{coupleId}/guests/{guestId}
  - name: string
  - phone: string
  - partySize: number
  - notes: string
  - rsvp: 'attending' | 'not-attending' | 'maybe' | 'pending'
  - createdAt: timestamp
```

---

## מבנה תיקיות

```
wedding-planning-web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # קבוצת דפי אימות
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/         # קבוצת דפים מאומתים
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── guests/
│   │   │   └── settings/
│   │   ├── invite/[coupleId]/   # דף הרשמת אורח (ציבורי)
│   │   ├── layout.tsx
│   │   ├── page.tsx             # דף נחיתה/הפניה
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                  # קומפוננטות UI בסיסיות
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── layout/              # קומפוננטות מבנה
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PartnerToggle.tsx
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   └── guests/
│   │
│   ├── services/                # שכבת לוגיקה
│   │   ├── interfaces/          # ממשקים
│   │   │   ├── IAuthService.ts
│   │   │   ├── ICoupleService.ts
│   │   │   ├── IEpicService.ts
│   │   │   ├── ITaskService.ts
│   │   │   ├── IGuestService.ts
│   │   │   └── index.ts
│   │   ├── firebase/            # מימושי Firebase
│   │   │   ├── authService.ts
│   │   │   ├── coupleService.ts
│   │   │   ├── epicService.ts
│   │   │   ├── taskService.ts
│   │   │   ├── guestService.ts
│   │   │   └── index.ts
│   │   └── index.ts             # ייצוא מרכזי
│   │
│   ├── hooks/                   # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useCouple.ts
│   │   ├── useTasks.ts
│   │   ├── useGuests.ts
│   │   └── usePartner.ts        # מנהל את ה-toggle
│   │
│   ├── types/                   # TypeScript Types
│   │   ├── couple.ts
│   │   ├── epic.ts
│   │   ├── task.ts
│   │   ├── guest.ts
│   │   └── index.ts
│   │
│   ├── lib/                     # הגדרות וקונפיגורציה
│   │   ├── firebase.ts
│   │   ├── logger.ts            # לוגר מרכזי
│   │   └── constants.ts         # קטגוריות, סטטוסים
│   │
│   └── utils/                   # פונקציות עזר
│       ├── formatDate.ts
│       ├── formatCurrency.ts
│       ├── generateIcs.ts
│       └── generateWhatsAppLink.ts
│
├── public/
├── firestore.rules
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## TypeScript Types

```typescript
// types/couple.ts
export interface Couple {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: Date;
  targetBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

// types/epic.ts
export interface Epic {
  id: string;
  coupleId: string;
  title: string;
  icon: string;
  color: string;
  targetBudget?: number;
  order: number;
  isDefault: boolean;
  createdAt: Date;
}

// types/task.ts
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type AssignedTo = 'partner1' | 'partner2' | 'both';

export interface Task {
  id: string;
  coupleId: string;
  epicId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  assignedTo: AssignedTo;
  estimatedCost?: number;
  actualCost?: number;
  status: TaskStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// types/guest.ts
export type RsvpStatus = 'attending' | 'not-attending' | 'maybe' | 'pending';

export interface Guest {
  id: string;
  coupleId: string;
  name: string;
  phone: string;
  partySize: number;
  notes?: string;
  rsvp: RsvpStatus;
  createdAt: Date;
}
```

---

## שלבי ביצוע

### שלב 1: הקמת תשתית
1. מחיקת קוד קיים (שמירת `.env.local` ו-`firebase.json`)
2. יצירת פרויקט Next.js חדש עם App Router
3. התקנת dependencies: firebase, tailwindcss, react-firebase-hooks
4. הגדרת Tailwind עם RTL
5. הגדרת Firebase connection
6. יצירת Types בסיסיים
7. יצירת לוגר מרכזי

### שלב 2: אימות
1. מימוש AuthService interface
2. דף הרשמה עם אימות מייל
3. דף התחברות
4. דף שכחתי סיסמה
5. useAuth hook
6. Protected routes middleware

### שלב 3: פרופיל זוג
1. מימוש CoupleService
2. דף הגדרות ראשוניות (אחרי הרשמה)
3. עריכת פרטי זוג
4. PartnerToggle component

### שלב 4: קטגוריות ומשימות
1. מימוש EpicService
2. מימוש TaskService
3. דף משימות עם תצוגת קטגוריות
4. טופס יצירת/עריכת משימה
5. שינוי סטטוס משימה

### שלב 5: דשבורד
1. קומפוננטות KPI
2. חישוב אחוזים והתקדמות
3. סיכום תקציב
4. גרף פילוח לפי קטגוריות

### שלב 6: אורחים
1. מימוש GuestService
2. דף ציבורי להרשמת אורחים
3. דף ניהול רשימת אורחים
4. יצירת לינק WhatsApp לשיתוף

### שלב 7: שיתוף ותזכורות
1. יצירת קובץ .ics
2. Firebase Cloud Functions לתזכורות מייל
3. שיתוף משימה ב-WhatsApp

### שלב 8: אבטחה וגימור
1. Firestore Security Rules
2. טיפול בשגיאות
3. בדיקות ידניות
4. UI/UX polish

---

## קבצים קריטיים ליצירה

1. `src/lib/firebase.ts` - חיבור Firebase
2. `src/lib/logger.ts` - לוגר מרכזי
3. `src/lib/constants.ts` - קטגוריות ברירת מחדל
4. `src/types/index.ts` - כל ה-Types
5. `src/services/interfaces/index.ts` - כל הממשקים
6. `src/services/firebase/index.ts` - מימושי Services
7. `src/hooks/useAuth.ts` - Hook אימות
8. `src/hooks/usePartner.ts` - Hook toggle חתן/כלה
9. `firestore.rules` - כללי אבטחה

---

## לוגר (Logging)

### מבנה
```
src/lib/logger.ts    # לוגר מרכזי
```

### רמות לוג
- **ERROR** - שגיאות קריטיות
- **WARN** - אזהרות
- **INFO** - פעולות משמעותיות
- **DEBUG** - לפיתוח בלבד (לא ב-production)

### היכן לשים לוגים (בלי להגזים)

**Services - פעולות CRUD:**
- `INFO` - יצירה/עדכון/מחיקה מוצלחים
- `ERROR` - כשלון בפעולה

**Auth:**
- `INFO` - התחברות/התנתקות/הרשמה
- `WARN` - ניסיון התחברות כושל
- `ERROR` - שגיאת אימות

**Pages:**
- `INFO` - טעינת דף ראשונית (רק דפים מרכזיים)
- `ERROR` - שגיאה בטעינת נתונים

### דוגמת מימוש
```typescript
// src/lib/logger.ts
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

const isDev = process.env.NODE_ENV === 'development';

function log(level: LogLevel, message: string, data?: Record<string, any>) {
  if (level === 'DEBUG' && !isDev) return;

  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...data };

  switch (level) {
    case 'ERROR':
      console.error(logEntry);
      break;
    case 'WARN':
      console.warn(logEntry);
      break;
    default:
      console.log(logEntry);
  }
}

export const logger = {
  error: (message: string, data?: Record<string, any>) => log('ERROR', message, data),
  warn: (message: string, data?: Record<string, any>) => log('WARN', message, data),
  info: (message: string, data?: Record<string, any>) => log('INFO', message, data),
  debug: (message: string, data?: Record<string, any>) => log('DEBUG', message, data),
};

// בשימוש:
logger.info('Task created', { taskId, coupleId });
logger.error('Failed to create task', { error: error.message, coupleId });
```

### כללים
- ❌ לא לוגים בכל רנדור
- ❌ לא לוגים בתוך לולאות
- ❌ לא מידע רגיש (סיסמאות, טוקנים)
- ✅ לוגים רק בפעולות משמעותיות
- ✅ תמיד לכלול context (userId, coupleId)

---

## עקרונות עיצוב (Design Principles)

### Don Norman's Fundamentals
יישום 6 העקרונות:
- **Affordances** - פונקציונליות ברורה
- **Signifiers** - רמזים היכן לפעול
- **Mapping** - פריסה אינטואיטיבית
- **Feedback** - תגובה מיידית לכל פעולה
- **Constraints** - מניעת שגיאות
- **Conceptual Model** - מודל מנטלי ברור למשתמש

### Gestalt Laws
- **Proximity & Similarity** - קיבוץ אלמנטים קשורים
- **Common Region** - שימוש במסגרות לקיבוץ
- **Continuity** - הנחיית העין של המשתמש

### Visual Hierarchy & Figure-Ground
- הבחנה ברורה בין אלמנטים פעילים לרקע
- שימוש בצללים ועומק
- ניגודיות גבוהה לפעולות קריטיות

### Error Prevention & Recovery
- **Poka-yoke** - מניעת שגיאות לפני שקורות
- כפתורי "בטל" ו"חזור" לכל פעולה הרסנית
- אישור לפני מחיקות

### Recognition over Recall
- כל המידע הנדרש למשימה גלוי על המסך
- אין צורך לזכור מסכים קודמים
- תוויות ברורות בכל מקום

### Systemic Design & Accessibility
- **8pt Grid System** - מערכת ריווח קבועה
- **WCAG 2.1** - ניגודיות ו-ARIA labels
- **Responsive** - עקביות בכל גדלי המסך

### Fitts's Law
- אזורי לחיצה גדולים מספיק (מינימום 44px)
- כפתורים במיקום אסטרטגי
- מזעור מרחק תנועה לפעולות נפוצות

---

## הערות נוספות

- **לא ב-MVP**: ניהול ספקים, ייבוא אורחים מאקסל, גרפים מתקדמים
- **RTL**: להגדיר `dir="rtl"` ב-layout הראשי
- **Responsive**: Mobile-first design
- **אימות מייל**: Firebase sendEmailVerification
- **תזכורות**: Firebase Cloud Functions עם scheduled triggers

</div>
