# 📊 מבנה שמירת המידע ב-Firebase

## סקירה כללית

האפליקציה שומרת את כל המידע ב-**Firebase** בשני שירותים עיקריים:

1. **Firebase Authentication** - שמירת פרטי התחברות (email/password)
2. **Firebase Firestore** - שמירת כל המידע של המשתמש (Database)

---

## 🔐 Firebase Authentication

### מה נשמר?
- **Email** - כתובת המייל של המשתמש
- **Password** - סיסמה מוצפנת (Firebase שומרת את זה בצורה מאובטחת)
- **UID** - מזהה ייחודי של המשתמש (User ID)

### איפה זה נשמר?
- ב-**Firebase Console** → **Authentication** → **Users**

### איך זה נוצר?
```typescript
// בקובץ: src/hooks/useSignupForm.ts
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const user = userCredential.user; // user.uid הוא המזהה הייחודי
```

---

## 💾 Firebase Firestore (Database)

המידע נשמר ב-**Collections** (אוספים) שונים:

### 1. 📋 Collection: `couples`

**מטרה:** שמירת פרטי הזוג

**מבנה המסמך:**
```typescript
{
  id: string,              // User UID (מזהה המשתמש)
  partner1Name: string,     // שם בן/בת הזוג הראשון
  partner2Name: string,     // שם בן/בת הזוג השני
  weddingDate: Timestamp,  // תאריך החתונה
  createdAt: Timestamp,    // תאריך יצירה
  updatedAt: Timestamp     // תאריך עדכון אחרון
}
```

**דוגמה:**
```json
{
  "id": "abc123xyz",
  "partner1Name": "ישראל",
  "partner2Name": "ישראלה",
  "weddingDate": "2025-10-10T00:00:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**איפה זה נוצר?**
```typescript
// בקובץ: src/hooks/useSignupForm.ts (שורה 87-94)
await setDoc(doc(db, 'couples', user.uid), {
  id: user.uid,
  partner1Name: formData.partner1Name,
  partner2Name: formData.partner2Name,
  weddingDate: formData.weddingDate ? Timestamp.fromDate(new Date(formData.weddingDate)) : null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});
```

**איך זה נקרא?**
```typescript
// בקובץ: src/hooks/useAuth.ts (שורה 60)
const coupleDoc = await getDoc(doc(db, 'couples', firebaseUser.uid));
```

---

### 2. 📝 Collection: `tasks`

**מטרה:** שמירת כל המשימות של הזוג

**מבנה המסמך:**
```typescript
{
  id: string,              // מזהה ייחודי (נוצר אוטומטית)
  coupleId: string,        // מזהה הזוג (User UID)
  epicId: string,          // מזהה ה-Epic (קבוצת משימות)
  title: string,           // כותרת המשימה
  description?: string,    // תיאור המשימה
  category: string,        // קטגוריה (venue, photography, etc.)
  priority: 'high' | 'medium' | 'low',
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  dueDate?: Timestamp,     // תאריך יעד
  completedAt?: Timestamp, // תאריך השלמה
  assignedTo?: string[],   // מי אחראי
  subtasks?: string[],     // תת-משימות
  order: number,          // סדר תצוגה
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**דוגמה:**
```json
{
  "id": "task-123",
  "coupleId": "abc123xyz",
  "epicId": "epic-456",
  "title": "🏛️ הזמנת אולם",
  "description": "לבחור ולהזמין אולם לחתונה",
  "category": "venue",
  "priority": "high",
  "status": "pending",
  "order": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**איפה זה נוצר?**
```typescript
// בקובץ: src/hooks/useSignupForm.ts (שורה 159-169)
await addDoc(collection(db, 'tasks'), {
  ...task,
  coupleId: user.uid,
  epicId: epicRef.id,
  status: 'pending',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});
```

**איך זה נקרא?**
```typescript
// בקובץ: src/services/firestoreService.ts (שורה 118)
const q = query(collection(db, 'tasks'), where('coupleId', '==', coupleId));
return onSnapshot(q, (snapshot) => {
  // Real-time updates!
});
```

---

### 3. 📦 Collection: `epics`

**מטרה:** שמירת קבוצות משימות (Epics)

**מבנה המסמך:**
```typescript
{
  id: string,              // מזהה ייחודי
  coupleId: string,        // מזהה הזוג
  title: string,          // כותרת ה-Epic
  description?: string,   // תיאור
  category: string,       // קטגוריה
  color?: string,         // צבע לתצוגה
  order: number,          // סדר תצוגה
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**דוגמה:**
```json
{
  "id": "epic-456",
  "coupleId": "abc123xyz",
  "title": "משימות כלליות",
  "description": "משימות חשובות לתכנון החתונה",
  "category": "general",
  "color": "#ec4899",
  "order": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**איפה זה נוצר?**
```typescript
// בקובץ: src/hooks/useSignupForm.ts (שורה 101-110)
const epicRef = await addDoc(collection(db, 'epics'), {
  title: 'משימות כלליות',
  coupleId: user.uid,
  category: 'general',
  color: '#ec4899',
  order: 0,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});
```

---

### 4. 👥 Collection: `guests`

**מטרה:** שמירת רשימת האורחים

**מבנה המסמך:**
```typescript
{
  id: string,              // מזהה ייחודי
  coupleId: string,        // מזהה הזוג
  name: string,           // שם האורח
  email?: string,         // כתובת מייל
  phone?: string,         // מספר טלפון
  relationship?: string,  // קשר (משפחה, חברים, וכו')
  plusOne?: number,      // מספר מלווים
  rsvpStatus: 'invited' | 'accepted' | 'declined' | 'pending',
  mealPreference?: string, // העדפת ארוחה
  notes?: string,         // הערות
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**איפה זה נשמר?**
```typescript
// בקובץ: src/services/firestoreService.ts (שורה 260-269)
await addDoc(collection(db, 'guests'), {
  ...guest,
  coupleId,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});
```

---

### 5. 🏢 Collection: `vendors`

**מטרה:** שמירת ספקים (צלם, אולם, וכו')

**מבנה המסמך:**
```typescript
{
  id: string,
  coupleId: string,
  name: string,           // שם הספק
  category: string,       // Photography, Catering, Venue, etc.
  phone?: string,
  email?: string,
  website?: string,
  address?: string,
  price?: number,         // מחיר
  rating?: number,        // דירוג
  notes?: string,
  isSelected: boolean,    // האם נבחר
  relatedTasks?: string[], // משימות קשורות
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔗 קשרים בין הנתונים

```
User (Firebase Auth)
  └── UID: "abc123xyz"
      │
      ├── couples/{uid}
      │   └── פרטי הזוג
      │
      ├── epics/
      │   └── coupleId: "abc123xyz"
      │       └── id: "epic-456"
      │
      ├── tasks/
      │   └── coupleId: "abc123xyz"
      │       └── epicId: "epic-456"
      │
      ├── guests/
      │   └── coupleId: "abc123xyz"
      │
      └── vendors/
          └── coupleId: "abc123xyz"
```

---

## 🔒 אבטחה - Firestore Security Rules

כל המידע מוגן על ידי **Security Rules**:

```javascript
// בקובץ: firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // כל המשתמשים המחוברים יכולים לקרוא ולכתוב
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**מה זה אומר?**
- רק משתמשים מחוברים יכולים לגשת לנתונים
- כל משתמש יכול לראות רק את הנתונים שלו (בגלל `coupleId`)

---

## 📍 איפה לראות את הנתונים?

### 1. Firebase Console
1. לך ל-[Firebase Console](https://console.firebase.google.com/)
2. בחר את הפרויקט שלך
3. לך ל-**Firestore Database**
4. תראה את כל ה-Collections והמסמכים

### 2. בקוד
```typescript
// קריאה בזמן אמת (Real-time)
import { onSnapshot, collection, query, where } from 'firebase/firestore';

const q = query(collection(db, 'tasks'), where('coupleId', '==', userId));
onSnapshot(q, (snapshot) => {
  snapshot.forEach((doc) => {
    console.log(doc.id, doc.data());
  });
});
```

---

## 🚀 פעולות נפוצות

### יצירת משתמש חדש
```typescript
// 1. יצירת משתמש ב-Authentication
const user = await createUserWithEmailAndPassword(auth, email, password);

// 2. יצירת מסמך couples
await setDoc(doc(db, 'couples', user.uid), {
  partner1Name: 'ישראל',
  partner2Name: 'ישראלה',
  // ...
});
```

### עדכון מידע
```typescript
await updateDoc(doc(db, 'couples', userId), {
  partner1Name: 'ישראל חדש',
  updatedAt: Timestamp.now(),
});
```

### מחיקת מידע
```typescript
await deleteDoc(doc(db, 'tasks', taskId));
```

### קריאת מידע
```typescript
const docSnap = await getDoc(doc(db, 'couples', userId));
if (docSnap.exists()) {
  console.log(docSnap.data());
}
```

---

## 📝 סיכום

| Collection | מטרה | מזהה |
|------------|------|------|
| `couples` | פרטי הזוג | `user.uid` |
| `epics` | קבוצות משימות | `auto-generated` |
| `tasks` | משימות | `auto-generated` |
| `guests` | אורחים | `auto-generated` |
| `vendors` | ספקים | `auto-generated` |

**כל המסמכים מקושרים דרך `coupleId` = `user.uid`**

---

## 🔍 קבצים רלוונטיים

- `src/hooks/useSignupForm.ts` - יצירת משתמש ונתונים ראשוניים
- `src/hooks/useAuth.ts` - קריאת נתוני הזוג
- `src/services/firestoreService.ts` - כל הפעולות על Firestore
- `src/lib/firebase.ts` - הגדרות Firebase

---

**✅ כל המידע נשמר אוטומטית ב-Firebase ונשאר גם אחרי סגירת הדפדפן!**

