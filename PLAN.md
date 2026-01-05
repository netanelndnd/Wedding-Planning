# תכנית MVP - מערכת תכנון חתונה

## סיכום דרישות

### טכנולוגיות
- **Framework**: Next.js 14+ עם App Router
- **Styling**: Tailwind CSS בלבד
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth עם אימות מייל
- **שפה**: עברית בלבד (RTL)
- **מיקום**: תיקיית `wedding-planning-web` (מחיקת קוד קיים)

### משתמשים
- Multi-tenant (הרבה זוגות)
- משתמש אחד לזוג
- Toggle חתן/כלה בראש המסך

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
interface Couple {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: Date;
  targetBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

// types/epic.ts
interface Epic {
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
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
type AssignedTo = 'partner1' | 'partner2' | 'both';

interface Task {
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
type RsvpStatus = 'attending' | 'not-attending' | 'maybe' | 'pending';

interface Guest {
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
3. התקנת dependencies: firebase, tailwindcss
4. הגדרת Tailwind עם RTL
5. הגדרת Firebase connection
6. יצירת Types בסיסיים

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
2. `src/lib/constants.ts` - קטגוריות ברירת מחדל
3. `src/types/index.ts` - כל ה-Types
4. `src/services/interfaces/index.ts` - כל הממשקים
5. `src/services/firebase/index.ts` - מימושי Services
6. `src/hooks/useAuth.ts` - Hook אימות
7. `src/hooks/usePartner.ts` - Hook toggle חתן/כלה
8. `firestore.rules` - כללי אבטחה

---

## הערות נוספות

- **לא ב-MVP**: ניהול ספקים, ייבוא אורחים מאקסל, גרפים מתקדמים
- **RTL**: להגדיר `dir="rtl"` ב-layout הראשי
- **Responsive**: Mobile-first design
- **אימות מייל**: Firebase sendEmailVerification
- **תזכורות**: Firebase Cloud Functions עם scheduled triggers
