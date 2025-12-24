# תוכנית: ארגון מחדש של תיקיית Services

## סיכום
ארגון מחדש של תיקיית `services` עם הפרדה בין interfaces ל-implementations, כולל יצירת שירותי Authentication ו-User CRUD חדשים.

---

## Firebase Config

```typescript
const DATABASE_NAME = "weddingdatabase123";
const PROJECT_ID = "wedding-planning-app-bf437";

import { getFirestore } from 'firebase/firestore';
const db = getFirestore(app, DATABASE_NAME);
```

---

## מבנה Firestore Collections

```
users/{userId}
  - email: string
  - displayName: string
  - photoURL?: string
  - coupleId?: string
  - createdAt: Timestamp
  - updatedAt: Timestamp

couples/{coupleId}
  - partner1Name: string
  - partner2Name: string
  - weddingDate: Timestamp
  - createdAt: Timestamp
  - updatedAt: Timestamp

tasks/{taskId}
  - coupleId: string
  - epicId: string
  - title: string
  - description?: string
  - category: string
  - priority: 'low' | 'medium' | 'high'
  - status: 'pending' | 'in_progress' | 'completed'
  - dueDate?: Timestamp
  - completedAt?: Timestamp
  - assignedTo?: string
  - createdAt: Timestamp
  - updatedAt: Timestamp

epics/{epicId}
  - coupleId: string
  - title: string
  - description?: string
  - category: string
  - color?: string
  - order: number
  - createdAt: Timestamp
  - updatedAt: Timestamp

vendors/{vendorId}
  - coupleId: string
  - name: string
  - category: string
  - phone?: string
  - email?: string
  - website?: string
  - address?: string
  - price?: number
  - rating?: number
  - notes?: string
  - isSelected: boolean
  - createdAt: Timestamp
  - updatedAt: Timestamp

guests/{guestId}
  - coupleId: string
  - name: string
  - email?: string
  - phone?: string
  - relationship?: string
  - plusOne: boolean
  - rsvpStatus: 'invited' | 'accepted' | 'declined' | 'pending'
  - mealPreference?: string
  - notes?: string
  - createdAt: Timestamp
  - updatedAt: Timestamp

settings/{coupleId}
  - theme: 'light' | 'dark'
  - language: 'he' | 'en'
  - notifications: boolean
  - updatedAt: Timestamp
```

---

## מבנה התיקיות החדש

```
src/services/
├── index.ts
├── factory.ts
├── interfaces/
│   ├── index.ts
│   ├── IAuthService.ts
│   ├── IUserService.ts
│   ├── ICoupleService.ts
│   ├── ITaskService.ts
│   ├── IEpicService.ts
│   ├── IVendorService.ts
│   └── IGuestService.ts
├── implementations/
│   ├── index.ts
│   ├── firestore/
│   │   ├── index.ts
│   │   ├── AuthService.ts
│   │   ├── UserService.ts
│   │   ├── CoupleService.ts
│   │   ├── TaskService.ts
│   │   ├── EpicService.ts
│   │   ├── VendorService.ts
│   │   └── GuestService.ts
│   └── mock/
│       ├── index.ts
│       ├── mockData.ts
│       ├── MockAuthService.ts
│       ├── MockUserService.ts
│       ├── MockCoupleService.ts
│       ├── MockTaskService.ts
│       ├── MockEpicService.ts
│       ├── MockVendorService.ts
│       └── MockGuestService.ts
```

---

## שלבי המימוש

### שלב 1: יצירת ממשקים
- `IAuthService.ts` - register, login, logout, resetPassword, onAuthStateChanged
- `IUserService.ts` - getProfile, updateProfile, getSettings, updateSettings
- `ICoupleService.ts` - create, getById, update, subscribe, delete
- `ITaskService.ts` - create, getById, getAllByCoupleId, update, delete, subscribe
- `IEpicService.ts` - create, getById, getAllByCoupleId, update, delete, subscribe
- `IVendorService.ts` - create, getById, getAllByCoupleId, update, delete, subscribe
- `IGuestService.ts` - create, getById, getAllByCoupleId, update, delete, subscribe

### שלב 2: טיפוסים חדשים
```typescript
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  coupleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export type Unsubscribe = () => void;
```

### שלב 3: מימוש Firestore
- AuthService, UserService, CoupleService, TaskService, EpicService, VendorService, GuestService

### שלב 4: מימוש Mock
- mockData.ts + כל השירותים במימוש mock

### שלב 5: Factory + Exports
- factory.ts - בוחר בין mock לfirestore
- index.ts - barrel export

### שלב 6: עדכון hooks
- useAuth.ts, useDashboard.ts, useSignupForm.ts

### שלב 7: ניקוי
- מחיקת realtimeService.ts ו-firestoreService.ts

---

## קבצים לשינוי

| קובץ | פעולה |
|------|-------|
| `src/services/*` | יצירת מבנה חדש |
| `src/types/index.ts` | הוספת טיפוסים |
| `src/lib/firebase.ts` | עדכון database |
| `src/hooks/useAuth.ts` | עדכון |
| `src/hooks/useDashboard.ts` | עדכון |

---

## הערות
- Firestore בלבד
- ללא תאימות לאחור
- תמיכה ב-Mock Mode
- Database: `weddingdatabase123`
